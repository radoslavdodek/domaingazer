import OpenAI from 'openai'
import aiProvidersConfig from '@/config/ai-providers.json'

type ProviderConfig = {
  name: string
  'api-key': string
  'base-url'?: string
}

type FeatureConfig = {
  provider: string
  model: string
}

type ProvidersConfig = {
  providers: ProviderConfig[]
  generateDomains: FeatureConfig
  explain: FeatureConfig
}

const clientByProvider = new Map<string, OpenAI>()

function getChatCompletionsUrl(baseUrl?: string) {
  const normalizedBaseUrl = (baseUrl ?? 'https://api.openai.com/v1').replace(/\/+$/, '')
  return `${normalizedBaseUrl}/chat/completions`
}

function getConfiguredProvider(feature: 'generateDomains' | 'explain') {
  const config = aiProvidersConfig as ProvidersConfig
  const providers = Array.isArray(config.providers) ? config.providers : []
  if (providers.length === 0) {
    throw new Error('No AI providers configured in src/config/ai-providers.json')
  }

  const featureConfig = feature === 'generateDomains' ? config.generateDomains : config.explain
  const selectedProviderName = featureConfig?.provider?.trim()
  if (!selectedProviderName) {
    throw new Error(`${feature}.provider must be set in src/config/ai-providers.json`)
  }

  const selected = providers.find((provider) => provider.name === selectedProviderName)
  if (!selected) {
    throw new Error(`${feature}.provider "${selectedProviderName}" is not defined in src/config/ai-providers.json`)
  }

  const selectedModel = featureConfig?.model?.trim()
  if (!selectedModel) {
    throw new Error(`${feature}.model must be set in src/config/ai-providers.json`)
  }

  const apiKeyEnvVar = selected['api-key']?.trim()
  if (!apiKeyEnvVar) {
    throw new Error(`Provider "${selected.name}" must define "api-key" as an environment variable name`)
  }

  const apiKey = process.env[apiKeyEnvVar]
  if (!apiKey) {
    throw new Error(`Missing API key for "${selected.name}". Set ${apiKeyEnvVar} in your environment`)
  }

  return {
    name: selected.name,
    model: selectedModel,
    baseUrl: selected['base-url']?.trim() || undefined,
    apiKey,
  }
}

function getClient(provider: { name: string; baseUrl?: string; apiKey: string }) {
  const existing = clientByProvider.get(provider.name)
  if (existing) return existing

  const client = new OpenAI({
    apiKey: provider.apiKey,
    baseURL: provider.baseUrl,
  })
  clientByProvider.set(provider.name, client)
  return client
}

export type AiUsage = {
  provider: string
  model: string
  promptTokens: number
  completionTokens: number
  totalTokens: number
}

export async function generateDomainNames(
  description: string,
  alreadySeen: string[],
  count = 10,
  signal?: AbortSignal,
  hint?: string
): Promise<{ names: string[]; usage: AiUsage }> {
  const provider = getConfiguredProvider('generateDomains')
  const requestUrl = getChatCompletionsUrl(provider.baseUrl)
  const requestId = crypto.randomUUID()
  const startedAt = Date.now()
  const targetCount = Math.max(1, Math.min(count, 10))
  const seenList =
    alreadySeen.length > 0
      ? `\n\nAvoid these names (already generated): ${alreadySeen.join(', ')}`
      : ''

  console.info('[ai.request.start]', {
    requestId,
    provider: provider.name,
    model: provider.model,
    requestUrl,
    targetCount,
    alreadySeenCount: alreadySeen.length,
    hasHint: Boolean(hint),
    descriptionLength: description.length,
  })

  let response: Awaited<ReturnType<OpenAI['chat']['completions']['create']>>
  try {
    response = await getClient(provider).chat.completions.create({
      model: provider.model,
      temperature: 0.9,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You are a domain name generator. Generate exactly ${targetCount} creative, brandable domain base names (without TLD).
        
        Rules:
        - Shorter names are preferred, but that's not the condition.
        - No hyphens or numbers.
        - Be creative and original.
        - Must be easy to read, pronounce, and spell.${seenList}
        
        Respond ONLY with a raw JSON object matching this structure. No markdown, no explanations.
        {"names": ["name1", "name2", ...]}`,
      },
        {
          role: 'user',
          content: `Generate ${targetCount} domain base names for: ${description}${hint ? `\n\nAdditional guidance given by user: <hint>${hint}</hint>. Respect it as much as possible.` : ''}`,
        },
      ],
    }, { signal })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[ai.request.error]', {
      requestId,
      provider: provider.name,
      model: provider.model,
      requestUrl,
      durationMs: Date.now() - startedAt,
      message,
    })
    throw err
  }

  console.info('[ai.request.success]', {
    requestId,
    provider: provider.name,
    model: provider.model,
    requestUrl,
    durationMs: Date.now() - startedAt,
    choiceCount: response.choices.length,
  })
  console.info('[ai.request.response]', {
    requestId,
    provider: provider.name,
    model: provider.model,
    requestUrl,
    response,
  })

  const usage: AiUsage = {
    provider: provider.name,
    model: provider.model,
    promptTokens: response.usage?.prompt_tokens ?? 0,
    completionTokens: response.usage?.completion_tokens ?? 0,
    totalTokens: response.usage?.total_tokens ?? 0,
  }

  try {
    const content = response.choices[0]?.message?.content ?? '{}'
    const parsed = JSON.parse(content) as { names?: unknown }
    if (Array.isArray(parsed.names)) {
      const names = parsed.names
        .filter((n): n is string => typeof n === 'string')
        .map((n) => n.toLowerCase().replace(/[^a-z0-9]/g, ''))
        .filter((n) => n.length > 0)
      console.info('[ai.request.parsed]', {
        requestId,
        provider: provider.name,
        model: provider.model,
        parsedNameCount: names.length,
      })
      return { names, usage }
    }
    console.warn('[ai.request.parse_invalid_schema]', {
      requestId,
      provider: provider.name,
      model: provider.model,
    })
  } catch {
    console.warn('[ai.request.parse_error]', {
      requestId,
      provider: provider.name,
      model: provider.model,
    })
  }
  return { names: [], usage }
}

export async function explainDomainName(
  description: string,
  baseName: string,
  signal?: AbortSignal
): Promise<{ explanation: string; usage: AiUsage }> {
  const provider = getConfiguredProvider('explain')
  const requestUrl = getChatCompletionsUrl(provider.baseUrl)
  const requestId = crypto.randomUUID()
  const startedAt = Date.now()

  console.info('[ai.explain.start]', {
    requestId,
    provider: provider.name,
    model: provider.model,
    requestUrl,
    descriptionLength: description.length,
    baseName,
  })

  let response: Awaited<ReturnType<OpenAI['chat']['completions']['create']>>
  try {
    response = await getClient(provider).chat.completions.create({
      model: provider.model,
      temperature: 0.7,
      messages: [
        {
          role: 'system',
          content: 'You are a branding strategist for startup domain names. Explain clearly and concisely why a domain name matches a product description and why it is a strong brand choice.',
        },
        {
          role: 'user',
          content: `Product description: ${description}\n\nDomain base name: ${baseName}\n\nWrite 2-3 concise sentences in plain text. Cover both: (1) why it matches the product, and (2) why it is a good name.`,
        },
      ],
    }, { signal })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[ai.explain.error]', {
      requestId,
      provider: provider.name,
      model: provider.model,
      requestUrl,
      durationMs: Date.now() - startedAt,
      message,
    })
    throw err
  }

  console.info('[ai.explain.success]', {
    requestId,
    provider: provider.name,
    model: provider.model,
    requestUrl,
    durationMs: Date.now() - startedAt,
    choiceCount: response.choices.length,
  })

  const usage: AiUsage = {
    provider: provider.name,
    model: provider.model,
    promptTokens: response.usage?.prompt_tokens ?? 0,
    completionTokens: response.usage?.completion_tokens ?? 0,
    totalTokens: response.usage?.total_tokens ?? 0,
  }
  const content = response.choices[0]?.message?.content
  const explanation = typeof content === 'string' ? content.trim() : ''
  return { explanation, usage }
}
