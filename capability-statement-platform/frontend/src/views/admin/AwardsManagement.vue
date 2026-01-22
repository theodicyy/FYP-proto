<template>
  <div class="animate-fade-in">
    <!-- Page Header -->
    <div class="page-header">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 class="page-title">Awards Management</h1>
          <p class="page-subtitle">Manage firm awards and accolades</p>
        </div>
        <button @click="showCreateModal = true" class="btn btn-primary">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v16m8-8H4" />
          </svg>
          Add Award
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
            <input v-model="searchQuery" type="text" placeholder="Search awards..." class="input pl-12" />
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
        <p class="text-secondary-500">Loading awards...</p>
      </div>
      <div v-else-if="filteredAwards.length === 0" class="empty-state">
        <svg class="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
        <h3 class="empty-state-title">No awards found</h3>
        <p class="empty-state-description">Add an award to get started or adjust your filters.</p>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="table">
          <thead>
            <tr>
              <th>Award Name</th>
              <th>Organization</th>
              <th>Year</th>
              <th>Category</th>
              <th>Industry</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="award in filteredAwards" :key="award.id">
              <td>
                <div class="flex items-center gap-2">
                  <svg class="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <span class="font-medium text-secondary-900">{{ award.award_name }}</span>
                </div>
              </td>
              <td>{{ award.awarding_organization || '-' }}</td>
              <td>{{ award.award_year || '-' }}</td>
              <td>
                <span v-if="award.category" class="badge badge-warning">{{ award.category }}</span>
                <span v-else class="text-secondary-400">-</span>
              </td>
              <td>{{ award.industry || '-' }}</td>
              <td>
                <div class="flex items-center justify-end gap-2">
                  <button @click="editAward(award)" class="btn btn-ghost btn-sm text-primary-600">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button @click="confirmDelete(award)" class="btn btn-ghost btn-sm text-red-600">
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
        <div v-if="showCreateModal || editingAward" class="modal-overlay" @click.self="closeModal">
          <div class="modal modal-lg">
            <div class="modal-header">
              <h3 class="text-lg font-semibold text-secondary-900">
                {{ editingAward ? 'Edit Award' : 'Add New Award' }}
              </h3>
              <button @click="closeModal" class="btn btn-ghost btn-sm">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form @submit.prevent="saveAward">
              <div class="modal-body space-y-4">
                <div class="input-group">
                  <label class="label">Award Name *</label>
                  <input v-model="awardForm.award_name" type="text" required class="input" />
                </div>
                
                <div class="input-group">
                  <label class="label">Awarding Organization</label>
                  <input v-model="awardForm.awarding_organization" type="text" class="input" />
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                  <div class="input-group">
                    <label class="label">Award Year</label>
                    <input v-model.number="awardForm.award_year" type="number" class="input" />
                  </div>
                  <div class="input-group">
                    <label class="label">Category</label>
                    <input v-model="awardForm.category" type="text" class="input" />
                  </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                  <div class="input-group">
                    <label class="label">Practice Group</label>
                    <input v-model="awardForm.practice_group" type="text" class="input" />
                  </div>
                  <div class="input-group">
                    <label class="label">Industry</label>
                    <input v-model="awardForm.industry" type="text" class="input" />
                  </div>
                </div>
                
                <div class="input-group">
                  <label class="label">Description</label>
                  <textarea v-model="awardForm.description" rows="3" class="input"></textarea>
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

    <!-- Delete Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="awardToDelete" class="modal-overlay" @click.self="awardToDelete = null">
          <div class="modal">
            <div class="modal-header">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 class="text-lg font-semibold text-secondary-900">Delete Award</h3>
              </div>
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
const filterIndustry = ref('')
const filterYear = ref(null)
const showCreateModal = ref(false)
const editingAward = ref(null)
const awardToDelete = ref(null)

const awardForm = ref({
  award_name: '',
  awarding_organization: '',
  award_year: null,
  category: '',
  practice_group: '',
  industry: '',
  description: '',
  source_system: 'admin'
})

const filteredAwards = computed(() => {
  let filtered = [...awards.value]
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(a => 
      a.award_name.toLowerCase().includes(query) ||
      (a.awarding_organization && a.awarding_organization.toLowerCase().includes(query))
    )
  }
  
  if (filterIndustry.value) {
    filtered = filtered.filter(a => a.industry === filterIndustry.value)
  }
  
  if (filterYear.value) {
    filtered = filtered.filter(a => a.award_year === filterYear.value)
  }
  
  return filtered
})

onMounted(async () => {
  await fetchAwards()
})

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
  filterIndustry.value = ''
  filterYear.value = null
}

function editAward(award) {
  editingAward.value = award
  awardForm.value = {
    award_name: award.award_name,
    awarding_organization: award.awarding_organization || '',
    award_year: award.award_year || null,
    category: award.category || '',
    practice_group: award.practice_group || '',
    industry: award.industry || '',
    description: award.description || '',
    source_system: award.source_system || 'admin'
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
    practice_group: '',
    industry: '',
    description: '',
    source_system: 'admin'
  }
}

async function saveAward() {
  saving.value = true
  try {
    if (editingAward.value) {
      await dataService.updateAward(editingAward.value.id, awardForm.value)
    } else {
      await dataService.createAward(awardForm.value)
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
