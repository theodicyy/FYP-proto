<template>
  <div class="animate-fade-in">
    <div class="page-header">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 class="page-title">Awards Management</h1>
          <p class="page-subtitle">Manage firm awards and accolades (schema-driven)</p>
        </div>
        <button @click="showCreateModal = true" class="btn btn-primary">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v16m8-8H4" />
          </svg>
          Add Award
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
            <input v-model="searchQuery" type="text" placeholder="Search by award or organization..." class="input pl-12" />
          </div>
        </div>
        <div class="w-full lg:w-40 input-group">
          <label class="label">Category</label>
          <input v-model="filterCategory" type="text" placeholder="Filter by category" class="input" />
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

    <div class="card">
      <div v-if="loading" class="py-12 text-center">
        <div class="spinner mx-auto mb-4"></div>
        <p class="text-secondary-500">Loading awards...</p>
      </div>
      <div v-else-if="filteredAwards.length === 0" class="empty-state">
        <svg class="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
        <h3 class="empty-state-title">No awards found</h3>
        <p class="empty-state-description">Add an award or adjust your filters.</p>
      </div>
      <div v-else class="crud-table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>Award name</th>
              <th>Organization</th>
              <th>Year</th>
              <th>Category</th>
              <th class="crud-actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="award in filteredAwards" :key="award.id">
              <td class="font-medium text-secondary-900">{{ award.award_name || '-' }}</td>
              <td>{{ award.awarding_organization || '-' }}</td>
              <td>{{ award.award_year ?? '-' }}</td>
              <td>
                <span v-if="award.category" class="badge badge-secondary">{{ award.category }}</span>
                <span v-else class="text-secondary-400">-</span>
              </td>
              <td class="crud-actions-col">
                <div class="crud-actions">
                  <button type="button" @click="editAward(award)" class="crud-btn crud-btn-edit" title="Edit" aria-label="Edit">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button type="button" @click="confirmDelete(award)" class="crud-btn crud-btn-delete" title="Delete" aria-label="Delete">
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

    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showCreateModal || editingAward" class="modal-overlay" @click.self="closeModal">
          <div class="modal modal-lg">
            <div class="modal-header">
              <h3 class="text-lg font-semibold text-secondary-900">
                {{ editingAward ? 'Edit Award' : 'Add New Award' }}
              </h3>
              <button @click="closeModal" class="btn btn-ghost btn-sm">×</button>
            </div>
            <form @submit.prevent="saveAward">
              <div class="modal-body space-y-4">
                <p class="section-title">Core details</p>
                <div class="input-group">
                  <label class="label">Award name *</label>
                  <input v-model="awardForm.award_name" type="text" required class="input" maxlength="255" />
                </div>
                <div class="input-group">
                  <label class="label">Awarding organization</label>
                  <input v-model="awardForm.awarding_organization" type="text" class="input" maxlength="255" />
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="input-group">
                    <label class="label">Award year</label>
                    <input v-model.number="awardForm.award_year" type="number" class="input" />
                  </div>
                  <div class="input-group">
                    <label class="label">Category</label>
                    <input v-model="awardForm.category" type="text" class="input" maxlength="100" />
                  </div>
                </div>

                <p class="section-title">Description & publications</p>
                <div class="input-group">
                  <label class="label">Description</label>
                  <textarea v-model="awardForm.description" rows="3" class="input"></textarea>
                </div>
                <div class="input-group">
                  <label class="label">Publications</label>
                  <textarea v-model="awardForm.publications" rows="2" class="input"></textarea>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" @click="closeModal" class="btn btn-secondary">Cancel</button>
                <button type="submit" class="btn btn-primary" :disabled="saving">
                  {{ saving ? 'Saving...' : 'Save Award' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <Teleport to="body">
      <Transition name="modal">
        <div v-if="awardToDelete" class="modal-overlay" @click.self="awardToDelete = null">
          <div class="modal">
            <div class="modal-header">
              <h3 class="text-lg font-semibold text-secondary-900">Delete Award</h3>
            </div>
            <div class="modal-body">
              <p class="text-secondary-700">
                Are you sure you want to delete <strong>{{ awardToDelete.award_name }}</strong>?
              </p>
              <p class="text-sm text-secondary-500 mt-2">This action cannot be undone.</p>
            </div>
            <div class="modal-footer">
              <button @click="awardToDelete = null" class="btn btn-secondary">Cancel</button>
              <button @click="deleteAward" class="btn btn-danger" :disabled="deleting">
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

const awards = ref([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const searchQuery = ref('')
const filterCategory = ref('')
const filterYear = ref(null)
const showCreateModal = ref(false)
const editingAward = ref(null)
const awardToDelete = ref(null)

const awardForm = ref({
  award_name: '',
  awarding_organization: '',
  award_year: null,
  category: '',
  description: '',
  publications: ''
})

const filteredAwards = computed(() => {
  let filtered = [...awards.value]
  const q = searchQuery.value.toLowerCase().trim()
  if (q) {
    filtered = filtered.filter(a =>
      (a.award_name || '').toLowerCase().includes(q) ||
      (a.awarding_organization || '').toLowerCase().includes(q)
    )
  }
  if (filterCategory.value.trim()) {
    const cat = filterCategory.value.toLowerCase().trim()
    filtered = filtered.filter(a => (a.category || '').toLowerCase().includes(cat))
  }
  if (filterYear.value != null && filterYear.value !== '') {
    filtered = filtered.filter(a => a.award_year === filterYear.value)
  }
  return filtered
})

onMounted(() => fetchAwards())

async function fetchAwards() {
  loading.value = true
  try {
    const response = await dataService.getAwards()
    awards.value = response.data || []
  } catch (error) {
    console.error('Error fetching awards:', error)
    alert('Error loading awards: ' + error.message)
  } finally {
    loading.value = false
  }
}

function clearFilters() {
  searchQuery.value = ''
  filterCategory.value = ''
  filterYear.value = null
}

function editAward(award) {
  editingAward.value = award
  awardForm.value = {
    award_name: award.award_name || '',
    awarding_organization: award.awarding_organization || '',
    award_year: award.award_year != null ? award.award_year : null,
    category: award.category || '',
    description: award.description || '',
    publications: award.publications || ''
  }
}

function closeModal() {
  showCreateModal.value = false
  editingAward.value = null
  awardForm.value = {
    award_name: '',
    awarding_organization: '',
    award_year: null,
    category: '',
    description: '',
    publications: ''
  }
}

function buildPayload() {
  const f = awardForm.value
  return {
    award_name: f.award_name,
    awarding_organization: f.awarding_organization || null,
    award_year: f.award_year != null ? f.award_year : null,
    category: f.category || null,
    description: f.description || null,
    publications: f.publications || null
  }
}

async function saveAward() {
  saving.value = true
  try {
    const payload = buildPayload()
    if (editingAward.value) {
      await dataService.updateAward(editingAward.value.id, payload)
    } else {
      await dataService.createAward(payload)
    }
    closeModal()
    await fetchAwards()
  } catch (error) {
    alert('Error saving award: ' + error.message)
  } finally {
    saving.value = false
  }
}

function confirmDelete(award) {
  awardToDelete.value = award
}

async function deleteAward() {
  if (!awardToDelete.value) return
  deleting.value = true
  try {
    await dataService.deleteAward(awardToDelete.value.id)
    awardToDelete.value = null
    await fetchAwards()
  } catch (error) {
    alert('Error deleting award: ' + error.message)
  } finally {
    deleting.value = false
  }
}
</script>

<style scoped>
.section-title {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-text-light, #6b7280);
  letter-spacing: 0.02em;
}
.modal-enter-active, .modal-leave-active { transition: all 0.3s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .modal, .modal-leave-to .modal { transform: scale(0.95) translateY(10px); }
</style>
