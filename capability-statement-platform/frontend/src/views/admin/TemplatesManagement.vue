<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Templates Management</h1>
      <button @click="createNewTemplate" class="btn btn-primary" :disabled="saving">
        {{ saving ? 'Creating...' : '+ Add Template' }}
      </button>
    </div>

    <!-- Search -->
    <div class="card mb-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-1">Search</label>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by name or description..."
            class="input"
          />
        </div>
        <div class="flex items-end">
          <button @click="clearFilters" class="btn btn-secondary w-full">
            Clear Filters
          </button>
        </div>
      </div>
    </div>

    <!-- Templates Table -->
    <div class="card">
      <div v-if="loading" class="text-center py-8">Loading...</div>
      <div v-else>
        <table class="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Content Preview</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="template in filteredTemplates" :key="template.id">
              <tr>
                <td class="font-medium">{{ template.name }}</td>
                <td>{{ template.description || '-' }}</td>
                <td class="max-w-md">
                  <div class="truncate text-xs text-gray-500" v-if="template.type === 'simple'">
                    {{ template.content?.substring(0, 100) }}{{ template.content?.length > 100 ? '...' : '' }}
                  </div>
                  <div v-else class="text-xs text-blue-600 italic">
                    <span class="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium mr-2">
                      Structured
                    </span>
                    {{ template.template_type === 'multipage' ? 'Multi-page template' : 'Structured template' }}
                  </div>
                </td>
                <td>
                  <div class="flex gap-2">
                    <button 
                      v-if="template.type === 'structured'" 
                      @click="togglePreview(template.id)" 
                      class="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      {{ previewingTemplateId === template.id ? 'Hide Preview' : 'Preview' }}
                    </button>
                    <button 
                      v-if="template.type === 'structured'"
                      @click="editTemplateContent(template.id)"
                      class="text-green-600 hover:text-green-800 text-sm"
                    >
                      Edit Content
                    </button>
                    <button 
                      v-if="template.type === 'simple'"
                      @click="editTemplate(template)" 
                      class="text-primary-600 hover:text-primary-800 text-sm"
                    >
                      Edit
                    </button>
                    <button @click="confirmDelete(template)" class="text-red-600 hover:text-red-800 text-sm">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
              <!-- Inline Preview Row for Structured Templates -->
              <tr v-if="template.type === 'structured' && previewingTemplateId === template.id">
                <td colspan="4" class="p-4 bg-gray-50">
                  <div class="border rounded-lg p-4 bg-white">
                    <div class="flex justify-between items-center mb-4">
                      <h4 class="font-semibold text-lg">{{ template.name }} - Preview</h4>
                      <button @click="previewingTemplateId = null" class="text-gray-500 hover:text-gray-700">✕</button>
                    </div>
                    <div class="overflow-x-auto" style="display: flex; justify-content: center; background-color: #f5f5f5; padding: 1rem;">
                      <StructuredTemplateRenderer 
                        :template-id="template.id" 
                        :pages-to-show="[1]" 
                      />
                    </div>
                  </div>
                </td>
              </tr>
            </template>
            <tr v-if="filteredTemplates.length === 0">
              <td colspan="4" class="text-center py-8 text-gray-500">
                No templates found
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showCreateModal || editingTemplate" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <h3 class="text-xl font-semibold mb-4">
          {{ editingTemplate ? 'Edit Template' : 'Add New Template' }}
        </h3>
        
        <form @submit.prevent="saveTemplate" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Name *</label>
            <input v-model="templateForm.name" type="text" required class="input" placeholder="e.g., Standard Corporate Template" />
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">Description</label>
            <input v-model="templateForm.description" type="text" class="input" placeholder="Brief description of the template" />
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">
              Content * 
              <span class="text-xs text-gray-500 font-normal">
                (Use placeholders: <code>&lcub;&lcub;lawyers&rcub;&rcub;</code>, <code>&lcub;&lcub;deals&rcub;&rcub;</code>, <code>&lcub;&lcub;awards&rcub;&rcub;</code>, <code>&lcub;&lcub;date&rcub;&rcub;</code>)
              </span>
            </label>
            <textarea 
              v-model="templateForm.content" 
              rows="15" 
              required 
              class="input font-mono text-sm"
              placeholder="CAPABILITY STATEMENT
===================

&lcub;&lcub;lawyers&rcub;&rcub;

&lcub;&lcub;deals&rcub;&rcub;

&lcub;&lcub;awards&rcub;&rcub;

---
Generated on: &lcub;&lcub;date&rcub;&rcub;"
            ></textarea>
            <div class="mt-2 text-xs text-gray-500">
              <p class="font-semibold mb-1">Available placeholders:</p>
              <ul class="list-disc list-inside space-y-0.5">
                <li><code>&lcub;&lcub;lawyers&rcub;&rcub;</code> - Will be replaced with selected lawyers list</li>
                <li><code>&lcub;&lcub;deals&rcub;&rcub;</code> - Will be replaced with selected deals list</li>
                <li><code>&lcub;&lcub;awards&rcub;&rcub;</code> - Will be replaced with selected awards list</li>
                <li><code>&lcub;&lcub;date&rcub;&rcub;</code> - Will be replaced with current date</li>
              </ul>
            </div>
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

    <!-- Content Editor Modal for Structured Templates - Full-Width Inline Editor (Google Docs style) -->
    <div v-if="editingTemplateDefinitionId" class="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div class="bg-white w-full h-full flex flex-col">
        <div class="flex justify-between items-center p-4 border-b border-gray-200 flex-shrink-0">
          <div class="flex items-center gap-4 flex-1">
            <h3 class="text-xl font-semibold">{{ editingTemplateName || 'Edit Template Content' }}</h3>
            <input 
              v-if="editingTemplateDefinitionId"
              v-model="editingTemplateName"
              @blur="updateTemplateName"
              class="flex-1 max-w-md px-3 py-1 border border-gray-300 rounded text-sm"
              placeholder="Template name..."
            />
          </div>
          <div class="flex items-center gap-3">
            <button 
              @click="handleSaveInlineContent"
              :disabled="savingContent"
              class="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium transition-colors"
            >
              {{ savingContent ? 'Saving...' : 'Confirm' }}
            </button>
            <button 
              @click="editingTemplateDefinitionId = null" 
              class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button @click="editingTemplateDefinitionId = null" class="text-gray-500 hover:text-gray-700 text-2xl font-light">✕</button>
          </div>
        </div>
        <!-- Full-Width Inline Editor -->
        <div class="flex-1 overflow-hidden">
          <InlineDocumentEditor 
            ref="inlineEditorRef"
            :template-id="editingTemplateDefinitionId"
          />
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="templateToDelete" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 class="text-xl font-semibold mb-4">Delete Template</h3>
        <p class="mb-4">
          Are you sure you want to delete <strong>{{ templateToDelete.name }}</strong>?
        </p>
        <p class="text-sm text-red-600 mb-4">
          This action cannot be undone. If this template is used in existing capability statements, those statements will remain but the template reference will be removed.
        </p>
        <div class="flex gap-2 justify-end">
          <button @click="templateToDelete = null" class="btn btn-secondary">
            Cancel
          </button>
          <button @click="deleteTemplate" class="btn btn-danger" :disabled="deleting">
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
import MultiPageTemplate from '../../components/MultiPageTemplate.vue'
import StructuredTemplateRenderer from '../../components/StructuredTemplateRenderer.vue'
import TemplateContentEditor from '../../components/TemplateContentEditor.vue'
import InlineDocumentEditor from '../../components/InlineDocumentEditor.vue'

const templates = ref([]) // Simple text templates
const templateDefinitions = ref([]) // Structured template definitions
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const searchQuery = ref('')
const showCreateModal = ref(false)
const editingTemplate = ref(null)
const templateToDelete = ref(null)
const previewingTemplateId = ref(null)
const editingTemplateDefinitionId = ref(null) // For structured template content editing
const editingTemplateName = ref('') // Current template name being edited
const templateContentKey = ref(0) // Force refresh preview after content save
const templateContentEditorRef = ref(null)
const inlineEditorRef = ref(null)
const savingContent = ref(false)

const templateForm = ref({
  name: '',
  description: '',
  content: ''
})

// Combine both template types for display
const allTemplates = computed(() => {
  const simple = templates.value.map(t => ({ ...t, type: 'simple' }))
  const structured = templateDefinitions.value.map(t => ({ ...t, type: 'structured' }))
  return [...simple, ...structured]
})

const filteredTemplates = computed(() => {
  let filtered = [...allTemplates.value]
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(t => 
      t.name.toLowerCase().includes(query) ||
      (t.description && t.description.toLowerCase().includes(query)) ||
      (t.content && t.content && t.content.toLowerCase().includes(query))
    )
  }
  
  return filtered
})

onMounted(async () => {
  await fetchAllTemplates()
})

async function fetchAllTemplates() {
  loading.value = true
  try {
    // Fetch both simple templates and structured template definitions
    const [simpleResponse, structuredResponse] = await Promise.all([
      dataService.getTemplates().catch(() => ({ data: [] })),
      dataService.getTemplateDefinitions().catch(() => ({ data: [] }))
    ])
    
    templates.value = simpleResponse.data?.data || simpleResponse.data || []
    templateDefinitions.value = structuredResponse.data || []
  } catch (error) {
    console.error('Error fetching templates:', error)
    alert('Error loading templates: ' + (error.response?.data?.error?.message || error.message))
  } finally {
    loading.value = false
  }
}

function clearFilters() {
  searchQuery.value = ''
}

function editTemplate(template) {
  editingTemplate.value = template
  templateForm.value = {
    name: template.name,
    description: template.description || '',
    content: template.content || ''
  }
}

function closeModal() {
  showCreateModal.value = false
  editingTemplate.value = null
  templateForm.value = {
    name: '',
    description: '',
    content: ''
  }
}

async function saveTemplate() {
  saving.value = true
  try {
    if (editingTemplate.value) {
      // Update simple template
      await dataService.updateTemplate(editingTemplate.value.id, templateForm.value)
      alert('Template updated successfully!')
    } else {
      // Create simple template
      await dataService.createTemplate(templateForm.value)
      alert('Template created successfully!')
    }
    closeModal()
    await fetchAllTemplates()
  } catch (error) {
    alert('Error saving template: ' + (error.response?.data?.error?.message || error.message))
  } finally {
    saving.value = false
  }
}

function isStructuredTemplate(template) {
  return template.type === 'structured'
}

function togglePreview(templateId) {
  if (previewingTemplateId.value === templateId) {
    previewingTemplateId.value = null
  } else {
    previewingTemplateId.value = templateId
  }
}

function editTemplateContent(templateDefinitionId) {
  editingTemplateDefinitionId.value = templateDefinitionId
  previewingTemplateId.value = null // Close preview if open
  
  // Load template name for editing
  const template = templateDefinitions.value.find(t => t.id === templateDefinitionId)
  if (template) {
    editingTemplateName.value = template.name
  } else {
    editingTemplateName.value = 'Template'
  }
}

async function createNewTemplate() {
  // Create a new template definition and open the editor (blank canvas)
  try {
    saving.value = true
    
    // Create a new template definition with minimal structure
    const response = await dataService.createTemplateDefinition({
      name: 'New Template',
      description: '',
      template_type: 'multipage',
      total_pages: 1,
      structure: JSON.stringify({
        pages: [{
          id: 'page-1',
          sections: []
        }]
      }),
      styles: null
    })
    
    // Open the editor with the new template ID
    const newTemplateId = response.data.id
    editingTemplateDefinitionId.value = newTemplateId
    editingTemplateName.value = 'New Template'
    showCreateModal.value = false // Close the form modal if it was open
    
    // Refresh templates list to include the new template
    await fetchAllTemplates()
  } catch (error) {
    console.error('Error creating new template:', error)
    alert('Error creating template: ' + (error.response?.data?.error?.message || error.message))
  } finally {
    saving.value = false
  }
}

async function updateTemplateName() {
  if (!editingTemplateDefinitionId.value || !editingTemplateName.value.trim()) return
  
  try {
    await dataService.updateTemplateDefinition(editingTemplateDefinitionId.value, {
      name: editingTemplateName.value.trim()
    })
    // Refresh templates list to show updated name
    await fetchAllTemplates()
  } catch (error) {
    console.error('Error updating template name:', error)
    // Don't show alert for name updates - just log the error
  }
}

function confirmDelete(template) {
  templateToDelete.value = template
}

async function deleteTemplate() {
  if (!templateToDelete.value) return
  
  deleting.value = true
  try {
    if (templateToDelete.value.type === 'structured') {
      await dataService.deleteTemplateDefinition(templateToDelete.value.id)
    } else {
      await dataService.deleteTemplate(templateToDelete.value.id)
    }
    alert('Template deleted successfully!')
    templateToDelete.value = null
    await fetchAllTemplates()
  } catch (error) {
    alert('Error deleting template: ' + (error.response?.data?.error?.message || error.message))
  } finally {
    deleting.value = false
  }
}

async function handleSaveContent() {
  if (templateContentEditorRef.value && typeof templateContentEditorRef.value.saveChanges === 'function') {
    savingContent.value = true
    try {
      await templateContentEditorRef.value.saveChanges()
    } catch (error) {
      console.error('Error saving content:', error)
    } finally {
      savingContent.value = false
    }
  }
}

async function handleSaveInlineContent() {
  if (!inlineEditorRef.value || !editingTemplateDefinitionId.value) return
  
  savingContent.value = true
  try {
    // Get serialized document structure
    const documentData = inlineEditorRef.value.getDocumentData()
    
    // Store the full document JSON as a single content entry
    // Use special identifiers: section_id='document', element_id='full_content', page_number=1
    const documentJson = JSON.stringify(documentData)
    
    // Use upsert to create or update the document content
    await dataService.upsertTemplateContent(editingTemplateDefinitionId.value, {
      page_number: 1,
      section_id: 'document',
      element_id: 'full_content',
      content_value: documentJson,
      content_type: 'html'
    })
    
    // Update template name if changed
    if (editingTemplateName.value.trim()) {
      await dataService.updateTemplateDefinition(editingTemplateDefinitionId.value, {
        name: editingTemplateName.value.trim()
      })
    }
    
    // Close modal and refresh
    editingTemplateDefinitionId.value = null
    editingTemplateName.value = ''
    await fetchAllTemplates()
    
    alert('Template content saved successfully!')
  } catch (error) {
    console.error('Error saving inline content:', error)
    
    // Provide detailed error feedback
    const errorResponse = error.response?.data
    let errorMessage = 'Error saving template content'
    
    if (errorResponse?.error) {
      if (errorResponse.error.details) {
        errorMessage = `${errorResponse.error.message}\n\n${errorResponse.error.details}`
      } else {
        errorMessage = errorResponse.error.message || errorMessage
      }
    } else if (error.message) {
      errorMessage = error.message
    }
    
    alert(errorMessage)
  } finally {
    savingContent.value = false
  }
}

function handleContentSaved() {
  // Force preview to refresh by incrementing key
  templateContentKey.value++
  editingTemplateDefinitionId.value = null
  // Refresh the template list
  fetchAllTemplates()
}
</script>

<style scoped>
/* Full-width editor modal - Google Docs style */
</style>
