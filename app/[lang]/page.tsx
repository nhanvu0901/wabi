import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  ClipboardList,
  Compass,
  GraduationCap,
  HeartHandshake,
  MessagesSquare,
  ShieldCheck,
  Users,
} from 'lucide-react'
import ParallaxA from '../../components/ParallaxA'
import ParallaxHeroTitle from '../../components/ParallaxHeroTitle'
import ParallaxIntro from '../../components/ParallaxIntro'
import Rich from '../../components/Rich'
import { getTherapists } from '../../lib/content'
import { selectHomepageTherapists } from '../../lib/home-team'
import { isLang, langAlternates, t, type Lang } from '../../lib/i18n'
import { pickTitle } from '../../lib/types'
import { notFound } from 'next/navigation'

export const revalidate = 60

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  return isLang(lang) ? { alternates: langAlternates(lang, '') } : {}
}

const EYEBROW: React.CSSProperties = {
  fontSize: '.72rem',
  letterSpacing: '.2em',
  textTransform: 'uppercase',
  color: '#4C5C38',
  fontWeight: 600,
}

const TITLE: React.CSSProperties = {
  fontFamily: "'Newsreader',serif",
  fontWeight: 400,
  fontSize: 'clamp(2rem,4vw,2.8rem)',
  letterSpacing: '-.015em',
  lineHeight: 1.1,
  marginTop: '14px',
}

const PILL: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '12px',
  padding: '7px 7px 7px 26px',
  borderRadius: '100px',
  fontWeight: 500,
}

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params
  if (!isLang(raw)) notFound()
  const lang: Lang = raw
  const tr = t(lang)
  const therapists = selectHomepageTherapists(await getTherapists())

  const whyCards = [
    { key: 'why.c1', Icon: ShieldCheck, background: 'linear-gradient(165deg,#42502F,#37432A)', color: '#F4F1E4', iconBg: 'rgba(244,241,228,.14)', iconColor: '#DDE6C4', y: -70 },
    { key: 'why.c2', Icon: GraduationCap, background: '#E7ECD8', color: '#2C3320', iconBg: '#FBF9F0', iconColor: '#4C5C38', y: -40 },
    { key: 'why.c3', Icon: HeartHandshake, background: '#FBF9F0', color: '#2C3320', iconBg: '#E7ECD8', iconColor: '#4C5C38', y: -12 },
  ]

  const serviceCards = [
    { key: 'sp.c1', Icon: MessagesSquare, background: '#FBF9F0', iconBg: '#E7ECD8', iconColor: '#4C5C38', y: -34 },
    { key: 'sp.c2', Icon: ClipboardList, background: 'linear-gradient(165deg,#6E8049,#42502F)', color: '#F4F1E4', iconBg: 'rgba(244,241,228,.14)', iconColor: '#DDE6C4', y: -62 },
    { key: 'sp.c3', Icon: Users, background: '#E7ECD8', iconBg: '#FBF9F0', iconColor: '#4C5C38', y: -34 },
  ]

  return (
    <ParallaxA>
      <section data-pxa-stage className="pxa-stage" aria-labelledby="home-title">
        <div data-pxa-inner className="pxa-stage__inner">
          <div data-pxa="pin" data-pxa-scale="-0.08" data-pxa-opacity="1,0.55" className="pxa-hero">
          <div data-pxa="pin" data-pxa-y="70" className="pxa-layer" style={{ top: '14%', left: '50%', width: 'min(320px,42vw)', height: 'min(320px,42vw)', marginLeft: 'min(-160px,-21vw)', borderRadius: '50%', background: 'radial-gradient(circle,rgba(255,253,244,.98),rgba(233,239,214,.4) 62%,transparent 72%)' }} />
          <div data-pxa="pin" data-pxa-y="-40" className="pxa-layer" style={{ bottom: '-6%', left: '-12%', right: '-12%', height: '56%', borderRadius: '50% 50% 0 0/34% 34% 0 0', background: 'linear-gradient(180deg,#CFDAB2,#C2CFA1)', opacity: .85 }} />
          <div data-pxa="pin" data-pxa-y="-95" className="pxa-layer" style={{ bottom: '-10%', left: '-22%', right: '8%', height: '48%', borderRadius: '50% 50% 0 0/40% 40% 0 0', background: 'linear-gradient(180deg,#A9BC85,#94A96F)' }} />
          <div data-pxa="pin" data-pxa-y="-150" data-pxa-x="30" className="pxa-layer" style={{ bottom: '-14%', left: '6%', right: '-24%', height: '40%', borderRadius: '50% 50% 0 0/44% 44% 0 0', background: 'linear-gradient(180deg,#7B8F58,#67793F)' }} />
          <div data-pxa="pin" data-pxa-y="-60" data-pxa-opacity="0.75,0.25" className="pxa-layer" style={{ bottom: '24%', left: '-10%', right: '-10%', height: '22%', background: 'linear-gradient(180deg,rgba(251,249,240,0),rgba(251,249,240,.95),rgba(251,249,240,0))', filter: 'blur(14px)' }} />
          <div data-pxa="pin" data-pxa-y="-230" data-pxa-x="-40" className="pxa-layer" style={{ bottom: '-8%', left: '-6%', width: 'min(340px,40vw)', height: 'min(240px,30vw)', borderRadius: '52% 48% 40% 60%/60% 50% 50% 40%', background: 'linear-gradient(150deg,#4E5F35,#3B4A28)' }} />
          <div data-pxa="pin" data-pxa-y="-280" data-pxa-x="52" className="pxa-layer" style={{ bottom: '-12%', right: '-8%', width: 'min(400px,44vw)', height: 'min(260px,32vw)', borderRadius: '46% 54% 58% 42%/52% 46% 54% 48%', background: 'linear-gradient(200deg,#57683C,#3F4E2B)' }} />

          <div className="pxa-hero-content">
            <div style={{ maxWidth: '840px' }}>
              <span data-pxa="pin" data-pxa-y="-90" data-pxa-opacity="1,0" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', border: '1px solid rgba(76,92,56,.16)', padding: '8px 18px', borderRadius: '100px', background: 'rgba(251,249,240,.9)', ...EYEBROW }}>
                <i style={{ width: '13px', height: '13px', background: '#6E8049', clipPath: 'polygon(50% 0,57% 43%,100% 50%,57% 57%,50% 100%,43% 57%,0 50%,43% 43%)' }} />
                {tr('hero.eyebrow')}
              </span>
              <ParallaxHeroTitle lines={[tr('hero.line1'), tr('hero.line2'), tr('hero.line3')]} />
              <div data-pxa="pin" data-pxa-y="-330" data-pxa-opacity="1,0" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px', marginTop: '34px' }}>
                <Link href={`/${lang}/lien-he`} style={{ ...PILL, background: 'linear-gradient(100deg,#42502F,#6E8049)', color: '#F7F5EA', boxShadow: '0 20px 38px -20px rgba(44,51,32,.95)' }}>
                  {tr('hero.cta1')} <span style={{ display: 'grid', width: '38px', height: '38px', placeItems: 'center', borderRadius: '50%', background: 'rgba(247,245,234,.2)' }}><ArrowRight size={16} /></span>
                </Link>
                <Link href={`/${lang}/dich-vu`} style={{ ...PILL, background: 'rgba(251,249,240,.94)', color: '#2C3320', boxShadow: '0 20px 38px -24px rgba(44,51,32,.8)' }}>
                  {tr('hero.cta2')} <span style={{ display: 'grid', width: '38px', height: '38px', placeItems: 'center', borderRadius: '50%', background: '#E7ECD8', color: '#4C5C38' }}><Compass size={16} /></span>
                </Link>
              </div>
            </div>
            <div data-pxa="pin" data-pxa-opacity="1,0" style={{ position: 'absolute', bottom: '22px', display: 'grid', justifyItems: 'center', gap: '7px', color: '#4C5C38', fontSize: '.72rem', letterSpacing: '.15em', textTransform: 'uppercase' }}>
              <span>{tr('hero.scroll')}</span><i className="pxa-scroll-line" />
            </div>
          </div>
          </div>
        </div>
      </section>

      <ParallaxIntro
        eyebrow={tr('intro.eyebrow')}
        body={tr('hero.body')}
        stats={[
          { number: '15+', label: tr('trust.1') },
          { number: '10+', label: tr('trust.2') },
          { number: '4', label: tr('trust.3') },
          { number: tr('trust.4num'), label: tr('trust.4') },
        ]}
      />

      <section data-pxa-stage className="pxa-values">
        <div className="pxa-shell pxa-shell--wide pxa-value-grid">
          <div className="pxa-scene-sticky" aria-hidden="true">
            <div data-pxa="pin" data-pxa-y="60" className="pxa-layer" style={{ top: '12%', left: '50%', width: '64%', aspectRatio: 1, marginLeft: '-32%', borderRadius: '50%', background: 'radial-gradient(circle,rgba(255,253,244,.95),rgba(233,239,214,.35) 60%,transparent 72%)' }} />
            <div data-pxa="pin" data-pxa-y="-70" className="pxa-layer" style={{ bottom: '-4%', left: '-14%', right: '-14%', height: '44%', borderRadius: '50% 50% 0 0/38% 38% 0 0', background: '#BECB9C' }} />
            <div data-pxa="pin" data-pxa-y="-140" data-pxa-x="-22" className="pxa-layer" style={{ bottom: '-8%', left: '-18%', right: '12%', height: '36%', borderRadius: '50% 50% 0 0/44% 44% 0 0', background: '#93A96D' }} />
            <div data-pxa="pin" data-pxa-y="-210" data-pxa-x="26" className="pxa-layer" style={{ bottom: '-10%', left: '8%', right: '-18%', height: '28%', borderRadius: '50% 50% 0 0/48% 48% 0 0', background: '#5B6C3D' }} />
            <div data-pxa="pin" data-pxa-y="-60" data-pxa-rotate="14" className="pxa-layer" style={{ top: '16%', left: '50%', width: 'min(180px,26vw)', height: 'min(180px,26vw)', marginLeft: 'min(-90px,-13vw)', border: '1px solid rgba(76,92,56,.28)', borderRadius: '50%' }} />
            <span style={{ position: 'absolute', bottom: '26px', left: 0, right: 0, textAlign: 'center', fontFamily: "'Newsreader',serif", fontStyle: 'italic', color: '#3A4629' }}>{tr('phil.eyebrow')}</span>
          </div>
          <div className="pxa-card-stack">
            <div data-pxa="flow" data-pxa-y="-28" style={{ padding: 'clamp(26px,4vw,42px) 0 12px' }}><span style={EYEBROW}>{tr('why.eyebrow')}</span><h2 style={TITLE}>{tr('why.title')}</h2></div>
            {whyCards.map(({ key, Icon, background, color, iconBg, iconColor, y }, index) => <article key={key} data-pxa="flow" data-pxa-y={y} className={`pxa-value-card pxa-value-card--${index + 1}`} style={{ background, color }}>{index === 0 && <Icon className="pxa-value-card__watermark" aria-hidden="true" />}<div className="pxa-icon" style={{ background: iconBg, color: iconColor }}><Icon size={24} /></div><h3 style={{ fontFamily: "'Newsreader',serif", fontWeight: 500, fontSize: '1.5rem', marginBottom: '10px' }}>{tr(`${key}.t`)}</h3><p style={{ color: color === '#F4F1E4' ? 'rgba(244,241,228,.78)' : '#6B7355' }}>{tr(`${key}.b`)}</p></article>)}
          </div>
        </div>
      </section>

      <section className="pxa-services">
        <div className="pxa-shell">
          <div data-pxa="flow" data-pxa-y="-32" style={{ maxWidth: '640px', marginBottom: '42px' }}><span style={EYEBROW}>{tr('sp.eyebrow')}</span><h2 style={TITLE}>{tr('sp.title')}</h2></div>
          <div className="pxa-service-grid">
            {serviceCards.map(({ key, Icon, background, color = '#2C3320', iconBg, iconColor, y }) => <Link key={key} href={`/${lang}/dich-vu`} data-pxa="flow" data-pxa-y={y} className="pxa-service-card" style={{ background, color }}><div className="pxa-icon" style={{ marginBottom: 'auto', background: iconBg, color: iconColor }}><Icon size={24} /></div><h3 style={{ fontFamily: "'Newsreader',serif", fontWeight: 500, fontSize: '1.5rem', marginBottom: '10px' }}>{tr(`${key}.t`)}</h3><p style={{ color: color === '#F4F1E4' ? 'rgba(244,241,228,.78)' : '#6B7355' }}>{tr(`${key}.b`)}</p><span style={{ alignSelf: 'flex-end', display: 'grid', width: '42px', height: '42px', marginTop: '18px', placeItems: 'center', borderRadius: '50%', background: color === '#F4F1E4' ? '#F4F1E4' : '#6E8049', color: color === '#F4F1E4' ? '#42502F' : '#F7F5EA' }}><ArrowRight size={18} /></span></Link>)}
          </div>
        </div>
      </section>

      <section data-pxa-stage className="pxa-stage pxa-stage--quote">
        <div data-pxa-inner className="pxa-stage__inner pxa-quote-stage">
          <div className="pxa-quote-frame">
            <div data-pxa="pin" data-pxa-y="120" data-pxa-scale="0.1" className="pxa-layer" style={{ inset: '-10%', background: 'radial-gradient(circle at 50% 30%,rgba(221,230,196,.22),transparent 60%)' }} />
            <div data-pxa="pin" data-pxa-y="-110" className="pxa-layer" style={{ bottom: '-6%', left: '-14%', right: '-14%', height: '40%', borderRadius: '50% 50% 0 0/38% 38% 0 0', background: '#39472A' }} />
            <div data-pxa="pin" data-pxa-y="-190" data-pxa-x="-30" className="pxa-layer" style={{ bottom: '-10%', left: '-18%', right: '16%', height: '30%', borderRadius: '50% 50% 0 0/46% 46% 0 0', background: '#2C3720' }} />
          </div>
          <div data-pxa="pin" data-pxa-y="-140" data-pxa-scale="0.06" className="pxa-quote-orb"><div><span style={EYEBROW}>{tr('phil.eyebrow')}</span><Rich as="p" html={tr('phil.body')} style={{ fontFamily: "'Newsreader',serif", fontWeight: 400, fontSize: 'clamp(1.45rem,3.3vw,2.2rem)', lineHeight: 1.35, color: '#2C3320', marginTop: '18px' }} /></div></div>
        </div>
      </section>

      <section className="pxa-team">
        <div className="pxa-shell">
          <div data-pxa="flow" data-pxa-y="-26" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap', marginBottom: '40px' }}><div><span style={EYEBROW}>{tr('tg.eyebrow')}</span><h2 style={TITLE}>{tr('tg.title')}</h2></div><Link href={`/${lang}/doi-ngu`} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#42502F', fontWeight: 500 }}>{tr('tg.viewall')} <ArrowRight size={17} /></Link></div>
          <div className="pxa-team-grid">
            {therapists.map((therapist) => (
              <article key={therapist.id} className="pxa-team-card">
                <div style={{ width: '104px', height: '104px', margin: '0 auto 16px', borderRadius: '50%', overflow: 'hidden', border: '1px solid #E7DECE' }}>
                  <Image src={therapist.photo_url} alt={therapist.name} width={208} height={208} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <h3 style={{ fontFamily: "'Newsreader',serif", fontWeight: 500, fontSize: '1.2rem' }}>{therapist.name}</h3>
                <p style={{ marginTop: '4px', fontSize: '.82rem', color: '#8A8072' }}>{pickTitle(therapist, lang)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="pxa-close"><div className="pxa-shell"><div data-pxa="flow" data-pxa-y="-40" className="pxa-close-card"><h2 style={{ ...TITLE, fontSize: 'clamp(2rem,4.5vw,3.2rem)', margin: '0 0 16px' }}>{tr('cta.title')}</h2><p style={{ maxWidth: '520px', margin: '0 auto 30px', color: '#5C6349', fontSize: '1.06rem' }}>{tr('cta.body')}</p><Link href={`/${lang}/lien-he`} style={{ ...PILL, background: 'linear-gradient(100deg,#42502F,#6E8049)', color: '#F7F5EA' }}>{tr('cta.btn')} <span style={{ display: 'grid', width: '38px', height: '38px', placeItems: 'center', borderRadius: '50%', background: 'rgba(247,245,234,.2)' }}><ArrowRight size={16} /></span></Link></div></div></section>
    </ParallaxA>
  )
}
