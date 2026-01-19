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
              <td>
                <button @click="viewStatement(statement.id)" class="text-primary-600 hover:text-primary-800 text-sm">
                  View
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
          <label class="block text-sm font-medium mb-1">Version</label>
          <select v-model="selectedVersion" @change="loadVersion" class="input">
            <option v-for="version in viewingStatement.versions" :key="version.id" :value="version.id">
              Version {{ version.version_number }} ({{ formatDate(version.created_at) }})
            </option>
          </select>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useCapStatementStore } from '../stores/capStatementStore'
import InlineDocumentEditor from '../components/InlineDocumentEditor.vue'
import dataService from '../services/dataService'
import html2pdf from 'html2pdf.js'

const capStore = useCapStatementStore()
const viewingStatement = ref(null)
const selectedVersion = ref(null)
const statementEditorRef = ref(null)
const saving = ref(false)
const showSaveModal = ref(false)
const editingStatusId = ref(null)
const editingStatusValue = ref(null)
const statusSelectRef = ref(null)

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
  // Version Selection - Ensure version is selected
  if (!selectedVersion.value || !viewingStatement.value || !selectedVersionData.value) {
    alert('Please select a version to download')
    return
  }
  
  // PDF Generation - Generate PDF from selected version content
  try {
    const version = selectedVersionData.value
    const content = version.content || ''
    
    if (!content) {
      alert('Selected version has no content to download')
      return
    }
    
    // Step 1: Extract HTML from database (version.content is TipTap HTML)
    // Step 2: Create container matching the preview's exact styles (what user sees in view mode)
    const tempDiv = document.createElement('div')
    tempDiv.style.position = 'absolute'
    tempDiv.style.left = '-9999px'
    tempDiv.style.width = '816px' // A4 width at 96 DPI
    tempDiv.style.padding = '96px' // 1 inch margins
    tempDiv.style.background = 'white'
    tempDiv.style.minHeight = '1123px' // A4 height
    tempDiv.className = 'pdf-export-container'
    
    // Set HTML content (TipTap HTML from database)
    if (isHTMLContent(content)) {
      tempDiv.innerHTML = content
    } else {
      tempDiv.textContent = content
      tempDiv.style.whiteSpace = 'pre-wrap'
    }
    
    // Add CSS stylesheet matching the preview view styles exactly (prose class + inline styles)
    const style = document.createElement('style')
    style.textContent = `
      .pdf-export-container {
        font-family: 'Times New Roman', serif;
        font-size: 14px;
        line-height: 1.6;
        color: #374151;
      }
      .pdf-export-container p {
        margin-top: 1.25em;
        margin-bottom: 1.25em;
      }
      .pdf-export-container p:first-child {
        margin-top: 0;
      }
      .pdf-export-container p:last-child {
        margin-bottom: 0;
      }
      .pdf-export-container h1 {
        font-size: 2.25em;
        margin-top: 0;
        margin-bottom: 0.8888889em;
        font-weight: 800;
        line-height: 1.1111111;
      }
      .pdf-export-container h2 {
        font-size: 1.5em;
        margin-top: 2em;
        margin-bottom: 1em;
        font-weight: 700;
        line-height: 1.3333333;
      }
      .pdf-export-container h3 {
        font-size: 1.25em;
        margin-top: 1.6em;
        margin-bottom: 0.6em;
        font-weight: 600;
        line-height: 1.6;
      }
      .pdf-export-container h4 {
        font-size: 1.125em;
        margin-top: 1.5555556em;
        margin-bottom: 0.4444444em;
        font-weight: 600;
        line-height: 1.5555556;
      }
      .pdf-export-container ul,
      .pdf-export-container ol {
        margin-top: 1.25em;
        margin-bottom: 1.25em;
        padding-left: 1.625em;
      }
      .pdf-export-container li {
        margin-top: 0.5em;
        margin-bottom: 0.5em;
      }
      .pdf-export-container img,
      .pdf-export-container .editor-image {
        max-width: 100%;
        height: auto;
        margin-top: 2em;
        margin-bottom: 2em;
      }
      .pdf-export-container table,
      .pdf-export-container .editor-table {
        width: 100%;
        table-layout: auto;
        text-align: left;
        margin-top: 2em;
        margin-bottom: 2em;
        font-size: 0.875em;
        line-height: 1.7142857;
        border-collapse: collapse;
      }
      .pdf-export-container table thead,
      .pdf-export-container .editor-table thead {
        border-bottom-width: 1px;
        border-bottom-color: rgb(229 231 235);
      }
      .pdf-export-container table thead th,
      .pdf-export-container .editor-table thead th {
        color: rgb(17 24 39);
        font-weight: 600;
        vertical-align: bottom;
        padding-right: 0.5714286em;
        padding-bottom: 0.5714286em;
        padding-left: 0.5714286em;
      }
      .pdf-export-container table tbody tr,
      .pdf-export-container .editor-table tbody tr {
        border-bottom-width: 1px;
        border-bottom-color: rgb(229 231 235);
      }
      .pdf-export-container table tbody td,
      .pdf-export-container .editor-table tbody td,
      .pdf-export-container table td,
      .pdf-export-container .editor-table td {
        vertical-align: baseline;
        padding-top: 0.5714286em;
        padding-right: 0.5714286em;
        padding-bottom: 0.5714286em;
        padding-left: 0.5714286em;
      }
      .pdf-export-container blockquote {
        font-weight: 500;
        font-style: italic;
        color: rgb(17 24 39);
        border-left-width: 0.25rem;
        border-left-color: rgb(229 231 235);
        quotes: "\\201C" "\\201D" "\\2018" "\\2019";
        margin-top: 1.6em;
        margin-bottom: 1.6em;
        padding-left: 1em;
      }
      .pdf-export-container code {
        color: rgb(17 24 39);
        font-weight: 600;
        font-size: 0.875em;
      }
      .pdf-export-container pre {
        color: rgb(229 231 235);
        background-color: rgb(17 24 39);
        overflow-x: auto;
        font-weight: 400;
        font-size: 0.875em;
        line-height: 1.7142857;
        margin-top: 1.7142857em;
        margin-bottom: 1.7142857em;
        border-radius: 0.375rem;
        padding-top: 0.8571429em;
        padding-right: 1.1428571em;
        padding-bottom: 0.8571429em;
        padding-left: 1.1428571em;
      }
      .pdf-export-container pre code {
        background-color: transparent;
        border-width: 0;
        border-radius: 0;
        padding: 0;
        font-weight: inherit;
        color: inherit;
        font-size: inherit;
        font-family: inherit;
        line-height: inherit;
      }
      .pdf-export-container pre code::before,
      .pdf-export-container pre code::after {
        content: none;
      }
      .pdf-export-container strong,
      .pdf-export-container b {
        font-weight: 600;
      }
      .pdf-export-container em,
      .pdf-export-container i {
        font-style: italic;
      }
      .pdf-export-container u {
        text-decoration: underline;
      }
    `
    
    // Create wrapper to include style
    const wrapper = document.createElement('div')
    wrapper.appendChild(style)
    wrapper.appendChild(tempDiv)
    document.body.appendChild(wrapper)
    
    // Wait for fonts and images to load
    await document.fonts.ready
    await new Promise(resolve => {
      const images = tempDiv.querySelectorAll('img')
      if (images.length === 0) {
        resolve()
        return
      }
      let loaded = 0
      images.forEach(img => {
        if (img.complete) {
          loaded++
          if (loaded === images.length) resolve()
        } else {
          img.onload = img.onerror = () => {
            loaded++
            if (loaded === images.length) resolve()
          }
        }
      })
    })
    
    // Step 3: Generate PDF from styled HTML
    const opt = {
      margin: 0,
      filename: `${viewingStatement.value.title || 'capability-statement'}_v${version.version_number}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        letterRendering: true,
        logging: false
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }
    
    await html2pdf().set(opt).from(tempDiv).save()
    
    // Cleanup
    document.body.removeChild(wrapper)
  } catch (error) {
    console.error('Error generating PDF:', error)
    alert('Error generating PDF: ' + error.message)
  }
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