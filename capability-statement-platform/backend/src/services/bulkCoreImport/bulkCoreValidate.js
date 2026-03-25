import { coerceCell } from './bulkCoreCoerce.js';

function pushError(errorsByTable, table, row, column, message) {
  if (!errorsByTable[table]) errorsByTable[table] = [];
  errorsByTable[table].push({ row, column, message });
}

/**
 * Reject unknown top-level table keys (contract is sole source of allowed tables).
 */
export function filterToContractTables(contract, tables) {
  const allowed = new Set(Object.keys(contract.tables));
  const unknown = Object.keys(tables || {}).filter((k) => !allowed.has(k));
  return { unknown };
}

export function validateAndCoerce(contract, tables) {
  const errors = {};
  const coerced = {};

  for (const tableName of contract.insert_order) {
    const rows = tables[tableName];
    if (!rows || !Array.isArray(rows)) {
      coerced[tableName] = [];
      continue;
    }

    const colDefs = contract.tables[tableName].columns;
    const colNames = Object.keys(colDefs);
    const outRows = [];

    rows.forEach((row, idx) => {
      const excelRow = idx + 2;
      if (!row || typeof row !== 'object') {
        pushError(errors, tableName, excelRow, '*', 'Row must be an object');
        return;
      }

      const isEmpty = colNames.every((c) => {
        const v = row[c];
        return v === undefined || v === null || String(v).trim() === '';
      });
      if (isEmpty) return;

      const built = {};
      let rowOk = true;

      for (const col of colNames) {
        const def = colDefs[col];
        const raw = row[col];
        if (def.required && (raw === undefined || raw === null || String(raw).trim() === '')) {
          pushError(errors, tableName, excelRow, col, 'Required field is missing');
          rowOk = false;
          continue;
        }
        if (raw === undefined || raw === null || String(raw).trim() === '') {
          built[col] = null;
          continue;
        }
        const r = coerceCell(raw, def);
        if (!r.ok) {
          pushError(errors, tableName, excelRow, col, r.error);
          rowOk = false;
        } else {
          built[col] = r.value;
        }
      }

      if (rowOk) {
        built._excelRow = excelRow;
        outRows.push(built);
      }
    });

    coerced[tableName] = outRows;
  }

  const hasErrors = Object.keys(errors).length > 0;
  return { ok: !hasErrors, errors, coerced };
}

/**
 * deal_lawyer rows: lawyer_id and deal_id must exist in DB or appear as explicit id on a row
 * in the same payload for lawyers / deals tables.
 */
export async function validateDealLawyersForeignKeys(connection, coercedTables, errors) {
  const dl = coercedTables.deal_lawyers || [];
  if (dl.length === 0) return;

  const payloadLawyerIds = new Set(
    (coercedTables.lawyers || [])
      .map((r) => r.id)
      .filter((id) => id !== null && id !== undefined)
  );
  const payloadDealIds = new Set(
    (coercedTables.deals || [])
      .map((r) => r.id)
      .filter((id) => id !== null && id !== undefined)
  );

  const needLawyers = [...new Set(dl.map((r) => r.lawyer_id))].filter(
    (id) => !payloadLawyerIds.has(id)
  );
  const needDeals = [...new Set(dl.map((r) => r.deal_id))].filter((id) => !payloadDealIds.has(id));

  let dbLawyers = new Set();
  let dbDeals = new Set();

  if (needLawyers.length) {
    const ph = needLawyers.map(() => '?').join(',');
    const [rows] = await connection.query(`SELECT id FROM lawyers WHERE id IN (${ph})`, needLawyers);
    dbLawyers = new Set(rows.map((x) => x.id));
  }
  if (needDeals.length) {
    const ph = needDeals.map(() => '?').join(',');
    const [rows] = await connection.query(`SELECT id FROM deals WHERE id IN (${ph})`, needDeals);
    dbDeals = new Set(rows.map((x) => x.id));
  }

  dl.forEach((r) => {
    const excelRow = r._excelRow ?? 0;
    const okL = payloadLawyerIds.has(r.lawyer_id) || dbLawyers.has(r.lawyer_id);
    const okD = payloadDealIds.has(r.deal_id) || dbDeals.has(r.deal_id);
    if (!okL) {
      pushError(errors, 'deal_lawyers', excelRow, 'lawyer_id', `lawyer_id ${r.lawyer_id} not found in database or lawyers sheet id column`);
    }
    if (!okD) {
      pushError(errors, 'deal_lawyers', excelRow, 'deal_id', `deal_id ${r.deal_id} not found in database or deals sheet id column`);
    }
  });
}

export async function validateLawyerEmailAmbiguity(connection, coercedTables, mode, errors) {
  if (mode !== 'upsert') return;
  const lawyers = coercedTables.lawyers || [];
  for (let i = 0; i < lawyers.length; i++) {
    const row = lawyers[i];
    const excelRow = row._excelRow ?? i + 2;
    if (!row.email) continue;
    const [rows] = await connection.query(
      'SELECT id FROM lawyers WHERE email <=> ?',
      [row.email]
    );
    if (rows.length > 1) {
      pushError(errors, 'lawyers', excelRow, 'email', 'Multiple existing lawyers share this email; cannot upsert');
    }
  }
}

export async function validateDealNaturalKeyAmbiguity(connection, coercedTables, mode, errors) {
  if (mode !== 'upsert') return;
  const deals = coercedTables.deals || [];
  for (let i = 0; i < deals.length; i++) {
    const row = deals[i];
    const excelRow = row._excelRow ?? i + 2;
    const [rows] = await connection.query(
      'SELECT id FROM deals WHERE deal_name <=> ? AND client_name <=> ?',
      [row.deal_name ?? null, row.client_name ?? null]
    );
    if (rows.length > 1) {
      pushError(errors, 'deals', excelRow, 'deal_name', 'Multiple deals match deal_name + client_name; cannot upsert');
    }
  }
}

/**
 * After replace deletes, DB has no core rows; deal_lawyers must reference explicit ids present on payload rows.
 */
export function validateReplaceForeignKeyPrecheck(mode, coercedTables, errors) {
  if (mode !== 'replace') return;
  const dl = coercedTables.deal_lawyers || [];
  if (dl.length === 0) return;

  const payloadLawyerIds = new Set(
    (coercedTables.lawyers || []).map((r) => r.id).filter((id) => id != null)
  );
  const payloadDealIds = new Set(
    (coercedTables.deals || []).map((r) => r.id).filter((id) => id != null)
  );

  dl.forEach((r) => {
    const excelRow = r._excelRow ?? 0;
    if (!payloadLawyerIds.has(r.lawyer_id)) {
      pushError(
        errors,
        'deal_lawyers',
        excelRow,
        'lawyer_id',
        'replace mode: lawyer_id must match an id on a lawyers row in this upload (database is cleared first)'
      );
    }
    if (!payloadDealIds.has(r.deal_id)) {
      pushError(
        errors,
        'deal_lawyers',
        excelRow,
        'deal_id',
        'replace mode: deal_id must match an id on a deals row in this upload (database is cleared first)'
      );
    }
  });
}

export async function validateAwardNaturalKeyAmbiguity(connection, coercedTables, mode, errors) {
  if (mode !== 'upsert') return;
  const awards = coercedTables.awards || [];
  for (let i = 0; i < awards.length; i++) {
    const row = awards[i];
    const excelRow = row._excelRow ?? i + 2;
    const [rows] = await connection.query(
      'SELECT id FROM awards WHERE award_name <=> ? AND award_year <=> ?',
      [row.award_name ?? null, row.award_year ?? null]
    );
    if (rows.length > 1) {
      pushError(errors, 'awards', excelRow, 'award_name', 'Multiple awards match award_name + award_year; cannot upsert');
    }
  }
}
