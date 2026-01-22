<template>
  <div class="animate-fade-in">
    <!-- Page Header -->
    <div class="page-header">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 class="page-title">Lawyers Management</h1>
          <p class="page-subtitle">Add and manage lawyer profiles in the system</p>
        </div>
        <button @click="showCreateModal = true" class="btn btn-primary">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v16m8-8H4" />
          </svg>
          Add Lawyer
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
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search by name or email..."
              class="input pl-12"
              @input="filterLawyers"
            />
          </div>
        </div>
        <div class="w-full lg:w-48 input-group">
          <label class="label">Practice Group</label>
          <select v-model="filterPracticeGroup" @change="filterLawyers" class="select">
            <option value="">All Groups</option>
            <option value="Corporate Law">Corporate Law</option>
            <option value="Intellectual Property">Intellectual Property</option>
            <option value="Litigation">Litigation</option>
          </select>
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
        <p class="text-secondary-500">Loading lawyers...</p>
      </div>
      <div v-else-if="filteredLawyers.length === 0" class="empty-state">
        <svg class="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <h3 class="empty-state-title">No lawyers found</h3>
        <p class="empty-state-description">Add a lawyer to get started or adjust your filters.</p>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Title</th>
              <th>Practice Group</th>
              <th>Experience</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="lawyer in filteredLawyers" :key="lawyer.id">
              <td>
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-medium">
                    {{ lawyer.first_name?.[0] }}{{ lawyer.last_name?.[0] }}
                  </div>
                  <span class="font-medium text-secondary-900">{{ lawyer.first_name }} {{ lawyer.last_name }}</span>
                </div>
              </td>
              <td class="text-secondary-500">{{ lawyer.email || '-' }}</td>
              <td>{{ lawyer.title || '-' }}</td>
              <td>
                <span v-if="lawyer.practice_group" class="badge badge-secondary">{{ lawyer.practice_group }}</span>
                <span v-else class="text-secondary-400">-</span>
              </td>
              <td>{{ lawyer.years_experience ? `${lawyer.years_experience} yrs` : '-' }}</td>
              <td>
                <div class="flex items-center justify-end gap-2">
                  <button @click="editLawyer(lawyer)" class="btn btn-ghost btn-sm text-primary-600">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button @click="confirmDelete(lawyer)" class="btn btn-ghost btn-sm text-red-600">
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
        <div v-if="showCreateModal || editingLawyer" class="modal-overlay" @click.self="closeModal">
          <div class="modal modal-lg">
            <div class="modal-header">
              <h3 class="text-lg font-semibold text-secondary-900">
                {{ editingLawyer ? 'Edit Lawyer' : 'Add New Lawyer' }}
              </h3>
              <button @click="closeModal" class="btn btn-ghost btn-sm">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form @submit.prevent="saveLawyer">
              <div class="modal-body space-y-4">
                <div class="grid grid-cols-2 gap-4">
                  <div class="input-group">
                    <label class="label">First Name *</label>
                    <input v-model="lawyerForm.first_name" type="text" required class="input" />
                  </div>
                  <div class="input-group">
                    <label class="label">Last Name *</label>
                    <input v-model="lawyerForm.last_name" type="text" required class="input" />
                  </div>
                </div>
                
                <div class="input-group">
                  <label class="label">Email</label>
                  <input v-model="lawyerForm.email" type="email" class="input" />
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                  <div class="input-group">
                    <label class="label">Title</label>
                    <input v-model="lawyerForm.title" type="text" class="input" />
                  </div>
                  <div class="input-group">
                    <label class="label">Practice Group</label>
                    <input v-model="lawyerForm.practice_group" type="text" class="input" />
                  </div>
                </div>
                
                <div class="input-group">
                  <label class="label">Years of Experience</label>
                  <input v-model.number="lawyerForm.years_experience" type="number" min="0" class="input" />
                </div>
                
                <div class="input-group">
                  <label class="label">Bio</label>
                  <textarea v-model="lawyerForm.bio" rows="3" class="input"></textarea>
                </div>
              </div>
              
              <div class="modal-footer">
                <button type="button" @click="closeModal" class="btn btn-secondary">Cancel</button>
                <button type="submit" class="btn btn-primary" :disabled="saving">
                  {{ saving ? 'Saving...' : 'Save Lawyer' }}
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
        <div v-if="lawyerToDelete" class="modal-overlay" @click.self="lawyerToDelete = null">
          <div class="modal">
            <div class="modal-header">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 class="text-lg font-semibold text-secondary-900">Delete Lawyer</h3>
              </div>
            </div>
            <div class="modal-body">
              <p class="text-secondary-700">
                Are you sure you want to delete <strong>{{ lawyerToDelete.first_name }} {{ lawyerToDelete.last_name }}</strong>?
              </p>
              <p class="text-sm text-secondary-500 mt-2">This action cannot be undone.</p>
            </div>
            <div class="modal-footer">
              <button @click="lawyerToDelete = null" class="btn btn-secondary">Cancel</button>
              <button @click="deleteLawyer" class="btn btn-danger" :disabled="deleting">
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

const lawyers = ref([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const searchQuery = ref('')
const filterPracticeGroup = ref('')
const showCreateModal = ref(false)
const editingLawyer = ref(null)
const lawyerToDelete = ref(null)

const lawyerForm = ref({
  first_name: '',
  last_name: '',
  email: '',
  title: '',
  practice_group: '',
  years_experience: null,
  bio: '',
  source_system: 'admin'
})

const filteredLawyers = computed(() => {
  let filtered = [...lawyers.value]
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(l => 
      l.first_name.toLowerCase().includes(query) ||
      l.last_name.toLowerCase().includes(query) ||
      (l.email && l.email.toLowerCase().includes(query))
    )
  }
  
  if (filterPracticeGroup.value) {
    filtered = filtered.filter(l => l.practice_group === filterPracticeGroup.value)
  }
  
  return filtered
})

onMounted(async () => {
  await fetchLawyers()
})

async function fetchLawyers() {
  loading.value = true
  try {
    const response = await dataService.getLawyers()
    lawyers.value = response.data || []
  } catch (error) {
    console.error('Error fetching lawyers:', error)
    alert('Error loading lawyers: ' + error.message)
  } finally {
    loading.value = false
  }
}

function filterLawyers() {}

function clearFilters() {
  searchQuery.value = ''
  filterPracticeGroup.value = ''
}

function editLawyer(lawyer) {
  editingLawyer.value = lawyer
  lawyerForm.value = {
    first_name: lawyer.first_name,
    last_name: lawyer.last_name,
    email: lawyer.email || '',
    title: lawyer.title || '',
    practice_group: lawyer.practice_group || '',
    years_experience: lawyer.years_experience || null,
    bio: lawyer.bio || '',
    source_system: lawyer.source_system || 'admin'
  }
}

function closeModal() {
  showCreateModal.value = false
  editingLawyer.value = null
  lawyerForm.value = {
    first_name: '',
    last_name: '',
    email: '',
    title: '',
    practice_group: '',
    years_experience: null,
    bio: '',
    source_system: 'admin'
  }
}

async function saveLawyer() {
  saving.value = true
  try {
    if (editingLawyer.value) {
      await dataService.updateLawyer(editingLawyer.value.id, lawyerForm.value)
    } else {
      await dataService.createLawyer(lawyerForm.value)
    }
    closeModal()
    await fetchLawyers()
  } catch (error) {
    alert('Error saving lawyer: ' + error.message)
  } finally {
    saving.value = false
  }
}

function confirmDelete(lawyer) {
  lawyerToDelete.value = lawyer
}

async function deleteLawyer() {
  if (!lawyerToDelete.value) return
  
  deleting.value = true
  try {
    await dataService.deleteLawyer(lawyerToDelete.value.id)
    lawyerToDelete.value = null
    await fetchLawyers()
  } catch (error) {
    alert('Error deleting lawyer: ' + error.message)
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
