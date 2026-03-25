import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let cached;

export function loadBulkCoreContract() {
  if (!cached) {
    const p = path.join(__dirname, '../../config/bulkCoreImportContract.json');
    cached = JSON.parse(readFileSync(p, 'utf8'));
  }
  return cached;
}

export const REVERSE_DELETE_ORDER = ['deal_lawyers', 'deals', 'awards', 'lawyers'];
