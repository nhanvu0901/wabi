import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import ServiceDirectory from '../components/ServiceDirectory'
import faqJson from '../data/faq.json'
import faqRagJson from '../data/faq-rag.json'
import servicesJson from '../data/services.json'
import type { Service } from '../lib/types'

const services = servicesJson.entries as Service[]

describe('service catalog', () => {
  it('renders the complete nine-service catalog without Art Therapy', () => {
    const html = renderToStaticMarkup(<ServiceDirectory services={services} lang="vi" />)

    expect(html.match(/<article class="inner-service-card /g)).toHaveLength(9)
    expect(html).toContain('Employee Assistance Program (EAP)')
    expect(html).toContain('Low-cost Therapy')
    expect(html).toContain('Workshop')
    expect(html).toContain('Open Talk')
    expect(html).toContain('Mentorship in Psychology')
    expect(html).not.toContain('Art Therapy')
    expect(html).toContain('09')
  })

  it('renders English service copy on the English route', () => {
    const html = renderToStaticMarkup(<ServiceDirectory services={services} lang="en" />)

    expect(html).toContain('people-centered workplace cultures')
    expect(html).toContain('fees 20% lower than standard rates')
    expect(html).toContain('no pressure to contribute')
    expect(html).toContain('Across six sessions')
    expect(html).not.toContain('Đồng hành cùng doanh nghiệp')
  })

  it('keeps the FAQ and RAG service answer aligned with the catalog', () => {
    const faq = faqJson.entries.find((entry) => entry.id === 8)
    const rag = faqRagJson.find((entry) => entry.id === 8)

    expect(faq?.answer).toContain('9 nhóm dịch vụ')
    expect(faq?.answer).toContain('Mentorship in Psychology')
    expect(faq?.answer).not.toContain('Art Therapy')
    expect(rag?.answer).toBe(faq?.answer)
  })
})
