import { ExternalLink, FileText, ShieldCheck, Clock, HeartHandshake } from 'lucide-react'
import type { Lang } from '../lib/i18n'

export default function ContactForm({ lang }: { lang: Lang }) {
  const isVi = lang === 'vi'

  return (
    <div className="contact-intake-card">
      <div style={{ marginBottom: '16px' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: '100px',
            background: '#E7ECD8',
            color: '#4C5C38',
            fontSize: '0.74rem',
            fontWeight: 600,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
          }}
        >
          <FileText style={{ width: '14px', height: '14px' }} />
          <span>{isVi ? 'Phiếu thông tin' : 'Intake Form'}</span>
        </span>
      </div>

      <h2
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(1.5rem, 2.5vw, 1.85rem)',
          fontWeight: 500,
          color: '#39452A',
          margin: '0 0 12px',
          lineHeight: 1.25,
        }}
      >
        {isVi ? 'Đăng ký tham vấn cùng Wabi' : 'Register for Consultation'}
      </h2>

      <p
        style={{
          color: '#5C6349',
          fontSize: '0.95rem',
          lineHeight: 1.65,
          margin: '0 0 24px',
        }}
      >
        {isVi
          ? 'Để Wabi thấu hiểu nguyện vọng và sắp xếp nhà tham vấn phù hợp nhất với nhu cầu của bạn, xin vui lòng dành 3–5 phút hoàn thành phiếu đăng ký chi tiết qua Google Form.'
          : 'To help Wabi understand your needs and match you with the most suitable therapist, please take 3–5 minutes to complete our detailed intake form via Google Forms.'}
      </p>

      {/* CÁC ĐIỂM BẢO CHỨNG / THÔNG TIN HỖ TRỢ */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          marginBottom: '26px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            borderRadius: '14px',
            background: '#FFFFFF',
            border: '1px solid #EDE8DA',
          }}
        >
          <Clock style={{ width: '18px', height: '18px', color: '#6E8049', flexShrink: 0 }} />
          <div style={{ fontSize: '0.88rem', color: '#39452A' }}>
            <strong>{isVi ? 'Thời gian điền: ' : 'Completion time: '}</strong>
            <span style={{ color: '#6B7355' }}>{isVi ? 'Khoảng 3–5 phút' : 'About 3–5 minutes'}</span>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            borderRadius: '14px',
            background: '#FFFFFF',
            border: '1px solid #EDE8DA',
          }}
        >
          <ShieldCheck style={{ width: '18px', height: '18px', color: '#6E8049', flexShrink: 0 }} />
          <div style={{ fontSize: '0.88rem', color: '#39452A' }}>
            <strong>{isVi ? 'Bảo mật: ' : 'Confidentiality: '}</strong>
            <span style={{ color: '#6B7355' }}>
              {isVi ? 'Tuyệt đối theo đạo đức nghề nghiệp tâm lý' : '100% strictly confidential'}
            </span>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            borderRadius: '14px',
            background: '#FFFFFF',
            border: '1px solid #EDE8DA',
          }}
        >
          <HeartHandshake style={{ width: '18px', height: '18px', color: '#6E8049', flexShrink: 0 }} />
          <div style={{ fontSize: '0.88rem', color: '#39452A' }}>
            <strong>{isVi ? 'Phản hồi: ' : 'Follow-up: '}</strong>
            <span style={{ color: '#6B7355' }}>
              {isVi ? 'Chuyên viên liên hệ trong vòng 24 giờ' : 'Response within 24 business hours'}
            </span>
          </div>
        </div>
      </div>

      {/* NÚT MỞ GOOGLE FORM */}
      <a
        href="https://forms.gle/Mx1K7Dq2YK8JG8fUA"
        target="_blank"
        rel="noopener noreferrer"
        className="wabi-lift"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          width: '100%',
          padding: '15px 24px',
          borderRadius: '100px',
          background: 'linear-gradient(100deg, var(--accent-deep, #42502F), var(--accent, #6E8049))',
          boxShadow: '0 16px 32px -12px rgba(44, 51, 32, 0.45)',
          color: '#F7F5EA',
          fontWeight: 500,
          fontSize: '0.98rem',
          textDecoration: 'none',
          boxSizing: 'border-box',
        }}
      >
        <span>{isVi ? 'Điền phiếu đăng ký tham vấn' : 'Complete Intake Form'}</span>
        <ExternalLink style={{ width: '18px', height: '18px', flexShrink: 0 }} />
      </a>

      <p
        style={{
          textAlign: 'center',
          fontSize: '0.78rem',
          color: '#8A8072',
          marginTop: '14px',
          marginBottom: 0,
        }}
      >
        {isVi
          ? 'Biểu mẫu an toàn mở trên Google Forms trong tab mới.'
          : 'Opens securely via Google Forms in a new tab.'}
      </p>
    </div>
  )
}
