import { NextResponse } from 'next/server'
import { getFaq, getTherapists, getServices } from '../../../lib/content'
import { chatStream, type ChatMessage } from '../../../lib/openrouter'
import { isLang, type Lang } from '../../../lib/i18n'
import { createRateLimiter } from '../../../lib/rate-limit'

// The chat assistant's server side. This route exists so OPENROUTER_API_KEY never
// reaches the browser: the client posts a question here, and this handler is the
// only thing that talks to OpenRouter.
//
// Grounding: the whole corpus (44 FAQ + 12 therapists + services ≈ 6.3k tokens)
// goes into the system prompt on every request. At this size that beats any
// retrieval step — see docs/rerank-research-2026-08-14.md.

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_QUESTION_CHARS = 1000
const MAX_HISTORY = 12
const CORPUS_TTL_MS = 5 * 60 * 1000
type CorpusCache = { text: string; at: number }
let corpusCache: CorpusCache | null = null

// 12 messages a minute per IP. See lib/rate-limit.ts for what this does and does
// not protect against.
const rateLimited = createRateLimiter({ windowMs: 60_000, max: 12 })

async function corpus(): Promise<string> {
  if (corpusCache && Date.now() - corpusCache.at < CORPUS_TTL_MS) return corpusCache.text

  const [faq, therapists, services] = await Promise.all([getFaq(), getTherapists(), getServices()])

  const text = [
    '## CÂU HỎI THƯỜNG GẶP',
    ...faq.map((r) => `[${r.topic}] H: ${r.question}\nĐ: ${r.answer}`),
    '',
    '## ĐỘI NGŨ THERAPIST',
    ...therapists.map(
      (r) => `${r.name} — ${r.title}. Chuyên môn: ${r.specialties}. Liệu pháp: ${r.therapies}. Phí: ${r.price}/buổi. ${r.location}`
    ),
    '',
    '## DỊCH VỤ',
    ...services.map((r) => `${r.name}: ${r.description}`),
  ].join('\n\n')

  corpusCache = { text, at: Date.now() }
  return text
}

function systemPrompt(body: string, lang: Lang): string {
  const reply =
    lang === 'vi'
      ? 'Trả lời bằng tiếng Việt, xưng "tụi mình", giọng ấm và gọn. Tối đa 4 câu.'
      : 'Reply in English, warm and concise, referring to Wabi as "we". Maximum 4 sentences. The source material below is Vietnamese — translate as you answer.'

  return `Bạn là trợ lý của Wabi Therapy, một dịch vụ tham vấn và trị liệu tâm lý tại Việt Nam.

QUY TẮC BẮT BUỘC
1. Chỉ dùng thông tin trong phần TƯ LIỆU bên dưới. Không suy diễn, không bịa số liệu, không bịa tên therapist.
2. Nếu tư liệu không có câu trả lời: nói thẳng là chưa có thông tin và mời người dùng nhắn admin qua Instagram (wabi.therapy) hoặc Facebook.
3. Không chẩn đoán, không kê thuốc, không nhận định về tình trạng bệnh lý của người dùng. Bạn không thay thế một buổi trị liệu.
4. KHẨN CẤP — nếu người dùng nhắc tới ý định tự hại, tự tử, hoặc đang trong khủng hoảng: bỏ qua mọi việc khác, đưa ngay Đường dây nóng Ngày Mai 096 306 1414, nói ngắn và ấm, không phân tích, không hỏi thêm.
5. TUYỆT ĐỐI không mô tả giờ hoạt động, mức độ sẵn sàng hay chất lượng của bất kỳ đường dây nóng nào — không nói "24/7", "luôn sẵn sàng", "trực suốt ngày đêm" hay tương tự, trừ khi tư liệu ghi đúng như vậy. Chỉ đưa tên và số. Wabi KHÔNG hoạt động 24/7 và không phải dịch vụ cấp cứu.
6. Không hứa hẹn kết quả trị liệu. Không nói thay cảm xúc của người dùng.
7. ${reply}

=== TƯ LIỆU ===
${body}`
}

export async function POST(request: Request) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'

  if (rateLimited(ip)) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
  }

  let payload: { lang?: string; messages?: { role?: string; content?: string }[] }
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'bad_json' }, { status: 400 })
  }

  const lang: Lang = isLang(payload.lang ?? '') ? (payload.lang as Lang) : 'vi'
  const incoming = Array.isArray(payload.messages) ? payload.messages : []

  const history: ChatMessage[] = incoming
    .filter((m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .slice(-MAX_HISTORY)
    .map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content!.slice(0, MAX_QUESTION_CHARS),
    }))

  if (!history.length || history[history.length - 1].role !== 'user') {
    return NextResponse.json({ error: 'no_question' }, { status: 400 })
  }

  let messages: ChatMessage[]
  try {
    messages = [{ role: 'system', content: systemPrompt(await corpus(), lang) }, ...history]
  } catch {
    return NextResponse.json({ error: 'corpus_unavailable' }, { status: 503 })
  }

  const encoder = new TextEncoder()
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of chatStream(messages, { signal: request.signal })) {
          controller.enqueue(encoder.encode(chunk))
        }
      } catch (err) {
        // The client shows its own failure line when the stream ends empty, so a
        // mid-stream error just closes here rather than injecting model-looking text.
        console.error('[chat] stream failed', err)
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Accel-Buffering': 'no',
    },
  })
}
