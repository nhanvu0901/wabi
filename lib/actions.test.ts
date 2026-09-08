import { describe, it, expect, vi, beforeEach } from 'vitest'
import { submitContact } from './actions'

vi.mock('./email', () => ({
  sendAdminNotification: vi.fn().mockResolvedValue({ ok: true }),
  sendClientAutoReply: vi.fn().mockResolvedValue({ ok: true }),
}))

vi.mock('./supabase', () => ({
  supabase: () => ({
    from: () => ({
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
  }),
}))

describe('submitContact Server Action', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('silently discards spam when honeypot field is filled', async () => {
    const fd = new FormData()
    fd.append('name', 'Spam Bot')
    fd.append('contact', 'bot@spam.com')
    fd.append('message', 'Buy crypto')
    fd.append('user_verification_field', 'I am a bot')

    const res = await submitContact(fd)
    expect(res.ok).toBe(true)
  })

  it('silently discards submission when time-to-submit is too fast (< 2.5s)', async () => {
    const fd = new FormData()
    fd.append('name', 'Fast User')
    fd.append('contact', 'fast@example.com')
    fd.append('message', 'Hello')
    // Rendered 500ms ago
    fd.append('_form_rendered_at', (Date.now() - 500).toString())

    const res = await submitContact(fd)
    expect(res.ok).toBe(true)
  })

  it('fails validation when required fields are missing', async () => {
    const fd = new FormData()
    fd.append('name', '')
    fd.append('contact', '')
    fd.append('_form_rendered_at', (Date.now() - 5000).toString())

    const res = await submitContact(fd)
    expect(res.ok).toBe(false)
  })

  it('processes valid contact submission when submitted normally (> 2.5s)', async () => {
    const fd = new FormData()
    fd.append('name', 'Trần Văn A')
    fd.append('contact', 'trana@example.com')
    fd.append('message', 'Tôi muốn tìm hiểu về buổi tham vấn.')
    fd.append('_form_rendered_at', (Date.now() - 5000).toString())

    const res = await submitContact(fd)
    expect(res.ok).toBe(true)
  })
})
