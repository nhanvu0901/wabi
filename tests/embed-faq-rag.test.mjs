import { describe, expect, it } from 'vitest'

import { EMBEDDING_DIMENSIONS, buildEmbeddingContent, buildRows } from '../scripts/ingest-data/embed-faq-rag.mjs'

describe('FAQ embedding preparation', () => {
  const faq = {
    id: 1,
    question: [
      'Tham vấn tâm lý là gì?',
      'Tư vấn tâm lý có nghĩa là gì?',
      'Tham vấn tâm lý giúp ích gì?',
    ],
    answer: 'Đây là quá trình trò chuyện cùng chuyên gia.',
  }

  it('requests Qwen embeddings at the configured 4096 dimensions', () => {
    expect(EMBEDDING_DIMENSIONS).toBe(4096)
  })

  it('builds one retrieval text from all question phrasings and the canonical answer', () => {
    expect(buildEmbeddingContent(faq)).toBe(
      'Các cách người dùng có thể hỏi:\n- Tham vấn tâm lý là gì?\n- Tư vấn tâm lý có nghĩa là gì?\n- Tham vấn tâm lý giúp ích gì?\n\nCâu trả lời chính thức:\nĐây là quá trình trò chuyện cùng chuyên gia.'
    )
  })

  it('creates one minimal database row per FAQ with its matching dense embedding', () => {
    const rows = buildRows([faq], [[0.1, -0.2, 0.3]])

    expect(rows).toEqual([{
      source_faq_id: 1,
      content: 'Các cách người dùng có thể hỏi:\n- Tham vấn tâm lý là gì?\n- Tư vấn tâm lý có nghĩa là gì?\n- Tham vấn tâm lý giúp ích gì?\n\nCâu trả lời chính thức:\nĐây là quá trình trò chuyện cùng chuyên gia.',
      embedding: [0.1, -0.2, 0.3],
      embedding_model: 'qwen/qwen3-embedding-8b',
    }])
  })
})
