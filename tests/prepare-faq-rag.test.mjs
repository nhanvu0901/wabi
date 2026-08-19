import { describe, expect, it } from 'vitest'

import { buildRagEntries, fetchWithTimeout } from '../scripts/ingest-data/prepare-faq-rag.mjs'

describe('buildRagEntries', () => {
  it('creates an ingestion record with only the original question plus five unique variants', () => {
    const source = [{
      id: 1,
      topic: 'Bắt đầu',
      question: 'Tham vấn tâm lý là gì?',
      answer: 'Đây là quá trình trò chuyện cùng chuyên gia.',
      answerOriginal: 'Bản cũ',
    }]

    const result = buildRagEntries(source, new Map([[1, [
      'Tham vấn tâm lý có nghĩa là gì?',
      'Tư vấn tâm lý diễn ra như thế nào?',
      'Tham vấn tâm lý giúp ích gì cho tôi?',
      'Khi nào nên tìm đến tham vấn tâm lý?',
      'Đi tham vấn tâm lý có phải là trị liệu không?',
    ]]]))

    expect(result).toEqual([{
      id: 1,
      question: [
        'Tham vấn tâm lý là gì?',
        'Tham vấn tâm lý có nghĩa là gì?',
        'Tư vấn tâm lý diễn ra như thế nào?',
        'Tham vấn tâm lý giúp ích gì cho tôi?',
        'Khi nào nên tìm đến tham vấn tâm lý?',
        'Đi tham vấn tâm lý có phải là trị liệu không?',
      ],
      answer: 'Đây là quá trình trò chuyện cùng chuyên gia.',
    }])
  })

  it('rejects a model result that repeats the original question instead of supplying five new ones', () => {
    const source = [{ id: 2, question: 'Buổi đầu diễn ra thế nào?', answer: 'Bạn sẽ làm quen với therapist.' }]

    expect(() => buildRagEntries(source, new Map([[2, [
      'Buổi đầu diễn ra thế nào?',
      'Buổi tham vấn đầu tiên có gì?',
      'Lần đầu đi therapy cần biết gì?',
      'Tôi sẽ làm gì trong buổi gặp đầu tiên?',
      'Buổi đầu với therapist diễn ra ra sao?',
    ]]]))).toThrow('must contain exactly five unique questions')
  })

  it('aborts a stalled model request instead of waiting indefinitely', async () => {
    let aborted = false
    const stalledFetch = (_url, options) => new Promise((_, reject) => {
      options.signal.addEventListener('abort', () => {
        aborted = true
        reject(options.signal.reason)
      })
    })

    await expect(fetchWithTimeout('https://example.test', {}, stalledFetch, 5)).rejects.toThrow()
    expect(aborted).toBe(true)
  })
})
