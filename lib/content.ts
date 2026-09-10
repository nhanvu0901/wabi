import { supabase } from './supabase'
import type {
  Service,
  Therapist,
  TherapistDetail,
  TherapistProfile,
  TherapistProfileSnapshot,
} from './types'
import servicesJson from '../data/services.json'
import faqJson from '../data/faq.json'
import profilesJson from '../data/therapist-profiles.json'
import therapistsJson from '../data/therapists.json'

// Content reads, with a local fallback.
//
// Supabase stays the source of truth — editing a row in the Table Editor is how
// content changes, and ISR picks it up within a minute. But a marketing site
// should not return 500 because the database had a bad minute, so every read
// falls back to the JSON snapshot in data/ when the query fails.
//
// The fallback is loud on purpose: a silent one turns "the DB is down" into
// "the site looks fine but is quietly serving stale content", which is worse.
// Watch for [content] in the logs.
//
// Regenerate the snapshots when the seed changes; see docs/.

export type FaqEntry = { topic: string; question: string; answer: string }

let warned = false

function fallbackWarning(what: string, err: unknown) {
  console.warn(`[content] ${what}: Supabase unavailable, serving data/ snapshot —`, err)
  if (!warned) {
    warned = true
    console.warn('[content] content is now STALE until the database is reachable again')
  }
}

export async function getTherapists(): Promise<Therapist[]> {
  try {
    const { data, error } = await supabase().from('therapists').select('*').order('sort_order')
    if (error) throw error
    if (!data?.length) throw new Error('no rows')
    return data as Therapist[]
  } catch (err) {
    fallbackWarning('therapists', err)
    return []
  }
}

export async function getTherapistsByName(names: string[]): Promise<Therapist[]> {
  try {
    const { data, error } = await supabase().from('therapists').select('*').in('name', names)
    if (error) throw error
    if (!data?.length) throw new Error('no rows')
    return data as Therapist[]
  } catch (err) {
    fallbackWarning('therapists-by-name', err)
    return []
  }
}

export function normalizeTherapistDetail(row: Therapist & {
  therapist_profiles?: TherapistProfile | TherapistProfile[] | null
}): TherapistDetail {
  const relation = row.therapist_profiles
  const profile = Array.isArray(relation) ? (relation[0] ?? null) : (relation ?? null)
  const { therapist_profiles: _relation, ...therapist } = row
  return { ...therapist, profile }
}

export function findLocalTherapistDetail(
  id: number,
  therapists: Therapist[],
  profiles: TherapistProfileSnapshot[],
): TherapistDetail | null {
  const therapist = therapists.find((item) => item.id === id)
  if (!therapist) return null

  const snapshot = profiles.find(
    (item) => item.therapist_name === therapist.name && item.is_published,
  )
  const profile = snapshot ? {
    therapist_id: therapist.id,
    full_name: snapshot.full_name,
    bio_vi: snapshot.bio_vi,
    bio_en: snapshot.bio_en,
    quote_vi: snapshot.quote_vi,
    quote_en: snapshot.quote_en,
    is_published: snapshot.is_published,
    created_at: null,
    updated_at: null,
  } : null

  return { ...therapist, profile }
}

export async function getTherapistDetail(id: number): Promise<TherapistDetail | null> {
  try {
    const { data, error } = await supabase()
      .from('therapists')
      .select('*, therapist_profiles(*)')
      .eq('id', id)
      .maybeSingle()
    if (error) throw error
    return data ? normalizeTherapistDetail(data) : null
  } catch (err) {
    fallbackWarning('therapist-detail', err)
    return findLocalTherapistDetail(
      id,
      therapistsJson.entries as Therapist[],
      profilesJson.entries as TherapistProfileSnapshot[],
    )
  }
}

export async function getServices(): Promise<Service[]> {
  try {
    const { data, error } = await supabase().from('services').select('*').order('sort_order')
    if (error) throw error
    if (!data?.length) throw new Error('no rows')
    return data as Service[]
  } catch (err) {
    fallbackWarning('services', err)
    return servicesJson.entries as Service[]
  }
}

export async function getFaq(): Promise<FaqEntry[]> {
  try {
    const { data, error } = await supabase().from('faq').select('topic,question,answer').order('sort_order')
    if (error) throw error
    if (!data?.length) throw new Error('no rows')
    return data as FaqEntry[]
  } catch (err) {
    fallbackWarning('faq', err)
    return faqJson.entries.map((e) => ({ topic: e.topic, question: e.question, answer: e.answer }))
  }
}
