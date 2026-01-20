<template>
  <div>
    <h1 class="text-3xl font-bold mb-6">Capability Statement Library</h1>
    
    <div v-if="capStore.error" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
      {{ capStore.error }}
    </div>

    <div class="card">
      <div v-if="capStore.loading" class="text-center py-8">Loading...</div>
      <div v-else>
        <table class="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Created</th>
              <th>Version</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="statement in capStore.statements" :key="statement.id">
              <td>{{ statement.title }}</td>
              <td>
                <!-- Inline Status Editor -->
                <div v-if="editingStatusId === statement.id" class="inline-status-editor">
                  <select 
                    v-model="editingStatusValue" 
                    @change="saveStatus(statement.id)"
                    @blur="cancelStatusEdit"
                    class="status-select"
                    :class="getStatusColorClass(editingStatusValue)"
                    ref="statusSelectRef"
                    autofocus
                  >
                    <option value="In Progress">In Progress</option>
                    <option value="Closed Won">Closed Won</option>
                    <option value="Closed Lost">Closed Lost</option>
                  </select>
                </div>
                <span 
                  v-else
                  @click="startStatusEdit(statement.id, statement.status)"
                  :class="[
                    'px-2 py-1 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity',
                    getStatusColorClass(statement.status)
                  ]"
                >
                  {{ statement.status || 'In Progress' }}
                </span>
              </td>
              <td>{{ formatDate(statement.created_at) }}</td>
              <td>{{ statement.latest_version?.version_number || '-' }}</td>
              <td class="space-x-2">
                <button @click="viewStatement(statement.id)" class="text-primary-600 hover:text-primary-800 text-sm">
                  View
                </button>
                <button 
                  @click="confirmDelete(statement)" 
                  class="text-red-600 hover:text-red-800 text-sm"
                >
                  Delete
                </button>
              </td>
            </tr>
            <tr v-if="capStore.statements.length === 0">
              <td colspan="5" class="text-center py-8 text-gray-500">
                No capability statements found. Create your first one!
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- View/Edit Modal -->
    <div v-if="viewingStatement" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <!-- Edit Mode: Full-screen editor like Templates Management -->
      <div v-if="capStore.isEditing" class="bg-white w-full h-full flex flex-col">
        <div class="flex justify-between items-center p-4 border-b border-gray-200 flex-shrink-0">
          <h3 class="text-xl font-semibold">{{ viewingStatement.title }}</h3>
          <div class="flex items-center gap-3">
            <button 
              @click="downloadVersion"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium transition-colors flex items-center gap-2"
              title="Download as PDF"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Download PDF
            </button>
            <button 
              @click="showSaveModal = true" 
              :disabled="capStore.loading || saving"
              class="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium transition-colors flex items-center gap-2"
              title="Save edits"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              {{ saving ? 'Saving...' : 'Save Edits' }}
            </button>
            <button 
              @click="cancelEdits" 
              class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button @click="cancelEdits" class="text-gray-500 hover:text-gray-700 text-2xl font-light">✕</button>
          </div>
        </div>
        <div class="flex-1 overflow-hidden">
          <InlineDocumentEditor 
            ref="statementEditorRef"
            :statement-id="viewingStatement?.id"
          />
        </div>
      </div>
      
      <!-- View Mode: Regular modal -->
      <div v-else class="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-semibold">{{ viewingStatement.title }}</h3>
          <button @click="viewingStatement = null" class="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        
        <div v-if="viewingStatement.versions && viewingStatement.versions.length > 0" class="mb-4">
          <div class="flex items-center gap-4">
            <!-- Version Selector -->
            <div class="flex-shrink-0">
              <label class="block text-sm font-medium mb-1">Version</label>
              <select v-model="selectedVersion" @change="loadVersion" class="input">
                <option v-for="version in viewingStatement.versions" :key="version.id" :value="version.id">
                  {{ getVersionDisplayName(version) }}
                </option>
              </select>
            </div>
            
            <!-- Version Name Editor (Google Docs style) -->
            <div class="flex-1" v-if="selectedVersionData">
              <label class="block text-sm font-medium mb-1">Version Name</label>
              <div class="relative">
                <!-- Display mode - click to edit -->
                <div 
                  v-if="!editingVersionName"
                  @click="startVersionNameEdit"
                  class="px-3 py-2 border border-transparent rounded-md cursor-pointer hover:border-gray-300 hover:bg-gray-50 transition-all group flex items-center gap-2"
                  title="Click to rename version"
                >
                  <span class="text-gray-700">
                    {{ selectedVersionData.version_name || 'Untitled Version' }}
                  </span>
                  <svg class="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                  </svg>
                </div>
                
                <!-- Edit mode - inline input -->
                <div v-else class="flex items-center gap-2">
                  <input
                    ref="versionNameInput"
                    v-model="newVersionName"
                    @keyup.enter="saveVersionName"
                    @keyup.escape="cancelVersionNameEdit"
                    @blur="saveVersionName"
                    class="px-3 py-2 border border-teal-500 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 flex-1"
                    placeholder="Enter version name..."
                  />
                  <button 
                    @click="saveVersionName"
                    class="p-2 text-teal-600 hover:text-teal-800"
                    title="Save"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </button>
                  <button 
                    @click="cancelVersionNameEdit"
                    class="p-2 text-gray-500 hover:text-gray-700"
                    title="Cancel"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
              </div>
              <p class="text-xs text-gray-500 mt-1">Created {{ formatDate(selectedVersionData.created_at) }}</p>
            </div>
          </div>
        </div>

        <div class="mb-4 flex gap-2">
          <button 
            @click="editStatement(viewingStatement.id)" 
            class="btn btn-primary"
          >
            Edit
          </button>
          <button 
            @click="downloadVersion"
            :disabled="!selectedVersion || !hasSelectedVersion"
            class="btn btn-secondary"
            title="Download selected version as PDF"
          >
            Download Version
          </button>
        </div>

        <!-- View Mode Content -->
        <div class="bg-gray-50 p-6 rounded-lg">
          <!-- Render as HTML if content appears to be HTML, otherwise as plain text -->
          <div 
            v-if="isHTMLContent(currentVersionContent)" 
            v-html="currentVersionContent"
            class="prose max-w-none"
            style="font-family: 'Times New Roman', serif; line-height: 1.6;"
          ></div>
          <div 
            v-else
            class="font-mono text-sm whitespace-pre-wrap"
          >{{ currentVersionContent }}</div>
        </div>
      </div>
    </div>

    <!-- Save Version Modal -->
    <div v-if="showSaveModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 class="text-xl font-semibold mb-4">Save Changes</h3>
        <p class="text-gray-600 mb-6">How would you like to save your changes?</p>
        <div class="space-y-3">
          <button 
            @click="saveAsNewVersion(viewingStatement.id)"
            :disabled="saving"
            class="w-full px-4 py-3 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium transition-colors text-left"
          >
            <div class="font-semibold">Save as New Version</div>
            <div class="text-xs text-teal-100 mt-1">Creates a new version entry and preserves all previous versions</div>
          </button>
          <button 
            @click="replaceCurrentVersion(viewingStatement.id)"
            :disabled="saving"
            class="w-full px-4 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium transition-colors text-left"
          >
            <div class="font-semibold">Replace Current Version</div>
            <div class="text-xs text-gray-300 mt-1">Overwrites the currently selected version (does not create a new version)</div>
          </button>
        </div>
        <div class="mt-6 flex justify-end">
          <button 
            @click="showSaveModal = false"
            class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm font-medium transition-colors"
            :disabled="saving"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 class="text-xl font-semibold mb-4 text-red-600">Delete Capability Statement</h3>
        <p class="text-gray-700 mb-2">
          Are you sure you want to delete "<strong>{{ statementToDelete?.title }}</strong>"?
        </p>
        <p class="text-gray-600 text-sm mb-4">
          This will permanently delete the capability statement and <strong>ALL {{ statementToDelete?.versions?.length || 0 }} version(s)</strong> associated with it. This action cannot be undone.
        </p>
        <div class="flex justify-end gap-3">
          <button 
            @click="showDeleteModal = false"
            class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm font-medium transition-colors"
            :disabled="deleting"
          >
            Cancel
          </button>
          <button 
            @click="deleteStatement"
            :disabled="deleting"
            class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 text-sm font-medium transition-colors"
          >
            {{ deleting ? 'Deleting...' : 'Delete Permanently' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useCapStatementStore } from '../stores/capStatementStore'
import InlineDocumentEditor from '../components/InlineDocumentEditor.vue'
import dataService from '../services/dataService'
// Using browser print for PDF export instead of html2pdf

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
  // Otherwise show display_content (edited if exists, else generated)
  if (viewingStatement.value.display_content) {
    return viewingStatement.value.display_content
  }
  // Fallback to version content
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
  return new Date(dateString).toLocaleDateString()
}

async function viewStatement(id, preserveSelectedVersion = false) {
  try {
    await capStore.fetchStatementById(id)
    viewingStatement.value = capStore.currentStatement
    // Only auto-select latest version if we're not preserving the current selection
    if (!preserveSelectedVersion && viewingStatement.value.latest_version) {
      selectedVersion.value = viewingStatement.value.latest_version.id
    }
    // Reset editing state when viewing
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
  
  // Load content into editor after editing mode is activated
  await nextTick()
  if (statementEditorRef.value && viewingStatement.value) {
    // Get content from selected version, or fall back to display_content
    let content = ''
    
    if (selectedVersion.value) {
      // Load the selected version's content
      const version = viewingStatement.value.versions?.find(v => v.id === selectedVersion.value)
      if (version) {
        content = version.content || ''
      }
    }
    
    // Fallback to display_content if no version selected or version has no content
    if (!content) {
      content = viewingStatement.value.display_content || 
                viewingStatement.value.edited_content || 
                viewingStatement.value.generated_content || ''
    }
    
    // Convert HTML content to document structure
    // InlineDocumentEditor expects: { pages: [{ id: 'page-1', content: '<html>...</html>' }] }
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
  // Reload statement to revert
  if (viewingStatement.value) {
    viewStatement(viewingStatement.value.id)
  }
}

function confirmDelete(statement) {
  statementToDelete.value = statement
  showDeleteModal.value = true
}

// Version name helpers
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
  // Focus the input after Vue updates the DOM
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
  
  // Don't save if name hasn't changed
  if (trimmedName === (selectedVersionData.value.version_name || '')) {
    cancelVersionNameEdit()
    return
  }
  
  try {
    // Call API to rename version
    await dataService.renameVersion(
      viewingStatement.value.id,
      selectedVersionData.value.id,
      trimmedName || null // Send null if empty to clear the name
    )
    
    // Update local data
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
    
    // Close modal
    showDeleteModal.value = false
    statementToDelete.value = null
    
    // Close view modal if viewing the deleted statement
    if (viewingStatement.value?.id === statementToDelete.value?.id) {
      viewingStatement.value = null
    }
    
    // Refresh the list
    await capStore.fetchStatements()
    
    alert('Capability statement and all its versions have been deleted successfully.')
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
  
  // Get document data from editor
  const documentData = statementEditorRef.value.getDocumentData()
  
  // Extract HTML content from pages
  // For capability statements, we save as a single HTML string
  // Combine all pages' content into one HTML string
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
    
    // Call API to create new version
    const response = await dataService.createVersion(id, htmlContent)
    
    if (response.success) {
      // Close modal
      showSaveModal.value = false
      // Exit editing mode
      capStore.cancelEditing()
      // Reload statement to show new version
      await viewStatement(id)
      alert('New version created successfully')
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
    
    // Call API to update existing version
    const response = await dataService.updateVersion(id, selectedVersion.value, htmlContent)
    
    if (response.success) {
      // Close modal
      showSaveModal.value = false
      // Exit editing mode
      capStore.cancelEditing()
      // Reload statement to show updated version
      await viewStatement(id)
      alert('Version updated successfully')
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
  // Version content is loaded via computed property
  // Reset editing when changing versions
  if (capStore.isEditing) {
    capStore.cancelEditing()
  }
  // Force reload of statement to update version data, but preserve selected version
  if (viewingStatement.value) {
    await viewStatement(viewingStatement.value.id, true)
  }
}

function getStatusColorClass(status) {
  if (!status) return 'bg-orange-100 text-orange-800'
  if (status === 'Closed Won') return 'bg-green-100 text-green-800'
  if (status === 'Closed Lost') return 'bg-red-100 text-red-800'
  if (status === 'In Progress') return 'bg-orange-100 text-orange-800'
  return 'bg-gray-100 text-gray-800'
}

function startStatusEdit(statementId, currentStatus) {
  editingStatusId.value = statementId
  editingStatusValue.value = currentStatus || 'In Progress'
  // Focus the select after it renders
  nextTick(() => {
    if (statusSelectRef.value) {
      statusSelectRef.value.focus()
    }
  })
}

function cancelStatusEdit() {
  // Small delay to allow change event to fire first
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
  
  // Optimistic update
  const statement = capStore.statements.find(s => s.id === statementId)
  const originalStatus = statement?.status
  
  if (statement) {
    statement.status = editingStatusValue.value
  }
  
  try {
    // Persist to backend
    const response = await dataService.updateStatement(statementId, {
      status: editingStatusValue.value
    })
    
    if (response.success) {
      // Update store with fresh data
      await capStore.fetchStatements()
    } else {
      // Revert on failure
      if (statement) {
        statement.status = originalStatus
      }
      alert('Failed to update status')
    }
  } catch (error) {
    // Revert on error
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
  // Get content for PDF
  let content = ''
  let version = selectedVersionData.value
  
  // Try to get content from multiple sources
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
  
  console.log('Content for PDF:', content.substring(0, 200))
  
  // Get version number for filename
  const versionNumber = version?.version_number || viewingStatement.value?.latest_version?.version_number || 'draft'
  const filename = `${viewingStatement.value?.title || 'capability-statement'}_v${versionNumber}.pdf`
  
  // Open new window for print-to-PDF
  const printWindow = window.open('', '_blank', 'width=816,height=1056')
  
  if (!printWindow) {
    alert('Please allow pop-ups to download PDF')
    return
  }
  
  // Write HTML to print window
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${filename}</title>
      <style>
        @page {
          size: A4;
          margin: 20mm;
        }
        @media print {
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
        body {
          font-family: 'Times New Roman', Georgia, serif;
          font-size: 12pt;
          line-height: 1.6;
          color: #000;
          margin: 0;
          padding: 20px;
          background: white;
        }
        p {
          margin: 0.8em 0;
        }
        h1 { font-size: 24pt; margin: 0.5em 0; }
        h2 { font-size: 18pt; margin: 0.5em 0; }
        h3 { font-size: 14pt; margin: 0.5em 0; }
        h4 { font-size: 12pt; margin: 0.5em 0; }
        img, .editor-image {
          max-width: 100%;
          height: auto;
          margin: 1em 0;
        }
        table, .editor-table {
          width: 100%;
          border-collapse: collapse;
          margin: 1em 0;
        }
        table td, table th,
        .editor-table td, .editor-table th {
          border: 1px solid #000;
          padding: 8px;
          text-align: left;
        }
        table th, .editor-table th {
          background-color: #f5f5f5;
          font-weight: bold;
        }
        strong, b { font-weight: bold; }
        em, i { font-style: italic; }
        u { text-decoration: underline; }
        ul, ol { margin: 0.5em 0; padding-left: 1.5em; }
        li { margin: 0.3em 0; }
        blockquote {
          border-left: 3px solid #ccc;
          margin: 1em 0;
          padding-left: 1em;
          font-style: italic;
        }
      </style>
    </head>
    <body>
      ${content}
    </body>
    </html>
  `)
  
  printWindow.document.close()
  
  // Wait for content to load
  await new Promise(resolve => {
    printWindow.onload = resolve
    setTimeout(resolve, 1000) // Fallback timeout
  })
  
  // Wait for images
  const images = printWindow.document.querySelectorAll('img')
  if (images.length > 0) {
    await Promise.race([
      Promise.all(Array.from(images).map(img => 
        new Promise(resolve => {
          if (img.complete) resolve()
          else {
            img.onload = resolve
            img.onerror = resolve
          }
        })
      )),
      new Promise(resolve => setTimeout(resolve, 3000))
    ])
  }
  
  // Small delay then print
  setTimeout(() => {
    printWindow.print()
    // Don't close immediately - let user save as PDF
  }, 500)
}

function isHTMLContent(content) {
  if (!content || typeof content !== 'string') return false
  // Check if content contains HTML tags
  const htmlTagPattern = /<[a-z][\s\S]*>/i
  return htmlTagPattern.test(content)
}

onMounted(async () => {
  await capStore.fetchStatements()
})
</script>

<style scoped>
.editor-container {
  min-height: 600px;
}

.inline-status-editor {
  display: inline-block;
}

.status-select {
  @apply px-2 py-1 rounded-full text-xs font-medium outline-none border-none cursor-pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
  background-position: right 0.25rem center;
  background-repeat: no-repeat;
  background-size: 1rem;
  padding-right: 1.75rem;
}

.status-select:focus {
  @apply ring-2 ring-teal-500 ring-offset-1;
}
</style>