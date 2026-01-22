<template>
  <div class="animate-fade-in">
    <!-- Page Header -->
    <div class="page-header">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 class="page-title">Deals Management</h1>
          <p class="page-subtitle">Manage deal records and transaction history</p>
        </div>
        <button @click="showCreateModal = true" class="btn btn-primary">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v16m8-8H4" />
          </svg>
          Add Deal
        </button>
      </div>
    </div>

    <!-- Filters -->
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
            <input v-model="searchQuery" type="text" placeholder="Search deals..." class="input pl-12" />
          </div>
        </div>
        <div class="w-full lg:w-40 input-group">
          <label class="label">Industry</label>
          <select v-model="filterIndustry" class="select">
            <option value="">All</option>
            <option value="Technology">Technology</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Manufacturing">Manufacturing</option>
          </select>
        </div>
        <div class="w-full lg:w-32 input-group">
          <label class="label">Year</label>
          <input v-model.number="filterYear" type="number" placeholder="Year" class="input" />
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

    <!-- Table -->
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
        <p class="empty-state-description">Add a deal to get started or adjust your filters.</p>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="table">
          <thead>
            <tr>
              <th>Deal Name</th>
              <th>Client</th>
              <th>Value</th>
              <th>Year</th>
              <th>Industry</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="deal in filteredDeals" :key="deal.id">
              <td class="font-medium text-secondary-900">{{ deal.deal_name }}</td>
              <td>{{ deal.client_name || '-' }}</td>
              <td>
                <span class="font-medium text-emerald-600">{{ formatCurrency(deal.deal_value, deal.deal_currency) }}</span>
              </td>
              <td>{{ deal.deal_year || '-' }}</td>
              <td>
                <span v-if="deal.industry" class="badge badge-info">{{ deal.industry }}</span>
                <span v-else class="text-secondary-400">-</span>
              </td>
              <td>
                <div class="flex items-center justify-end gap-2">
                  <button @click="editDeal(deal)" class="btn btn-ghost btn-sm text-primary-600">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button @click="confirmDelete(deal)" class="btn btn-ghost btn-sm text-red-600">
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

    <!-- Create/Edit Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showCreateModal || editingDeal" class="modal-overlay" @click.self="closeModal">
          <div class="modal modal-lg">
            <div class="modal-header">
              <h3 class="text-lg font-semibold text-secondary-900">
                {{ editingDeal ? 'Edit Deal' : 'Add New Deal' }}
              </h3>
              <button @click="closeModal" class="btn btn-ghost btn-sm">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form @submit.prevent="saveDeal">
              <div class="modal-body space-y-4">
                <div class="input-group">
                  <label class="label">Deal Name *</label>
                  <input v-model="dealForm.deal_name" type="text" required class="input" />
                </div>
                
                <div class="input-group">
                  <label class="label">Client Name</label>
                  <input v-model="dealForm.client_name" type="text" class="input" />
                </div>
                
                <div class="grid grid-cols-3 gap-4">
                  <div class="input-group">
                    <label class="label">Deal Value</label>
                    <input v-model.number="dealForm.deal_value" type="number" step="0.01" class="input" />
                  </div>
                  <div class="input-group">
                    <label class="label">Currency</label>
                    <select v-model="dealForm.deal_currency" class="select">
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="SGD">SGD</option>
                    </select>
                  </div>
                  <div class="input-group">
                    <label class="label">Deal Year</label>
                    <input v-model.number="dealForm.deal_year" type="number" class="input" />
                  </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                  <div class="input-group">
                    <label class="label">Industry</label>
                    <input v-model="dealForm.industry" type="text" class="input" />
                  </div>
                  <div class="input-group">
                    <label class="label">Practice Group</label>
                    <input v-model="dealForm.practice_group" type="text" class="input" />
                  </div>
                </div>
                
                <div class="input-group">
                  <label class="label">Description</label>
                  <textarea v-model="dealForm.deal_description" rows="3" class="input"></textarea>
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

    <!-- Delete Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="dealToDelete" class="modal-overlay" @click.self="dealToDelete = null">
          <div class="modal">
            <div class="modal-header">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 class="text-lg font-semibold text-secondary-900">Delete Deal</h3>
              </div>
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
const filterYear = ref(null)
const showCreateModal = ref(false)
const editingDeal = ref(null)
const dealToDelete = ref(null)

const dealForm = ref({
  deal_name: '',
  client_name: '',
  deal_value: null,
  deal_currency: 'USD',
  industry: '',
  practice_group: '',
  deal_year: null,
  deal_description: '',
  deal_type: '',
  source_system: 'admin'
})

const filteredDeals = computed(() => {
  let filtered = [...deals.value]
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(d => 
      d.deal_name.toLowerCase().includes(query) ||
      (d.client_name && d.client_name.toLowerCase().includes(query))
    )
  }
  
  if (filterIndustry.value) {
    filtered = filtered.filter(d => d.industry === filterIndustry.value)
  }
  
  if (filterYear.value) {
    filtered = filtered.filter(d => d.deal_year === filterYear.value)
  }
  
  return filtered
})

onMounted(async () => {
  await fetchDeals()
})

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
  filterYear.value = null
}

function editDeal(deal) {
  editingDeal.value = deal
  dealForm.value = {
    deal_name: deal.deal_name,
    client_name: deal.client_name || '',
    deal_value: deal.deal_value || null,
    deal_currency: deal.deal_currency || 'USD',
    industry: deal.industry || '',
    practice_group: deal.practice_group || '',
    deal_year: deal.deal_year || null,
    deal_description: deal.deal_description || '',
    deal_type: deal.deal_type || '',
    source_system: deal.source_system || 'admin'
  }
}

function closeModal() {
  showCreateModal.value = false
  editingDeal.value = null
  dealForm.value = {
    deal_name: '',
    client_name: '',
    deal_value: null,
    deal_currency: 'USD',
    industry: '',
    practice_group: '',
    deal_year: null,
    deal_description: '',
    deal_type: '',
    source_system: 'admin'
  }
}

async function saveDeal() {
  saving.value = true
  try {
    if (editingDeal.value) {
      await dataService.updateDeal(editingDeal.value.id, dealForm.value)
    } else {
      await dataService.createDeal(dealForm.value)
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

function formatCurrency(value, currency = 'USD') {
  if (!value) return '-'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0
  }).format(value)
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active {
  transition: all 0.3s ease;
}
.modal-enter-from, .modal-leave-to {
  opacity: 0;
}
.modal-enter-from .modal, .modal-leave-to .modal {
  transform: scale(0.95) translateY(10px);
}
</style>
