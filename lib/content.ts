import { supabase } from './supabase'
import type { Service, Therapist } from './types'
import therapistsJson from '../data/therapists.json'
import servicesJson from '../data/services.json'
import faqJson from '../data/faq.json'

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
    return therapistsJson.entries as Therapist[]
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
    return (therapistsJson.entries as Therapist[]).filter((t) => names.includes(t.name))
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
