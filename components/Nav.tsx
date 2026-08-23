'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowRight, Menu, X } from 'lucide-react'
import { LANGS, t, type Lang } from '../lib/i18n'

const LINKS = [
  { path: '', key: 'nav.home' },
  { path: '/dich-vu', key: 'nav.services' },
  { path: '/doi-ngu', key: 'nav.team' },
  { path: '/lien-he', key: 'nav.contact' },
]

export default function Nav({ lang }: { lang: Lang }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname() || `/${lang}`
  const tr = t(lang)
  const rest = pathname.replace(/^\/(vi|en)/, '')

  return (
    <header className="wabi-nav">
      <div className="wabi-nav__frame">
        <div className="wabi-nav-shell">
          <Link className="wabi-nav__brand" href={`/${lang}`} onClick={() => setOpen(false)}>
            <span className="wabi-pulse wabi-nav__dot" />
            <span>Wabi <em>Therapy</em></span>
          </Link>

          <nav className={`wabi-nav-links${open ? ' is-open' : ''}`} aria-label="Primary navigation">
            {LINKS.map((item) => {
              const href = `/${lang}${item.path}`
              const active = pathname === href
              return (
                <Link
                  key={item.key}
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  onClick={() => setOpen(false)}
                >
                  {tr(item.key)}
                </Link>
              )
            })}
          </nav>

          <div className="wabi-nav__actions">
            <div className="wabi-language-switch" aria-label="Language">
              {LANGS.map((entry) => (
                <Link
                  key={entry}
                  href={`/${entry}${rest}`}
                  hrefLang={entry}
                  aria-current={entry === lang ? 'true' : undefined}
                  onClick={() => setOpen(false)}
                >
                  {entry.toUpperCase()}
                </Link>
              ))}
            </div>
            <Link className="wabi-nav__booking" href={`/${lang}/lien-he`}>
              {tr('nav.book')}
              <span><ArrowRight aria-hidden="true" /></span>
            </Link>
            <button
              className="wabi-nav-burger"
              type="button"
              aria-label="Menu"
              aria-expanded={open}
              onClick={() => setOpen((current) => !current)}
            >
              {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
