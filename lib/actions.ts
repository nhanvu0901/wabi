'use server'

import { supabase } from './supabase'
import { validateContact } from './validate'
import { createRateLimiter } from './rate-limit'
import { sendAdminNotification, sendClientAutoReply } from './email'

// Lớp 3: Giới hạn tần suất gửi form (tối đa 4 lần / 10 phút trên mỗi thông tin liên hệ)
const contactLimiter = createRateLimiter({ windowMs: 10 * 60 * 1000, max: 4 })

export async function submitContact(formData: FormData): Promise<{ ok: boolean }> {
  // LỚP 1 CHỐNG SPAM: BẪY HONEYPOT
  const honeypot = formData.get('user_verification_field')?.toString()
  if (honeypot && honeypot.trim().length > 0) {
    console.warn('[Spam Shield] Bot rơi vào bẫy Honeypot. Âm thầm loại bỏ request.')
    return { ok: true }
  }

  // LỚP 2 CHỐNG SPAM: TIME-TO-SUBMIT (Kiểm tra thời gian thao tác)
  const timestampStr = formData.get('_form_rendered_at')?.toString()
  if (timestampStr) {
    const elapsedMs = Date.now() - Number.parseInt(timestampStr, 10)
    if (elapsedMs < 2500) {
      console.warn(`[Spam Shield] Form gửi quá nhanh (${elapsedMs}ms). Loại bỏ bot.`)
      return { ok: true }
    }
  }

  // LỚP 3 CHỐNG SPAM: RATE LIMITING
  const rawContact = formData.get('contact')?.toString() || ''
  if (contactLimiter(rawContact.toLowerCase())) {
    console.warn('[Spam Shield] Quá giới hạn tần suất gửi form.')
    return { ok: false }
  }

  // VALIDATE DỮ LIỆU ĐẦU VÀO
  const valid = validateContact({
    name: formData.get('name')?.toString(),
    contact: rawContact,
    message: formData.get('message')?.toString(),
  })
  if (!valid) return { ok: false }

  // 1. LƯU DATABASE SUPABASE (NẾU CÓ, NẾU LỖI THÌ BỎ QUA KHÔNG CHẶN FORM)
  try {
    await supabase().from('contact_submissions').insert(valid)
  } catch (err) {
    console.warn('[DB] Bỏ qua lưu Supabase (chưa cấu hình hoặc kết nối gián đoạn):', err)
  }

  // 2. GỬI EMAIL THÔNG BÁO CHO ADMIN QUA RESEND (KÈM NÚT REPLY-TO KHÁCH)
  await sendAdminNotification(valid)

  // 3. GỬI EMAIL CẢM ƠN TỰ ĐỘNG CHO KHÁCH QUA GMAIL SMTP (CÁCH B)
  if (valid.contact.includes('@')) {
    sendClientAutoReply(valid).catch(console.error)
  }

  return { ok: true }
}
