import * as XLSX from 'xlsx'
import contract from '@/config/bulkCoreImportContract.json'

function normalizeHeader(h) {
  if (h === undefined || h === null) return ''
  return String(h).trim()
}

/**
 * Sheet name must equal contract table name. Column headers must match contract keys; unknown columns dropped.
 * @returns {{ tables: Record<string, object[]>, skippedSheets: string[] }}
 */
export function parseWorkbookToTables(arrayBuffer) {
  const wb = XLSX.read(arrayBuffer, { type: 'array', cellDates: true })
  const allowedTables = new Set(Object.keys(contract.tables))
  const tables = {}
  const skippedSheets = []

  for (const sheetName of wb.SheetNames) {
    const name = sheetName.trim()
    if (!allowedTables.has(name)) {
      skippedSheets.push(sheetName)
      continue
    }

    const ws = wb.Sheets[sheetName]
    const rows = XLSX.utils.sheet_to_json(ws, { defval: '', raw: false })
    const colDefs = contract.tables[name].columns
    const allowedCols = new Set(Object.keys(colDefs))
    const mapped = []

    for (const rawRow of rows) {
      const out = {}
      for (const [k, v] of Object.entries(rawRow)) {
        const key = normalizeHeader(k)
        if (!allowedCols.has(key)) continue
        out[key] = v === '' ? null : v
      }
      mapped.push(out)
    }

    tables[name] = mapped
  }

  return { tables, skippedSheets }
}
