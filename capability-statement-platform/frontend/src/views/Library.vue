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
        <router-link to="/aggregation" class="btn btn-primary mt-4">
          Create Statement
        </router-link>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Created</th>
              <th>Version</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="statement in capStore.statements" :key="statement.id">
              <td>
                <span class="font-medium text-secondary-900">{{ statement.title }}</span>
              </td>
              <td>
                <!-- Inline Status Editor -->
                <div v-if="editingStatusId === statement.id" class="inline-block">
                  <select 
                    v-model="editingStatusValue" 
                    @change="saveStatus(statement.id)"
                    @blur="cancelStatusEdit"
                    class="select text-xs py-1 px-2 min-w-0"
                    ref="statusSelectRef"
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
                <span class="badge badge-secondary">v{{ statement.latest_version?.version_number || '1' }}</span>
              </td>
              <td>
                <div class="flex items-center justify-end gap-2">
                  <button 
                    @click="viewStatement(statement.id)" 
                    class="btn btn-ghost btn-sm text-primary-600 hover:text-primary-700"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View
                  </button>
                  <button 
                    @click="confirmDelete(statement)" 
                    class="btn btn-ghost btn-sm text-red-600 hover:text-red-700"
                  >
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

    <!-- View/Edit Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="viewingStatement" class="modal-overlay" @click.self="!capStore.isEditing && (viewingStatement = null)">
          <!-- Edit Mode: Full-screen editor -->
          <div v-if="capStore.isEditing" class="fixed inset-0 bg-white flex flex-col z-50">
            <div class="flex items-center justify-between px-6 py-4 border-b border-secondary-200 bg-white">
              <div class="flex items-center gap-4">
                <button @click="cancelEdits" class="btn btn-ghost btn-sm">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h3 class="text-lg font-semibold text-secondary-900">{{ viewingStatement.title }}</h3>
              </div>
              <div class="flex items-center gap-3">
                <button 
                  @click="downloadVersion"
                  class="btn btn-secondary btn-sm"
                  title="Download as PDF"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download PDF
                </button>
                <button 
                  @click="showSaveModal = true" 
                  :disabled="capStore.loading || saving"
                  class="btn btn-primary btn-sm"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 13l4 4L19 7" />
                  </svg>
                  {{ saving ? 'Saving...' : 'Save' }}
                </button>
                <button @click="cancelEdits" class="btn btn-ghost btn-sm">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div class="flex-1 overflow-hidden bg-secondary-100">
              <InlineDocumentEditor 
                ref="statementEditorRef"
                :statement-id="viewingStatement?.id"
              />
            </div>
          </div>
          
          <!-- View Mode: Modal -->
          <div v-else class="modal modal-xl max-h-[90vh] overflow-hidden flex flex-col">
            <div class="modal-header flex items-center justify-between">
              <h3 class="text-lg font-semibold text-secondary-900">{{ viewingStatement.title }}</h3>
              <button @click="viewingStatement = null" class="btn btn-ghost btn-sm">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div class="modal-body flex-1 overflow-y-auto">
              <!-- Version Selector -->
              <div v-if="viewingStatement.versions && viewingStatement.versions.length > 0" class="mb-6">
                <div class="flex flex-col sm:flex-row gap-4">
                  <div class="flex-shrink-0">
                    <label class="label">Version</label>
                    <select v-model="selectedVersion" @change="loadVersion" class="select">
                      <option v-for="version in viewingStatement.versions" :key="version.id" :value="version.id">
                        {{ getVersionDisplayName(version) }}
                      </option>
                    </select>
                  </div>
                  
                  <!-- Version Name Editor -->
                  <div class="flex-1" v-if="selectedVersionData">
                    <label class="label">Version Name</label>
                    <div v-if="!editingVersionName" 
                      @click="startVersionNameEdit"
                      class="p-3 rounded-lg border border-secondary-200 cursor-pointer hover:border-secondary-300 hover:bg-secondary-50 transition-all group"
                    >
                      <div class="flex items-center justify-between">
                        <span class="text-secondary-700">{{ selectedVersionData.version_name || 'Untitled Version' }}</span>
                        <svg class="w-4 h-4 text-secondary-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </div>
                      <p class="text-xs text-secondary-400 mt-1">Created {{ formatDate(selectedVersionData.created_at) }}</p>
                    </div>
                    <div v-else class="flex items-center gap-2">
                      <input
                        ref="versionNameInput"
                        v-model="newVersionName"
                        @keyup.enter="saveVersionName"
                        @keyup.escape="cancelVersionNameEdit"
                        @blur="saveVersionName"
                        class="input"
                        placeholder="Enter version name..."
                      />
                      <button @click="saveVersionName" class="btn btn-ghost btn-sm text-primary-600">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <button @click="cancelVersionNameEdit" class="btn btn-ghost btn-sm text-secondary-500">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex gap-3 mb-6">
                <button @click="editStatement(viewingStatement.id)" class="btn btn-primary">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Edit
                </button>
                <button 
                  @click="downloadVersion"
                  :disabled="!selectedVersion || !hasSelectedVersion"
                  class="btn btn-secondary"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download
                </button>
              </div>

              <!-- Content Preview -->
              <div class="bg-secondary-50 rounded-xl p-6 border border-secondary-200">
                <div 
                  v-if="isHTMLContent(currentVersionContent)" 
                  v-html="currentVersionContent"
                  class="prose max-w-none"
                ></div>
                <div v-else class="font-mono text-sm whitespace-pre-wrap text-secondary-700">
                  {{ currentVersionContent }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Save Version Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showSaveModal" class="modal-overlay" @click.self="!saving && (showSaveModal = false)">
          <div class="modal">
            <div class="modal-header">
              <h3 class="text-lg font-semibold text-secondary-900">Save Changes</h3>
            </div>
            <div class="modal-body">
              <p class="text-secondary-600 mb-6">How would you like to save your changes?</p>
              <div class="space-y-3">
                <button 
                  @click="saveAsNewVersion(viewingStatement.id)"
                  :disabled="saving"
                  class="w-full p-4 rounded-xl border-2 border-primary-200 bg-primary-50 hover:bg-primary-100 text-left transition-colors disabled:opacity-50"
                >
                  <div class="flex items-start gap-3">
                    <div class="w-10 h-10 rounded-lg bg-primary-500 flex items-center justify-center text-white flex-shrink-0">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <div>
                      <div class="font-semibold text-secondary-900">Save as New Version</div>
                      <div class="text-sm text-secondary-500 mt-1">Creates a new version and preserves all previous versions</div>
                    </div>
                  </div>
                </button>
                <button 
                  @click="replaceCurrentVersion(viewingStatement.id)"
                  :disabled="saving"
                  class="w-full p-4 rounded-xl border-2 border-secondary-200 hover:bg-secondary-50 text-left transition-colors disabled:opacity-50"
                >
                  <div class="flex items-start gap-3">
                    <div class="w-10 h-10 rounded-lg bg-secondary-500 flex items-center justify-center text-white flex-shrink-0">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </div>
                    <div>
                      <div class="font-semibold text-secondary-900">Replace Current Version</div>
                      <div class="text-sm text-secondary-500 mt-1">Overwrites the currently selected version</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
            <div class="modal-footer">
              <button @click="showSaveModal = false" :disabled="saving" class="btn btn-secondary">
                Cancel
              </button>
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
            <div class="modal-header border-b-red-100">
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
                This will permanently delete the statement and <strong>all {{ statementToDelete?.versions?.length || 0 }} version(s)</strong>. This action cannot be undone.
              </p>
            </div>
            <div class="modal-footer">
              <button @click="showDeleteModal = false" :disabled="deleting" class="btn btn-secondary">
                Cancel
              </button>
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
import { ref, computed, onMounted, nextTick } from 'vue'
import { useCapStatementStore } from '../stores/capStatementStore'
import InlineDocumentEditor from '../components/InlineDocumentEditor.vue'
import dataService from '../services/dataService'

const capStore = useCapStatementStore()
const viewingStatement = ref(null)
const selectedVersion = ref(null)
const statementEditorRef = ref(null)
const saving = ref(false)
const showSaveModal = ref(false)
const showDeleteModal = ref(false)
const statementToDelete = ref(null)
const deleting = ref(false)
const editingStatusId = ref(null)
const editingStatusValue = ref(null)
const statusSelectRef = ref(null)
const editingVersionName = ref(false)
const newVersionName = ref('')
const versionNameInput = ref(null)

const currentVersionContent = computed(() => {
  if (!viewingStatement.value) return ''
  if (viewingStatement.value.display_content) {
    return viewingStatement.value.display_content
  }
  if (selectedVersion.value) {
    const version = viewingStatement.value.versions?.find(v => v.id === selectedVersion.value)
    return version?.content || ''
  }
  return viewingStatement.value.latest_version?.content || ''
})

const hasSelectedVersion = computed(() => {
  if (!viewingStatement.value || !selectedVersion.value) return false
  return viewingStatement.value.versions?.some(v => v.id === selectedVersion.value) || false
})

const selectedVersionData = computed(() => {
  if (!viewingStatement.value || !selectedVersion.value) return null
  return viewingStatement.value.versions?.find(v => v.id === selectedVersion.value) || null
})

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

async function viewStatement(id, preserveSelectedVersion = false) {
  try {
    await capStore.fetchStatementById(id)
    viewingStatement.value = capStore.currentStatement
    if (!preserveSelectedVersion && viewingStatement.value.latest_version) {
      selectedVersion.value = viewingStatement.value.latest_version.id
    }
    capStore.isEditing = false
  } catch (error) {
    alert('Error loading statement: ' + error.message)
  }
}

async function editStatement(id) {
  if (!viewingStatement.value) {
    await viewStatement(id)
  }
  capStore.startEditing()
  
  await nextTick()
  if (statementEditorRef.value && viewingStatement.value) {
    let content = ''
    
    if (selectedVersion.value) {
      const version = viewingStatement.value.versions?.find(v => v.id === selectedVersion.value)
      if (version) {
        content = version.content || ''
      }
    }
    
    if (!content) {
      content = viewingStatement.value.display_content || 
                viewingStatement.value.edited_content || 
                viewingStatement.value.generated_content || ''
    }
    
    const documentData = {
      pages: [{
        id: 'page-1',
        content: content
      }]
    }
    
    statementEditorRef.value.loadDocument(documentData)
  }
}

function cancelEdits() {
  capStore.cancelEditing()
  if (viewingStatement.value) {
    viewStatement(viewingStatement.value.id)
  }
}

function confirmDelete(statement) {
  statementToDelete.value = statement
  showDeleteModal.value = true
}

function getVersionDisplayName(version) {
  if (version.version_name) {
    return `${version.version_name} (v${version.version_number})`
  }
  return `Version ${version.version_number} (${formatDate(version.created_at)})`
}

function startVersionNameEdit() {
  if (!selectedVersionData.value) return
  newVersionName.value = selectedVersionData.value.version_name || ''
  editingVersionName.value = true
  nextTick(() => {
    if (versionNameInput.value) {
      versionNameInput.value.focus()
      versionNameInput.value.select()
    }
  })
}

function cancelVersionNameEdit() {
  editingVersionName.value = false
  newVersionName.value = ''
}

async function saveVersionName() {
  if (!selectedVersionData.value || !viewingStatement.value) {
    cancelVersionNameEdit()
    return
  }
  
  const trimmedName = newVersionName.value.trim()
  
  if (trimmedName === (selectedVersionData.value.version_name || '')) {
    cancelVersionNameEdit()
    return
  }
  
  try {
    await dataService.renameVersion(
      viewingStatement.value.id,
      selectedVersionData.value.id,
      trimmedName || null
    )
    
    const versionIndex = viewingStatement.value.versions.findIndex(v => v.id === selectedVersionData.value.id)
    if (versionIndex !== -1) {
      viewingStatement.value.versions[versionIndex].version_name = trimmedName || null
    }
    
    editingVersionName.value = false
    newVersionName.value = ''
    
  } catch (error) {
    console.error('Error renaming version:', error)
    alert('Error renaming version: ' + (error.response?.data?.error?.message || error.message))
  }
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
    console.error('Error deleting statement:', error)
    alert('Error deleting statement: ' + (error.response?.data?.error?.message || error.message))
  } finally {
    deleting.value = false
  }
}

function getEditorContent() {
  if (!statementEditorRef.value) {
    return null
  }
  
  const documentData = statementEditorRef.value.getDocumentData()
  
  let htmlContent = ''
  if (documentData.pages && documentData.pages.length > 0) {
    htmlContent = documentData.pages.map(page => page.content || '').join('')
  }
  
  return htmlContent
}

async function saveAsNewVersion(id) {
  if (!statementEditorRef.value) {
    alert('Editor not initialized')
    showSaveModal.value = false
    return
  }
  
  saving.value = true
  try {
    const htmlContent = getEditorContent()
    
    if (htmlContent === null) {
      alert('Failed to get editor content')
      showSaveModal.value = false
      return
    }
    
    const response = await dataService.createVersion(id, htmlContent)
    
    if (response.success) {
      showSaveModal.value = false
      capStore.cancelEditing()
      await viewStatement(id)
    } else {
      throw new Error(response.error?.message || 'Failed to create new version')
    }
  } catch (error) {
    alert('Error saving edits: ' + error.message)
    showSaveModal.value = false
  } finally {
    saving.value = false
  }
}

async function replaceCurrentVersion(id) {
  if (!statementEditorRef.value) {
    alert('Editor not initialized')
    showSaveModal.value = false
    return
  }
  
  if (!selectedVersion.value) {
    alert('No version selected')
    showSaveModal.value = false
    return
  }
  
  saving.value = true
  try {
    const htmlContent = getEditorContent()
    
    if (htmlContent === null) {
      alert('Failed to get editor content')
      showSaveModal.value = false
      return
    }
    
    const response = await dataService.updateVersion(id, selectedVersion.value, htmlContent)
    
    if (response.success) {
      showSaveModal.value = false
      capStore.cancelEditing()
      await viewStatement(id)
    } else {
      throw new Error(response.error?.message || 'Failed to update version')
    }
  } catch (error) {
    alert('Error saving edits: ' + error.message)
    showSaveModal.value = false
  } finally {
    saving.value = false
  }
}

async function loadVersion() {
  if (capStore.isEditing) {
    capStore.cancelEditing()
  }
  if (viewingStatement.value) {
    await viewStatement(viewingStatement.value.id, true)
  }
}

function startStatusEdit(statementId, currentStatus) {
  editingStatusId.value = statementId
  editingStatusValue.value = currentStatus || 'In Progress'
  nextTick(() => {
    if (statusSelectRef.value) {
      statusSelectRef.value.focus()
    }
  })
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
  
  if (statement) {
    statement.status = editingStatusValue.value
  }
  
  try {
    const response = await dataService.updateStatement(statementId, {
      status: editingStatusValue.value
    })
    
    if (response.success) {
      await capStore.fetchStatements()
    } else {
      if (statement) {
        statement.status = originalStatus
      }
      alert('Failed to update status')
    }
  } catch (error) {
    if (statement) {
      statement.status = originalStatus
    }
    alert('Error updating status: ' + error.message)
  } finally {
    editingStatusId.value = null
    editingStatusValue.value = null
  }
}

async function downloadVersion() {
  let content = ''
  let version = selectedVersionData.value
  
  if (capStore.isEditing && statementEditorRef.value) {
    const editorContent = getEditorContent()
    if (editorContent) content = editorContent
  }
  if (!content && version?.content) content = version.content
  if (!content && viewingStatement.value?.display_content) content = viewingStatement.value.display_content
  if (!content && viewingStatement.value?.edited_content) content = viewingStatement.value.edited_content
  if (!content && viewingStatement.value?.generated_content) content = viewingStatement.value.generated_content
  
  if (!content) {
    alert('No content available to download.')
    return
  }
  
  const versionNumber = version?.version_number || viewingStatement.value?.latest_version?.version_number || 'draft'
  const filename = `${viewingStatement.value?.title || 'capability-statement'}_v${versionNumber}.pdf`
  
  const printWindow = window.open('', '_blank', 'width=816,height=1056')
  
  if (!printWindow) {
    alert('Please allow pop-ups to download PDF')
    return
  }
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${filename}</title>
      <style>
        @page { size: letter; margin: 0.75in; }
        @media print {
          body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
        * { box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 11pt; line-height: 1.5; color: #1a1d21;
          margin: 0; padding: 0; background: white;
        }
        p { margin: 0 0 11pt 0; }
        h1 { font-size: 20pt; margin: 20pt 0 6pt; font-weight: 400; }
        h2 { font-size: 16pt; margin: 18pt 0 6pt; font-weight: 400; }
        h3 { font-size: 14pt; margin: 16pt 0 4pt; font-weight: 600; }
        img { max-width: 100%; height: auto; display: block; margin: 11pt 0; }
        table { border-collapse: collapse !important; border: 2px solid #000 !important; margin: 11pt 0 !important; width: auto !important; }
        td, th { border: 1px solid #000 !important; padding: 8px 12px !important; vertical-align: top !important; }
        th { background-color: #f3f4f6 !important; font-weight: 600 !important; }
        table p { margin: 0 !important; }
        strong, b { font-weight: bold; }
        em, i { font-style: italic; }
        ul, ol { margin: 11pt 0; padding-left: 1.5em; }
        li { margin: 4pt 0; }
      </style>
    </head>
    <body>${content}</body>
    </html>
  `)
  
  printWindow.document.close()
  
  setTimeout(() => {
    printWindow.print()
  }, 500)
}

function isHTMLContent(content) {
  if (!content || typeof content !== 'string') return false
  return /<[a-z][\s\S]*>/i.test(content)
}

onMounted(async () => {
  await capStore.fetchStatements()
})
</script>

<style scoped>
/* Modal transitions */
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

/* Prose content styling */
:deep(.prose table) {
  border-collapse: collapse !important;
  border: 2px solid #000 !important;
  margin: 1em 0 !important;
}

:deep(.prose td),
:deep(.prose th) {
  border: 1px solid #000 !important;
  padding: 8px 12px !important;
}

:deep(.prose th) {
  background-color: #f3f4f6 !important;
  font-weight: 600 !important;
}

:deep(.prose img) {
  max-width: 100%;
  height: auto;
  margin: 1em 0;
}
</style>
