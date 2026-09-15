export const NAV_COLLAPSE_OFFSET = 80

export function shouldCollapseNav(scrollY: number, open: boolean): boolean {
  return scrollY > NAV_COLLAPSE_OFFSET && !open
}

export function shouldRestoreNavTriggerFocus(scrollY: number, focusWasInMenu: boolean): boolean {
  return focusWasInMenu && shouldCollapseNav(scrollY, false)
}

/**
 * How long the nav stays motion-locked after the last resize event. Long enough
 * to cover a continuous drag, short enough that a real click right after the
 * drag still animates.
 */
export const NAV_RESIZE_SETTLE_MS = 140

/**
 * The nav's collapse transitions only exist inside the desktop media query, so
 * dragging across the breakpoint makes the browser replay the whole collapse
 * animation mid-drag. Only the width can cross that breakpoint — mobile browsers
 * fire resize for URL-bar height changes, which must keep their motion.
 */
export function shouldSuppressNavMotion(previousWidth: number, nextWidth: number): boolean {
  return previousWidth !== nextWidth
}
