import { beforeEach, describe, expect, it, vi } from 'vitest'
import profilesJson from '../data/therapist-profiles.json'
import therapistsJson from '../data/therapists.json'

const db = vi.hoisted(() => ({
  maybeSingle: vi.fn(),
  eq: vi.fn(),
  select: vi.fn(),
  from: vi.fn(),
}))

vi.mock('../lib/supabase', () => ({
  supabase: () => ({ from: db.from }),
}))

import {
  findLocalTherapistDetail,
  getTherapistDetail,
  normalizeTherapistDetail,
} from '../lib/content'
import { pickProfileContent, type TherapistProfile } from '../lib/types'

const profile: TherapistProfile = {
  therapist_id: 2,
  full_name: 'Nguyễn Ngọc Mai',
  bio_vi: 'Đoạn một.\n\nĐoạn hai.',
  bio_en: null,
  quote_vi: 'Trích dẫn.',
  quote_en: null,
  is_published: true,
  created_at: null,
  updated_at: null,
}

beforeEach(() => {
  vi.clearAllMocks()
  db.from.mockReturnValue({ select: db.select })
  db.select.mockReturnValue({ eq: db.eq })
  db.eq.mockReturnValue({ maybeSingle: db.maybeSingle })
})

describe('therapist detail content', () => {
  it('normalizes an embedded published profile', () => {
    const detail = normalizeTherapistDetail({
      ...therapistsJson.entries[1],
      therapist_profiles: [{
        therapist_id: 2,
        full_name: 'Nguyễn Ngọc Mai',
        bio_vi: 'Nội dung',
        bio_en: null,
        quote_vi: null,
        quote_en: null,
        is_published: true,
        created_at: null,
        updated_at: null,
      }],
    })

    expect(detail.profile?.full_name).toBe('Nguyễn Ngọc Mai')
  })

  it('joins local therapist and profile by stable display name', () => {
    const detail = findLocalTherapistDetail(2, therapistsJson.entries, profilesJson.entries)

    expect(detail?.name).toBe('ThS. Ngọc Mai')
    expect(detail?.profile?.full_name).toBe('Nguyễn Ngọc Mai')
  })

  it('returns a therapist with a null profile when no profile exists', () => {
    const detail = findLocalTherapistDetail(1, therapistsJson.entries, profilesJson.entries)

    expect(detail?.name).toBe('ThS. Hà Trang')
    expect(detail?.profile).toBeNull()
  })

  it('returns the joined Supabase detail when the query succeeds', async () => {
    db.maybeSingle.mockResolvedValueOnce({
      data: { ...therapistsJson.entries[1], therapist_profiles: [] },
      error: null,
    })

    const detail = await getTherapistDetail(2)

    expect(db.from).toHaveBeenCalledWith('therapists')
    expect(db.eq).toHaveBeenCalledWith('id', 2)
    expect(detail?.name).toBe('ThS. Ngọc Mai')
  })

  it('uses the local snapshots when Supabase returns an error', async () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    db.maybeSingle.mockResolvedValueOnce({ data: null, error: new Error('offline') })

    try {
      const detail = await getTherapistDetail(2)

      expect(detail?.profile?.full_name).toBe('Nguyễn Ngọc Mai')
      expect(warning).toHaveBeenCalledWith(
        expect.stringContaining('[content] therapist-detail: Supabase unavailable'),
        expect.any(Error),
      )
    } finally {
      warning.mockRestore()
    }
  })
})

describe('pickProfileContent', () => {
  it('returns Vietnamese without a fallback marker on vi', () => {
    expect(pickProfileContent(profile, 'vi')).toEqual({
      bio: profile.bio_vi,
      quote: profile.quote_vi,
      isFallback: false,
    })
  })

  it('falls back to Vietnamese when English content is absent', () => {
    expect(pickProfileContent(profile, 'en')).toEqual({
      bio: profile.bio_vi,
      quote: profile.quote_vi,
      isFallback: true,
    })
  })

  it('uses English content when it is present', () => {
    expect(pickProfileContent({
      ...profile,
      bio_en: 'English biography.',
      quote_en: 'English quote.',
    }, 'en')).toEqual({
      bio: 'English biography.',
      quote: 'English quote.',
      isFallback: false,
    })
  })

  it('marks fallback when English bio is present but quote falls back to Vietnamese', () => {
    expect(pickProfileContent({
      ...profile,
      bio_en: 'English biography.',
      quote_en: null,
    }, 'en')).toEqual({
      bio: 'English biography.',
      quote: profile.quote_vi,
      isFallback: true,
    })
  })

  it('does not mark fallback when both quotes are absent', () => {
    expect(pickProfileContent({
      ...profile,
      bio_en: 'English biography.',
      quote_vi: null,
      quote_en: null,
    }, 'en')).toEqual({
      bio: 'English biography.',
      quote: null,
      isFallback: false,
    })
  })
})
