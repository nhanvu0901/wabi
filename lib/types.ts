import type { Lang } from './i18n'

// Every Vietnamese-bearing text column has an English twin. `name` is excluded —
// personal names don't translate — and so is `price`, which is a number plus a
// suffix that comes from the dictionary (card.ses: "/buổi" vs "/session").
//
// The *_en columns are nullable and fall back to Vietnamese, which is what most
// `therapies` rows want: "CBT · ACT · DBT" is the same in both languages, and
// only the one row phrased in Vietnamese needs a translation.
export type Service = {
  id: number
  sort_order: number
  name: string
  description: string
  name_en: string | null
  description_en: string | null
}

export type Therapist = {
  id: number
  sort_order: number
  name: string
  title: string
  specialties: string
  therapies: string
  price: string
  location: string
  title_en: string | null
  specialties_en: string | null
  therapies_en: string | null
  location_en: string | null
  photo_url: string | null
}

export type TherapistProfile = {
  therapist_id: number
  full_name: string | null
  bio_vi: string
  bio_en: string | null
  quote_vi: string | null
  quote_en: string | null
  is_published: boolean
  created_at: string | null
  updated_at: string | null
}

export type TherapistProfileSnapshot = Omit<
  TherapistProfile,
  'therapist_id' | 'created_at' | 'updated_at'
> & { therapist_name: string }

export type TherapistDetail = Therapist & {
  profile: TherapistProfile | null
}

function pick(vi: string, en: string | null | undefined, lang: Lang): string {
  return lang === 'en' && en ? en : vi
}

export const pickTitle = (t: Therapist, lang: Lang) => pick(t.title, t.title_en, lang)
export const pickSpecialties = (t: Therapist, lang: Lang) => pick(t.specialties, t.specialties_en, lang)
export const pickTherapies = (t: Therapist, lang: Lang) => pick(t.therapies, t.therapies_en, lang)
export const pickLocation = (t: Therapist, lang: Lang) => pick(t.location, t.location_en, lang)
export const pickServiceName = (s: Service, lang: Lang) => pick(s.name, s.name_en, lang)
export const pickServiceDescription = (s: Service, lang: Lang) => pick(s.description, s.description_en, lang)

export function pickProfileContent(profile: TherapistProfile, lang: Lang) {
  const hasEnglishBio = Boolean(profile.bio_en?.trim())
  const hasEnglishQuote = Boolean(profile.quote_en?.trim())
  const isEnglish = lang === 'en'
  return {
    bio: isEnglish && hasEnglishBio ? profile.bio_en! : profile.bio_vi,
    quote: isEnglish && hasEnglishQuote ? profile.quote_en! : profile.quote_vi,
    isFallback: isEnglish && (!hasEnglishBio || (!hasEnglishQuote && Boolean(profile.quote_vi?.trim()))),
  }
}
