<template>
  <div class="max-w-6xl mx-auto px-4 py-8">
    <div class="mb-8">
      <h1 class="text-2xl font-semibold text-secondary-900">Excel bulk import</h1>
      <p class="mt-2 text-secondary-600 text-sm">
        Sheet names must match table names: <code class="text-xs bg-secondary-100 px-1 rounded">lawyers</code>,
        <code class="text-xs bg-secondary-100 px-1 rounded">awards</code>,
        <code class="text-xs bg-secondary-100 px-1 rounded">deals</code>,
        <code class="text-xs bg-secondary-100 px-1 rounded">deal_lawyers</code>. Headers must match column names in the schema contract exactly.
      </p>
    </div>

    <div
      class="border-2 border-dashed rounded-xl p-10 text-center transition-colors"
      :class="isDragging ? 'border-primary-500 bg-primary-50/50' : 'border-secondary-200 bg-secondary-50/30'"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="onDrop"
    >
      <input
        ref="fileInput"
        type="file"
        accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        class="hidden"
        @change="onFileChange"
      />
      <p class="text-secondary-700 mb-4">Drag and drop an <strong>.xlsx</strong> file here, or</p>
      <button type="button" class="btn btn-primary" @click="$refs.fileInput.click()">Choose file</button>
    </div>

    <p v-if="skippedSheets.length" class="mt-3 text-sm text-amber-700">
      Skipped sheets (not in contract): {{ skippedSheets.join(', ') }}
    </p>

    <div v-if="sheetNames.length" class="mt-8 space-y-6">
      <div class="flex flex-wrap items-end gap-4">
        <div>
          <label class="block text-xs font-medium text-secondary-500 mb-1">Import mode</label>
          <select v-model="mode" class="input border rounded-lg px-3 py-2 text-sm min-w-[180px]">
            <option value="append">append</option>
            <option value="replace">replace</option>
            <option value="upsert">upsert</option>
          </select>
        </div>
        <div class="flex-1 min-w-[200px]">
          <label class="block text-xs font-medium text-secondary-500 mb-1">Preview sheet</label>
          <select v-model="activeSheet" class="input border rounded-lg px-3 py-2 text-sm w-full max-w-md">
            <option v-for="s in sheetNames" :key="s" :value="s">{{ s }} ({{ (tables[s] || []).length }} rows)</option>
          </select>
        </div>
      </div>

      <div v-if="validationErrorsFlat.length" class="rounded-lg border border-red-200 bg-red-50 p-4">
        <h2 class="text-sm font-semibold text-red-800 mb-2">Validation errors</h2>
        <ul class="text-sm text-red-900 space-y-1 max-h-48 overflow-auto">
          <li v-for="(e, i) in validationErrorsFlat" :key="i">
            <span class="font-mono text-xs">{{ e.table }}</span> row {{ e.row }}
            <span v-if="e.column" class="font-mono text-xs">· {{ e.column }}</span>
            — {{ e.message }}
          </li>
        </ul>
      </div>

      <div class="rounded-lg border border-secondary-200 overflow-hidden">
        <div class="bg-secondary-100 px-3 py-2 text-xs font-medium text-secondary-600">Preview (first 20 rows)</div>
        <div class="overflow-x-auto max-h-96">
          <table v-if="previewRows.length" class="min-w-full text-sm">
            <thead class="bg-secondary-50 sticky top-0">
              <tr>
                <th
                  v-for="col in previewColumns"
                  :key="col"
                  class="text-left px-2 py-1 border-b border-secondary-200 font-medium text-secondary-700"
                >
                  {{ col }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, ri) in previewRows" :key="ri" class="border-b border-secondary-100">
                <td v-for="col in previewColumns" :key="col" class="px-2 py-1 text-secondary-800 whitespace-nowrap max-w-xs truncate">
                  {{ displayCell(row[col]) }}
                </td>
              </tr>
            </tbody>
          </table>
          <p v-else class="p-4 text-secondary-500 text-sm">No rows in this sheet.</p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <button
          type="button"
          class="btn btn-primary"
          :disabled="!canUpload || loading"
          @click="confirmUpload"
        >
          {{ loading ? 'Uploading…' : 'Confirm upload' }}
        </button>
        <p v-if="successSummary" class="text-sm text-green-700">{{ successSummary }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { parseWorkbookToTables } from '@/modules/bulkUpload/excelParser.js'
import { validateAndCoerceClient, filterToContractTables } from '@/modules/bulkUpload/bulkCoreValidate.js'
import { dataService } from '@/services/dataService'

const fileInput = ref(null)
const isDragging = ref(false)
const tables = ref({})
const skippedSheets = ref([])
const mode = ref('append')
const activeSheet = ref('')
const clientValidation = ref({ ok: true, errors: {} })
const loading = ref(false)
const successSummary = ref('')

const sheetNames = computed(() => Object.keys(tables.value).sort())

const validationErrorsFlat = computed(() => {
  const out = []
  const err = clientValidation.value.errors || {}
  for (const [table, list] of Object.entries(err)) {
    for (const item of list) {
      out.push({ table, ...item })
    }
  }
  return out
})

const canUpload = computed(() => sheetNames.value.length > 0 && clientValidation.value.ok)

const previewRows = computed(() => {
  const rows = tables.value[activeSheet.value] || []
  return rows.slice(0, 20)
})

const previewColumns = computed(() => {
  const rows = tables.value[activeSheet.value] || []
  if (!rows.length) return []
  const keys = new Set()
  rows.slice(0, 20).forEach((r) => Object.keys(r).forEach((k) => keys.add(k)))
  return [...keys]
})

watch(sheetNames, (names) => {
  if (names.length && !names.includes(activeSheet.value)) {
    activeSheet.value = names[0]
  }
})

function displayCell(v) {
  if (v === null || v === undefined) return ''
  if (typeof v === 'object') return JSON.stringify(v)
  return String(v)
}

function ingestArrayBuffer(buf) {
  successSummary.value = ''
  const { tables: t, skippedSheets: sk } = parseWorkbookToTables(buf)
  tables.value = t
  skippedSheets.value = sk
  const { unknown } = filterToContractTables(t)
  if (unknown.length) {
    clientValidation.value = {
      ok: false,
      errors: {
        _request: [
          {
            row: 0,
            column: 'tables',
            message: `Unknown table keys: ${unknown.join(', ')}`
          }
        ]
      }
    }
    return
  }
  clientValidation.value = validateAndCoerceClient(t)
}

function onFileChange(e) {
  const f = e.target.files?.[0]
  if (!f) return
  f.arrayBuffer().then(ingestArrayBuffer)
}

function onDrop(e) {
  isDragging.value = false
  const f = e.dataTransfer?.files?.[0]
  if (!f || !/\.xlsx$/i.test(f.name)) return
  f.arrayBuffer().then(ingestArrayBuffer)
}

async function confirmUpload() {
  if (!canUpload.value) return
  loading.value = true
  successSummary.value = ''
  try {
    const res = await dataService.bulkCoreImport(mode.value, tables.value)
    if (res.success && res.inserted) {
      const parts = Object.entries(res.inserted)
        .map(([k, n]) => `${k}: ${n}`)
        .join(', ')
      successSummary.value = `Success — inserted/updated rows: ${parts}`
    } else {
      clientValidation.value = {
        ok: false,
        errors: res.errors || { _request: [{ row: 0, column: '', message: 'Unknown error' }] }
      }
    }
  } catch (err) {
    const data = err.response?.data
    if (data?.errors) {
      clientValidation.value = { ok: false, errors: data.errors }
    } else {
      clientValidation.value = {
        ok: false,
        errors: {
          _request: [{ row: 0, column: '', message: err.message || 'Request failed' }]
        }
      }
    }
  } finally {
    loading.value = false
  }
}
</script>
