import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import TherapistProfileView from '../components/TherapistProfile'
import type { TherapistDetail } from '../lib/types'

const mocks = vi.hoisted(() => ({
  getTherapistDetail: vi.fn(),
  notFound: vi.fn(() => { throw new Error('NEXT_NOT_FOUND') }),
}))

vi.mock('../lib/content', () => ({ getTherapistDetail: mocks.getTherapistDetail }))
vi.mock('next/navigation', () => ({ notFound: mocks.notFound }))

import TherapistDetailPage, {
  generateMetadata,
} from '../app/[lang]/doi-ngu/[id]/page'

const detail: TherapistDetail = {
  id: 2,
  sort_order: 2,
  name: 'ThS. Ngọc Mai',
  title: 'Thạc sĩ Tâm lý Lâm sàng',
  specialties: 'Lo âu',
  therapies: 'CBT · IFS',
  price: '650K',
  location: 'Online · offline HN',
  title_en: 'MSc Clinical Psychology',
  specialties_en: 'Anxiety',
  therapies_en: null,
  location_en: 'Online · in-person Hanoi',
  photo_url: '/images/therapists/ngoc-mai.jpg',
  profile: {
    therapist_id: 2,
    full_name: 'Nguyễn Ngọc Mai',
    bio_vi: '  Đoạn một.\n\n \n\nĐoạn hai.  ',
    bio_en: null,
    quote_vi: 'Một trích dẫn.',
    quote_en: null,
    is_published: true,
    created_at: null,
    updated_at: null,
  },
}

beforeEach(() => {
  mocks.getTherapistDetail.mockReset()
  mocks.notFound.mockReset()
  mocks.notFound.mockImplementation(() => { throw new Error('NEXT_NOT_FOUND') })
})

describe('therapist detail route', () => {
  it('loads one therapist and renders the profile component', async () => {
    mocks.getTherapistDetail.mockResolvedValueOnce(detail)

    const page = await TherapistDetailPage({
      params: Promise.resolve({ lang: 'vi', id: '2' }),
    })

    expect(mocks.getTherapistDetail).toHaveBeenCalledWith(2)
    expect(renderToStaticMarkup(page)).toContain('Nguyễn Ngọc Mai')
  })

  it('keeps an existing therapist without a profile as a valid page', async () => {
    mocks.getTherapistDetail.mockResolvedValueOnce({ ...detail, profile: null })

    const page = await TherapistDetailPage({
      params: Promise.resolve({ lang: 'vi', id: '2' }),
    })

    expect(renderToStaticMarkup(page)).toContain('Thông tin giới thiệu đang được cập nhật.')
    expect(mocks.notFound).not.toHaveBeenCalled()
  })

  it('returns not found for a malformed id', async () => {
    await expect(TherapistDetailPage({
      params: Promise.resolve({ lang: 'vi', id: '2abc' }),
    })).rejects.toThrow('NEXT_NOT_FOUND')

    expect(mocks.getTherapistDetail).not.toHaveBeenCalled()
  })

  it.each(['0', '9007199254740992'])('returns not found for unsafe id %s', async (id) => {
    await expect(TherapistDetailPage({
      params: Promise.resolve({ lang: 'vi', id }),
    })).rejects.toThrow('NEXT_NOT_FOUND')

    expect(mocks.notFound).toHaveBeenCalledOnce()
    expect(mocks.getTherapistDetail).not.toHaveBeenCalled()
  })

  it('returns not found when the therapist does not exist', async () => {
    mocks.getTherapistDetail.mockResolvedValueOnce(null)

    await expect(TherapistDetailPage({
      params: Promise.resolve({ lang: 'vi', id: '999' }),
    })).rejects.toThrow('NEXT_NOT_FOUND')
  })

  it('builds localized metadata and alternates', async () => {
    mocks.getTherapistDetail.mockResolvedValueOnce(detail)

    const metadata = await generateMetadata({
      params: Promise.resolve({ lang: 'en', id: '2' }),
    })

    expect(metadata).toMatchObject({
      title: 'ThS. Ngọc Mai',
      description: 'MSc Clinical Psychology',
      alternates: {
        canonical: '/en/doi-ngu/2',
        languages: { vi: '/vi/doi-ngu/2', en: '/en/doi-ngu/2' },
      },
    })
  })
})

describe('server-rendered therapist profile', () => {
  it('renders Vietnamese identity, facts, trimmed biography paragraphs and a quote', () => {
    const html = renderToStaticMarkup(<TherapistProfileView therapist={detail} lang="vi" />)

    expect(html).toContain('<h1>Nguyễn Ngọc Mai</h1>')
    expect(html).toContain('alt="Nguyễn Ngọc Mai"')
    expect(html).toContain('Thạc sĩ Tâm lý Lâm sàng')
    expect(html).toContain('<dt>Chuyên môn</dt><dd>Lo âu</dd>')
    expect(html).toContain('<dt>Liệu pháp</dt><dd>CBT · IFS</dd>')
    expect(html).toContain('Online · offline HN')
    expect(html).toContain('650K/buổi')
    expect(html).toContain('<p>Đoạn một.</p>')
    expect(html).toContain('<p>Đoạn hai.</p>')
    expect(html).not.toContain('<p></p>')
    expect(html).toMatch(/<blockquote[^>]*>Một trích dẫn\.<\/blockquote>/)
    expect(html).toContain('href="/vi/doi-ngu"')
    expect(html).toContain('href="/vi/lien-he"')
    expect(html).not.toContain('data-reveal')
  })

  it('marks Vietnamese fallback while localizing English facts, fee and navigation', () => {
    const html = renderToStaticMarkup(<TherapistProfileView therapist={detail} lang="en" />)

    expect(html).toContain('This introduction is currently available in Vietnamese.')
    expect(html).toContain('MSc Clinical Psychology')
    expect(html).toContain('<dt>Focus</dt><dd>Anxiety</dd>')
    expect(html).toContain('Online · in-person Hanoi')
    expect(html).toContain('650K/session')
    expect(html).toContain('href="/en/doi-ngu"')
    expect(html).toContain('href="/en/lien-he"')
    expect(html).toContain('Contact us to book')
  })

  it('shows the fallback notice when only the rendered quote falls back to Vietnamese', () => {
    const therapist = { ...detail, profile: { ...detail.profile!, bio_en: 'English introduction.' } }
    const html = renderToStaticMarkup(<TherapistProfileView therapist={therapist} lang="en" />)

    expect(html).toContain('<p>English introduction.</p>')
    expect(html).toContain('Một trích dẫn.')
    expect(html).toContain('This introduction is currently available in Vietnamese.')
  })

  it('renders available English content without a fallback notice', () => {
    const therapist = {
      ...detail,
      therapies_en: 'Cognitive behavioral therapy',
      profile: { ...detail.profile!, bio_en: 'English introduction.', quote_en: 'English quote.' },
    }
    const html = renderToStaticMarkup(<TherapistProfileView therapist={therapist} lang="en" />)

    expect(html).toContain('<p>English introduction.</p>')
    expect(html).toContain('English quote.')
    expect(html).toContain('Cognitive behavioral therapy')
    expect(html).not.toContain('This introduction is currently available in Vietnamese.')
    expect(html).not.toContain('Đoạn một.')
  })

  it.each([
    ['vi', 'Thông tin giới thiệu đang được cập nhật.'],
    ['en', 'This introduction is being updated.'],
  ] as const)('keeps identity and contact available without a profile in %s', (lang, message) => {
    const html = renderToStaticMarkup(
      <TherapistProfileView therapist={{ ...detail, photo_url: null, profile: null }} lang={lang} />,
    )

    expect(html).toContain('<h1>ThS. Ngọc Mai</h1>')
    expect(html).toContain(message)
    expect(html).toContain(`href="/${lang}/lien-he"`)
    expect(html).not.toContain('<blockquote')
    expect(html).not.toContain('<img')
    expect(html).not.toContain('This introduction is currently available in Vietnamese.')
  })

  it('uses the card name without a full name and omits blank quotes', () => {
    const therapist = {
      ...detail,
      profile: { ...detail.profile!, full_name: ' ', bio_en: 'English introduction.', quote_vi: ' ', quote_en: null },
    }
    const html = renderToStaticMarkup(<TherapistProfileView therapist={therapist} lang="en" />)

    expect(html).toContain('<h1>ThS. Ngọc Mai</h1>')
    expect(html).not.toContain('<blockquote')
    expect(html).not.toContain('This introduction is currently available in Vietnamese.')
  })

  it('renders biography and quote markup as plain text', () => {
    const therapist = {
      ...detail,
      profile: { ...detail.profile!, bio_vi: '<script>alert(1)</script>', quote_vi: '<b>Listen</b>' },
    }
    const html = renderToStaticMarkup(<TherapistProfileView therapist={therapist} lang="vi" />)

    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
    expect(html).toContain('&lt;b&gt;Listen&lt;/b&gt;')
    expect(html).not.toContain('<script>')
    expect(html).not.toContain('<b>Listen</b>')
  })
})
