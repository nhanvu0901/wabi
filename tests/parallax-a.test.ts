import { describe, expect, it } from 'vitest'

import { flowProgress, parallaxTransform, stageProgress } from '../lib/parallax-a'

describe('Pinned Stages motion math', () => {
  it('maps the scrollable portion of a stage to a 0–1 progress value', () => {
    expect(stageProgress(800, 1800, 800)).toBe(0)
    expect(stageProgress(-500, 1800, 800)).toBe(0.5)
    expect(stageProgress(-1400, 1800, 800)).toBe(1)
  })

  it('combines configured layer movement into a GPU-friendly transform', () => {
    expect(parallaxTransform({ progress: 0.5, x: 30, y: -150, scale: -0.08, rotate: 0 })).toBe(
      'translate3d(15.00px,-75.00px,0) scale(0.9600)'
    )
  })

  it('calculates flow motion from a stable document position', () => {
    expect(flowProgress(1400, 1000, 800)).toBe(0)
    expect(flowProgress(1200, 1000, 800)).toBe(0.25)
    expect(flowProgress(5000, 1000, 800)).toBe(-1.2)
  })
})
