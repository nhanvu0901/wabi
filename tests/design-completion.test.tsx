import React from 'react'
import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next/navigation', () => ({ usePathname: () => '/vi' }))
import ChatBox from '../components/ChatBox'
import ContactPageContent from '../components/ContactPageContent'
import Footer from '../components/Footer'
import Nav from '../components/Nav'
import { selectHomepageTherapists } from '../lib/home-team'
import type { Therapist } from '../lib/types'

const therapist = (id: number, photoUrl: string | null): Therapist => ({
  id,
  sort_order: id,
  name: `Therapist ${id}`,
  title: 'Thạc sĩ Tâm lý',
  specialties: 'Lo âu',
  therapies: 'CBT',
  price: '650K',
  location: 'Online',
  title_en: 'MSc Psychology',
  specialties_en: 'Anxiety',
  therapies_en: 'CBT',
  location_en: 'Online',
  photo_url: photoUrl,
})

describe('new design completion', () => {
  it('renders the complete contact page visibly in server HTML', () => {
    const html = renderToStaticMarkup(<ContactPageContent lang="vi" />)
    const css = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8')
      .replace(/\s+/g, '')

    expect(html).toContain('contact-page')
    expect(html).toContain('Đường dây nóng')
    expect(html).toContain('Onion Cafe · Hà Nội')
    expect(html).not.toContain('data-reveal')
    expect(html).not.toMatch(/opacity:0(?:[;"'])/)
    expect(css).toContain('.contact-page__hero{text-align:center')
    expect(css).toContain('.contact-connect-card{position:relative;overflow:hidden;background:linear-gradient(160deg,var(--accent-deep,#42502F),#333E26)')
    expect(css).toContain('.contact-hotlines{background:#E7ECD8')
  })

  it('uses the new visual shell classes without changing behavior', () => {
    const nav = renderToStaticMarkup(<Nav lang="vi" />)
    const footer = renderToStaticMarkup(<Footer lang="vi" />)
    const chat = renderToStaticMarkup(<ChatBox lang="vi" />)
    const css = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8')
      .replace(/\s+/g, '')

    expect(nav).toContain('wabi-nav-shell')
    expect(nav).toContain('Đặt lịch')
    expect(footer).toContain('wabi-footer')
    expect(chat).toContain('wabi-chat-panel')
    expect(chat).toContain('aria-controls="chat-panel"')
    expect(css).toContain('.wabi-nav-shell{height:68px;display:flex')
    expect(css).toContain('.wabi-footer{position:relative;overflow:hidden;background:linear-gradient(170deg,var(--accent-deep,#42502F),#2F3A24)')
    expect(css).toContain('.wabi-chat-panel__header{display:flex;align-items:center;gap:12px;background:linear-gradient(120deg,var(--accent-deep,#42502F),#37432A)')
  })

  it('only selects homepage therapists that have an image', () => {
    const selected = selectHomepageTherapists([
      therapist(1, '/one.jpg'),
      therapist(2, null),
      therapist(3, '/three.jpg'),
      therapist(4, '/four.jpg'),
      therapist(5, '/five.jpg'),
      therapist(6, '   '),
      therapist(7, ' /seven.jpg '),
    ], 10)

    expect(selected.map((entry) => entry.id)).toEqual([1, 3, 4, 5, 7])
    expect(selectHomepageTherapists([therapist(7, ' /seven.jpg ')])[0]?.photo_url)
      .toBe('/seven.jpg')
  })

  it('flattens pinned stages when scripting is unavailable', () => {
    const css = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8')
      .replace(/\s+/g, '')
    const parallax = readFileSync(new URL('../components/ParallaxA.tsx', import.meta.url), 'utf8')

    expect(css).toContain('@media(scripting:none)')
    expect(css).toContain('.pxa-stage,.pxa-stage--quote{height:auto!important}')
    expect(css).toContain('.pxa-stage__inner{position:relative!important;height:max(640px,86vh)!important')
    expect(css).toContain('@media(max-width:940px)and(scripting:none)')
    expect(css).toContain('.wabi-nav-links{position:static;display:flex!important')
    expect(css).toContain('.wabi-nav-burger{display:none!important}')
    expect(parallax).toContain("motionPreference.addEventListener('change', scheduleMeasure)")
    expect(parallax).toContain("motionPreference.removeEventListener('change', scheduleMeasure)")
  })

  it('keeps scroll work scoped to the page and therapist cards visually stable', () => {
    const parallax = readFileSync(new URL('../components/ParallaxA.tsx', import.meta.url), 'utf8')
    const homepage = readFileSync(new URL('../app/[lang]/page.tsx', import.meta.url), 'utf8')

    expect(parallax).toContain("window.addEventListener('scroll', schedule")
    expect(parallax).not.toContain("document.addEventListener('scroll', schedule")
    expect(parallax).toContain('documentCenter')
    expect(homepage).toContain('<article key={therapist.id} className="pxa-team-card">')
  })

  it('uses responsive micro-interactions instead of the breathing duration for cards', () => {
    const css = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8')
      .replace(/\s+/g, '')

    expect(css).toContain('--micro:320ms')
    expect(css).toContain('.wabi-lift{transition:transformvar(--micro)')
    expect(css).toContain('.pxa-team-card{padding:20px')
    expect(css).not.toContain('.wabi-liftimg{filter:grayscale')
  })
})
