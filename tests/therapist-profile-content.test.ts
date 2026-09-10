import { describe, expect, it } from 'vitest'
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
