'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowRight, Menu, X } from 'lucide-react'
import { LANGS, t, type Lang } from '../lib/i18n'
import {
  NAV_RESIZE_SETTLE_MS,
  shouldCollapseNav,
  shouldRestoreNavTriggerFocus,
  shouldSuppressNavMotion,
} from '../lib/nav-state'

const LINKS = [
  { path: '', key: 'nav.home' },
  { path: '/dich-vu', key: 'nav.services' },
  { path: '/doi-ngu', key: 'nav.team' },
  { path: '/lien-he', key: 'nav.contact' },
]

export default function Nav({ lang }: { lang: Lang }) {
  const [open, setOpen] = useState(false)
  const [pastCollapseOffset, setPastCollapseOffset] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const pathname = usePathname() || `/${lang}`
  const tr = t(lang)
  const rest = pathname.replace(/^\/(vi|en)/, '')
  const collapsed = pastCollapseOffset && !open

  useEffect(() => {
    let previousScrollY = window.scrollY
    const updateScrollState = () => {
      const scrollY = window.scrollY
      setPastCollapseOffset(shouldCollapseNav(scrollY, false))
      if (scrollY !== previousScrollY && window.matchMedia('(min-width: 941px)').matches) {
        const focusWasInMenu = contentRef.current?.contains(document.activeElement) ?? false
        setOpen(false)
        if (shouldRestoreNavTriggerFocus(scrollY, focusWasInMenu)) {
          requestAnimationFrame(() => menuButtonRef.current?.focus())
        }
      }
      previousScrollY = scrollY
    }

    updateScrollState()
    window.addEventListener('scroll', updateScrollState, { passive: true })
    return () => window.removeEventListener('scroll', updateScrollState)
  }, [])

  useEffect(() => {
    let previousWidth = window.innerWidth
    let settleTimer: ReturnType<typeof setTimeout> | undefined

    // The collapse transitions live inside the desktop media query, so crossing
    // the breakpoint replays them mid-drag. Park them until the drag settles.
    // Set synchronously here: resize runs before the frame's style recalc, which
    // is the only point where the suppression can still win.
    const lockMotionWhileResizing = () => {
      const width = window.innerWidth
      if (!shouldSuppressNavMotion(previousWidth, width)) return
      previousWidth = width
      document.documentElement.dataset.navResizing = 'true'
      clearTimeout(settleTimer)
      settleTimer = setTimeout(() => {
        delete document.documentElement.dataset.navResizing
      }, NAV_RESIZE_SETTLE_MS)
    }

    window.addEventListener('resize', lockMotionWhileResizing)
    return () => {
      window.removeEventListener('resize', lockMotionWhileResizing)
      clearTimeout(settleTimer)
      delete document.documentElement.dataset.navResizing
    }
  }, [])

  useEffect(() => {
    if (!open) return
    const frame = requestAnimationFrame(() => {
      contentRef.current?.querySelector<HTMLAnchorElement>('#primary-navigation a')?.focus()
    })
    return () => cancelAnimationFrame(frame)
  }, [open])

  return (
    <header
      className={`wabi-nav${pastCollapseOffset ? ' is-scrolled' : ''}${open ? ' is-open' : ''}${collapsed ? ' is-collapsed' : ''}`}
      data-nav-collapsed={collapsed}
    >
      <div className="wabi-nav__frame">
        <div className="wabi-nav-shell">
          <div ref={contentRef} className="wabi-nav__content">
            <Link className="wabi-nav__brand" href={`/${lang}`} onClick={() => setOpen(false)}>
              <span className="wabi-pulse wabi-nav__dot" />
              <span>Wabi <em>Therapy</em></span>
            </Link>

            <nav
              id="primary-navigation"
              className={`wabi-nav-links${open ? ' is-open' : ''}`}
              aria-label="Primary navigation"
            >
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
              <Link className="wabi-nav__booking" href={`/${lang}/lien-he`} onClick={() => setOpen(false)}>
                {tr('nav.book')}
                <span><ArrowRight aria-hidden="true" /></span>
              </Link>
            </div>
          </div>
          <button
            ref={menuButtonRef}
            className="wabi-nav-burger"
            type="button"
            aria-label={open ? (lang === 'vi' ? 'Đóng menu' : 'Close menu') : (lang === 'vi' ? 'Mở menu' : 'Open menu')}
            aria-controls="primary-navigation"
            aria-expanded={open}
            onClick={() => setOpen((current) => !current)}
          >
            <Menu className="wabi-nav-burger__menu" aria-hidden="true" />
            <X className="wabi-nav-burger__close" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  )
}
