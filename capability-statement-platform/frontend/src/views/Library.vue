
<template>
  <div class="animate-fade-in">
    <!-- Page Header -->
    <div class="page-header">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 class="page-title">Capability Statement Library</h1>
          <p class="page-subtitle">Manage and view your saved capability statements</p>
        </div>
        <div class="page-actions">
          <router-link to="/aggregation" class="btn btn-primary">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v16m8-8H4" />
            </svg>
            Create New
          </router-link>
        </div>
      </div>
    </div>

    <!-- Error Alert -->
    <Transition name="fade">
      <div v-if="capStore.error" class="alert alert-error mb-6 flex items-start gap-3">
        <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{{ capStore.error }}</span>
      </div>
    </Transition>

    <!-- Search & Filter Bar -->
    <div class="card mb-6">
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="flex-1 relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search title, client or matter no..."
            class="input pl-9 w-full"
          />
        </div>

        <div class="flex items-center gap-2 flex-shrink-0">
          <button @click="showFilters = !showFilters" class="btn btn-secondary btn-sm sm:hidden">
            Filters
            <span v-if="activeFilterCount" class="ml-1 bg-primary-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{{ activeFilterCount }}</span>
          </button>

          <div class="hidden sm:flex items-center gap-2">
            <select v-model="filterStatus" class="select text-sm py-2 px-3">
              <option value="">All Statuses</option>
              <option value="generated">Generated</option>
              <option value="In Progress">In Progress</option>
              <option value="Closed Won">Closed Won</option>
              <option value="Closed Lost">Closed Lost</option>
            </select>
            <div class="flex items-center gap-1 text-secondary-400 text-sm">
              <input v-model="filterDateFrom" type="date" class="input text-sm py-2 px-3 w-36" title="From date" />
              <span>–</span>
              <input v-model="filterDateTo" type="date" class="input text-sm py-2 px-3 w-36" title="To date" />
            </div>
            <button v-if="activeFilterCount" @click="clearFilters" class="btn btn-ghost btn-sm text-secondary-400 hover:text-secondary-700 px-2" title="Clear filters">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div v-if="showFilters" class="sm:hidden mt-3 pt-3 border-t border-secondary-100 flex flex-col gap-2">
        <select v-model="filterStatus" class="select text-sm">
          <option value="">All Statuses</option>
          <option value="generated">Generated</option>
          <option value="In Progress">In Progress</option>
          <option value="Closed Won">Closed Won</option>
          <option value="Closed Lost">Closed Lost</option>
        </select>
        <div class="flex items-center gap-2">
          <input v-model="filterDateFrom" type="date" class="input text-sm flex-1" />
          <span class="text-secondary-400">–</span>
          <input v-model="filterDateTo" type="date" class="input text-sm flex-1" />
        </div>
        <button v-if="activeFilterCount" @click="clearFilters" class="btn btn-ghost btn-sm text-secondary-500 self-start">Clear filters</button>
      </div>

      <p v-if="capStore.statements.length > 0" class="text-xs text-secondary-400 mt-3">
        Showing {{ filteredStatements.length }} of {{ capStore.statements.length }} statement{{ capStore.statements.length !== 1 ? 's' : '' }}
      </p>
    </div>

    <!-- Statements Table -->
    <div class="card">
      <div v-if="capStore.loading" class="py-12 text-center">
        <div class="spinner mx-auto mb-4"></div>
        <p class="text-secondary-500">Loading statements...</p>
      </div>
      <div v-else-if="capStore.statements.length === 0" class="empty-state">
        <svg class="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
        </svg>
        <h3 class="empty-state-title">No statements yet</h3>
        <p class="empty-state-description">Create your first capability statement to get started.</p>
        <router-link to="/aggregation" class="btn btn-primary mt-4">Create Statement</router-link>
      </div>
      <div v-else-if="filteredStatements.length === 0" class="empty-state">
        <h3 class="empty-state-title">No results found</h3>
        <p class="empty-state-description">Try adjusting your search or filters.</p>
        <button @click="clearFilters" class="btn btn-secondary mt-4">Clear Filters</button>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Client</th>
              <th>Matter No.</th>
              <th>Status</th>
              <th>Created</th>
              <th>Versions</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="statement in filteredStatements" :key="statement.id">
              <td>
                <span class="font-medium text-secondary-900">{{ statement.title }}</span>
              </td>
              <td class="text-secondary-500 text-sm">{{ statement.client_name || '—' }}</td>
              <td class="text-secondary-500 text-sm">{{ statement.matter_number || '—' }}</td>
              <td>
                <div v-if="editingStatusId === statement.id" class="inline-block">
                  <select
                    v-model="editingStatusValue"
                    @change="saveStatus(statement.id)"
                    @blur="cancelStatusEdit"
                    class="select text-xs py-1 px-2 min-w-0"
                    autofocus
                  >
                    <option value="In Progress">In Progress</option>
                    <option value="Closed Won">Closed Won</option>
                    <option value="Closed Lost">Closed Lost</option>
                  </select>
                </div>
                <button
                  v-else
                  @click="startStatusEdit(statement.id, statement.status)"
                  class="badge cursor-pointer hover:opacity-80 transition-opacity"
                  :class="getStatusBadgeClass(statement.status)"
                >
                  {{ statement.status || 'In Progress' }}
                </button>
              </td>
              <td class="text-secondary-500">{{ formatDate(statement.created_at) }}</td>
              <td>
                <span class="badge badge-secondary">{{ statement.version_count || 1 }} version{{ (statement.version_count || 1) !== 1 ? 's' : '' }}</span>
              </td>
              <td>
                <div class="flex items-center justify-end gap-2">
                  <button @click="openViewModal(statement.id)" class="btn btn-ghost btn-sm text-primary-600 hover:text-primary-700">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View
                  </button>
                  <button @click="editStatement(statement.id)" class="btn btn-ghost btn-sm text-secondary-600 hover:text-secondary-800">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Edit
                  </button>
                  <button @click="confirmDelete(statement)" class="btn btn-ghost btn-sm text-red-600 hover:text-red-700">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- View Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="viewingStatement" class="modal-overlay" @click.self="viewingStatement = null">
          <div class="modal modal-xl max-h-[90vh] overflow-hidden flex flex-col">
            <div class="modal-header flex items-center justify-between">
              <h3 class="text-lg font-semibold text-secondary-900">{{ viewingStatement.title }}</h3>
              <button @click="viewingStatement = null" class="btn btn-ghost btn-sm">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div class="modal-body flex-1 overflow-y-auto">
              <!-- Actions -->
              <div class="flex flex-wrap gap-3 mb-6">
                <button @click="editStatement(viewingStatement.id)" class="btn btn-primary">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Edit (New Version)
                </button>
              </div>

              <!-- Version History -->
              <h4 class="text-sm font-semibold text-secondary-700 mb-3">Version History</h4>
              <div class="space-y-3">
                <div
                  v-for="version in viewingStatement.versions"
                  :key="version.id"
                  class="flex items-center justify-between p-4 rounded-xl border border-secondary-200 bg-secondary-50"
                >
                  <div>
                    <div class="flex items-center gap-2 mb-1">
                      <span class="badge badge-secondary">v{{ version.version_number }}</span>
                      <span class="font-medium text-secondary-800 text-sm">
                        {{ version.title || viewingStatement.title }}
                      </span>
                    </div>
                    <p class="text-xs text-secondary-400">Generated {{ formatDate(version.created_at) }}</p>
                  </div>
                  <button
                    @click="downloadDocxById(version.id, version.title || viewingStatement.title)"
                    class="btn btn-secondary btn-sm"
                    title="Download DOCX"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    DOCX
                  </button>
                </div>
                <div v-if="!viewingStatement.versions || viewingStatement.versions.length === 0" class="text-sm text-secondary-400 py-4 text-center">
                  No versions found.
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showDeleteModal" class="modal-overlay" @click.self="!deleting && (showDeleteModal = false)">
          <div class="modal">
            <div class="modal-header">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 class="text-lg font-semibold text-red-600">Delete Statement</h3>
              </div>
            </div>
            <div class="modal-body">
              <p class="text-secondary-700 mb-2">
                Are you sure you want to delete "<strong>{{ statementToDelete?.title }}</strong>"?
              </p>
              <p class="text-secondary-500 text-sm">
                This will permanently delete the statement and <strong>all {{ statementToDelete?.version_count || 0 }} version(s)</strong>. This action cannot be undone.
              </p>
            </div>
            <div class="modal-footer">
              <button @click="showDeleteModal = false" :disabled="deleting" class="btn btn-secondary">Cancel</button>
              <button @click="deleteStatement" :disabled="deleting" class="btn btn-danger">
                {{ deleting ? 'Deleting...' : 'Delete Permanently' }}
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
import { useRouter } from 'vue-router'
import { useCapStatementStore } from '../stores/capStatementStore'
import dataService from '../services/dataService'

const router = useRouter()
const capStore = useCapStatementStore()

const viewingStatement = ref(null)
const showDeleteModal = ref(false)
const statementToDelete = ref(null)
const deleting = ref(false)
const editingStatusId = ref(null)
const editingStatusValue = ref(null)

const searchQuery = ref('')
const filterStatus = ref('')
const filterDateFrom = ref('')
const filterDateTo = ref('')
const showFilters = ref(false)

const activeFilterCount = computed(() =>
  [filterStatus.value, filterDateFrom.value, filterDateTo.value].filter(Boolean).length
)

const filteredStatements = computed(() => {
  let list = capStore.statements
  const q = searchQuery.value.trim().toLowerCase()
  if (q) {
    list = list.filter(s =>
      (s.title || '').toLowerCase().includes(q) ||
      (s.client_name || '').toLowerCase().includes(q) ||
      (s.matter_number || '').toLowerCase().includes(q)
    )
  }
  if (filterStatus.value) {
    list = list.filter(s => (s.status || '').toLowerCase() === filterStatus.value.toLowerCase())
  }
  if (filterDateFrom.value) {
    const from = new Date(filterDateFrom.value)
    list = list.filter(s => new Date(s.created_at) >= from)
  }
  if (filterDateTo.value) {
    const to = new Date(filterDateTo.value)
    to.setHours(23, 59, 59, 999)
    list = list.filter(s => new Date(s.created_at) <= to)
  }
  return list
})

function clearFilters() {
  searchQuery.value = ''
  filterStatus.value = ''
  filterDateFrom.value = ''
  filterDateTo.value = ''
  showFilters.value = false
}

function formatDate(dateString) {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function getStatusBadgeClass(status) {
  if (!status || status === 'In Progress') return 'badge-warning'
  if (status === 'Closed Won') return 'badge-success'
  if (status === 'Closed Lost') return 'badge-danger'
  return 'badge-secondary'
}

async function openViewModal(id) {
  try {
    const res = await dataService.getStatementById(id)
    viewingStatement.value = res?.data?.data ?? res?.data ?? null
  } catch (error) {
    alert('Error loading statement: ' + error.message)
  }
}

async function editStatement(id) {
  try {
    capStore.error = null
    await capStore.loadForEdit(id)
    viewingStatement.value = null
    router.push('/configuration')
  } catch (error) {
    alert('Error loading statement for editing: ' + (error.message || 'Unknown error'))
  }
}

function confirmDelete(statement) {
  statementToDelete.value = statement
  showDeleteModal.value = true
}

async function deleteStatement() {
  if (!statementToDelete.value) return
  deleting.value = true
  try {
    await dataService.deleteStatement(statementToDelete.value.id)
    showDeleteModal.value = false
    if (viewingStatement.value?.id === statementToDelete.value?.id) {
      viewingStatement.value = null
    }
    statementToDelete.value = null
    await capStore.fetchStatements()
  } catch (error) {
    alert('Error deleting statement: ' + (error.response?.data?.error?.message || error.message))
  } finally {
    deleting.value = false
  }
}

function startStatusEdit(statementId, currentStatus) {
  editingStatusId.value = statementId
  editingStatusValue.value = currentStatus || 'In Progress'
}

function cancelStatusEdit() {
  setTimeout(() => {
    editingStatusId.value = null
    editingStatusValue.value = null
  }, 200)
}

async function saveStatus(statementId) {
  if (!editingStatusValue.value) {
    cancelStatusEdit()
    return
  }
  const statement = capStore.statements.find(s => s.id === statementId)
  const originalStatus = statement?.status
  if (statement) statement.status = editingStatusValue.value
  try {
    const response = await dataService.updateStatement(statementId, { status: editingStatusValue.value })
    if (response.success || response?.data?.success) {
      await capStore.fetchStatements()
    } else {
      if (statement) statement.status = originalStatus
      alert('Failed to update status')
    }
  } catch (error) {
    if (statement) statement.status = originalStatus
    alert('Error updating status: ' + error.message)
  } finally {
    editingStatusId.value = null
    editingStatusValue.value = null
  }
}

async function downloadDocxById(id, title) {
  try {
    const response = await dataService.downloadDocx(id)
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title || 'Capability_Statement'}.docx`
    a.click()
    URL.revokeObjectURL(url)
  } catch (err) {
    alert('Failed to download DOCX: ' + (err.response?.data?.error?.message || err.message))
  }
}

onMounted(async () => {
  await capStore.fetchStatements()
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal,
.modal-leave-to .modal {
  transform: scale(0.95) translateY(10px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
