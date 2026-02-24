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
          <label class="label">Practice group</label>
          <input
            v-model="filterPracticeGroup"
            type="text"
            placeholder="Filter by practice group"
            class="input"
            @input="filterLawyers"
          />
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
      <div v-else class="crud-table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Title</th>
              <th>Designation</th>
              <th>Practice group</th>
              <th>Experience</th>
              <th class="crud-actions-col">Actions</th>
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
              <td>{{ lawyer.designation || lawyer.lawyer_designation || '-' }}</td>
              <td>
                <span v-if="lawyer.practice_group" class="badge badge-secondary">{{ lawyer.practice_group }}</span>
                <span v-else class="text-secondary-400">-</span>
              </td>
              <td>{{ lawyer.years_experience != null ? `${lawyer.years_experience} yrs` : '-' }}</td>
              <td class="crud-actions-col">
                <div class="crud-actions">
                  <button type="button" @click="editLawyer(lawyer)" class="crud-btn crud-btn-edit" title="Edit" aria-label="Edit">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button type="button" @click="confirmDelete(lawyer)" class="crud-btn crud-btn-delete" title="Delete" aria-label="Delete">
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
        <div v-if="showCreateModal || editingLawyer" class="lawyer-modal-overlay" @click.self="closeModal">
          <div class="lawyer-modal">
            <div class="lawyer-modal-header">
              <h3 class="text-lg font-semibold text-secondary-900">
                {{ editingLawyer ? 'Edit Lawyer' : 'Add New Lawyer' }}
              </h3>
              <button type="button" @click="closeModal" class="lawyer-modal-close" aria-label="Close">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form @submit.prevent="saveLawyer" class="lawyer-modal-form">
              <div class="lawyer-modal-body">
                <p
                  v-if="formError"
                  class="lawyer-form-error"
                  role="alert"
                >
                  {{ formError }}
                </p>

                <section class="lawyer-form-section">
                  <h4 class="lawyer-form-section-title">Name & contact</h4>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="input-group">
                      <label class="label" for="lawyer-first">First name <span class="text-red-500">*</span></label>
                      <input id="lawyer-first" v-model="lawyerForm.first_name" type="text" required class="input" maxlength="100" placeholder="e.g. Jane" />
                    </div>
                    <div class="input-group">
                      <label class="label" for="lawyer-last">Last name <span class="text-red-500">*</span></label>
                      <input id="lawyer-last" v-model="lawyerForm.last_name" type="text" required class="input" maxlength="100" placeholder="e.g. Tan" />
                    </div>
                  </div>
                  <div class="input-group">
                    <label class="label" for="lawyer-email">Email</label>
                    <input id="lawyer-email" v-model="lawyerForm.email" type="email" class="input" maxlength="191" placeholder="e.g. jane.tan@firm.com" />
                  </div>
                  <div class="input-group">
                    <label class="label" for="lawyer-phone">Phone</label>
                    <input id="lawyer-phone" v-model="lawyerForm.phone" type="text" class="input" placeholder="e.g. +65 6123 4567" />
                  </div>
                </section>

                <section class="lawyer-form-section">
                  <h4 class="lawyer-form-section-title">Role & practice</h4>
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div class="input-group">
                      <label class="label" for="lawyer-title">Title</label>
                      <input id="lawyer-title" v-model="lawyerForm.title" type="text" class="input" maxlength="100" placeholder="e.g. Partner" />
                    </div>
                    <div class="input-group">
                      <label class="label" for="lawyer-designation">Designation</label>
                      <input id="lawyer-designation" v-model="lawyerForm.designation" type="text" class="input" maxlength="100" />
                    </div>
                    <div class="input-group">
                      <label class="label" for="lawyer-lawyer-designation">Lawyer designation</label>
                      <input id="lawyer-lawyer-designation" v-model="lawyerForm.lawyer_designation" type="text" class="input" maxlength="255" />
                    </div>
                  </div>
                  <div class="input-group">
                    <label class="label" for="lawyer-practice">Practice group</label>
                    <input id="lawyer-practice" v-model="lawyerForm.practice_group" type="text" class="input" maxlength="300" placeholder="e.g. Corporate, Litigation" />
                  </div>
                  <div class="input-group lawyer-years-field">
                    <label class="label" for="lawyer-years">Years of experience</label>
                    <input id="lawyer-years" v-model.number="lawyerForm.years_experience" type="number" min="0" class="input" placeholder="—" />
                  </div>
                </section>

                <section class="lawyer-form-section">
                  <h4 class="lawyer-form-section-title">Qualifications & admissions</h4>
                  <div class="input-group">
                    <label class="label" for="lawyer-qualifications">Qualifications</label>
                    <textarea id="lawyer-qualifications" v-model="lawyerForm.qualifications" rows="2" class="input" placeholder="Education, degrees"></textarea>
                  </div>
                  <div class="input-group">
                    <label class="label" for="lawyer-admissions">Admissions</label>
                    <textarea id="lawyer-admissions" v-model="lawyerForm.admissions" rows="1" class="input" placeholder="Bar admissions"></textarea>
                  </div>
                </section>

                <section class="lawyer-form-section">
                  <h4 class="lawyer-form-section-title">Bio</h4>
                  <div class="input-group">
                    <label class="label" for="lawyer-bio">Short biography</label>
                    <textarea id="lawyer-bio" v-model="lawyerForm.bio" rows="3" class="input" placeholder="Brief professional summary"></textarea>
                  </div>
                </section>
              </div>

              <div class="lawyer-modal-footer">
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
const formError = ref('')

const lawyerForm = ref({
  first_name: '',
  last_name: '',
  email: '',
  practice_group: '',
  title: '',
  designation: '',
  lawyer_designation: '',
  phone: '',
  qualifications: '',
  admissions: '',
  bio: '',
  years_experience: null
})

const filteredLawyers = computed(() => {
  let filtered = [...lawyers.value]
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(l => 
      (l.first_name || '').toLowerCase().includes(query) ||
      (l.last_name || '').toLowerCase().includes(query) ||
      (l.email || '').toLowerCase().includes(query)
    )
  }
  
  if (filterPracticeGroup.value.trim()) {
    const pg = filterPracticeGroup.value.toLowerCase().trim()
    filtered = filtered.filter(l => (l.practice_group || '').toLowerCase().includes(pg))
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
    first_name: lawyer.first_name || '',
    last_name: lawyer.last_name || '',
    email: lawyer.email || '',
    practice_group: lawyer.practice_group || '',
    title: lawyer.title || '',
    designation: lawyer.designation || '',
    lawyer_designation: lawyer.lawyer_designation || '',
    phone: lawyer.phone || '',
    qualifications: lawyer.qualifications || '',
    admissions: lawyer.admissions || '',
    bio: lawyer.bio || '',
    years_experience: lawyer.years_experience != null ? lawyer.years_experience : null
  }
}

function closeModal() {
  showCreateModal.value = false
  editingLawyer.value = null
  formError.value = ''
  lawyerForm.value = {
    first_name: '',
    last_name: '',
    email: '',
    practice_group: '',
    title: '',
    designation: '',
    lawyer_designation: '',
    phone: '',
    qualifications: '',
    admissions: '',
    bio: '',
    years_experience: null
  }
}

async function saveLawyer() {
  formError.value = ''

  const first = (lawyerForm.value.first_name || '').trim()
  const last = (lawyerForm.value.last_name || '').trim()
  if (!first || !last) {
    formError.value = 'First name and last name are required.'
    return
  }

  if (lawyerForm.value.years_experience != null && lawyerForm.value.years_experience < 0) {
    formError.value = 'Years of experience cannot be negative.'
    return
  }

  saving.value = true
  try {
    const payload = { ...lawyerForm.value }
    if (!editingLawyer.value) {
      payload.source_system = 'admin'
    }
    if (editingLawyer.value) {
      await dataService.updateLawyer(editingLawyer.value.id, payload)
    } else {
      await dataService.createLawyer(payload)
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
/* Lawyer modal: constrained size, scrollable body, clear hierarchy */
.lawyer-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background-color: rgba(84, 88, 91, 0.5);
  backdrop-filter: blur(2px);
}

.lawyer-modal {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 36rem;
  max-height: min(90vh, 720px);
  background-color: var(--color-surface);
  border-radius: 0.75rem;
  box-shadow: var(--shadow-lg);
  animation: lawyerModalIn 0.2s ease-out;
}

.lawyer-modal-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--color-border);
}

.lawyer-modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  color: var(--color-text-light, #6b7280);
  background: none;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: color 0.15s, background-color 0.15s;
}
.lawyer-modal-close:hover {
  color: var(--color-text, #374151);
  background-color: var(--color-neutral-light, #f3f4f6);
}

.lawyer-modal-form {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.lawyer-modal-body {
  flex: 1 1 auto;
  overflow-y: auto;
  padding: 1rem 1.25rem 1.25rem;
  -webkit-overflow-scrolling: touch;
}

.lawyer-form-error {
  font-size: 0.875rem;
  color: #b91c1c;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
  margin-bottom: 1rem;
}

.lawyer-form-section {
  margin-bottom: 1.5rem;
}
.lawyer-form-section:last-child {
  margin-bottom: 0;
}

.lawyer-form-section-title {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-text-light, #6b7280);
  letter-spacing: 0.02em;
  margin: 0 0 0.75rem 0;
  padding-bottom: 0.25rem;
}

.lawyer-years-field {
  max-width: 8rem;
}

.lawyer-modal-footer {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-top: 1px solid var(--color-border);
  background-color: var(--color-neutral-light, #f9fafb);
  border-radius: 0 0 0.75rem 0.75rem;
}

@keyframes lawyerModalIn {
  from {
    opacity: 0;
    transform: scale(0.96) translateY(-8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .lawyer-modal,
.modal-leave-to .lawyer-modal {
  transform: scale(0.96) translateY(-8px);
}
</style>
