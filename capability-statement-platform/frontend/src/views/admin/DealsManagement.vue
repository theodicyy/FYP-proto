<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Deals Management</h1>
      <button @click="showCreateModal = true" class="btn btn-primary">
        + Add Deal
      </button>
    </div>

    <!-- Search and Filters -->
    <div class="card mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium mb-1">Search</label>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search deals..."
            class="input"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Industry</label>
          <select v-model="filterIndustry" class="input">
            <option value="">All</option>
            <option value="Technology">Technology</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Manufacturing">Manufacturing</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Year</label>
          <input v-model.number="filterYear" type="number" placeholder="Year" class="input" />
        </div>
        <div class="flex items-end">
          <button @click="clearFilters" class="btn btn-secondary w-full">
            Clear
          </button>
        </div>
      </div>
    </div>

    <!-- Deals Table -->
    <div class="card">
      <div v-if="loading" class="text-center py-8">Loading...</div>
      <div v-else>
        <table class="table">
          <thead>
            <tr>
              <th>Deal Name</th>
              <th>Client</th>
              <th>Value</th>
              <th>Year</th>
              <th>Industry</th>
              <th>Practice Group</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="deal in filteredDeals" :key="deal.id">
              <td>{{ deal.deal_name }}</td>
              <td>{{ deal.client_name || '-' }}</td>
              <td>{{ formatCurrency(deal.deal_value, deal.deal_currency) }}</td>
              <td>{{ deal.deal_year || '-' }}</td>
              <td>{{ deal.industry || '-' }}</td>
              <td>{{ deal.practice_group || '-' }}</td>
              <td>
                <div class="flex gap-2">
                  <button @click="editDeal(deal)" class="text-primary-600 hover:text-primary-800 text-sm">
                    Edit
                  </button>
                  <button @click="confirmDelete(deal)" class="text-red-600 hover:text-red-800 text-sm">
                    Delete
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredDeals.length === 0">
              <td colspan="7" class="text-center py-8 text-gray-500">
                No deals found
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showCreateModal || editingDeal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <h3 class="text-xl font-semibold mb-4">
          {{ editingDeal ? 'Edit Deal' : 'Add New Deal' }}
        </h3>
        
        <form @submit.prevent="saveDeal" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Deal Name *</label>
            <input v-model="dealForm.deal_name" type="text" required class="input" />
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">Client Name</label>
            <input v-model="dealForm.client_name" type="text" class="input" />
          </div>
          
          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">Deal Value</label>
              <input v-model.number="dealForm.deal_value" type="number" step="0.01" class="input" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Currency</label>
              <select v-model="dealForm.deal_currency" class="input">
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Deal Year</label>
              <input v-model.number="dealForm.deal_year" type="number" class="input" />
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">Industry</label>
              <input v-model="dealForm.industry" type="text" class="input" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Practice Group</label>
              <input v-model="dealForm.practice_group" type="text" class="input" />
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">Deal Type</label>
              <input v-model="dealForm.deal_type" type="text" class="input" placeholder="e.g., M&A, IPO" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Source System</label>
              <input v-model="dealForm.source_system" type="text" class="input" />
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">Description</label>
            <textarea v-model="dealForm.deal_description" rows="4" class="input"></textarea>
          </div>
          
          <div class="flex gap-2 justify-end">
            <button type="button" @click="closeModal" class="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? 'Saving...' : 'Save' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="dealToDelete" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 class="text-xl font-semibold mb-4">Delete Deal</h3>
        <p class="mb-4">
          Are you sure you want to delete <strong>{{ dealToDelete.deal_name }}</strong>?
        </p>
        <p class="text-sm text-red-600 mb-4">
          This action cannot be undone if the deal has associated lawyers.
        </p>
        <div class="flex gap-2 justify-end">
          <button @click="dealToDelete = null" class="btn btn-secondary">Cancel</button>
          <button @click="deleteDeal" class="btn btn-danger" :disabled="deleting">
            {{ deleting ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>
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
      alert('Deal updated successfully!')
    } else {
      await dataService.createDeal(dealForm.value)
      alert('Deal created successfully!')
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
    alert('Deal deleted successfully!')
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
