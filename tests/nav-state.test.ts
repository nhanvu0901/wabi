import { describe, expect, it } from 'vitest'
import {
  NAV_COLLAPSE_OFFSET,
  shouldCollapseNav,
  shouldRestoreNavTriggerFocus,
  shouldSuppressNavMotion,
  NAV_RESIZE_SETTLE_MS,
} from '../lib/nav-state'

describe('desktop navigation presentation', () => {
  it.each([
    { scrollY: 0, open: false, expected: false },
    { scrollY: NAV_COLLAPSE_OFFSET, open: false, expected: false },
    { scrollY: NAV_COLLAPSE_OFFSET + 1, open: false, expected: true },
    { scrollY: NAV_COLLAPSE_OFFSET + 1, open: true, expected: false },
  ])(
    'returns $expected for scrollY=$scrollY and open=$open',
    ({ scrollY, open, expected }) => {
      expect(shouldCollapseNav(scrollY, open)).toBe(expected)
    }
  )

  it.each([
    { scrollY: 1, focusWasInMenu: true, expected: false },
    { scrollY: NAV_COLLAPSE_OFFSET, focusWasInMenu: true, expected: false },
    { scrollY: NAV_COLLAPSE_OFFSET + 1, focusWasInMenu: false, expected: false },
    { scrollY: NAV_COLLAPSE_OFFSET + 1, focusWasInMenu: true, expected: true },
  ])(
    'restores trigger focus=$expected at scrollY=$scrollY when menu focus=$focusWasInMenu',
    ({ scrollY, focusWasInMenu, expected }) => {
      expect(shouldRestoreNavTriggerFocus(scrollY, focusWasInMenu)).toBe(expected)
    }
  )
})

describe('navigation motion during viewport resize', () => {
  it.each([
    { previousWidth: 1280, nextWidth: 1279, expected: true },
    { previousWidth: 940, nextWidth: 945, expected: true },
    { previousWidth: 1280, nextWidth: 1280, expected: false },
  ])(
    'returns $expected when width goes $previousWidth -> $nextWidth',
    ({ previousWidth, nextWidth, expected }) => {
      expect(shouldSuppressNavMotion(previousWidth, nextWidth)).toBe(expected)
    }
  )

  it('keeps motion enabled when only the viewport height changes', () => {
    expect(shouldSuppressNavMotion(390, 390)).toBe(false)
  })

  it('settles the resize lock in well under one animation cycle', () => {
    expect(NAV_RESIZE_SETTLE_MS).toBeGreaterThan(0)
    expect(NAV_RESIZE_SETTLE_MS).toBeLessThanOrEqual(200)
  })
})
