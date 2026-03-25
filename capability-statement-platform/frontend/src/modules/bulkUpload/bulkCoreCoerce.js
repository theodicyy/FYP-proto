/**
 * Mirrors backend bulkCoreCoerce (contract-driven only).
 */

export function coerceJsonInput(raw) {
  if (raw === undefined || raw === null) return { ok: true, value: null }
  if (typeof raw === 'object' && raw !== null && !Array.isArray(raw)) {
    return { ok: true, value: raw }
  }
  if (Array.isArray(raw)) {
    return { ok: true, value: raw }
  }
  const s = String(raw).trim()
  if (s === '') return { ok: true, value: null }
  if (s.startsWith('{') || s.startsWith('[')) {
    try {
      return { ok: true, value: JSON.parse(s) }
    } catch {
      return { ok: false, error: 'Invalid JSON string' }
    }
  }
  const parts = s.split(',').map((p) => p.trim()).filter(Boolean)
  return { ok: true, value: parts }
}

export function stringifyJsonForDb(value) {
  if (value === null || value === undefined) return null
  return JSON.stringify(value)
}

export function coerceInt(raw) {
  if (raw === undefined || raw === null || raw === '') return { ok: true, value: null }
  const n = typeof raw === 'number' ? raw : parseInt(String(raw).trim(), 10)
  if (!Number.isFinite(n)) return { ok: false, error: 'Expected integer' }
  return { ok: true, value: n }
}

export function coerceDecimal(raw) {
  if (raw === undefined || raw === null || raw === '') return { ok: true, value: null }
  const s = String(raw).trim().replace(/,/g, '')
  const n = Number(s)
  if (!Number.isFinite(n)) return { ok: false, error: 'Expected decimal number' }
  return { ok: true, value: n }
}

export function coerceDate(raw) {
  if (raw === undefined || raw === null || raw === '') return { ok: true, value: null }
  if (raw instanceof Date && !Number.isNaN(raw.getTime())) {
    return { ok: true, value: raw.toISOString().slice(0, 10) }
  }
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    const d = new Date(Math.round((raw - 25569) * 86400 * 1000))
    if (!Number.isNaN(d.getTime())) return { ok: true, value: d.toISOString().slice(0, 10) }
  }
  const s = String(raw).trim()
  const d2 = new Date(s)
  if (!Number.isNaN(d2.getTime())) {
    return { ok: true, value: d2.toISOString().slice(0, 10) }
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return { ok: true, value: s }
  return { ok: false, error: 'Expected date (YYYY-MM-DD or Excel date)' }
}

export function coerceString(raw) {
  if (raw === undefined || raw === null) return { ok: true, value: null }
  const s = String(raw).trim()
  return { ok: true, value: s === '' ? null : s }
}

export function coerceEnum(raw, allowed) {
  if (raw === undefined || raw === null || raw === '') return { ok: true, value: null }
  const s = String(raw).trim()
  if (!allowed.includes(s)) {
    return { ok: false, error: `Must be one of: ${allowed.join(', ')}` }
  }
  return { ok: true, value: s }
}

export function coerceCell(raw, colDef) {
  const { type, enum_values: enumValues } = colDef
  switch (type) {
    case 'string':
      return coerceString(raw)
    case 'int':
      return coerceInt(raw)
    case 'decimal':
      return coerceDecimal(raw)
    case 'date':
      return coerceDate(raw)
    case 'enum':
      return coerceEnum(raw, enumValues || [])
    case 'json': {
      const j = coerceJsonInput(raw)
      if (!j.ok) return j
      return { ok: true, value: stringifyJsonForDb(j.value) }
    }
    default:
      return { ok: false, error: `Unknown type: ${type}` }
  }
}
