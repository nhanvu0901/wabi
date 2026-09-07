import React from 'react'
import { existsSync, readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import TherapistCard from '../components/TherapistCard'
import ServiceDirectory from '../components/ServiceDirectory'
import type { Therapist } from '../lib/types'

vi.mock('../lib/content', () => ({
  getTherapists: vi.fn(async () => [therapist]),
}))
vi.mock('next/navigation', () => ({ notFound: vi.fn() }))
import TherapistDetailPage from '../app/[lang]/doi-ngu/[id]/page'

const therapist: Therapist = {
  id: 1,
  sort_order: 1,
  name: 'ThS. Ngọc Mai',
  title: 'Thạc sĩ Tâm lý Lâm sàng',
  specialties: 'Lo âu',
  therapies: 'CBT',
  price: '650K',
  location: 'Online · offline HN',
  title_en: null,
  specialties_en: null,
  therapies_en: null,
  location_en: null,
  photo_url: null,
}

describe('inner page progressive rendering', () => {
  it('renders therapist content visibly before client JavaScript runs', () => {
    const html = renderToStaticMarkup(<TherapistCard t={therapist} lang="vi" />)

    expect(html).toContain('ThS. Ngọc Mai')
    expect(html).not.toContain('data-reveal')
    expect(html).not.toMatch(/opacity:0(?:[;"'])/)
  })

  it('links each therapist card to a minimal detail page', () => {
    const html = renderToStaticMarkup(<TherapistCard t={therapist} lang="vi" />)
    const detailPage = new URL('../app/[lang]/doi-ngu/[id]/page.tsx', import.meta.url)

    expect(html).toContain('href="/vi/doi-ngu/1"')
    expect(html).toContain('Xem thêm')
    expect(existsSync(detailPage)).toBe(true)
    expect(readFileSync(detailPage, 'utf8')).toContain('{therapist.name}')
  })

  it('renders the selected therapist name on the detail page', async () => {
    const page = await TherapistDetailPage({ params: Promise.resolve({ lang: 'vi', id: '1' }) })

    expect(renderToStaticMarkup(page)).toContain('<h1>ThS. Ngọc Mai</h1>')
  })

  it('renders service content visibly before client JavaScript runs', () => {
    const html = renderToStaticMarkup(
      <ServiceDirectory
        lang="vi"
        services={[
          {
            id: 1,
            sort_order: 1,
            name: 'Tham vấn & Trị liệu tâm lý',
            description: 'Nội dung dịch vụ',
            name_en: 'Counseling & Psychotherapy',
            description_en: 'Service content',
          },
        ]}
      />,
    )

    expect(html).toContain('Tham vấn &amp; Trị liệu tâm lý')
    expect(html).not.toContain('data-reveal')
    expect(html).not.toMatch(/opacity:0(?:[;"'])/)
  })
})
