import contract from '@/config/bulkCoreImportContract.json'
import { coerceCell } from './bulkCoreCoerce.js'

function pushError(errorsByTable, table, row, column, message) {
  if (!errorsByTable[table]) errorsByTable[table] = []
  errorsByTable[table].push({ row, column, message })
}

export function filterToContractTables(tables) {
  const allowed = new Set(Object.keys(contract.tables))
  const unknown = Object.keys(tables || {}).filter((k) => !allowed.has(k))
  return { unknown }
}

export function validateAndCoerceClient(tables) {
  const errors = {}
  const coerced = {}
  const insertOrder = contract.insert_order

  for (const tableName of insertOrder) {
    const rows = tables[tableName]
    if (!rows || !Array.isArray(rows)) {
      coerced[tableName] = []
      continue
    }

    const colDefs = contract.tables[tableName].columns
    const colNames = Object.keys(colDefs)
    const outRows = []

    rows.forEach((row, idx) => {
      const excelRow = idx + 2
      if (!row || typeof row !== 'object') {
        pushError(errors, tableName, excelRow, '*', 'Row must be an object')
        return
      }

      const isEmpty = colNames.every((c) => {
        const v = row[c]
        return v === undefined || v === null || String(v).trim() === ''
      })
      if (isEmpty) return

      const built = {}
      let rowOk = true

      for (const col of colNames) {
        const def = colDefs[col]
        const raw = row[col]
        if (def.required && (raw === undefined || raw === null || String(raw).trim() === '')) {
          pushError(errors, tableName, excelRow, col, 'Required field is missing')
          rowOk = false
          continue
        }
        if (raw === undefined || raw === null || String(raw).trim() === '') {
          built[col] = null
          continue
        }
        const r = coerceCell(raw, def)
        if (!r.ok) {
          pushError(errors, tableName, excelRow, col, r.error)
          rowOk = false
        } else {
          built[col] = r.value
        }
      }

      if (rowOk) {
        built._excelRow = excelRow
        outRows.push(built)
      }
    })

    coerced[tableName] = outRows
  }

  const hasErrors = Object.keys(errors).length > 0
  return { ok: !hasErrors, errors, coerced }
}
