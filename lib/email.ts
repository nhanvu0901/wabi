import { Resend } from 'resend'
import nodemailer from 'nodemailer'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

function getGmailTransporter() {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    return null
  }
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  })
}

export type ContactEmailPayload = {
  name: string
  contact: string
  message?: string
}

/**
 * 1. Gửi thông báo đến Admin qua Resend (dùng domain mặc định onboarding@resend.dev)
 * Cài đặt replyTo = email của khách để Admin bấm "Trả lời" là gửi thẳng cho khách.
 */
export async function sendAdminNotification({ name, contact, message }: ContactEmailPayload): Promise<{ ok: boolean }> {
  if (!resend || !process.env.ADMIN_NOTIFICATION_EMAIL) {
    console.warn('[Email] Bỏ qua gửi thông báo Admin: Thiếu RESEND_API_KEY hoặc ADMIN_NOTIFICATION_EMAIL.')
    return { ok: false }
  }

  const isEmail = contact.includes('@')
  const timeString = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: auto; padding: 28px; border: 1px solid #E6E3D0; border-radius: 18px; background: #FBF9F0; color: #2C3320;">
      <div style="margin-bottom: 20px;">
        <span style="font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #6E7A50; font-weight: 600;">Wabi Therapy · Thông báo mới</span>
        <h2 style="color: #39452A; margin: 6px 0 0; font-size: 22px; font-weight: 500;">Yêu cầu kết nối từ website</h2>
      </div>

      <div style="background: #FFFFFF; border: 1px solid #EDE8DA; border-radius: 14px; padding: 20px; margin: 18px 0;">
        <p style="margin: 0 0 10px; font-size: 15px;"><strong>Thân chủ:</strong> ${escapeHtml(name)}</p>
        <p style="margin: 0 0 10px; font-size: 15px;"><strong>Liên hệ:</strong> <a href="${isEmail ? `mailto:${escapeHtml(contact)}` : `tel:${escapeHtml(contact)}`}" style="color: #6E8049; font-weight: 600; text-decoration: none;">${escapeHtml(contact)}</a></p>
        <p style="margin: 0 0 14px; font-size: 13px; color: #8A8072;"><strong>Thời gian:</strong> ${timeString}</p>
        
        <div style="padding-top: 14px; border-top: 1px dashed #E5DFCF;">
          <strong style="font-size: 14px; color: #42502F;">Lời nhắn / Vấn đề quan tâm:</strong>
          <p style="margin: 8px 0 0; color: #434D35; white-space: pre-wrap; line-height: 1.6; font-size: 14.5px;">${message ? escapeHtml(message) : '<em style="color:#8A8072;">(Không để lại lời nhắn)</em>'}</p>
        </div>
      </div>

      ${isEmail ? `
        <div style="text-align: center; margin-top: 24px;">
          <a href="mailto:${escapeHtml(contact)}?subject=Wabi%20Therapy%20h%E1%BB%93i%20%C4%91%C3%A1p%20y%C3%AAu%20c%E1%BA%A7u%20c%E1%BB%A7a%20b%E1%BA%A1n" 
             style="display: inline-block; background: #42502F; color: #F7F5EA; padding: 11px 26px; border-radius: 100px; text-decoration: none; font-weight: 500; font-size: 14px;">
            Trả lời thân chủ ngay
          </a>
        </div>
      ` : ''}

      <p style="text-align: center; font-size: 12px; color: #8A8072; margin-top: 24px;">
        Thư này được gửi tự động từ hệ thống Wabi Therapy.
      </p>
    </div>
  `

  try {
    const res = await resend.emails.send({
      from: 'Wabi Therapy <onboarding@resend.dev>',
      to: process.env.ADMIN_NOTIFICATION_EMAIL,
      replyTo: isEmail ? contact : undefined,
      subject: `[Wabi] Yêu cầu kết nối mới từ ${name}`,
      html,
    })
    return { ok: !res.error }
  } catch (error) {
    console.error('[Email] Lỗi gửi Resend tới Admin:', error)
    return { ok: false }
  }
}

/**
 * 2. Gửi email xác nhận tự động (Auto-reply) cho khách hàng qua Gmail SMTP (Cách B)
 * Chỉ gửi nếu thông tin liên hệ là một email hợp lệ.
 */
export async function sendClientAutoReply({ name, contact }: ContactEmailPayload): Promise<{ ok: boolean }> {
  if (!contact.includes('@')) {
    return { ok: false }
  }

  const transporter = getGmailTransporter()
  if (!transporter || !process.env.GMAIL_USER) {
    console.warn('[Email] Bỏ qua gửi Auto-reply cho khách: Thiếu GMAIL_USER hoặc GMAIL_APP_PASSWORD.')
    return { ok: false }
  }

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: auto; padding: 32px 24px; background: #F3F0E2; border-radius: 20px; color: #2C3320;">
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; color: #4C5C38; font-weight: 600;">Wabi Therapy</span>
        <h2 style="font-family: serif; font-size: 23px; font-weight: 400; margin: 8px 0 0; color: #39452A;">Một khoảng lặng để lắng nghe chính mình</h2>
      </div>

      <div style="background: #FBF9F0; border: 1px solid #E6E3D0; border-radius: 16px; padding: 24px 26px; box-shadow: 0 10px 30px -15px rgba(44,51,32,0.15);">
        <p style="font-size: 16px; line-height: 1.6; margin-top: 0;">Chào <strong>${escapeHtml(name)}</strong>,</p>
        <p style="font-size: 15px; line-height: 1.6; color: #5C6349;">Tụi mình đã nhận được lời nhắn từ bạn qua website Wabi Therapy. Cảm ơn bạn đã tin tưởng và mở lòng chia sẻ cùng tụi mình.</p>
        <p style="font-size: 15px; line-height: 1.6; color: #5C6349;">Chuyên viên của Wabi sẽ đọc kỹ thông tin và liên hệ lại với bạn qua email này trong vòng <strong>24 giờ làm việc</strong>.</p>
        
        <div style="margin: 20px 0; padding: 14px 16px; background: #E7ECD8; border-radius: 12px; font-size: 13px; color: #4C5C38; line-height: 1.5;">
          🔒 <em>Mọi thông tin bạn chia sẻ đều được cam kết bảo mật tuyệt đối theo tiêu chuẩn đạo đức nghề nghiệp tâm lý.</em>
        </div>

        <p style="font-size: 14px; margin-bottom: 0; color: #6E8049;">Thân mến,<br/><strong style="color: #42502F;">Đội ngũ Wabi Therapy</strong></p>
      </div>

      <p style="text-align: center; font-size: 12px; color: #8A8072; margin-top: 22px; line-height: 1.5;">
        Nếu bạn cần hỗ trợ thêm, bạn có thể trả lời trực tiếp email này hoặc nhắn cho tụi mình qua Instagram: <strong>@wabi.therapy</strong>
      </p>
    </div>
  `

  try {
    await transporter.sendMail({
      from: `"Wabi Therapy" <${process.env.GMAIL_USER}>`,
      to: contact,
      subject: `Wabi đã nhận được lời nhắn của bạn, ${name}`,
      html,
    })
    return { ok: true }
  } catch (error) {
    console.error('[Email] Lỗi gửi Gmail auto-reply cho khách:', error)
    return { ok: false }
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
