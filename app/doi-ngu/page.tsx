import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { Therapist } from '../../lib/types'
import TherapistCard from '../../components/TherapistCard'

export const revalidate = 60
export const metadata = { title: 'Đội ngũ — Wabi Therapy' }

export default async function TeamPage() {
  const { data, error } = await supabase().from('therapists').select('*').order('sort_order')
  if (error) throw error
  const therapists = data as Therapist[]

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
            marginBottom: '52px',
          }}
        >
          <span style={{ fontSize: '.74rem', letterSpacing: '.24em', textTransform: 'uppercase', color: 'var(--accent-deep,#434D35)', fontWeight: 600 }}>
            Đội ngũ Therapist
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
            Những người sẽ đồng hành cùng bạn
          </h2>
          <p style={{ color: '#645D53', fontSize: '1.06rem' }}>
            Mỗi therapist có chuyên môn, liệu pháp và mức phí riêng. Chia sẻ với admin về tuổi, nơi sống và vấn đề bạn
            gặp — tụi mình sẽ tư vấn người phù hợp nhất. Bạn hoàn toàn có thể đổi therapist nếu thấy cần.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '22px' }}>
          {therapists.map((t) => (
            <TherapistCard key={t.id} t={t} />
          ))}
        </div>
        <p style={{ textAlign: 'center', color: '#7A7266', marginTop: '36px', fontSize: '.94rem' }}>
          …và nhiều chuyên viên khác. Nhắn admin để nhận danh sách đầy đủ phù hợp với nhu cầu của bạn.
        </p>
        <div style={{ textAlign: 'center', marginTop: '26px' }}>
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
            }}
          >
            <MessageCircle style={{ width: '18px', height: '18px' }} /> Nhờ tư vấn chọn therapist
          </Link>
        </div>
      </div>
    </section>
  )
}
