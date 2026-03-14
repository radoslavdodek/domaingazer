export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getEffectiveUser } from '@/lib/impersonation'
import { createAdminClient } from '@/lib/supabase/admin'

const SLACK_WEBHOOK_URL = process.env.SLACK_FEEDBACK_WEBHOOK_URL

const MAX_ATTACHMENTS = 3
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp']

export async function POST(req: Request) {
  const supabase = await createClient()
  const { user, supabaseClient } = await getEffectiveUser(supabase)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()

  const message = (formData.get('message') as string)?.trim()
  if (!message) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 })
  }

  const title = (formData.get('title') as string)?.trim() || null
  const category = (formData.get('category') as string) || null
  const priority = (formData.get('priority') as string) || 'medium'
  const feedback_type = (formData.get('feedback_type') as string) || 'general'
  const page_url = (formData.get('page_url') as string) || null
  const user_agent = (formData.get('user_agent') as string) || null
  const screen_info = (formData.get('screen_info') as string) || null
  const app_version = (formData.get('app_version') as string) || null

  let search_context = null
  const searchContextRaw = formData.get('search_context') as string | null
  if (searchContextRaw) {
    try {
      search_context = JSON.parse(searchContextRaw)
    } catch { /* ignore malformed JSON */ }
  }

  // Handle file uploads
  const attachmentPaths: string[] = []
  const files = formData.getAll('attachments') as File[]

  if (files.length > MAX_ATTACHMENTS) {
    return NextResponse.json({ error: `Maximum ${MAX_ATTACHMENTS} attachments allowed` }, { status: 400 })
  }

  for (const file of files) {
    if (!file.size) continue // skip empty file inputs

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: `File "${file.name}" exceeds 5MB limit` }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: `File "${file.name}" has unsupported type. Only images are allowed.` }, { status: 400 })
    }

    const ext = file.name.split('.').pop() || 'png'
    const storagePath = `${user.id}/${crypto.randomUUID()}.${ext}`

    const { error: uploadError } = await supabaseClient.storage
      .from('feedback-attachments')
      .upload(storagePath, file, { contentType: file.type })

    if (uploadError) {
      console.error('Feedback attachment upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload attachment' }, { status: 500 })
    }

    attachmentPaths.push(storagePath)
  }

  const { data, error } = await supabaseClient.from('user_feedback').insert({
    user_id: user.id,
    user_email: user.email!,
    title,
    message,
    category,
    priority,
    feedback_type,
    page_url,
    user_agent,
    screen_info,
    attachments: attachmentPaths.length > 0 ? attachmentPaths : null,
    search_context,
    app_version,
  }).select('id').single()

  if (error) {
    console.error('Feedback insert error:', error)
    return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 })
  }

  // Fire-and-forget Slack notification
  if (SLACK_WEBHOOK_URL) {
    const typeLabel = feedback_type === 'bug_report' ? 'Bug Report'
      : feedback_type === 'feature_request' ? 'Feature Request'
      : 'General Feedback'
    const searchLine = search_context?.query
      ? `\n>Search: _"${search_context.query}"_ (${search_context.results?.length ?? 0} results)`
      : ''

    const slackText = [
      `*New Feedback* — ${typeLabel} (${priority})`,
      `From: ${user.email}`,
      title ? `*${title}*` : null,
      message.length > 500 ? message.slice(0, 500) + '...' : message,
      searchLine || null,
      app_version ? `Version: ${app_version}` : null,
      category ? `Category: ${category}` : null,
      attachmentPaths.length > 0 ? `${attachmentPaths.length} attachment(s)` : null,
    ].filter(Boolean).join('\n')

    fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: slackText }),
    }).catch((err) => console.error('Slack feedback notification failed:', err))
  }

  return NextResponse.json({ ok: true, id: data.id })
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (user.app_metadata?.is_admin !== true) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const admin = createAdminClient()

  type FeedbackRow = {
    id: string
    attachments: string[] | null
    [key: string]: unknown
  }

  const { data, error } = await admin
    .from('user_feedback')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) {
    console.error('Feedback fetch error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Generate signed URLs for attachments
  const rows = (data ?? []) as FeedbackRow[]
  const feedbackWithUrls = await Promise.all(
    rows.map(async (item) => {
      if (!item.attachments?.length) return item

      const signedUrls = await Promise.all(
        item.attachments.map(async (path: string) => {
          const { data: urlData } = await admin.storage
            .from('feedback-attachments')
            .createSignedUrl(path, 3600) // 1 hour
          return urlData?.signedUrl ?? null
        })
      )

      return { ...item, attachment_urls: signedUrls.filter(Boolean) }
    })
  )

  return NextResponse.json({ feedback: feedbackWithUrls })
}
