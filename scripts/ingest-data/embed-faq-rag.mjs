import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/embeddings'
export const EMBEDDING_MODEL = 'qwen/qwen3-embedding-8b'
export const EMBEDDING_DIMENSIONS = 4096
const INPUT_PATH = new URL('../../data/faq-rag.json', import.meta.url)
const BATCH_SIZE = 8

export function buildEmbeddingContent({ id, question, answer }) {
  if (!Number.isInteger(id) || !Array.isArray(question) || question.length === 0 || typeof answer !== 'string' || !answer.trim()) {
    throw new Error(`FAQ ${id ?? 'unknown'} is not a valid faq-rag record`)
  }
  return `Các cách người dùng có thể hỏi:\n${question.map((item) => `- ${item}`).join('\n')}\n\nCâu trả lời chính thức:\n${answer.trim()}`
}

export function buildRows(entries, embeddings) {
  if (entries.length !== embeddings.length) {
    throw new Error(`Expected ${entries.length} embeddings but received ${embeddings.length}`)
  }
  return entries.map((entry, index) => ({
    source_faq_id: entry.id,
    content: buildEmbeddingContent(entry),
    embedding: embeddings[index],
    embedding_model: EMBEDDING_MODEL,
  }))
}

function requiredEnv(name) {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is not set. Add it to .env.local; do not commit that file.`)
  return value
}

async function embedBatch(contents) {
  const key = requiredEnv('OPENROUTER_API_KEY')
  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: contents,
      dimensions: EMBEDDING_DIMENSIONS,
      encoding_format: 'float',
    }),
    signal: AbortSignal.timeout(45_000),
  })
  const raw = await response.text()
  if (!response.ok) throw new Error(`OpenRouter embeddings failed (${response.status}): ${raw.slice(0, 300)}`)

  const data = JSON.parse(raw)?.data
  if (!Array.isArray(data) || data.length !== contents.length) {
    throw new Error('OpenRouter returned an unexpected number of embeddings')
  }
  const vectors = [...data].sort((a, b) => a.index - b.index).map((item) => item.embedding)
  if (vectors.some((vector) => !Array.isArray(vector) || vector.length !== EMBEDDING_DIMENSIONS)) {
    throw new Error(`OpenRouter did not return ${EMBEDDING_DIMENSIONS}-dimension embeddings`)
  }
  return vectors
}

async function upsertRows(rows) {
  const url = requiredEnv('NEXT_PUBLIC_SUPABASE_URL')
  const serviceRoleKey = requiredEnv('SUPABASE_SERVICE_ROLE_KEY')
  const response = await fetch(`${url}/rest/v1/faq_embeddings?on_conflict=source_faq_id`, {
    method: 'POST',
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify(rows),
    signal: AbortSignal.timeout(30_000),
  })
  if (!response.ok) {
    throw new Error(`Supabase upsert failed (${response.status}): ${(await response.text()).slice(0, 500)}`)
  }
}

function batches(items, size) {
  return Array.from({ length: Math.ceil(items.length / size) }, (_, index) => items.slice(index * size, index * size + size))
}

export async function ingestFaqRag({ inputPath = INPUT_PATH, dryRun = false } = {}) {
  const entries = JSON.parse(await readFile(inputPath, 'utf8'))
  if (!Array.isArray(entries) || entries.length === 0) throw new Error('faq-rag.json must be a non-empty array')

  const allRows = []
  for (const batch of batches(entries, BATCH_SIZE)) {
    const contents = batch.map(buildEmbeddingContent)
    if (dryRun) {
      allRows.push(...batch.map((entry) => ({ source_faq_id: entry.id, content: buildEmbeddingContent(entry) })))
      continue
    }
    const vectors = await embedBatch(contents)
    const rows = buildRows(batch, vectors)
    await upsertRows(rows)
    allRows.push(...rows)
    console.log(`Embedded and upserted ${allRows.length}/${entries.length} FAQ records`)
  }
  return allRows
}

const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]
if (isDirectRun) {
  const dryRun = process.argv.includes('--dry-run')
  ingestFaqRag({ dryRun })
    .then((rows) => console.log(dryRun ? `Validated ${rows.length} FAQ records; no API calls were made.` : `Finished ingesting ${rows.length} FAQ records.`))
    .catch((error) => {
      console.error(error.message)
      process.exitCode = 1
    })
}
