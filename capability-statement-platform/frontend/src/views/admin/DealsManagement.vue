<template>
  <div class="animate-fade-in">
    <div class="page-header">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 class="page-title">Deals Management</h1>
          <p class="page-subtitle">Manage deal records (schema-driven)</p>
        </div>
        <button @click="showCreateModal = true" class="btn btn-primary">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v16m8-8H4" />
          </svg>
          Add Deal
        </button>
      </div>
    </div>

    <div class="card mb-6">
      <div class="flex flex-col lg:flex-row gap-4">
        <div class="flex-1 input-group">
          <label class="label">Search</label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-4 flex items-center text-secondary-400">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input v-model="searchQuery" type="text" placeholder="Search by deal or client name..." class="input pl-12" />
          </div>
        </div>
        <div class="w-full lg:w-48 input-group">
          <label class="label">Deal industry</label>
          <input v-model="filterIndustry" type="text" placeholder="Filter by industry" class="input" />
        </div>
        <div class="flex items-end">
          <button @click="clearFilters" class="btn btn-secondary">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear
          </button>
        </div>
      </div>
    </div>

    <div class="card">
      <div v-if="loading" class="py-12 text-center">
        <div class="spinner mx-auto mb-4"></div>
        <p class="text-secondary-500">Loading deals...</p>
      </div>
      <div v-else-if="filteredDeals.length === 0" class="empty-state">
        <svg class="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="empty-state-title">No deals found</h3>
        <p class="empty-state-description">Add a deal or adjust your filters.</p>
      </div>
      <div v-else class="crud-table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>Deal name</th>
              <th>Client</th>
              <th>Value</th>
              <th>Currency</th>
              <th>Deal date</th>
              <th>Deal industry</th>
              <th class="crud-actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="deal in filteredDeals" :key="deal.id">
              <td class="font-medium text-secondary-900">{{ deal.deal_name || '-' }}</td>
              <td>{{ deal.client_name || '-' }}</td>
              <td>{{ formatNumber(deal.deal_value) }}</td>
              <td>{{ deal.currency || deal.deal_currency || '-' }}</td>
              <td>{{ formatDate(deal.deal_date) }}</td>
              <td>
                <span v-if="deal.deal_industry || deal.industry" class="badge badge-secondary">{{ deal.deal_industry || deal.industry }}</span>
                <span v-else class="text-secondary-400">-</span>
              </td>
              <td class="crud-actions-col">
                <div class="crud-actions">
                  <button type="button" @click="editDeal(deal)" class="crud-btn crud-btn-edit" title="Edit" aria-label="Edit">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button type="button" @click="confirmDelete(deal)" class="crud-btn crud-btn-delete" title="Delete" aria-label="Delete">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create/Edit Modal (schema fields) -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showCreateModal || editingDeal" class="modal-overlay" @click.self="closeModal">
          <div class="modal modal-lg modal-max-height">
            <div class="modal-header">
              <h3 class="text-lg font-semibold text-secondary-900">
                {{ editingDeal ? 'Edit Deal' : 'Add New Deal' }}
              </h3>
              <button @click="closeModal" class="btn btn-ghost btn-sm">×</button>
            </div>
            <form @submit.prevent="saveDeal">
              <div class="modal-body space-y-4">
                <p class="section-title">Core details</p>
                <div class="input-group">
                  <label class="label">Deal name *</label>
                  <input v-model="dealForm.deal_name" type="text" required class="input" maxlength="255" />
                </div>
                <div class="input-group">
                  <label class="label">Client name</label>
                  <input v-model="dealForm.client_name" type="text" class="input" maxlength="255" />
                </div>
                <div class="input-group">
                  <label class="label">Deal industry</label>
                  <input v-model="dealForm.deal_industry" type="text" class="input" placeholder="e.g. M&A, Banking" />
                </div>

                <p class="section-title">Value & dates</p>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div class="input-group">
                    <label class="label">Deal value</label>
                    <input v-model.number="dealForm.deal_value" type="number" step="0.01" class="input" />
                  </div>
                  <div class="input-group">
                    <label class="label">Currency</label>
                    <select v-model="dealForm.currency" class="select">
                      <option value="">—</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="SGD">SGD</option>
                    </select>
                  </div>
                  <div class="input-group">
                    <label class="label">Jurisdiction</label>
                    <input v-model="dealForm.jurisdiction" type="text" class="input" maxlength="100" />
                  </div>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div class="input-group">
                    <label class="label">Deal date</label>
                    <input v-model="dealForm.deal_date" type="date" class="input" />
                  </div>
                  <div class="input-group">
                    <label class="label">Signing date</label>
                    <input v-model="dealForm.signing_date" type="date" class="input" />
                  </div>
                  <div class="input-group">
                    <label class="label">Completion date</label>
                    <input v-model="dealForm.completion_date" type="date" class="input" />
                  </div>
                </div>

                <p class="section-title">Role & notability</p>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="input-group">
                    <label class="label">Acting for</label>
                    <input v-model="dealForm.acting_for" type="text" class="input" maxlength="50" placeholder="e.g. Buyer, Seller" />
                  </div>
                  <div class="input-group">
                    <label class="label">Notability</label>
                    <select v-model="dealForm.notability" class="select">
                      <option value="">—</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                </div>
                <div class="input-group">
                  <label class="label">Notable reason</label>
                  <textarea v-model="dealForm.notable_reason" rows="2" class="input"></textarea>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="input-group">
                    <label class="label">Partner approval</label>
                    <select v-model="dealForm.partner_approval" class="select">
                      <option value="">—</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  <div class="input-group">
                    <label class="label">Partner initial</label>
                    <input v-model="dealForm.partner_initial" type="text" class="input" maxlength="20" />
                  </div>
                </div>

                <p class="section-title">Descriptions</p>
                <div class="input-group">
                  <label class="label">Deal summary</label>
                  <textarea v-model="dealForm.deal_summary" rows="3" class="input"></textarea>
                </div>
                <div class="input-group">
                  <label class="label">Significant features</label>
                  <textarea v-model="dealForm.significant_features" rows="2" class="input"></textarea>
                </div>
                <div class="input-group">
                  <label class="label">Past clients</label>
                  <textarea v-model="dealForm.past_clients" rows="1" class="input"></textarea>
                </div>
                <div class="input-group">
                  <label class="label">Remarks</label>
                  <textarea v-model="dealForm.remarks" rows="2" class="input"></textarea>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" @click="closeModal" class="btn btn-secondary">Cancel</button>
                <button type="submit" class="btn btn-primary" :disabled="saving">
                  {{ saving ? 'Saving...' : 'Save Deal' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <Teleport to="body">
      <Transition name="modal">
        <div v-if="dealToDelete" class="modal-overlay" @click.self="dealToDelete = null">
          <div class="modal">
            <div class="modal-header">
              <h3 class="text-lg font-semibold text-secondary-900">Delete Deal</h3>
            </div>
            <div class="modal-body">
              <p class="text-secondary-700">
                Are you sure you want to delete <strong>{{ dealToDelete.deal_name }}</strong>?
              </p>
              <p class="text-sm text-secondary-500 mt-2">This action cannot be undone.</p>
            </div>
            <div class="modal-footer">
              <button @click="dealToDelete = null" class="btn btn-secondary">Cancel</button>
              <button @click="deleteDeal" class="btn btn-danger" :disabled="deleting">
                {{ deleting ? 'Deleting...' : 'Delete' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import dataService from '../../services/dataService'

const deals = ref([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const searchQuery = ref('')
const filterIndustry = ref('')
const showCreateModal = ref(false)
const editingDeal = ref(null)
const dealToDelete = ref(null)

const dealForm = ref({
  deal_name: '',
  client_name: '',
  deal_summary: '',
  significant_features: '',
  notability: '',
  notable_reason: '',
  acting_for: '',
  deal_value: null,
  currency: '',
  jurisdiction: '',
  deal_date: '',
  signing_date: '',
  completion_date: '',
  past_clients: '',
  deal_industry: '',
  remarks: '',
  partner_approval: '',
  partner_initial: ''
})

const filteredDeals = computed(() => {
  let filtered = [...deals.value]
  const q = searchQuery.value.toLowerCase().trim()
  if (q) {
    filtered = filtered.filter(d =>
      (d.deal_name || '').toLowerCase().includes(q) ||
      (d.client_name || '').toLowerCase().includes(q)
    )
  }
  const ind = filterIndustry.value.toLowerCase().trim()
  if (ind) {
    filtered = filtered.filter(d =>
      (d.deal_industry || d.industry || '').toLowerCase().includes(ind)
    )
  }
  return filtered
})

onMounted(() => fetchDeals())

async function fetchDeals() {
  loading.value = true
  try {
    const response = await dataService.getDeals()
    deals.value = response.data || []
  } catch (error) {
    console.error('Error fetching deals:', error)
    alert('Error loading deals: ' + error.message)
  } finally {
    loading.value = false
  }
}

function clearFilters() {
  searchQuery.value = ''
  filterIndustry.value = ''
}

function editDeal(deal) {
  editingDeal.value = deal
  dealForm.value = {
    deal_name: deal.deal_name || '',
    client_name: deal.client_name || '',
    deal_summary: deal.deal_summary || deal.deal_description || '',
    significant_features: deal.significant_features || '',
    notability: deal.notability || '',
    notable_reason: deal.notable_reason || '',
    acting_for: deal.acting_for || '',
    deal_value: deal.deal_value != null ? deal.deal_value : null,
    currency: deal.currency || deal.deal_currency || '',
    jurisdiction: deal.jurisdiction || '',
    deal_date: deal.deal_date ? deal.deal_date.toString().slice(0, 10) : '',
    signing_date: deal.signing_date ? deal.signing_date.toString().slice(0, 10) : '',
    completion_date: deal.completion_date ? deal.completion_date.toString().slice(0, 10) : '',
    past_clients: deal.past_clients || '',
    deal_industry: deal.deal_industry || deal.industry || '',
    remarks: deal.remarks || '',
    partner_approval: deal.partner_approval || '',
    partner_initial: deal.partner_initial || ''
  }
}

function closeModal() {
  showCreateModal.value = false
  editingDeal.value = null
  dealForm.value = {
    deal_name: '',
    client_name: '',
    deal_summary: '',
    significant_features: '',
    notability: '',
    notable_reason: '',
    acting_for: '',
    deal_value: null,
    currency: '',
    jurisdiction: '',
    deal_date: '',
    signing_date: '',
    completion_date: '',
    past_clients: '',
    deal_industry: '',
    remarks: '',
    partner_approval: '',
    partner_initial: ''
  }
}

function buildPayload() {
  const f = dealForm.value
  return {
    deal_name: f.deal_name,
    client_name: f.client_name || null,
    deal_summary: f.deal_summary || null,
    significant_features: f.significant_features || null,
    notability: f.notability || null,
    notable_reason: f.notable_reason || null,
    acting_for: f.acting_for || null,
    deal_value: f.deal_value != null ? f.deal_value : null,
    currency: f.currency || null,
    jurisdiction: f.jurisdiction || null,
    deal_date: f.deal_date || null,
    signing_date: f.signing_date || null,
    completion_date: f.completion_date || null,
    past_clients: f.past_clients || null,
    deal_industry: f.deal_industry || null,
    remarks: f.remarks || null,
    partner_approval: f.partner_approval || null,
    partner_initial: f.partner_initial || null
  }
}

async function saveDeal() {
  saving.value = true
  try {
    const payload = buildPayload()
    if (editingDeal.value) {
      await dataService.updateDeal(editingDeal.value.id, payload)
    } else {
      await dataService.createDeal(payload)
    }
    closeModal()
    await fetchDeals()
  } catch (error) {
    alert('Error saving deal: ' + error.message)
  } finally {
    saving.value = false
  }
}

function confirmDelete(deal) {
  dealToDelete.value = deal
}

async function deleteDeal() {
  if (!dealToDelete.value) return
  deleting.value = true
  try {
    await dataService.deleteDeal(dealToDelete.value.id)
    dealToDelete.value = null
    await fetchDeals()
  } catch (error) {
    alert('Error deleting deal: ' + error.message)
  } finally {
    deleting.value = false
  }
}

function formatNumber(value) {
  if (value == null) return '-'
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value)
}

function formatDate(d) {
  if (!d) return '-'
  const s = typeof d === 'string' ? d : d.toString()
  return s.slice(0, 10)
}
</script>

<style scoped>
.section-title {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-text-light, #6b7280);
  letter-spacing: 0.02em;
}
.modal-max-height { max-height: 90vh; overflow-y: auto; }
.modal-enter-active, .modal-leave-active { transition: all 0.3s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .modal, .modal-leave-to .modal { transform: scale(0.95) translateY(10px); }
</style>
