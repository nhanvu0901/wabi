export function stageProgress(stageTop: number, stageHeight: number, viewportHeight: number): number {
  const span = Math.max(0, stageHeight - viewportHeight)
  if (span === 0) return 0
  return Math.min(1, Math.max(0, -stageTop / span))
}

export function flowProgress(documentCenter: number, scrollTop: number, viewportHeight: number): number {
  const progress = (scrollTop + viewportHeight / 2 - documentCenter) / viewportHeight
  return Math.min(1.2, Math.max(-1.2, progress))
}

type ParallaxOptions = {
  progress: number
  x?: number
  y?: number
  scale?: number
  rotate?: number
}

export function parallaxTransform({ progress, x = 0, y = 0, scale = 0, rotate = 0 }: ParallaxOptions): string {
  const parts = [`translate3d(${(x * progress).toFixed(2)}px,${(y * progress).toFixed(2)}px,0)`]
  if (scale) parts.push(`scale(${(1 + scale * Math.max(0, progress)).toFixed(4)})`)
  if (rotate) parts.push(`rotate(${(rotate * progress).toFixed(3)}deg)`)
  return parts.join(' ')
}
