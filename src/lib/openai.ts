import OpenAI from 'openai'

let _openai: OpenAI | null = null

function getOpenAI() {
    if (!_openai) _openai = new OpenAI()
    return _openai
}

export async function generateDomainNames(
    description: string,
    alreadySeen: string[]
): Promise<string[]> {
    const seenList =
        alreadySeen.length > 0
            ? `\n\nAvoid these names (already generated): ${alreadySeen.join(', ')}`
            : ''

    const response = await getOpenAI().chat.completions.create({
        model: 'gpt-4.1',
        temperature: 0.9,
        response_format: {type: 'json_object'},
        messages: [
            {
                role: 'system',
                content: `You are a domain name generator. Generate exactly 10 creative, brandable domain base names (without TLD).
        
        Rules:
        - Shorter names are preferred, but that's not the condition.
        - No hyphens or numbers.
        - Must be easy to read, pronounce, and spell.${alreadySeen}
        
        Respond ONLY with a raw JSON object matching this structure. No markdown, no explanations.
        {"names": ["name1", "name2", ...]}`,
            },
            {
                role: 'user',
                content: `Generate 10 domain base names for: ${description}`,
            },
        ],
    })

    try {
        const content = response.choices[0]?.message?.content ?? '{}'
        const parsed = JSON.parse(content) as { names?: unknown }
        if (Array.isArray(parsed.names)) {
            return parsed.names
                .filter((n): n is string => typeof n === 'string')
                .map((n) => n.toLowerCase().replace(/[^a-z0-9]/g, ''))
                .filter((n) => n.length > 0)
        }
    } catch {
        // fall through
    }
    return []
}
