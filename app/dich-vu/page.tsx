import Link from 'next/link'
import { Users } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { Service } from '../../lib/types'

export const revalidate = 60
export const metadata = { title: 'Dịch vụ — Wabi Therapy' }

// ponytail: pill label, tag chips and <b> highlights aren't DB columns
// (services table is only sort_order/name/description, char-verified from the
// same source section) — they stay hard-coded here, keyed by sort_order (1–5)
// since that's what the query orders by. Unknown sort_order (DB row without a
// matching entry) degrades to empty pill/tags/highlights instead of crashing.
const SERVICE_EXTRAS: Record<number, { pill: string; tags: string[]; highlights: string[] }> = {
  1: {
    pill: 'Counseling / Psychotherapy',
    tags: ['Trầm cảm · Lo âu', 'ADHD · BPD · PTSD', 'Attachment styles', 'Childhood trauma', 'Lòng tự trọng'],
    highlights: [],
  },
  2: {
    pill: 'Psychological Assessment',
    tags: ['Test nhân cách Big5', 'Đa trí thông minh', 'Lòng tự trọng (Sorensen)', 'Cảm nhận hạnh phúc (Ryff)'],
    highlights: ['7–10 ngày'],
  },
  3: {
    pill: 'Couple Therapy',
    tags: ['Đánh giá mối quan hệ', 'Chuẩn bị làm cha mẹ', 'Couple Hàn–Việt (tiếng Hàn)'],
    highlights: [],
  },
  4: {
    pill: 'Trị liệu bằng nghệ thuật',
    tags: ['Art as Therapy', 'Khám phá cảm xúc'],
    highlights: [],
  },
  5: {
    pill: 'Career Counseling',
    tags: ['Test đa trí thông minh', 'Định hướng nghề', 'Lập kế hoạch'],
    highlights: ['Cơ bản', 'Chuyên sâu'],
  },
}

// Source wraps some description phrases in <b style="color:#33302A;font-weight:500">
// (Wabi Therapy.dc.html:247, :289). DB stores plain text, so re-wrap the known
// phrases here. Phrase not found (content edited via dashboard) → renders plain.
function renderDescription(text: string, highlights: string[]): React.ReactNode[] {
  let parts: React.ReactNode[] = [text]
  for (const h of highlights) {
    parts = parts.flatMap((part) => {
      if (typeof part !== 'string' || !part.includes(h)) return [part]
      return part.split(h).flatMap((seg, i) =>
        i === 0
          ? [seg]
          : [
              <b key={`${h}-${i}`} style={{ color: '#33302A', fontWeight: 500 }}>
                {h}
              </b>,
              seg,
            ]
      )
    })
  }
  return parts
}

export default async function ServicesPage() {
  const { data, error } = await supabase().from('services').select('*').order('sort_order')
  if (error) throw error
  const services = data as Service[]

  return (
    <section style={{ padding: 'clamp(56px,8vw,96px) 0' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 clamp(20px,5vw,40px)' }}>
        <div
          data-reveal
          style={{
            opacity: 0,
            transform: 'translateY(22px)',
            transition: 'opacity .8s ease,transform .8s ease',
            maxWidth: '680px',
            marginBottom: '52px',
          }}
        >
          <span style={{ fontSize: '.74rem', letterSpacing: '.24em', textTransform: 'uppercase', color: 'var(--accent-deep,#434D35)', fontWeight: 600 }}>
            Dịch vụ
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
            Chọn hình thức phù hợp với bạn
          </h2>
          <p style={{ color: '#645D53', fontSize: '1.06rem' }}>
            Online qua Google Meet hoặc trực tiếp tại địa điểm của therapist (HN & TP.HCM). Một buổi khoảng 60 phút.
            Không quy định số buổi cố định.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {services.map((s) => {
            const extra = SERVICE_EXTRAS[s.sort_order] ?? { pill: '', tags: [], highlights: [] }
            return (
              <div
                key={s.id}
                data-reveal
                style={{
                  opacity: 0,
                  transform: 'translateY(24px)',
                  transition: 'opacity .7s ease,transform .7s ease',
                  background: '#FCFAF4',
                  border: '1px solid #EAE0D0',
                  borderRadius: '26px',
                  padding: 'clamp(28px,4vw,40px)',
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr',
                  gap: 'clamp(18px,3vw,32px)',
                }}
              >
                <div style={{ fontFamily: "'Newsreader',serif", fontSize: '1.7rem', color: '#B39BC0', fontWeight: 500, lineHeight: 1 }}>
                  {String(s.sort_order).padStart(2, '0')}
                </div>
                <div>
                  <h3 style={{ fontFamily: "'Newsreader',serif", fontWeight: 500, fontSize: 'clamp(1.4rem,2.6vw,1.75rem)', marginBottom: '8px' }}>
                    {s.name}
                  </h3>
                  <div
                    style={{
                      display: 'inline-block',
                      fontSize: '.74rem',
                      fontWeight: 500,
                      color: 'var(--accent-deep,#434D35)',
                      background: '#E7EADD',
                      padding: '5px 13px',
                      borderRadius: '100px',
                      marginBottom: '16px',
                    }}
                  >
                    {extra.pill}
                  </div>
                  <p style={{ color: '#6B6459', marginBottom: '18px' }}>{renderDescription(s.description, extra.highlights)}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '9px' }}>
                    {extra.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{ fontSize: '.83rem', background: '#F7F2E9', border: '1px solid #E7DECE', padding: '6px 14px', borderRadius: '100px', color: '#6B6459' }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <div
          data-reveal
          style={{ opacity: 0, transform: 'translateY(22px)', transition: 'opacity .8s ease,transform .8s ease', textAlign: 'center', marginTop: '48px' }}
        >
          <Link
            href="/doi-ngu"
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
            }}
          >
            <Users style={{ width: '18px', height: '18px' }} /> Gặp đội ngũ therapist
          </Link>
        </div>
      </div>
    </section>
  )
}
