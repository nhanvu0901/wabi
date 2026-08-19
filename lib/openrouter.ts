// OpenRouter client — server-side only.
//
// The key is read from OPENROUTER_API_KEY (deliberately NOT NEXT_PUBLIC_), so
// Next never inlines it into the client bundle. Import this only from server
// components, route handlers or 'use server' actions — importing it from a
// client component ships a request the browser can't authenticate and leaks
// nothing useful, it just fails.
//
// Endpoint + payload shape follow OpenRouter's OpenAI-compatible embeddings
// API: POST https://openrouter.ai/api/v1/embeddings with { model, input }.

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'

/** qwen/qwen3-embedding-8b — 32,768 token context, $0.01 per 1M input tokens. */
export const EMBEDDING_MODEL = 'qwen/qwen3-embedding-8b'

/** deepseek/deepseek-v4-flash — 1,048,576 token context, $0.14/$0.28 per 1M in/out. */
export const CHAT_MODEL = 'deepseek/deepseek-v4-flash'

const DEFAULT_TIMEOUT_MS = 30_000

export type EmbeddingUsage = {
  prompt_tokens?: number
  total_tokens?: number
}

export type EmbedOptions = {
  /** Override the model; defaults to EMBEDDING_MODEL. */
  model?: string
  /** Request a model-supported output size (the FAQ corpus uses 4096). */
  dimensions?: number
  /** Passed straight through to the API ('float' is the server default). */
  encoding_format?: 'float' | 'base64'
  /** Abort the request from the caller (e.g. a request-scoped signal). */
  signal?: AbortSignal
  /** Per-call timeout, ms. Ignored when `signal` already aborted. */
  timeoutMs?: number
}

type EmbeddingResponse = {
  data?: { embedding: number[]; index: number }[]
  usage?: EmbeddingUsage
  error?: { message?: string }
}

export class OpenRouterError extends Error {
  status: number
  body: string
  constructor(message: string, status: number, body: string) {
    super(message)
    this.name = 'OpenRouterError'
    this.status = status
    this.body = body
  }
}

function apiKey(): string {
  const key = process.env.OPENROUTER_API_KEY
  if (!key) {
    throw new Error('OPENROUTER_API_KEY is not set — add it to .env.local (see .env.example)')
  }
  return key
}

/**
 * Embed one or many texts. Returns one vector per input, in input order.
 *
 * Throws OpenRouterError on a non-2xx response (the API key is never included
 * in the message) and a plain Error on a missing key or malformed payload.
 */
export async function embed(input: string | string[], opts: EmbedOptions = {}): Promise<number[][]> {
  const texts = Array.isArray(input) ? input : [input]
  if (texts.length === 0) return []

  const timeout = AbortSignal.timeout(opts.timeoutMs ?? DEFAULT_TIMEOUT_MS)
  const signal = opts.signal ? AbortSignal.any([opts.signal, timeout]) : timeout

  const res = await fetch(`${OPENROUTER_BASE_URL}/embeddings`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: opts.model ?? EMBEDDING_MODEL,
      input: texts,
      ...(opts.dimensions ? { dimensions: opts.dimensions } : {}),
      ...(opts.encoding_format ? { encoding_format: opts.encoding_format } : {}),
    }),
    signal,
  })

  const raw = await res.text()
  if (!res.ok) {
    throw new OpenRouterError(`OpenRouter embeddings failed: ${res.status} ${res.statusText}`, res.status, raw)
  }

  let parsed: EmbeddingResponse
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error('OpenRouter returned a non-JSON embeddings response')
  }
  if (!Array.isArray(parsed.data)) {
    throw new Error(parsed.error?.message ?? 'OpenRouter embeddings response had no data array')
  }

  // The API returns an `index` per row; sort by it rather than trusting order.
  const sorted = [...parsed.data].sort((a, b) => a.index - b.index)
  if (sorted.length !== texts.length) {
    throw new Error(`OpenRouter returned ${sorted.length} embeddings for ${texts.length} inputs`)
  }
  return sorted.map((d) => d.embedding)
}

/** Single-text convenience wrapper around embed(). */
export async function embedOne(text: string, opts: EmbedOptions = {}): Promise<number[]> {
  const [vector] = await embed(text, opts)
  return vector
}

export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string }

export type ChatStreamOptions = {
  model?: string
  maxTokens?: number
  temperature?: number
  signal?: AbortSignal
}

/**
 * Streams a chat completion as plain text chunks.
 *
 * `reasoning: { enabled: false }` is not optional: deepseek-v4-flash reasons by
 * default, which billed 400 completion tokens for 77 visible characters and put
 * ~12s in front of the first word when measured on 2026-08-14.
 */
export async function* chatStream(
  messages: ChatMessage[],
  opts: ChatStreamOptions = {}
): AsyncGenerator<string> {
  const res = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: opts.model ?? CHAT_MODEL,
      messages,
      stream: true,
      reasoning: { enabled: false },
      max_tokens: opts.maxTokens ?? 500,
      temperature: opts.temperature ?? 0.3,
    }),
    signal: opts.signal,
  })

  if (!res.ok || !res.body) {
    const body = await res.text().catch(() => '')
    throw new OpenRouterError(`OpenRouter chat failed: ${res.status} ${res.statusText}`, res.status, body)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    // SSE frames are newline-delimited; the last piece may be a partial line.
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const payload = line.slice(6).trim()
      if (!payload || payload === '[DONE]') continue
      try {
        const delta = JSON.parse(payload)?.choices?.[0]?.delta?.content
        if (delta) yield delta as string
      } catch {
        // OpenRouter sends ": OPENROUTER PROCESSING" keep-alive comments and can
        // split a frame across chunks; skip anything that isn't complete JSON.
      }
    }
  }
}

/** Cosine similarity between two equal-length vectors, for ranking embed() output. */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(`Vector length mismatch: ${a.length} vs ${b.length}`)
  }
  let dot = 0
  let normA = 0
  let normB = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB)
  return denom === 0 ? 0 : dot / denom
}
