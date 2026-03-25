import pool from '../../config/database.js';
import { logger } from '../../utils/logger.js';
import { loadBulkCoreContract, REVERSE_DELETE_ORDER } from './loadContract.js';
import {
  validateAndCoerce,
  filterToContractTables,
  validateDealLawyersForeignKeys,
  validateLawyerEmailAmbiguity,
  validateDealNaturalKeyAmbiguity,
  validateAwardNaturalKeyAmbiguity,
  validateReplaceForeignKeyPrecheck
} from './bulkCoreValidate.js';

function stripMeta(row) {
  if (!row || typeof row !== 'object') return row;
  const { _excelRow, ...rest } = row;
  return rest;
}

function tableColumnOrder(contract, tableName) {
  return Object.keys(contract.tables[tableName].columns);
}

function dataColumns(contract, tableName) {
  return tableColumnOrder(contract, tableName).filter((c) => c !== 'id');
}

async function insertLawyerRow(conn, row, mode, contract) {
  const r = stripMeta(row);
  const dataCols = dataColumns(contract, 'lawyers');
  const vals = dataCols.map((c) => r[c] ?? null);

  if (mode === 'upsert' && r.email) {
    const [found] = await conn.query('SELECT id FROM lawyers WHERE email <=> ? LIMIT 2', [r.email]);
    if (found.length === 1) {
      const id = found[0].id;
      const assigns = dataCols.map((c) => `${c} = ?`).join(', ');
      await conn.query(`UPDATE lawyers SET ${assigns} WHERE id = ?`, [...vals, id]);
      return 'updated';
    }
  }

  const cols = [];
  const params = [];
  if (r.id != null) {
    cols.push('id');
    params.push(r.id);
  }
  dataCols.forEach((c, i) => {
    cols.push(c);
    params.push(vals[i]);
  });
  await conn.query(
    `INSERT INTO lawyers (${cols.join(',')}) VALUES (${cols.map(() => '?').join(',')})`,
    params
  );
  return 'inserted';
}

async function insertDealRow(conn, row, mode, contract) {
  const r = stripMeta(row);
  const dataCols = dataColumns(contract, 'deals');
  const vals = dataCols.map((c) => r[c] ?? null);

  if (mode === 'upsert') {
    const [found] = await conn.query(
      'SELECT id FROM deals WHERE deal_name <=> ? AND client_name <=> ? LIMIT 2',
      [r.deal_name ?? null, r.client_name ?? null]
    );
    if (found.length === 1) {
      const id = found[0].id;
      const assigns = dataCols.map((c) => `${c} = ?`).join(', ');
      await conn.query(`UPDATE deals SET ${assigns} WHERE id = ?`, [...vals, id]);
      return 'updated';
    }
  }

  const cols = [];
  const params = [];
  if (r.id != null) {
    cols.push('id');
    params.push(r.id);
  }
  dataCols.forEach((c, i) => {
    cols.push(c);
    params.push(vals[i]);
  });
  await conn.query(
    `INSERT INTO deals (${cols.join(',')}) VALUES (${cols.map(() => '?').join(',')})`,
    params
  );
  return 'inserted';
}

async function insertAwardRow(conn, row, mode, contract) {
  const r = stripMeta(row);
  const dataCols = dataColumns(contract, 'awards');
  const vals = dataCols.map((c) => r[c] ?? null);

  if (mode === 'upsert') {
    const [found] = await conn.query(
      'SELECT id FROM awards WHERE award_name <=> ? AND award_year <=> ? LIMIT 2',
      [r.award_name ?? null, r.award_year ?? null]
    );
    if (found.length === 1) {
      const id = found[0].id;
      const assigns = dataCols.map((c) => `${c} = ?`).join(', ');
      await conn.query(`UPDATE awards SET ${assigns} WHERE id = ?`, [...vals, id]);
      return 'updated';
    }
  }

  const cols = [];
  const params = [];
  if (r.id != null) {
    cols.push('id');
    params.push(r.id);
  }
  dataCols.forEach((c, i) => {
    cols.push(c);
    params.push(vals[i]);
  });
  await conn.query(
    `INSERT INTO awards (${cols.join(',')}) VALUES (${cols.map(() => '?').join(',')})`,
    params
  );
  return 'inserted';
}

async function insertDealLawyerRow(conn, row, mode) {
  const r = stripMeta(row);
  const role = r.role ?? null;
  if (mode === 'upsert') {
    await conn.query(
      `INSERT INTO deal_lawyers (deal_id, lawyer_id, role) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE role = VALUES(role)`,
      [r.deal_id, r.lawyer_id, role]
    );
  } else {
    await conn.query(
      'INSERT INTO deal_lawyers (deal_id, lawyer_id, role) VALUES (?, ?, ?)',
      [r.deal_id, r.lawyer_id, role]
    );
  }
}

export async function runBulkCoreImport(body) {
  const contract = loadBulkCoreContract();
  const mode = body?.mode;
  const tables = body?.tables;

  if (!['append', 'replace', 'upsert'].includes(mode)) {
    return {
      success: false,
      errors: {
        _request: [{ row: 0, column: 'mode', message: 'mode must be append, replace, or upsert' }]
      }
    };
  }

  if (!tables || typeof tables !== 'object') {
    return {
      success: false,
      errors: {
        _request: [{ row: 0, column: 'tables', message: 'tables object is required' }]
      }
    };
  }

  const { unknown } = filterToContractTables(contract, tables);
  if (unknown.length) {
    return {
      success: false,
      errors: {
        _request: [
          {
            row: 0,
            column: 'tables',
            message: `Unknown table keys (not in contract): ${unknown.join(', ')}`
          }
        ]
      }
    };
  }

  const { ok, errors, coerced } = validateAndCoerce(contract, tables);
  if (!ok) {
    return { success: false, errors };
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const mergedErrors = { ...errors };
    validateReplaceForeignKeyPrecheck(mode, coerced, mergedErrors);

    await validateDealLawyersForeignKeys(conn, coerced, mergedErrors);
    await validateLawyerEmailAmbiguity(conn, coerced, mode, mergedErrors);
    await validateDealNaturalKeyAmbiguity(conn, coerced, mode, mergedErrors);
    await validateAwardNaturalKeyAmbiguity(conn, coerced, mode, mergedErrors);

    if (Object.keys(mergedErrors).length > 0) {
      await conn.rollback();
      return { success: false, errors: mergedErrors };
    }

    if (mode === 'replace') {
      for (const t of REVERSE_DELETE_ORDER) {
        await conn.query(`DELETE FROM ${t}`);
      }
    }

    const inserted = {
      lawyers: 0,
      awards: 0,
      deals: 0,
      deal_lawyers: 0
    };

    for (const tableName of contract.insert_order) {
      const rows = coerced[tableName] || [];
      if (tableName === 'lawyers') {
        for (const row of rows) {
          await insertLawyerRow(conn, row, mode, contract);
          inserted.lawyers += 1;
        }
      } else if (tableName === 'awards') {
        for (const row of rows) {
          await insertAwardRow(conn, row, mode, contract);
          inserted.awards += 1;
        }
      } else if (tableName === 'deals') {
        for (const row of rows) {
          await insertDealRow(conn, row, mode, contract);
          inserted.deals += 1;
        }
      } else if (tableName === 'deal_lawyers') {
        for (const row of rows) {
          await insertDealLawyerRow(conn, row, mode);
          inserted.deal_lawyers += 1;
        }
      }
    }

    await conn.commit();
    return { success: true, inserted };
  } catch (err) {
    await conn.rollback();
    logger.error('bulkCoreImport failed', { error: err.message, stack: err.stack });
    return {
      success: false,
      errors: {
        _request: [{ row: 0, column: '*', message: err.message || 'Database error' }]
      }
    };
  } finally {
    conn.release();
  }
}
