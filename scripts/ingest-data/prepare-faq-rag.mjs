import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'
const MODEL = process.env.OPENROUTER_FAQ_VARIANT_MODEL ?? 'deepseek/deepseek-v4-flash'
const INPUT_PATH = new URL('../../data/faq.json', import.meta.url)
const OUTPUT_PATH = new URL('../../data/faq-rag.json', import.meta.url)
const VARIANT_COUNT = 5

function normalizeQuestion(value) {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : ''
}

function parseJsonResponse(content) {
  const trimmed = content.trim().replace(/^```json\s*/i, '').replace(/\s*```$/, '')
  return JSON.parse(trimmed)
}

/** Prevent a provider/network stall from blocking the entire batch forever. */
export function fetchWithTimeout(url, options, fetchImpl = fetch, timeoutMs = 30_000) {
  const timeout = AbortSignal.timeout(timeoutMs)
  const signal = options.signal ? AbortSignal.any([options.signal, timeout]) : timeout
  return fetchImpl(url, { ...options, signal })
}

/**
 * Converts canonical FAQ data into the minimal ingestion format.
 * `variantsById` is injected so this transformation can be tested without an API call.
 */
export function buildRagEntries(entries, variantsById) {
  return entries.map(({ id, question, answer }) => {
    const original = normalizeQuestion(question)
    const variants = variantsById.get(id)
    if (!original || !answer || !Array.isArray(variants)) {
      throw new Error(`FAQ ${id} is missing its canonical question, answer, or generated variants`)
    }

    const unique = []
    const seen = new Set([original.toLocaleLowerCase('vi')])
    for (const value of variants) {
      const variant = normalizeQuestion(value)
      const key = variant.toLocaleLowerCase('vi')
      if (variant && !seen.has(key)) {
        seen.add(key)
        unique.push(variant)
      }
    }

    if (unique.length !== VARIANT_COUNT) {
      throw new Error(`FAQ ${id} must contain exactly five unique questions; received ${unique.length}`)
    }

    return { id, question: [original, ...unique], answer }
  })
}

async function generateVariants(entry) {
  const key = process.env.OPENROUTER_API_KEY
  if (!key) throw new Error('OPENROUTER_API_KEY is not set. Run with node --env-file=.env.local.')

  const prompt = [
    'Tạo đúng 5 cách diễn đạt khác bằng tiếng Việt cho một câu hỏi FAQ.',
    'Giữ nguyên ý định hỏi; không trả lời câu hỏi; không thêm thông tin, thương hiệu hay lời khuyên mới.',
    'Mỗi câu phải tự nhiên, phù hợp để người dùng hỏi chatbot, và khác câu gốc cũng như khác nhau.',
    'Chỉ trả về JSON hợp lệ theo đúng dạng {"questions":["...", "...", "...", "...", "..."]}; không markdown.',
    `Câu gốc: ${entry.question}`,
  ].join('\n')

  let lastError
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetchWithTimeout(OPENROUTER_URL, {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: 'system', content: 'Bạn là biên tập viên tiếng Việt. Luôn chỉ trả về JSON hợp lệ.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.35,
          max_tokens: 220,
          reasoning: { enabled: false },
        }),
      })
      const raw = await response.text()
      if (!response.ok) throw new Error(`OpenRouter returned ${response.status}: ${raw.slice(0, 300)}`)

      const content = JSON.parse(raw)?.choices?.[0]?.message?.content
      const parsed = parseJsonResponse(content)
      const candidate = new Map([[entry.id, parsed.questions]])
      buildRagEntries([entry], candidate)
      return parsed.questions
    } catch (error) {
      lastError = error
      if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, attempt * 600))
    }
  }
  throw new Error(`FAQ ${entry.id} could not generate five valid variants: ${lastError.message}`)
}

async function mapWithConcurrency(items, limit, mapper) {
  const results = new Array(items.length)
  let cursor = 0
  const worker = async () => {
    while (cursor < items.length) {
      const index = cursor++
      results[index] = await mapper(items[index], index)
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker))
  return results
}

export async function prepareFaqRag({ inputPath = INPUT_PATH, outputPath = OUTPUT_PATH } = {}) {
  const source = JSON.parse(await readFile(inputPath, 'utf8'))
  if (!Array.isArray(source.entries) || source.entries.length === 0) {
    throw new Error('Input faq.json has no entries')
  }

  console.log(`Generating Vietnamese question variants for ${source.entries.length} FAQ entries with ${MODEL}...`)
  const variants = await mapWithConcurrency(source.entries, 5, async (entry, index) => {
    const questions = await generateVariants(entry)
    console.log(`[${index + 1}/${source.entries.length}] FAQ ${entry.id} complete`)
    return [entry.id, questions]
  })

  const output = buildRagEntries(source.entries, new Map(variants))
  await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8')
  return output
}

const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]
if (isDirectRun) {
  prepareFaqRag()
    .then((output) => console.log(`Wrote ${output.length} FAQ records to ${fileURLToPath(OUTPUT_PATH)}`))
    .catch((error) => {
      console.error(error.message)
      process.exitCode = 1
    })
}
