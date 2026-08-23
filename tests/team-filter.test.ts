import { describe, expect, it } from 'vitest'
import { filterTherapists } from '../lib/team-filter'
import type { Therapist } from '../lib/types'

const therapist = (id: number, location: string, locationEn: string | null = null): Therapist => ({
  id,
  sort_order: id,
  name: `Therapist ${id}`,
  title: 'Thạc sĩ Tâm lý',
  specialties: 'Lo âu',
  therapies: 'CBT',
  price: '650K',
  location,
  title_en: null,
  specialties_en: null,
  therapies_en: null,
  location_en: locationEn,
  photo_url: null,
})

const entries = [
  therapist(1, 'Online · offline HN', 'Online · in-person Hanoi'),
  therapist(2, 'Chỉ online', 'Online only'),
  therapist(3, 'Online · offline HCM', 'Online · in-person HCMC'),
]

describe('filterTherapists', () => {
  it('keeps every therapist for the all filter', () => {
    expect(filterTherapists(entries, 'all').map((entry) => entry.id)).toEqual([1, 2, 3])
  })

  it('matches online therapists without treating online-only as a city', () => {
    expect(filterTherapists(entries, 'online').map((entry) => entry.id)).toEqual([1, 2, 3])
    expect(filterTherapists(entries, 'hn').map((entry) => entry.id)).toEqual([1])
    expect(filterTherapists(entries, 'hcm').map((entry) => entry.id)).toEqual([3])
  })
})
