import { NextResponse } from 'next/server'
import { getServices, getTherapists } from '../../../lib/content'
import { formatFaqContext, isEmergencyMessage, retrieveFaqContext } from '../../../lib/faq-rag'
import { chatStream, type ChatMessage } from '../../../lib/openrouter'
import { createRateLimiter } from '../../../lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_QUESTION_CHARS = 1000
const MAX_HISTORY = 12
const DIRECTORY_TTL_MS = 5 * 60 * 1000
type DirectoryCache = { text: string; at: number }
let directoryCache: DirectoryCache | null = null

const rateLimited = createRateLimiter({ windowMs: 60_000, max: 12 })

async function directoryContext(): Promise<string> {
  if (directoryCache && Date.now() - directoryCache.at < DIRECTORY_TTL_MS) return directoryCache.text

  const [therapists, services] = await Promise.all([getTherapists(), getServices()])
  const text = [
    '## ĐỘI NGŨ THERAPIST',
    ...therapists.map(
      (r) => `${r.name} — ${r.title}. Chuyên môn: ${r.specialties}. Liệu pháp: ${r.therapies}. Phí: ${r.price}/buổi. ${r.location}`
    ),
    '',
    '## DỊCH VỤ',
    ...services.map((r) => `${r.name}: ${r.description}`),
  ].join('\n\n')

  directoryCache = { text, at: Date.now() }
  return text
}

function systemPrompt(faqContext: string, directory: string): string {
  return `Bạn là trợ lý của Wabi Therapy, một dịch vụ tham vấn và trị liệu tâm lý tại Việt Nam.

QUY TẮC BẮT BUỘC
1. Trả lời bằng tiếng Việt, xưng "tụi mình", giọng ấm và gọn. Tối đa 4 câu.
2. Chỉ dùng thông tin trong phần TƯ LIỆU bên dưới. Hãy tóm tắt/paraphrase, không bịa số liệu, chính sách hoặc tên therapist.
3. Nếu tư liệu không có câu trả lời: nói thẳng là chưa có thông tin và mời người dùng nhắn admin qua Instagram (wabi.therapy) hoặc Facebook.
4. Không chẩn đoán, không kê thuốc, không nhận định về tình trạng bệnh lý của người dùng. Bạn không thay thế một buổi trị liệu.
5. Không hứa hẹn kết quả trị liệu hoặc nói thay cảm xúc của người dùng.
6. Wabi KHÔNG hoạt động 24/7 và không phải dịch vụ cấp cứu. Không mô tả giờ hoạt động hay mức độ sẵn sàng của bất kỳ đường dây nóng nào.

=== FAQ ĐƯỢC TRUY XUẤT ===
${faqContext || '(Không tìm thấy FAQ phù hợp.)'}

=== THÔNG TIN DỊCH VỤ VÀ ĐỘI NGŨ ===
${directory}`
}

function emergencyResponse(): Response {
  return new Response(
    'Mình rất tiếc bạn đang phải trải qua lúc này. Hãy liên hệ ngay Đường dây nóng Ngày Mai 096 306 1414, hoặc đến cơ sở y tế gần nhất nếu bạn đang có nguy cơ tức thời. Bạn không cần đối mặt một mình.',
    { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } }
  )
}

export async function POST(request: Request) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'

  if (rateLimited(ip)) return NextResponse.json({ error: 'rate_limited' }, { status: 429 })

  let payload: { messages?: { role?: string; content?: string }[] }
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'bad_json' }, { status: 400 })
  }

  const incoming = Array.isArray(payload.messages) ? payload.messages : []
  const history: ChatMessage[] = incoming
    .filter((m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .slice(-MAX_HISTORY)
    .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content!.slice(0, MAX_QUESTION_CHARS) }))

  const question = history.at(-1)
  if (!question || question.role !== 'user') return NextResponse.json({ error: 'no_question' }, { status: 400 })
  if (isEmergencyMessage(question.content)) return emergencyResponse()

  let messages: ChatMessage[]
  try {
    const [matches, directory] = await Promise.all([
      retrieveFaqContext(question.content, request.signal),
      directoryContext(),
    ])
    messages = [{ role: 'system', content: systemPrompt(formatFaqContext(matches), directory) }, ...history]
  } catch (error) {
    console.error('[chat] RAG retrieval failed', error)
    return NextResponse.json({ error: 'rag_unavailable' }, { status: 503 })
  }

  const encoder = new TextEncoder()
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of chatStream(messages, { signal: request.signal })) controller.enqueue(encoder.encode(chunk))
      } catch (error) {
        console.error('[chat] stream failed', error)
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
