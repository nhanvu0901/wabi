import Link from 'next/link'
import Image from 'next/image'
import {
  MessageCircle,
  Compass,
  ShieldCheck,
  GraduationCap,
  HeartHandshake,
  MessagesSquare,
  ClipboardList,
  Users,
  ArrowRight,
} from 'lucide-react'
import ImagePlaceholder from '../../components/ImagePlaceholder'
import Rich from '../../components/Rich'
import { getTherapistsByName } from '../../lib/content'
import { isLang, t, langAlternates, type Lang } from '../../lib/i18n'
import { pickTitle } from '../../lib/types'
import { notFound } from 'next/navigation'

export const revalidate = 60

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  return isLang(lang) ? { alternates: langAlternates(lang, '') } : {}
}

// Glimpse cards: design order (bundled design L461–495). The design hard-codes
// these four names and pulls each role from tg.r1–r4; we match names against the
// DB so a rename in the dashboard shows up here, and fall back to the dictionary
// role when the row is missing or has no translation.
const GLIMPSE = [
  { name: 'ThS. Ngọc Mai', roleKey: 'tg.r1', delay: '' },
  { name: 'ThS. Hà Trang', roleKey: 'tg.r2', delay: ' .08s' },
  { name: 'ThS. Ly Đinh', roleKey: 'tg.r3', delay: ' .16s' },
  { name: 'ThS. Đức Minh', roleKey: 'tg.r4', delay: ' .24s' },
]

const EYEBROW: React.CSSProperties = {
  fontSize: '.74rem',
  letterSpacing: '.24em',
  textTransform: 'uppercase',
  color: 'var(--accent-deep,#434D35)',
  fontWeight: 600,
}

const SECTION_H2: React.CSSProperties = {
  fontFamily: "'Newsreader',serif",
  fontWeight: 400,
  fontSize: 'clamp(2rem,4vw,2.7rem)',
  letterSpacing: '-.01em',
  lineHeight: 1.14,
  marginTop: '14px',
}

const CARD: React.CSSProperties = {
  background: '#FCFAF4',
  border: '1px solid #EAE0D0',
  borderRadius: '24px',
  padding: '34px',
}

const CARD_ICON: React.CSSProperties = {
  width: '52px',
  height: '52px',
  borderRadius: '15px',
  display: 'grid',
  placeItems: 'center',
  marginBottom: '20px',
}

const CARD_H3: React.CSSProperties = {
  fontFamily: "'Newsreader',serif",
  fontWeight: 500,
  fontSize: '1.4rem',
  marginBottom: '10px',
}

const CARD_P: React.CSSProperties = { color: '#6B6459', fontSize: '.97rem' }

const PILL_CTA: React.CSSProperties = {
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
}

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params
  if (!isLang(raw)) notFound()
  const lang: Lang = raw
  const tr = t(lang)

  const rows = await getTherapistsByName(GLIMPSE.map((g) => g.name))
  const byName = new Map(rows.map((row) => [row.name, row]))

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
        {/* Vòng thở — điểm nhấn chuyển động của trang chủ. Ba vòng lệch pha 1/3
            nhịp; nhìn vài giây là thở theo, đó là kỹ thuật trị liệu thật.
            aria-hidden vì nó không mang thông tin gì cho trình đọc màn hình. */}
        <div className="wabi-breath-rings" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
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
              ...EYEBROW,
            }}
          >
            {tr('hero.eyebrow')}
          </span>
          <Rich
            as="h1"
            html={tr('hero.title')}
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
              display: 'block',
            }}
          />
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
            {tr('hero.body')}
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
            <Link href={`/${lang}/lien-he`} style={PILL_CTA}>
              <MessageCircle style={{ width: '18px', height: '18px' }} /> <span>{tr('hero.cta1')}</span>
            </Link>
            <Link
              href={`/${lang}/dich-vu`}
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
              <Compass style={{ width: '18px', height: '18px' }} /> <span>{tr('hero.cta2')}</span>
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
          {[
            { num: '15+', key: 'trust.1' },
            { num: '10+', key: 'trust.2' },
            { num: '4', key: 'trust.3' },
          ].map((s) => (
            <div key={s.key} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <b style={{ fontFamily: "'Newsreader',serif", fontWeight: 500, fontSize: '2.1rem', color: 'var(--accent-deep,#434D35)', lineHeight: 1 }}>
                {s.num}
              </b>
              <span style={{ fontSize: '.86rem', color: '#7A7266' }}>{tr(s.key)}</span>
            </div>
          ))}
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
              {tr('trust.4num')}
            </b>
            <span style={{ fontSize: '.86rem', color: '#7A7266' }}>{tr('trust.4')}</span>
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
            <span style={EYEBROW}>{tr('why.eyebrow')}</span>
            <h2 style={SECTION_H2}>{tr('why.title')}</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '22px' }}>
            {[
              { k: 'why.c1', Icon: ShieldCheck, bg: '#E7EADD', fg: 'var(--accent-deep,#434D35)', delay: '' },
              { k: 'why.c2', Icon: GraduationCap, bg: '#ECE6F0', fg: '#7A6A82', delay: ' .08s' },
              { k: 'why.c3', Icon: HeartHandshake, bg: '#EEDFD3', fg: '#A05F41', delay: ' .16s' },
            ].map(({ k, Icon, bg, fg, delay }) => (
              <div
                key={k}
                className="wabi-lift"
                data-reveal
                style={{
                  opacity: 0,
                  transform: 'translateY(24px)',
                  transition: `opacity .8s ease${delay},transform .8s ease${delay}`,
                  ...CARD,
                }}
              >
                <div style={{ ...CARD_ICON, background: bg, color: fg }}>
                  <Icon style={{ width: '25px', height: '25px' }} />
                </div>
                <h3 style={CARD_H3}>{tr(`${k}.t`)}</h3>
                <p style={CARD_P}>{tr(`${k}.b`)}</p>
              </div>
            ))}
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
            <span style={EYEBROW}>{tr('sp.eyebrow')}</span>
            <h2 style={SECTION_H2}>{tr('sp.title')}</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '22px' }}>
            {[
              { k: 'sp.c1', Icon: MessagesSquare, bg: '#E7EADD', fg: 'var(--accent-deep,#434D35)', delay: '' },
              { k: 'sp.c2', Icon: ClipboardList, bg: '#ECE6F0', fg: '#7A6A82', delay: ' .08s' },
              { k: 'sp.c3', Icon: Users, bg: '#EEDFD3', fg: '#A05F41', delay: ' .16s' },
            ].map(({ k, Icon, bg, fg, delay }) => (
              <Link
                key={k}
                href={`/${lang}/dich-vu`}
                className="wabi-lift"
                data-reveal
                style={{
                  opacity: 0,
                  transform: 'translateY(24px)',
                  transition: `opacity .8s ease${delay},transform .8s ease${delay}`,
                  display: 'block',
                  cursor: 'pointer',
                  color: 'inherit',
                  ...CARD,
                }}
              >
                <div style={{ ...CARD_ICON, background: bg, color: fg }}>
                  <Icon style={{ width: '25px', height: '25px' }} />
                </div>
                <h3 style={CARD_H3}>{tr(`${k}.t`)}</h3>
                <p style={CARD_P}>{tr(`${k}.b`)}</p>
              </Link>
            ))}
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
            <span style={EYEBROW}>{tr('phil.eyebrow')}</span>
            <Rich
              as="p"
              html={tr('phil.body')}
              style={{
                fontFamily: "'Newsreader',serif",
                fontWeight: 400,
                fontSize: 'clamp(1.5rem,3.4vw,2.2rem)',
                lineHeight: 1.4,
                maxWidth: '760px',
                margin: '22px auto 0',
              }}
            />
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
              <span style={EYEBROW}>{tr('tg.eyebrow')}</span>
              <h2 style={SECTION_H2}>{tr('tg.title')}</h2>
            </div>
            <Link
              href={`/${lang}/doi-ngu`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 500, color: 'var(--accent-deep,#434D35)' }}
            >
              <span>{tr('tg.viewall')}</span> <ArrowRight style={{ width: '17px', height: '17px' }} />
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '22px' }}>
            {GLIMPSE.map((g) => {
              const row = byName.get(g.name)
              const role = (row && pickTitle(row, lang)) || tr(g.roleKey)
              return (
                <div
                  key={g.name}
                  className="wabi-lift"
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
                    {row?.photo_url ? (
                      <Image
                        src={row.photo_url}
                        alt={row.name}
                        width={208}
                        height={208}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <ImagePlaceholder label="Ảnh" />
                    )}
                  </div>
                  <h4 style={{ fontFamily: "'Newsreader',serif", fontWeight: 500, fontSize: '1.2rem' }}>{row?.name ?? g.name}</h4>
                  <div style={{ fontSize: '.82rem', color: '#8A8072', marginTop: '4px' }}>{role}</div>
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
            {tr('cta.title')}
          </h2>
          <p style={{ color: '#645D53', maxWidth: '520px', margin: '0 auto 30px', fontSize: '1.06rem' }}>{tr('cta.body')}</p>
          <Link href={`/${lang}/lien-he`} style={{ ...PILL_CTA, padding: '15px 32px' }}>
            <MessageCircle style={{ width: '18px', height: '18px' }} /> <span>{tr('cta.btn')}</span>
          </Link>
        </div>
      </section>
    </>
  )
}
