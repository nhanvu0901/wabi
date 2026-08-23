'use client'

import { useEffect } from 'react'
import { flowProgress, parallaxTransform, stageProgress } from '../lib/parallax-a'

function numberAttribute(element: HTMLElement, name: string): number {
  return Number.parseFloat(element.dataset[name] ?? '0') || 0
}

export default function ParallaxA({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>('[data-pxa-root]')
    if (!root) return

    type StageMotion = {
      element: HTMLElement
      inner: HTMLElement | null
      documentTop: number
      height: number
      progress: number
      transform: string
    }
    type LayerMotion = {
      element: HTMLElement
      stage?: StageMotion
      mode: 'pin' | 'flow'
      documentCenter: number
      x: number
      y: number
      scale: number
      rotate: number
      opacity?: [number, number]
      transform: string
      renderedOpacity: string
    }

    const stages: StageMotion[] = [...root.querySelectorAll<HTMLElement>('[data-pxa-stage]')].map((element) => ({
      element,
      inner: element.querySelector<HTMLElement>(':scope > [data-pxa-inner]'),
      documentTop: 0,
      height: 0,
      progress: 0,
      transform: '',
    }))
    const stageByElement = new Map(stages.map((stage) => [stage.element, stage]))
    const layers: LayerMotion[] = [...root.querySelectorAll<HTMLElement>('[data-pxa]')].map((element) => {
      const opacity = element.dataset.pxaOpacity?.split(',').map(Number)
      const stageElement = element.closest<HTMLElement>('[data-pxa-stage]')

      return {
        element,
        stage: stageElement ? stageByElement.get(stageElement) : undefined,
        mode: element.dataset.pxa === 'pin' ? 'pin' : 'flow',
        documentCenter: 0,
        x: numberAttribute(element, 'pxaX'),
        y: numberAttribute(element, 'pxaY'),
        scale: numberAttribute(element, 'pxaScale'),
        rotate: numberAttribute(element, 'pxaRotate'),
        opacity: opacity?.length === 2 && opacity.every(Number.isFinite) ? [opacity[0], opacity[1]] : undefined,
        transform: '',
        renderedOpacity: '',
      }
    })
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0
    let needsMeasure = true
    let disposed = false

    const resetMotion = () => {
      for (const stage of stages) {
        stage.inner?.style.removeProperty('transform')
        stage.transform = ''
      }
      for (const layer of layers) {
        layer.element.style.removeProperty('transform')
        layer.element.style.removeProperty('opacity')
        layer.transform = ''
        layer.renderedOpacity = ''
      }
    }

    const measure = () => {
      const scrollTop = window.scrollY

      // Flow positions must be measured without their previous visual transform.
      // All writes happen before all reads so this produces one layout pass, not
      // one forced layout per layer.
      for (const layer of layers) {
        if (layer.mode === 'flow') {
          layer.element.style.removeProperty('transform')
          layer.transform = ''
        }
      }
      for (const stage of stages) {
        const rect = stage.element.getBoundingClientRect()
        stage.documentTop = rect.top + scrollTop
        stage.height = rect.height
      }
      for (const layer of layers) {
        if (layer.mode !== 'flow') continue
        const rect = layer.element.getBoundingClientRect()
        layer.documentCenter = rect.top + scrollTop + rect.height / 2
      }
      needsMeasure = false
    }

    const paint = () => {
      frame = 0
      if (motionPreference.matches) {
        resetMotion()
        return
      }

      if (needsMeasure) measure()
      const viewportHeight = window.innerHeight || 800
      const scrollTop = window.scrollY

      for (const stage of stages) {
        const stageTop = stage.documentTop - scrollTop
        const span = Math.max(0, stage.height - viewportHeight)
        const offset = Math.min(Math.max(scrollTop - stage.documentTop, 0), span)
        const transform = `translate3d(0,${offset.toFixed(2)}px,0)`
        if (stage.inner && stage.transform !== transform) {
          stage.inner.style.transform = transform
          stage.transform = transform
        }
        stage.progress = stageProgress(stageTop, stage.height, viewportHeight)
      }

      for (const layer of layers) {
        const progress =
          layer.mode === 'pin' && layer.stage
            ? layer.stage.progress
            : flowProgress(layer.documentCenter, scrollTop, viewportHeight)
        const transform = parallaxTransform({
          progress,
          x: layer.x,
          y: layer.y,
          scale: layer.scale,
          rotate: layer.rotate,
        })
        if (layer.transform !== transform) {
          layer.element.style.transform = transform
          layer.transform = transform
        }
        if (layer.opacity) {
          const [from, to] = layer.opacity
          const t = Math.min(1, Math.max(0, progress))
          const opacity = String(from + (to - from) * t)
          if (layer.renderedOpacity !== opacity) {
            layer.element.style.opacity = opacity
            layer.renderedOpacity = opacity
          }
        }
      }
    }

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(paint)
    }
    const scheduleMeasure = () => {
      needsMeasure = true
      schedule()
    }
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', scheduleMeasure)
    window.addEventListener('load', scheduleMeasure, { once: true })
    motionPreference.addEventListener('change', scheduleMeasure)
    document.fonts?.ready.then(() => {
      if (!disposed) scheduleMeasure()
    })
    schedule()

    return () => {
      disposed = true
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', scheduleMeasure)
      window.removeEventListener('load', scheduleMeasure)
      motionPreference.removeEventListener('change', scheduleMeasure)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return <main data-pxa-root className="pxa-home">{children}</main>
}
