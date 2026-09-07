'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import type { Lang } from '../lib/i18n'

type Props = {
  lang: Lang
  title: string
}

export default function MindfulBreathing({ lang, title }: Props) {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale')

  useEffect(() => {
    let active = true
    let timer: ReturnType<typeof setTimeout>

    const runCycle = () => {
      if (!active) return
      setPhase('inhale')
      timer = setTimeout(() => {
        if (!active) return
        setPhase('hold')
        timer = setTimeout(() => {
          if (!active) return
          setPhase('exhale')
          timer = setTimeout(() => {
            if (!active) return
            runCycle()
          }, 6000)
        }, 1000)
      }, 4000)
    }

    runCycle()

    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [])

  const phaseLabels = {
    inhale: {
      vi: 'Hít vào nhẹ nhàng...',
      en: 'Inhale gently...',
    },
    hold: {
      vi: 'Giữ khoảng lặng...',
      en: 'Hold in stillness...',
    },
    exhale: {
      vi: 'Thở ra buông lỏng...',
      en: 'Exhale and let go...',
    },
  }

  const phaseText = phaseLabels[phase][lang]

  return (
    <div className="wabi-breathing-card">
      <div className="wabi-breathing-card__header">
        <span className="wabi-breathing-card__eyebrow">
          <span className="wabi-breathing-card__spark" aria-hidden="true">✦</span>
          {title}
        </span>
        <h3 className="wabi-breathing-card__title">
          {lang === 'vi' ? 'Một khoảng lặng cho chính bạn' : 'A quiet moment for yourself'}
        </h3>
      </div>

      <div className="wabi-breathing-orb-wrap">
        {/* Pulsing breathing aura */}
        <div className={`wabi-breathing-aura wabi-breathing-aura--${phase}`} aria-hidden="true" />

        {/* Slow revolving zen ring */}
        <div className="wabi-breathing-ring" aria-hidden="true" />

        {/* Circular photo portal */}
        <div className={`wabi-breathing-portal wabi-breathing-portal--${phase}`}>
          <Image
            src="/images/wabi-spirit.jpg"
            alt={title}
            width={480}
            height={480}
            sizes="(max-width: 560px) 140px, (max-width: 860px) 170px, 220px"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            priority
          />
          <div className="wabi-breathing-portal__glare" aria-hidden="true" />
        </div>
      </div>

      {/* Breathing guidance indicator */}
      <div className="wabi-breathing-guide" aria-live="polite">
        <div className="wabi-breathing-guide__phase">
          <span className={`wabi-breathing-guide__dot wabi-breathing-guide__dot--${phase}`} aria-hidden="true" />
          <span className="wabi-breathing-guide__text">{phaseText}</span>
        </div>
      </div>

      {/* Grounded reassurance footer */}
      <div className="wabi-breathing-card__footer">
        <div className="wabi-breathing-pill">
          <span className="wabi-breathing-pill__leaf" aria-hidden="true">🌱</span>
          <span>{lang === 'vi' ? 'Đồng hành nhẹ nhàng cùng bạn' : 'Walking gently beside you'}</span>
        </div>
      </div>
    </div>
  )
}
