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
      document.querySelectorAll<HTMLElement>('[data-rise]').forEach((el) => el.setAttribute('data-risen', 'true'))
      return
    }
    // Tiêu đề dâng lên (components/RiseIn) dùng chung observer này — một chỗ
    // quan sát cho cả hai cơ chế, không dựng thêm observer thứ hai.
    const risers = Array.from(document.querySelectorAll<HTMLElement>('[data-rise]'))
    const rise = (el: HTMLElement) => el.setAttribute('data-risen', 'true')

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const el = e.target as HTMLElement
            if (el.hasAttribute('data-rise')) rise(el)
            else show(el)
            io.unobserve(e.target)
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
    )
    els.forEach((el) => io.observe(el))
    risers.forEach((el) => io.observe(el))
    // safety: never leave content invisible
    const t = setTimeout(() => {
      els.forEach((el) => {
        if (getComputedStyle(el).opacity === '0') show(el)
      })
      risers.forEach(rise)
    }, 2600)
    return () => {
      io.disconnect()
      clearTimeout(t)
    }
  }, [pathname])
  return null
}
