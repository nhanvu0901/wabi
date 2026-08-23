import type { Therapist } from './types'

export type TherapistWithPhoto = Therapist & { photo_url: string }

export function selectHomepageTherapists(
  therapists: Therapist[],
  limit = 4,
): TherapistWithPhoto[] {
  return therapists
    .flatMap((therapist) => {
      const photoUrl = therapist.photo_url?.trim()
      return photoUrl ? [{ ...therapist, photo_url: photoUrl }] : []
    })
    .slice(0, limit)
}
