'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import { LANGS, type Lang, t } from '../lib/i18n'

// Route slugs stay Vietnamese in both languages (/vi/dich-vu and /en/dich-vu).
// Only the visible label switches — that comes from the dictionary.
const LINKS = [
  { path: '', key: 'nav.home' },
  { path: '/dich-vu', key: 'nav.services' },
  { path: '/doi-ngu', key: 'nav.team' },
  { path: '/lien-he', key: 'nav.contact' },
]

export default function Nav({ lang }: { lang: Lang }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const tr = t(lang)

  // Strip the language prefix so the same path can be rebuilt in the other language.
  const rest = pathname.replace(/^\/(vi|en)/, '')

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 200,
        background: 'rgba(247,242,233,.82)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderBottom: '1px solid #E7DECE',
      }}
    >
      <div
        style={{
          maxWidth: '1160px',
          margin: '0 auto',
          padding: '0 clamp(20px,5vw,40px)',
          height: '74px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
        }}
      >
        <Link
          href={`/${lang}`}
          onClick={() => setOpen(false)}
          style={{ display: 'flex', alignItems: 'center', gap: '11px', cursor: 'pointer', color: '#33302A' }}
        >
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#B67A5E', boxShadow: '0 0 0 5px #EEDFD3' }}></span>
          <span style={{ fontFamily: "'Newsreader',serif", fontSize: '1.55rem', letterSpacing: '-.01em', lineHeight: 1 }}>
            Wabi <span style={{ fontStyle: 'italic', color: '#8A8072', fontSize: '.92em' }}>Therapy</span>
          </span>
        </Link>
        <nav className={open ? 'wnav-links open' : 'wnav-links'} id="wmenu" style={{ alignItems: 'center', gap: '4px' }}>
          {LINKS.map((l) => {
            const href = `/${lang}${l.path}`
            const active = pathname === href
            return (
              <Link
                key={l.key}
                href={href}
                onClick={() => setOpen(false)}
                style={{
                  fontSize: '.92rem',
                  padding: '9px 16px',
                  borderRadius: '100px',
                  cursor: 'pointer',
                  transition: '.2s',
                  background: active ? 'var(--accent,#5A6647)' : 'transparent',
                  color: active ? '#FCFAF4' : '#6B6459',
                }}
              >
                {tr(l.key)}
              </Link>
            )
          })}
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          {/* Language switcher — <Link> rather than the design's setLang(), so the
              server renders the chosen language instead of swapping it after load. */}
          <div style={{ display: 'flex', alignItems: 'center', background: '#F1E9DB', border: '1px solid #E2D8C6', borderRadius: '100px', padding: '3px' }}>
            {LANGS.map((l) => (
              <Link
                key={l}
                href={`/${l}${rest}`}
                hrefLang={l}
                aria-current={l === lang ? 'true' : undefined}
                onClick={() => setOpen(false)}
                style={{
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '.8rem',
                  fontWeight: 600,
                  padding: '6px 13px',
                  borderRadius: '100px',
                  transition: '.2s',
                  background: l === lang ? 'var(--accent,#5A6647)' : 'transparent',
                  color: l === lang ? '#FCFAF4' : '#8A8072',
                }}
              >
                {l.toUpperCase()}
              </Link>
            ))}
          </div>
          <button
            className="wburger"
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
            aria-expanded={open}
            style={{
              background: 'transparent',
              border: '1px solid #E2D8C6',
              borderRadius: '12px',
              width: '44px',
              height: '44px',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#33302A',
            }}
          >
            <Menu size={22} />
          </button>
        </div>
      </div>
    </header>
  )
}
