import { LifeBuoy, MapPin } from 'lucide-react'
import ContactForm from '../../components/ContactForm'

export const metadata = { title: 'Liên hệ — Wabi Therapy' }

export default function ContactPage() {
  return (
    <section style={{ padding: 'clamp(56px,8vw,96px) 0' }}>
      <div style={{ maxWidth: '1160px', margin: '0 auto', padding: '0 clamp(20px,5vw,40px)' }}>
        <div
          data-reveal
          style={{
            opacity: 0,
            transform: 'translateY(22px)',
            transition: 'opacity .8s ease,transform .8s ease',
            maxWidth: '720px',
            marginBottom: '48px',
          }}
        >
          <span style={{ fontSize: '.74rem', letterSpacing: '.24em', textTransform: 'uppercase', color: 'var(--accent-deep,#434D35)', fontWeight: 600 }}>
            Contact
          </span>
          <h2
            style={{
              fontFamily: "'Newsreader',serif",
              fontWeight: 400,
              fontSize: 'clamp(2.2rem,5vw,3.2rem)',
              letterSpacing: '-.01em',
              lineHeight: 1.1,
              margin: '14px 0 14px',
            }}
          >
            Hãy nhắn cho tụi mình khi bạn sẵn sàng
          </h2>
          <p style={{ color: '#645D53', fontSize: '1.06rem' }}>
            Cứ thoải mái suy nghĩ. Bao giờ muốn lên lịch, chỉ cần nhắn — admin sẽ book giúp bạn sớm nhất. Nếu có câu
            hỏi ngoài tham vấn hay tình huống cần giúp đỡ, cũng cứ nhắn nhé.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: '22px', alignItems: 'start' }}>
          {/* CONNECT CARD */}
          <div
            data-reveal
            style={{
              opacity: 0,
              transform: 'translateY(24px)',
              transition: 'opacity .8s ease,transform .8s ease',
              background: '#3A342C',
              color: '#F7F2E9',
              borderRadius: '28px',
              padding: 'clamp(30px,4vw,44px)',
            }}
          >
            <h3 style={{ fontFamily: "'Newsreader',serif", fontWeight: 500, fontSize: '1.7rem', color: '#F7F2E9', marginBottom: '12px' }}>
              Kết nối với Wabi
            </h3>
            <p style={{ color: 'rgba(247,242,233,.72)', marginBottom: '28px' }}>
              Chia sẻ một chút về tuổi, nơi sống và điều bạn đang gặp phải — tụi mình sẽ tư vấn therapist & dịch vụ phù hợp.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <a
                href="https://www.instagram.com/wabi.therapy/"
                target="_blank"
                rel="noopener"
                style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 18px', background: 'rgba(247,242,233,.08)', borderRadius: '16px', color: '#F7F2E9' }}
              >
                <i className="fa-brands fa-instagram" style={{ width: '22px', fontSize: '1.2rem', textAlign: 'center', color: '#D9A88C' }}></i>
                <span>
                  <b style={{ display: 'block', fontWeight: 500 }}>wabi.therapy</b>
                  <span style={{ fontSize: '.82rem', color: 'rgba(247,242,233,.6)' }}>Instagram</span>
                </span>
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61556380754645"
                target="_blank"
                rel="noopener"
                style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 18px', background: 'rgba(247,242,233,.08)', borderRadius: '16px', color: '#F7F2E9' }}
              >
                <i className="fa-brands fa-facebook" style={{ width: '22px', fontSize: '1.2rem', textAlign: 'center', color: '#D9A88C' }}></i>
                <span>
                  <b style={{ display: 'block', fontWeight: 500 }}>Wabi Therapy</b>
                  <span style={{ fontSize: '.82rem', color: 'rgba(247,242,233,.6)' }}>Facebook</span>
                </span>
              </a>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 18px', background: 'rgba(247,242,233,.08)', borderRadius: '16px' }}>
                <i className="fa-solid fa-location-dot" style={{ width: '22px', fontSize: '1.2rem', textAlign: 'center', color: '#D9A88C' }}></i>
                <span>
                  <b style={{ display: 'block', fontWeight: 500 }}>4 Ngõ 46A Phạm Ngọc Thạch</b>
                  <span style={{ fontSize: '.82rem', color: 'rgba(247,242,233,.6)' }}>Onion Cafe · Hà Nội</span>
                </span>
              </div>
            </div>
          </div>

          {/* FORM */}
          <div
            data-reveal
            style={{
              opacity: 0,
              transform: 'translateY(24px)',
              transition: 'opacity .8s ease .08s,transform .8s ease .08s',
              background: '#FCFAF4',
              border: '1px solid #EAE0D0',
              borderRadius: '28px',
              padding: 'clamp(30px,4vw,44px)',
            }}
          >
            <ContactForm />
          </div>
        </div>

        {/* HOTLINE */}
        <div
          data-reveal
          style={{
            opacity: 0,
            transform: 'translateY(24px)',
            transition: 'opacity .8s ease,transform .8s ease',
            background: '#F1E2D7',
            border: '1px solid #E7CFC1',
            borderRadius: '28px',
            padding: 'clamp(30px,4vw,44px)',
            marginTop: '22px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#A0573C', fontWeight: 600, marginBottom: '8px' }}>
            <LifeBuoy style={{ width: '20px', height: '20px' }} /> Cần hỗ trợ khẩn cấp?
          </div>
          <h3 style={{ fontFamily: "'Newsreader',serif", fontWeight: 500, fontSize: '1.5rem', marginBottom: '6px' }}>
            Đường dây nóng
          </h3>
          <p style={{ fontSize: '.95rem', color: '#6B6459', marginBottom: '22px', maxWidth: '640px' }}>
            Nếu bạn đang trong khủng hoảng, hãy liên hệ ngay các đường dây dưới đây — luôn có người sẵn sàng lắng nghe.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '0 40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '14px', padding: '12px 0', borderBottom: '1px dashed #DDBFB0', fontSize: '.94rem' }}>
              <span>Đường dây nóng Ngày Mai</span>
              <b style={{ color: '#A0573C', fontWeight: 600, whiteSpace: 'nowrap' }}>096 306 1414</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '14px', padding: '12px 0', borderBottom: '1px dashed #DDBFB0', fontSize: '.94rem' }}>
              <span>Tổng đài Bảo vệ Trẻ em Quốc gia</span>
              <b style={{ color: '#A0573C', fontWeight: 600, whiteSpace: 'nowrap' }}>111</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '14px', padding: '12px 0', borderBottom: '1px dashed #DDBFB0', fontSize: '.94rem' }}>
              <span>Hội Tâm lý Trị liệu Việt Nam</span>
              <b style={{ color: '#A0573C', fontWeight: 600, whiteSpace: 'nowrap' }}>1900 63 644</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '14px', padding: '12px 0', borderBottom: '1px dashed #DDBFB0', fontSize: '.94rem' }}>
              <span>Ngôi nhà Bình yên (PN & trẻ em)</span>
              <b style={{ color: '#A0573C', fontWeight: 600, whiteSpace: 'nowrap' }}>1900 96 96 80</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '14px', padding: '12px 0', fontSize: '.94rem' }}>
              <span>Bệnh viện Việt Pháp (Hà Nội)</span>
              <b style={{ color: '#A0573C', fontWeight: 600, whiteSpace: 'nowrap' }}>024 3574 1111</b>
            </div>
          </div>
        </div>

        {/* MAP PLACEHOLDER */}
        <div
          data-reveal
          style={{
            opacity: 0,
            transform: 'translateY(24px)',
            transition: 'opacity .8s ease,transform .8s ease',
            marginTop: '22px',
            borderRadius: '28px',
            overflow: 'hidden',
            border: '1px solid #E2D8C6',
            position: 'relative',
            height: '280px',
            background: 'linear-gradient(135deg,#E7EADD,#EAE1D2)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'linear-gradient(#DDD6C6 1px,transparent 1px),linear-gradient(90deg,#DDD6C6 1px,transparent 1px)',
              backgroundSize: '44px 44px',
              opacity: 0.5,
            }}
          ></div>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              gap: '8px',
              color: '#5A5346',
            }}
          >
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: 'var(--accent,#5A6647)',
                color: '#FCFAF4',
                display: 'grid',
                placeItems: 'center',
                boxShadow: '0 12px 24px -12px rgba(90,102,71,.9)',
              }}
            >
              <MapPin style={{ width: '24px', height: '24px' }} />
            </div>
            <b style={{ fontFamily: "'Newsreader',serif", fontWeight: 500, fontSize: '1.2rem' }}>Onion Cafe · Hà Nội</b>
            <span style={{ fontSize: '.9rem', color: '#7A7266' }}>4 Ngõ 46A Phạm Ngọc Thạch</span>
          </div>
        </div>
      </div>
    </section>
  )
}
