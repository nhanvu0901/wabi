import React from 'react'
import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next/navigation', () => ({ usePathname: () => '/vi' }))

import Nav from '../components/Nav'

describe('navigation behavior', () => {
  it('starts expanded and connects its menu button to the primary navigation', () => {
    const html = renderToStaticMarkup(<Nav lang="vi" />)

    expect(html).toContain('data-nav-collapsed="false"')
    expect(html).toContain('id="primary-navigation"')
    expect(html).toContain('aria-controls="primary-navigation"')
  })

  it('uses a right-anchored reveal and keeps both menu icons available for a crossfade', () => {
    const html = renderToStaticMarkup(<Nav lang="vi" />)
    const css = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8')

    expect(html).toContain('wabi-nav-burger__menu')
    expect(html).toContain('wabi-nav-burger__close')
    expect(css).toContain('clip-path:inset(0 round 100px)')
    expect(css).toContain('clip-path:inset(7px 0 7px calc(100% - 54px) round 27px)')
    expect(css).not.toContain('transition:width .36s')
    expect(css).not.toContain('.wabi-nav.is-collapsed .wabi-nav-shell{width:54px')
  })
})

describe('navigation motion guards', () => {
  const css = () => readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8')

  it('freezes nav transitions while the viewport is being resized', () => {
    expect(css()).toContain('[data-nav-resizing]')
  })

  it('lets the reduced-motion guard beat the collapsed-state transitions', () => {
    const reducedMotionBlock = css().slice(css().indexOf('@media(prefers-reduced-motion:reduce)'))

    expect(reducedMotionBlock).toContain('.wabi-nav__content{transition:none!important}')
  })
})
