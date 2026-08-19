import { describe, expect, it } from 'vitest'

import { formatFaqContext, isEmergencyMessage } from '../lib/faq-rag'

describe('FAQ RAG context', () => {
  it('formats only the retrieved FAQ records for the answer model', () => {
    expect(formatFaqContext([
      {
        source_faq_id: 7,
        content: 'Các cách người dùng có thể hỏi:\n- Cần chuẩn bị gì?\n\nCâu trả lời chính thức:\nBạn không cần chuẩn bị quá nhiều.',
        similarity: 0.87,
      },
    ])).toBe(
      '[FAQ #7 | độ liên quan 0.87]\nCác cách người dùng có thể hỏi:\n- Cần chuẩn bị gì?\n\nCâu trả lời chính thức:\nBạn không cần chuẩn bị quá nhiều.'
    )
  })

  it('does not fabricate source context when retrieval has no matches', () => {
    expect(formatFaqContext([])).toBe('')
  })
})

describe('emergency screening', () => {
  it('flags direct Vietnamese self-harm language before retrieval', () => {
    expect(isEmergencyMessage('Tôi đang muốn tự tử')).toBe(true)
  })

  it('does not flag a routine scheduling question', () => {
    expect(isEmergencyMessage('Mình muốn đổi lịch hẹn')).toBe(false)
  })
})
