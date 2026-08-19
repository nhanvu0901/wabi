import { embedOne } from './openrouter'
import { supabase } from './supabase'

export const FAQ_EMBEDDING_DIMENSIONS = 4096
const MATCH_COUNT = 5

export type FaqMatch = {
  source_faq_id: number
  content: string
  similarity: number
}

export function formatFaqContext(matches: FaqMatch[]): string {
  return matches
    .map(
      (match) =>
        `[FAQ #${match.source_faq_id} | độ liên quan ${match.similarity.toFixed(2)}]\n${match.content}`
    )
    .join('\n\n')
}

/** Checks immediate-safety language before any retrieval or model call. */
export function isEmergencyMessage(message: string): boolean {
  return /(tự\s*tử|tự\s*hại|muốn\s+chết|không\s+muốn\s+sống|muốn\s+kết\s+thúc\s+(cuộc\s+đời|mọi\s+thứ)|giết\s+bản\s+thân)/iu.test(
    message
  )
}

/** Embeds one query and retrieves the nearest FAQ rows through the Supabase RPC. */
export async function retrieveFaqContext(query: string, signal?: AbortSignal): Promise<FaqMatch[]> {
  const embedding = await embedOne(query, { dimensions: FAQ_EMBEDDING_DIMENSIONS, signal })
  if (embedding.length !== FAQ_EMBEDDING_DIMENSIONS) {
    throw new Error(`Expected a ${FAQ_EMBEDDING_DIMENSIONS}-dimension FAQ query embedding`)
  }

  const { data, error } = await supabase().rpc('match_faq_embeddings', {
    query_embedding: embedding,
    match_count: MATCH_COUNT,
  })
  if (error) throw error

  return (data ?? []) as FaqMatch[]
}
