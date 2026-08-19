import Link from 'next/link'
import { notFound } from 'next/navigation'
import RiseIn from '../../../components/RiseIn'
import { Users } from 'lucide-react'
import Rich from '../../../components/Rich'
import { getServices } from '../../../lib/content'
import { isLang, t, langAlternates, type Lang } from '../../../lib/i18n'
import { pickServiceName, pickServiceDescription } from '../../../lib/types'

export const revalidate = 60

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!isLang(lang)) return { title: 'Dịch vụ' }
  return { title: t(lang)('nav.services'), alternates: langAlternates(lang, '/dich-vu') }
}

// Pill label and tag chips aren't DB columns — the services table only holds
// sort_order/name/description. They stay here, keyed by sort_order (1–5).
// Following the design: pills for 01/02/03/05 are English clinical labels that
// don't translate, and only the tags that need translating carry a dict key.
// `key: true` means "look this up"; a plain string renders as-is in both languages.
type Chip = { text: string; key?: boolean }
const SERVICE_EXTRAS: Record<number, { pill: string; pillKey?: boolean; tags: Chip[]; highlightKeys?: string[] }> = {
  1: {
    pill: 'Counseling / Psychotherapy',
    tags: [
      { text: 'Trầm cảm · Lo âu' },
      { text: 'ADHD · BPD · PTSD' },
      { text: 'Attachment styles' },
      { text: 'Childhood trauma' },
      { text: 'sv1.tag', key: true },
    ],
  },
  2: {
    pill: 'Psychological Assessment',
    tags: [
      { text: 'sv2.tag1', key: true },
      { text: 'sv2.tag2', key: true },
      { text: 'sv2.tag3', key: true },
      { text: 'sv2.tag4', key: true },
    ],
  },
  3: {
    pill: 'Couple Therapy',
    tags: [
      { text: 'sv3.tag1', key: true },
      { text: 'sv3.tag2', key: true },
      { text: 'sv3.tag3', key: true },
    ],
  },
  4: {
    pill: 'sv4.badge',
    pillKey: true,
    tags: [{ text: 'Art as Therapy' }, { text: 'sv4.tag', key: true }],
  },
  5: {
    pill: 'Career Counseling',
    tags: [
      { text: 'sv5.tag1', key: true },
      { text: 'sv5.tag2', key: true },
      { text: 'sv5.tag3', key: true },
    ],
  },
}

// sv2.b and sv5.b carry <b> highlights in the dictionary; the DB stores plain
// text. When the DB copy still matches the dictionary copy we render the
// dictionary version (markup intact); once someone edits it in the dashboard the
// DB wins and renders plain.
const RICH_DESCRIPTION: Record<number, string> = { 2: 'sv2.b', 5: 'sv5.b' }

export default async function ServicesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params
  if (!isLang(raw)) notFound()
  const lang: Lang = raw
  const tr = t(lang)

  const services = await getServices()

  const stripTags = (s: string) => s.replace(/<[^>]*>/g, '')

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
            {tr('sp.eyebrow')}
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
            <RiseIn>{tr('sv.title')}</RiseIn>
          </h2>
          <p style={{ color: '#645D53', fontSize: '1.06rem' }}>{tr('sv.intro')}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {services.map((s) => {
            const extra = SERVICE_EXTRAS[s.sort_order] ?? { pill: '', tags: [] }
            const dbDescription = pickServiceDescription(s, lang)
            const richKey = RICH_DESCRIPTION[s.sort_order]
            const richValue = richKey ? tr(richKey) : null
            const useRich = richValue != null && stripTags(richValue) === dbDescription
            return (
              <div
                key={s.id}
                className="wabi-lift"
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
                    {pickServiceName(s, lang)}
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
                    {extra.pillKey ? tr(extra.pill) : extra.pill}
                  </div>
                  {useRich ? (
                    <Rich as="p" html={richValue} style={{ color: '#6B6459', marginBottom: '18px' }} />
                  ) : (
                    <p style={{ color: '#6B6459', marginBottom: '18px' }}>{dbDescription}</p>
                  )}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '9px' }}>
                    {extra.tags.map((tag) => (
                      <span
                        key={tag.text}
                        style={{ fontSize: '.83rem', background: '#F7F2E9', border: '1px solid #E7DECE', padding: '6px 14px', borderRadius: '100px', color: '#6B6459' }}
                      >
                        {tag.key ? tr(tag.text) : tag.text}
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
            href={`/${lang}/doi-ngu`}
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
            <Users style={{ width: '18px', height: '18px' }} /> <span>{tr('sv.cta')}</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
