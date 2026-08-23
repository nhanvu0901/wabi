import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import ParallaxIntro from '../components/ParallaxIntro'
import ParallaxHeroTitle from '../components/ParallaxHeroTitle'

describe('Parallax A content handoff', () => {
  it('moves the introduction into the rising cream sheet without dropping it', () => {
    const html = renderToStaticMarkup(
      <ParallaxIntro
        eyebrow="Wabi là gì?"
        body="Không gian an toàn, riêng tư và thấu cảm."
        stats={[
          { number: '15+', label: 'Thạc sĩ Tâm lý Lâm sàng' },
          { number: '10+', label: 'Liệu pháp trị liệu' },
        ]}
      />,
    )

    expect(html).toContain('Wabi là gì?')
    expect(html).toContain('Không gian an toàn, riêng tư và thấu cảm.')
    expect(html).toContain('15+')
    expect(html).toContain('Liệu pháp trị liệu')
  })
})

describe('Parallax A hero depth', () => {
  it('renders the three title lines as independently moving layers', () => {
    const html = renderToStaticMarkup(
      <ParallaxHeroTitle lines={['Một khoảng lặng', 'để bạn được', 'là chính mình.']} />,
    )

    expect(html).toContain('data-pxa-y="-150"')
    expect(html).toContain('data-pxa-y="-215"')
    expect(html).toContain('data-pxa-y="-290"')
    expect(html).toContain('pxa-hero-title__motion')
    expect(html).toContain('là chính mình.')
  })
})
