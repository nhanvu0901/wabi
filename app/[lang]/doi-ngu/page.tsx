import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MessageCircle } from 'lucide-react'
import { getTherapists } from '../../../lib/content'
import { isLang, t, langAlternates, type Lang } from '../../../lib/i18n'
import TherapistCard from '../../../components/TherapistCard'

export const revalidate = 60

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!isLang(lang)) return { title: 'Đội ngũ' }
  return { title: t(lang)('tm.eyebrow'), alternates: langAlternates(lang, '/doi-ngu') }
}

export default async function TeamPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params
  if (!isLang(raw)) notFound()
  const lang: Lang = raw
  const tr = t(lang)

  const therapists = await getTherapists()

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
            {tr('tm.eyebrow')}
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
            {tr('tm.title')}
          </h2>
          <p style={{ color: '#645D53', fontSize: '1.06rem' }}>{tr('tm.intro')}</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '22px' }}>
          {therapists.map((row) => (
            <TherapistCard key={row.id} t={row} lang={lang} />
          ))}
        </div>
        <p style={{ textAlign: 'center', color: '#7A7266', marginTop: '36px', fontSize: '.94rem' }}>{tr('tm.foot')}</p>
        <div style={{ textAlign: 'center', marginTop: '26px' }}>
          <Link
            href={`/${lang}/lien-he`}
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
            <MessageCircle style={{ width: '18px', height: '18px' }} /> <span>{tr('tm.cta')}</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
