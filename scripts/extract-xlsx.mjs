#!/usr/bin/env node
// Turns the Wabi content spreadsheet into structured JSON under data/.
//
//   node scripts/extract-xlsx.mjs <path-to.xlsx>
//
// Re-run this whenever the team sends a new spreadsheet — the JSON is generated,
// never hand-edited. No dependencies: an .xlsx is a zip of XML, and both are
// parsed here directly.
//
// Sheets consumed:
//   FAQ         → data/faq.json           (44 Q&A, incl. the revised-answer column)
//   TEXT EDITED → data/content-changes.json (copy under review + service changes)
//   Tổng quan   → data/faq-overview.json  (counts per topic group)

import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'

/* ---------------------------------------------------------------- zip ---- */

function readZip(file) {
  const buf = fs.readFileSync(file)
  const files = new Map()

  // Walk local file headers (PK\x03\x04) rather than the central directory —
  // enough for the well-formed archives Excel and Sheets produce.
  let i = 0
  while (i < buf.length - 4) {
    if (buf.readUInt32LE(i) !== 0x04034b50) {
      i++
      continue
    }
    const method = buf.readUInt16LE(i + 8)
    let compressedSize = buf.readUInt32LE(i + 18)
    let uncompressedSize = buf.readUInt32LE(i + 22)
    const nameLen = buf.readUInt16LE(i + 26)
    const extraLen = buf.readUInt16LE(i + 28)
    const name = buf.toString('utf8', i + 30, i + 30 + nameLen)
    const dataStart = i + 30 + nameLen + extraLen

    // Streamed entries put the sizes in a trailing descriptor; find the next
    // header instead and treat everything up to it as the payload.
    if (compressedSize === 0 && uncompressedSize === 0) {
      let j = dataStart
      while (j < buf.length - 4 && buf.readUInt32LE(j) !== 0x04034b50 && buf.readUInt32LE(j) !== 0x02014b50) j++
      compressedSize = j - dataStart
    }

    const raw = buf.subarray(dataStart, dataStart + compressedSize)
    try {
      files.set(name, method === 0 ? raw : zlib.inflateRawSync(raw))
    } catch {
      // A malformed entry we don't need shouldn't stop the whole extraction.
    }
    i = dataStart + compressedSize
  }
  return files
}

/* ---------------------------------------------------------------- xml ---- */

const decodeEntities = (s) =>
  s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&amp;/g, '&') // last, so "&amp;lt;" doesn't become "<"

function sharedStrings(xml) {
  if (!xml) return []
  return [...xml.matchAll(/<si>([\s\S]*?)<\/si>/g)].map((m) =>
    // A cell can be split across several <t> runs when parts are styled
    // differently; concatenate them, and keep <br>-style line breaks.
    [...m[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((t) => decodeEntities(t[1])).join('')
  )
}

function sheetRows(xml, strings) {
  return [...xml.matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g)].map((row) => {
    const cells = {}
    for (const c of row[1].matchAll(/<c r="([A-Z]+)\d+"([^>]*)\/?>(?:([\s\S]*?)<\/c>)?/g)) {
      const [, col, attrs, inner = ''] = c
      const type = /t="([^"]+)"/.exec(attrs)?.[1]
      if (type === 'inlineStr') {
        const runs = [...inner.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((t) => decodeEntities(t[1]))
        if (runs.length) cells[col] = runs.join('')
        continue
      }
      const v = /<v>([\s\S]*?)<\/v>/.exec(inner)?.[1]
      if (v == null) continue
      cells[col] = type === 's' ? strings[Number(v)] : decodeEntities(v)
    }
    return cells
  })
}

function sheetsByName(files) {
  const wb = files.get('xl/workbook.xml')?.toString('utf8') ?? ''
  const names = [...wb.matchAll(/<sheet[^>]*name="([^"]*)"[^>]*sheetId="(\d+)"/g)]
  const strings = sharedStrings(files.get('xl/sharedStrings.xml')?.toString('utf8'))
  const out = new Map()
  names.forEach(([, name], index) => {
    // Sheets are stored in document order as sheet1.xml, sheet2.xml, …
    const xml = files.get(`xl/worksheets/sheet${index + 1}.xml`)?.toString('utf8')
    if (xml) out.set(decodeEntities(name), sheetRows(xml, strings))
  })
  return out
}

/* --------------------------------------------------------------- clean --- */

const clean = (v) => (typeof v === 'string' ? v.replace(/\r\n/g, '\n').trim() : v)
const nonEmpty = (v) => {
  const c = clean(v)
  return c ? c : null
}

/* ----------------------------------------------------------------- faq --- */

function extractFaq(rows) {
  // Row 0-1 are the title banner, row 2 is the header.
  const header = rows.findIndex((r) => clean(r.A) === 'STT')
  const body = rows.slice(header + 1).filter((r) => nonEmpty(r.C))

  return body.map((r) => {
    const original = nonEmpty(r.D)
    const revised = nonEmpty(r.H)
    return {
      id: Math.round(Number(r.A)),
      topic: nonEmpty(r.B),
      question: nonEmpty(r.C),
      // `answer` is what should ship: the revision when the team wrote one.
      answer: revised ?? original,
      answerOriginal: original,
      answerRevised: revised,
      hasRevision: revised != null,
      reviewNote: nonEmpty(r.G),
      priority: nonEmpty(r.E),
      channels: (nonEmpty(r.F) ?? '')
        .split('·')
        .map((s) => s.trim())
        .filter(Boolean),
    }
  })
}

/* ------------------------------------------------------ content changes -- */

function extractContentChanges(rows) {
  const body = rows.slice(1).filter((r) => nonEmpty(r.A))
  const noteAt = body.findIndex((r) => clean(r.A) === 'NOTE')

  // Above the NOTE marker: existing site copy flagged for a rewrite. Column B
  // holds the replacement, and is still empty for all of them.
  const copyUnderReview = body.slice(0, noteAt === -1 ? body.length : noteAt).map((r) => ({
    current: clean(r.A),
    replacement: nonEmpty(r.B),
  }))

  // Below it: the service list change. The first row is the instruction itself,
  // the rest are name → description pairs.
  const after = noteAt === -1 ? [] : body.slice(noteAt + 1)
  const instruction = after.length ? clean(after[0].A) : null
  const addServices = after
    .slice(1)
    .filter((r) => nonEmpty(r.B))
    .map((r) => ({ name: clean(r.A), description: clean(r.B) }))

  return {
    copyUnderReview,
    services: {
      instruction,
      // "Bỏ Art Therapy" — parsed out of the instruction so a reader of the JSON
      // doesn't have to.
      remove: instruction && /bỏ\s+(.+?)\./i.test(instruction) ? [/bỏ\s+(.+?)\./i.exec(instruction)[1].trim()] : [],
      add: addServices,
    },
  }
}

/* -------------------------------------------------------------- overview - */

function extractOverview(rows) {
  const header = rows.findIndex((r) => clean(r.A) === 'Nhóm chủ đề')
  if (header === -1) return { groups: [], total: null }

  const all = rows
    .slice(header + 1)
    .filter((r) => nonEmpty(r.A) && nonEmpty(r.B))
    .map((r) => ({
      topic: clean(r.A),
      questions: Number(r.B),
      highPriority: r.C == null ? null : Number(r.C),
    }))

  // The sheet ends with a TỔNG row; that's a total, not a topic group.
  const totalRow = all.find((g) => /^TỔNG/i.test(g.topic))
  return {
    groups: all.filter((g) => g !== totalRow),
    total: totalRow ? { questions: totalRow.questions, highPriority: totalRow.highPriority } : null,
  }
}

/* ------------------------------------------------------------------ run -- */

const input = process.argv[2]
if (!input) {
  console.error('usage: node scripts/extract-xlsx.mjs <path-to.xlsx>')
  process.exit(1)
}

const files = readZip(input)
const sheets = sheetsByName(files)
const outDir = path.join(process.cwd(), 'data')
fs.mkdirSync(outDir, { recursive: true })

const meta = { source: path.basename(input), generatedBy: 'scripts/extract-xlsx.mjs' }

const faq = extractFaq(sheets.get('FAQ') ?? [])
const changes = extractContentChanges(sheets.get('TEXT EDITED') ?? [])
const overview = extractOverview(sheets.get('Tổng quan') ?? [])

const write = (name, data) => {
  fs.writeFileSync(path.join(outDir, name), JSON.stringify(data, null, 2) + '\n')
  console.log(`  data/${name}`)
}

console.log(`sheets: ${[...sheets.keys()].join(' | ')}\n`)
write('faq.json', { ...meta, sheet: 'FAQ', count: faq.length, entries: faq })
write('content-changes.json', { ...meta, sheet: 'TEXT EDITED', ...changes })
write('faq-overview.json', { ...meta, sheet: 'Tổng quan', ...overview })

console.log(`\n${faq.length} FAQ · ${faq.filter((f) => f.hasRevision).length} có bản sửa · ${faq.filter((f) => f.reviewNote).length} có ghi chú`)
console.log(`${changes.services.add.length} dịch vụ thêm · ${changes.services.remove.length} dịch vụ bỏ · ${changes.copyUnderReview.length} đoạn copy chờ sửa`)
