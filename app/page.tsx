import Link from 'next/link'
import {
  CalendarHeart,
  Compass,
  ShieldCheck,
  GraduationCap,
  HeartHandshake,
  MessagesSquare,
  ClipboardList,
  Users,
  ArrowRight,
} from 'lucide-react'
import ImagePlaceholder from '../components/ImagePlaceholder'
import { supabase } from '../lib/supabase'
import type { Therapist } from '../lib/types'

export const revalidate = 60

// Glimpse cards: design order (design source L171–203). DB rows matched by exact
// name; each entry doubles as hard-coded fallback if the row is missing.
const GLIMPSE = [
  { name: 'ThS. Ngọc Mai', title: 'Thạc sĩ Tâm lý Lâm sàng', delay: '' },
  { name: 'ThS. Hà Trang', title: 'Thạc sĩ Tâm lý Lâm sàng · ĐH Xã hội Nga', delay: ' .08s' },
  { name: 'ThS. Ly Đinh', title: 'Thạc sĩ Tâm lý', delay: ' .16s' },
  { name: 'ThS. Đức Minh', title: 'Trị liệu & Tư vấn · ĐH Western Sydney', delay: ' .24s' },
]

export default async function Home() {
  const { data, error } = await supabase()
    .from('therapists')
    .select('*')
    .in('name', GLIMPSE.map((g) => g.name))
  if (error) throw error
  const byName = new Map((data as Therapist[]).map((t) => [t.name, t]))

  return (
    <>
      {/* HERO — Direction A: Stillness (centered, text-forward) */}
      <div
        id="hero-still"
        style={{ position: 'relative', overflow: 'hidden', padding: 'clamp(72px,11vw,132px) 0 clamp(56px,8vw,96px)' }}
      >
        <div
          style={{
            position: 'absolute',
            width: 'min(560px,80vw)',
            height: 'min(560px,80vw)',
            borderRadius: '47% 53% 60% 40%/45% 50% 50% 55%',
            background: 'radial-gradient(circle at 40% 40%,#E7EADD,#DFE4D0)',
            filter: 'blur(8px)',
            top: '-16%',
            right: '-12%',
            opacity: 0.7,
            zIndex: 0,
          }}
        ></div>
        <div
          style={{
            position: 'absolute',
            width: 'min(400px,60vw)',
            height: 'min(400px,60vw)',
            borderRadius: '60% 40% 45% 55%/55% 45% 55% 45%',
            background: 'radial-gradient(circle at 50% 50%,#EEDFD3,#EAD7C8)',
            filter: 'blur(10px)',
            bottom: '-24%',
            left: '-10%',
            opacity: 0.55,
            zIndex: 0,
          }}
        ></div>
        <div
          style={{
            maxWidth: '900px',
            margin: '0 auto',
            padding: '0 clamp(20px,5vw,40px)',
            position: 'relative',
            zIndex: 2,
            textAlign: 'center',
          }}
        >
          <span
            data-reveal
            style={{
              opacity: 0,
              transform: 'translateY(18px)',
              transition: 'opacity .8s ease,transform .8s ease',
              display: 'inline-block',
              fontSize: '.74rem',
              letterSpacing: '.24em',
              textTransform: 'uppercase',
              color: 'var(--accent-deep,#434D35)',
              fontWeight: 600,
            }}
          >
            Tham vấn · Trị liệu · Đánh giá tâm lý
          </span>
          <h1
            data-reveal
            style={{
              opacity: 0,
              transform: 'translateY(22px)',
              transition: 'opacity .9s ease .05s,transform .9s ease .05s',
              fontFamily: "'Newsreader',serif",
              fontWeight: 400,
              letterSpacing: '-.015em',
              lineHeight: 1.08,
              fontSize: 'clamp(2.6rem,7vw,5rem)',
              margin: '20px 0 26px',
            }}
          >
            Một khoảng lặng để bạn được{' '}
            <span style={{ fontStyle: 'italic', color: 'var(--accent-deep,#434D35)' }}>là chính mình.</span>
          </h1>
          <p
            data-reveal
            style={{
              opacity: 0,
              transform: 'translateY(22px)',
              transition: 'opacity .9s ease .12s,transform .9s ease .12s',
              fontSize: 'clamp(1.05rem,2.1vw,1.24rem)',
              color: '#645D53',
              maxWidth: '620px',
              margin: '0 auto 38px',
            }}
          >
            Wabi là không gian an toàn, riêng tư và thấu cảm — nơi bạn bắt đầu hành trình chăm sóc sức khỏe tinh thần
            một cách nhẹ nhàng, đúng với chính mình. Online & offline tại Hà Nội và TP.HCM.
          </p>
          <div
            data-reveal
            style={{
              opacity: 0,
              transform: 'translateY(22px)',
              transition: 'opacity .9s ease .18s,transform .9s ease .18s',
              display: 'flex',
              gap: '14px',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <Link
              href="/lien-he"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '9px',
                padding: '15px 30px',
                borderRadius: '100px',
                fontWeight: 500,
                cursor: 'pointer',
                background: 'var(--accent,#5A6647)',
                color: '#FCFAF4',
                boxShadow: '0 16px 34px -18px rgba(90,102,71,.9)',
              }}
            >
              <CalendarHeart style={{ width: '18px', height: '18px' }} /> Liên hệ với tụi mình
            </Link>
            <Link
              href="/dich-vu"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '9px',
                padding: '15px 28px',
                borderRadius: '100px',
                fontWeight: 500,
                cursor: 'pointer',
                background: '#FCFAF4',
                border: '1px solid #E2D8C6',
                color: '#33302A',
              }}
            >
              <Compass style={{ width: '18px', height: '18px' }} /> Khám phá dịch vụ
            </Link>
          </div>
          <div style={{ maxWidth: '720px', margin: '56px auto 0', position: 'relative', zIndex: 2 }}>
            <div
              style={{
                borderRadius: '26px',
                overflow: 'hidden',
                aspectRatio: '16/7',
                border: '1px solid #E7DECE',
                boxShadow: '0 40px 70px -46px rgba(51,48,42,.6)',
              }}
            >
              <ImagePlaceholder label="Ảnh thiên nhiên tĩnh lặng — đá cuội, rêu, ánh sáng dịu" />
            </div>
          </div>
        </div>
      </div>

      {/* hero-editorial (design L78–94) intentionally omitted — static port uses hero-still only */}

      {/* TRUST STRIP */}
      <div style={{ maxWidth: '1160px', margin: '0 auto', padding: '0 clamp(20px,5vw,40px)' }}>
        <div
          data-reveal
          style={{
            opacity: 0,
            transform: 'translateY(22px)',
            transition: 'opacity .8s ease,transform .8s ease',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))',
            gap: '24px',
            padding: '34px 0 clamp(40px,6vw,64px)',
            borderTop: '1px solid #E7DECE',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <b style={{ fontFamily: "'Newsreader',serif", fontWeight: 500, fontSize: '2.1rem', color: 'var(--accent-deep,#434D35)', lineHeight: 1 }}>
              15+
            </b>
            <span style={{ fontSize: '.86rem', color: '#7A7266' }}>Thạc sĩ Tâm lý Lâm sàng</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <b style={{ fontFamily: "'Newsreader',serif", fontWeight: 500, fontSize: '2.1rem', color: 'var(--accent-deep,#434D35)', lineHeight: 1 }}>
              10+
            </b>
            <span style={{ fontSize: '.86rem', color: '#7A7266' }}>Liệu pháp trị liệu</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <b style={{ fontFamily: "'Newsreader',serif", fontWeight: 500, fontSize: '2.1rem', color: 'var(--accent-deep,#434D35)', lineHeight: 1 }}>
              4
            </b>
            <span style={{ fontSize: '.86rem', color: '#7A7266' }}>Ngôn ngữ: Việt · Anh · Hàn · Trung</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <b
              style={{
                fontFamily: "'Newsreader',serif",
                fontWeight: 500,
                fontSize: '1.5rem',
                color: 'var(--accent-deep,#434D35)',
                lineHeight: 1,
                marginTop: '6px',
              }}
            >
              Linh hoạt
            </b>
            <span style={{ fontSize: '.86rem', color: '#7A7266' }}>Không cọc · không ép số buổi</span>
          </div>
        </div>
      </div>

      {/* VALUE / WHY */}
      <section style={{ padding: 'clamp(56px,8vw,96px) 0' }}>
        <div style={{ maxWidth: '1160px', margin: '0 auto', padding: '0 clamp(20px,5vw,40px)' }}>
          <div
            data-reveal
            style={{
              opacity: 0,
              transform: 'translateY(22px)',
              transition: 'opacity .8s ease,transform .8s ease',
              maxWidth: '640px',
              marginBottom: '48px',
            }}
          >
            <span style={{ fontSize: '.74rem', letterSpacing: '.24em', textTransform: 'uppercase', color: 'var(--accent-deep,#434D35)', fontWeight: 600 }}>
              Vì sao chọn Wabi
            </span>
            <h2
              style={{
                fontFamily: "'Newsreader',serif",
                fontWeight: 400,
                fontSize: 'clamp(2rem,4vw,2.7rem)',
                letterSpacing: '-.01em',
                lineHeight: 1.14,
                marginTop: '14px',
              }}
            >
              Ba điều bạn luôn được đảm bảo
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '22px' }}>
            <div
              data-reveal
              style={{
                opacity: 0,
                transform: 'translateY(24px)',
                transition: 'opacity .8s ease,transform .8s ease',
                background: '#FCFAF4',
                border: '1px solid #EAE0D0',
                borderRadius: '24px',
                padding: '34px',
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '15px',
                  display: 'grid',
                  placeItems: 'center',
                  background: '#E7EADD',
                  color: 'var(--accent-deep,#434D35)',
                  marginBottom: '20px',
                }}
              >
                <ShieldCheck style={{ width: '25px', height: '25px' }} />
              </div>
              <h3 style={{ fontFamily: "'Newsreader',serif", fontWeight: 500, fontSize: '1.4rem', marginBottom: '10px' }}>
                An toàn & riêng tư
              </h3>
              <p style={{ color: '#6B6459', fontSize: '.97rem' }}>
                Mọi chia sẻ của bạn được giữ kín tuyệt đối. Không phán xét, chỉ có lắng nghe và thấu hiểu.
              </p>
            </div>
            <div
              data-reveal
              style={{
                opacity: 0,
                transform: 'translateY(24px)',
                transition: 'opacity .8s ease .08s,transform .8s ease .08s',
                background: '#FCFAF4',
                border: '1px solid #EAE0D0',
                borderRadius: '24px',
                padding: '34px',
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '15px',
                  display: 'grid',
                  placeItems: 'center',
                  background: '#ECE6F0',
                  color: '#7A6A82',
                  marginBottom: '20px',
                }}
              >
                <GraduationCap style={{ width: '25px', height: '25px' }} />
              </div>
              <h3 style={{ fontFamily: "'Newsreader',serif", fontWeight: 500, fontSize: '1.4rem', marginBottom: '10px' }}>
                Chuyên môn sâu
              </h3>
              <p style={{ color: '#6B6459', fontSize: '.97rem' }}>
                Đội ngũ tốt nghiệp Thạc sĩ Tâm lý học Lâm sàng, đào tạo bài bản trong nước & quốc tế (Anh, Úc, Nga…).
              </p>
            </div>
            <div
              data-reveal
              style={{
                opacity: 0,
                transform: 'translateY(24px)',
                transition: 'opacity .8s ease .16s,transform .8s ease .16s',
                background: '#FCFAF4',
                border: '1px solid #EAE0D0',
                borderRadius: '24px',
                padding: '34px',
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '15px',
                  display: 'grid',
                  placeItems: 'center',
                  background: '#EEDFD3',
                  color: '#A05F41',
                  marginBottom: '20px',
                }}
              >
                <HeartHandshake style={{ width: '25px', height: '25px' }} />
              </div>
              <h3 style={{ fontFamily: "'Newsreader',serif", fontWeight: 500, fontSize: '1.4rem', marginBottom: '10px' }}>
                Đồng hành linh hoạt
              </h3>
              <p style={{ color: '#6B6459', fontSize: '.97rem' }}>
                Không quy định số buổi cố định, không cọc trước. Bạn hẹn theo nhịp của mình — tuần, tháng, hay khi cần.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES PREVIEW */}
      <section style={{ padding: '0 0 clamp(56px,8vw,96px)' }}>
        <div style={{ maxWidth: '1160px', margin: '0 auto', padding: '0 clamp(20px,5vw,40px)' }}>
          <div
            data-reveal
            style={{
              opacity: 0,
              transform: 'translateY(22px)',
              transition: 'opacity .8s ease,transform .8s ease',
              maxWidth: '640px',
              marginBottom: '48px',
            }}
          >
            <span style={{ fontSize: '.74rem', letterSpacing: '.24em', textTransform: 'uppercase', color: 'var(--accent-deep,#434D35)', fontWeight: 600 }}>
              Dịch vụ
            </span>
            <h2
              style={{
                fontFamily: "'Newsreader',serif",
                fontWeight: 400,
                fontSize: 'clamp(2rem,4vw,2.7rem)',
                letterSpacing: '-.01em',
                lineHeight: 1.14,
                marginTop: '14px',
              }}
            >
              Chúng mình có thể đồng hành cùng bạn ở đâu?
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '22px' }}>
            <Link
              href="/dich-vu"
              data-reveal
              style={{
                opacity: 0,
                transform: 'translateY(24px)',
                transition: 'opacity .8s ease,transform .8s ease',
                display: 'block',
                background: '#FCFAF4',
                border: '1px solid #EAE0D0',
                borderRadius: '24px',
                padding: '34px',
                cursor: 'pointer',
                color: 'inherit',
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '15px',
                  display: 'grid',
                  placeItems: 'center',
                  background: '#E7EADD',
                  color: 'var(--accent-deep,#434D35)',
                  marginBottom: '20px',
                }}
              >
                <MessagesSquare style={{ width: '25px', height: '25px' }} />
              </div>
              <h3 style={{ fontFamily: "'Newsreader',serif", fontWeight: 500, fontSize: '1.4rem', marginBottom: '10px' }}>
                Tham vấn & Trị liệu
              </h3>
              <p style={{ color: '#6B6459', fontSize: '.97rem' }}>
                Cho các vấn đề về bản ngã, lòng tự trọng, gắn bó, và bệnh lý: trầm cảm, lo âu, ADHD, BPD, PTSD…
              </p>
            </Link>
            <Link
              href="/dich-vu"
              data-reveal
              style={{
                opacity: 0,
                transform: 'translateY(24px)',
                transition: 'opacity .8s ease .08s,transform .8s ease .08s',
                display: 'block',
                background: '#FCFAF4',
                border: '1px solid #EAE0D0',
                borderRadius: '24px',
                padding: '34px',
                cursor: 'pointer',
                color: 'inherit',
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '15px',
                  display: 'grid',
                  placeItems: 'center',
                  background: '#ECE6F0',
                  color: '#7A6A82',
                  marginBottom: '20px',
                }}
              >
                <ClipboardList style={{ width: '25px', height: '25px' }} />
              </div>
              <h3 style={{ fontFamily: "'Newsreader',serif", fontWeight: 500, fontSize: '1.4rem', marginBottom: '10px' }}>
                Đánh giá tâm lý
              </h3>
              <p style={{ color: '#6B6459', fontSize: '.97rem' }}>
                Buổi 60 phút cùng nhà tâm lý + báo cáo PDF chuyên sâu qua email trong 7–10 ngày.
              </p>
            </Link>
            <Link
              href="/dich-vu"
              data-reveal
              style={{
                opacity: 0,
                transform: 'translateY(24px)',
                transition: 'opacity .8s ease .16s,transform .8s ease .16s',
                display: 'block',
                background: '#FCFAF4',
                border: '1px solid #EAE0D0',
                borderRadius: '24px',
                padding: '34px',
                cursor: 'pointer',
                color: 'inherit',
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '15px',
                  display: 'grid',
                  placeItems: 'center',
                  background: '#EEDFD3',
                  color: '#A05F41',
                  marginBottom: '20px',
                }}
              >
                <Users style={{ width: '25px', height: '25px' }} />
              </div>
              <h3 style={{ fontFamily: "'Newsreader',serif", fontWeight: 500, fontSize: '1.4rem', marginBottom: '10px' }}>
                Cặp đôi · Art · Hướng nghiệp
              </h3>
              <p style={{ color: '#6B6459', fontSize: '.97rem' }}>
                Tham vấn cặp đôi, trị liệu bằng nghệ thuật và định hướng nghề nghiệp cho tuổi trẻ.
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* PHILOSOPHY */}
      <section style={{ padding: '0 0 clamp(56px,8vw,96px)' }}>
        <div style={{ maxWidth: '1160px', margin: '0 auto', padding: '0 clamp(20px,5vw,40px)' }}>
          <div
            data-reveal
            style={{
              opacity: 0,
              transform: 'translateY(24px)',
              transition: 'opacity .9s ease,transform .9s ease',
              background: '#EFE7D8',
              borderRadius: '32px',
              padding: 'clamp(40px,7vw,72px) clamp(28px,6vw,64px)',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <span style={{ fontSize: '.74rem', letterSpacing: '.24em', textTransform: 'uppercase', color: 'var(--accent-deep,#434D35)', fontWeight: 600 }}>
              Tinh thần Wabi
            </span>
            <p
              style={{
                fontFamily: "'Newsreader',serif",
                fontWeight: 400,
                fontSize: 'clamp(1.5rem,3.4vw,2.2rem)',
                lineHeight: 1.4,
                maxWidth: '760px',
                margin: '22px auto 0',
              }}
            >
              Mỗi vết thương tâm hồn đều xứng đáng được{' '}
              <span style={{ fontStyle: 'italic', color: 'var(--accent-deep,#434D35)' }}>lắng nghe và chăm sóc.</span> Wabi
              có những nhà trị liệu sẵn sàng ở đây, đi cùng bạn nhẹ nhàng từng bước.
            </p>
          </div>
        </div>
      </section>

      {/* TEAM GLIMPSE */}
      <section style={{ padding: '0 0 clamp(56px,8vw,96px)' }}>
        <div style={{ maxWidth: '1160px', margin: '0 auto', padding: '0 clamp(20px,5vw,40px)' }}>
          <div
            data-reveal
            style={{
              opacity: 0,
              transform: 'translateY(22px)',
              transition: 'opacity .8s ease,transform .8s ease',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              gap: '20px',
              flexWrap: 'wrap',
              marginBottom: '40px',
            }}
          >
            <div style={{ maxWidth: '560px' }}>
              <span style={{ fontSize: '.74rem', letterSpacing: '.24em', textTransform: 'uppercase', color: 'var(--accent-deep,#434D35)', fontWeight: 600 }}>
                Đội ngũ
              </span>
              <h2
                style={{
                  fontFamily: "'Newsreader',serif",
                  fontWeight: 400,
                  fontSize: 'clamp(2rem,4vw,2.7rem)',
                  letterSpacing: '-.01em',
                  lineHeight: 1.14,
                  marginTop: '14px',
                }}
              >
                Những người sẽ đồng hành cùng bạn
              </h2>
            </div>
            <Link
              href="/doi-ngu"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 500, color: 'var(--accent-deep,#434D35)' }}
            >
              Xem tất cả therapist <ArrowRight style={{ width: '17px', height: '17px' }} />
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '22px' }}>
            {GLIMPSE.map((g) => {
              const t = byName.get(g.name) ?? g
              return (
                <div
                  key={g.name}
                  data-reveal
                  style={{
                    opacity: 0,
                    transform: 'translateY(24px)',
                    transition: `opacity .8s ease${g.delay},transform .8s ease${g.delay}`,
                    background: '#FCFAF4',
                    border: '1px solid #EAE0D0',
                    borderRadius: '24px',
                    padding: '20px',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      width: '104px',
                      height: '104px',
                      margin: '0 auto 16px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: '1px solid #E7DECE',
                    }}
                  >
                    <ImagePlaceholder label="Ảnh" />
                  </div>
                  <h4 style={{ fontFamily: "'Newsreader',serif", fontWeight: 500, fontSize: '1.2rem' }}>{t.name}</h4>
                  <div style={{ fontSize: '.82rem', color: '#8A8072', marginTop: '4px' }}>{t.title}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CLOSING CTA */}
      <section style={{ padding: '0 0 clamp(64px,9vw,110px)' }}>
        <div
          data-reveal
          style={{
            opacity: 0,
            transform: 'translateY(24px)',
            transition: 'opacity .9s ease,transform .9s ease',
            maxWidth: '900px',
            margin: '0 auto',
            padding: '0 clamp(20px,5vw,40px)',
            textAlign: 'center',
          }}
        >
          <h2
            style={{
              fontFamily: "'Newsreader',serif",
              fontWeight: 400,
              fontSize: 'clamp(1.9rem,4.4vw,3rem)',
              letterSpacing: '-.01em',
              lineHeight: 1.16,
              marginBottom: '16px',
            }}
          >
            Bạn không cần phải chờ đến khi “đủ tệ”.
          </h2>
          <p style={{ color: '#645D53', maxWidth: '520px', margin: '0 auto 30px', fontSize: '1.06rem' }}>
            Hãy đi therapy khi bạn sẵn sàng. Nhắn cho tụi mình bất cứ khi nào bạn muốn bắt đầu.
          </p>
          <Link
            href="/lien-he"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '9px',
              padding: '15px 32px',
              borderRadius: '100px',
              fontWeight: 500,
              cursor: 'pointer',
              background: 'var(--accent,#5A6647)',
              color: '#FCFAF4',
              boxShadow: '0 16px 34px -18px rgba(90,102,71,.9)',
            }}
          >
            <CalendarHeart style={{ width: '18px', height: '18px' }} /> Bắt đầu ngay
          </Link>
        </div>
      </section>
    </>
  )
}
