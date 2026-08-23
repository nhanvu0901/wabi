import type { Therapist } from './types'

export type TeamFilter = 'all' | 'online' | 'hn' | 'hcm'

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
}

export function filterTherapists(therapists: Therapist[], filter: TeamFilter): Therapist[] {
  if (filter === 'all') return therapists

  return therapists.filter((therapist) => {
    const location = normalize(`${therapist.location} ${therapist.location_en ?? ''}`)

    if (filter === 'online') return location.includes('online')
    if (filter === 'hn') return /\bhn\b|ha noi|hanoi/.test(location)

    return /\bhcmc?\b|ho chi minh|tp\.?\s*hcm|sai gon|saigon|\bsg\b/.test(location)
  })
}
