'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

// Ports Wabi Therapy.dc.html's initReveal() (~L458-483) 1:1: threshold 0.12,
// rootMargin '0px 0px -6% 0px' (bottom edge only, NOT all sides), show =
// opacity:1 + transform:none then unobserve, 2600ms safety timeout that only
// forces elements still at opacity:0.
export default function RevealInit() {
  const pathname = usePathname()
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'))
    const show = (el: HTMLElement) => {
      el.style.opacity = '1'
      el.style.transform = 'none'
    }
    // ponytail: source's reduceMotion is an editor-time prop (default false,
    // unrelated to OS setting); the shipped site has no editor, so the real
    // accessibility signal is the OS media query.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      els.forEach(show)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            show(e.target as HTMLElement)
            io.unobserve(e.target)
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
    )
    els.forEach((el) => io.observe(el))
    // safety: never leave content invisible
    const t = setTimeout(() => {
      els.forEach((el) => {
        if (getComputedStyle(el).opacity === '0') show(el)
      })
    }, 2600)
    return () => {
      io.disconnect()
      clearTimeout(t)
    }
  }, [pathname])
  return null
}
