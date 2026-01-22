<template>
  <div class="animate-fade-in">
    <!-- Page Header -->
    <div class="page-header">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 class="page-title">Templates Management</h1>
          <p class="page-subtitle">Create and manage document templates</p>
        </div>
        <button @click="createNewTemplate" class="btn btn-primary" :disabled="saving">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v16m8-8H4" />
          </svg>
          {{ saving ? 'Creating...' : 'Add Template' }}
        </button>
      </div>
    </div>

    <!-- Search -->
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
            <input v-model="searchQuery" type="text" placeholder="Search by name or description..." class="input pl-12" />
          </div>
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

    <!-- Templates Table -->
    <div class="card">
      <div v-if="loading" class="py-12 text-center">
        <div class="spinner mx-auto mb-4"></div>
        <p class="text-secondary-500">Loading templates...</p>
      </div>
      <div v-else-if="filteredTemplates.length === 0" class="empty-state">
        <svg class="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
        <h3 class="empty-state-title">No templates found</h3>
        <p class="empty-state-description">Create a template to get started.</p>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Type</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="template in filteredTemplates" :key="template.id">
              <tr>
                <td class="font-medium text-secondary-900">{{ template.name }}</td>
                <td class="text-secondary-500 max-w-xs truncate">{{ template.description || '-' }}</td>
                <td>
                  <span v-if="template.type === 'structured'" class="badge badge-primary">Structured</span>
                  <span v-else class="badge badge-secondary">Simple</span>
                </td>
                <td>
                  <div class="flex items-center justify-end gap-2">
                    <button 
                      v-if="template.type === 'structured'" 
                      @click="togglePreview(template.id)" 
                      class="btn btn-ghost btn-sm text-blue-600"
                      :title="previewingTemplateId === template.id ? 'Hide Preview' : 'Preview'"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button 
                      v-if="template.type === 'structured'"
                      @click="editTemplateContent(template.id)"
                      class="btn btn-ghost btn-sm text-emerald-600"
                      title="Edit Content"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button 
                      v-if="template.type === 'simple'"
                      @click="editTemplate(template)" 
                      class="btn btn-ghost btn-sm text-primary-600"
                      title="Edit"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button @click="confirmDelete(template)" class="btn btn-ghost btn-sm text-red-600" title="Delete">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
              <!-- Inline Preview Row -->
              <tr v-if="template.type === 'structured' && previewingTemplateId === template.id">
                <td colspan="4" class="p-6 bg-secondary-50">
                  <div class="bg-white rounded-xl border border-secondary-200 p-6">
                    <div class="flex justify-between items-center mb-4">
                      <h4 class="font-semibold text-secondary-900">{{ template.name }} - Preview</h4>
                      <button @click="previewingTemplateId = null" class="btn btn-ghost btn-sm">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div class="flex justify-center bg-secondary-100 rounded-lg p-4">
                      <StructuredTemplateRenderer 
                        :template-id="template.id" 
                        :pages-to-show="[1]" 
                      />
                    </div>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Simple Template Edit Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showCreateModal || editingTemplate" class="modal-overlay" @click.self="closeModal">
          <div class="modal modal-xl">
            <div class="modal-header">
              <h3 class="text-lg font-semibold text-secondary-900">
                {{ editingTemplate ? 'Edit Template' : 'Add New Template' }}
              </h3>
              <button @click="closeModal" class="btn btn-ghost btn-sm">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form @submit.prevent="saveTemplate">
              <div class="modal-body space-y-4">
                <div class="input-group">
                  <label class="label">Name *</label>
                  <input v-model="templateForm.name" type="text" required class="input" placeholder="e.g., Standard Corporate Template" />
                </div>
                
                <div class="input-group">
                  <label class="label">Description</label>
                  <input v-model="templateForm.description" type="text" class="input" placeholder="Brief description" />
                </div>
                
                <div class="input-group">
                  <label class="label">
                    Content * 
                    <span class="text-xs text-secondary-500 font-normal ml-2">
                      Use placeholders: <code class="px-1 py-0.5 bg-secondary-100 rounded">{{lawyers}}</code>, 
                      <code class="px-1 py-0.5 bg-secondary-100 rounded">{{deals}}</code>, 
                      <code class="px-1 py-0.5 bg-secondary-100 rounded">{{awards}}</code>
                    </span>
                  </label>
                  <textarea v-model="templateForm.content" rows="12" required class="input font-mono text-sm"></textarea>
                </div>
              </div>
              
              <div class="modal-footer">
                <button type="button" @click="closeModal" class="btn btn-secondary">Cancel</button>
                <button type="submit" class="btn btn-primary" :disabled="saving">
                  {{ saving ? 'Saving...' : 'Save Template' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Full-screen Structured Template Editor -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="editingTemplateDefinitionId" class="fixed inset-0 z-50 flex flex-col bg-white">
          <div class="flex items-center justify-between px-6 py-4 border-b border-secondary-200 bg-white">
            <div class="flex items-center gap-4 flex-1">
              <button @click="editingTemplateDefinitionId = null" class="btn btn-ghost btn-sm">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <input 
                v-model="editingTemplateName"
                @blur="updateTemplateName"
                class="flex-1 max-w-md px-3 py-2 border border-secondary-200 rounded-lg focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                placeholder="Template name..."
              />
            </div>
            <div class="flex items-center gap-3">
              <button 
                @click="handleSaveInlineContent"
                :disabled="savingContent"
                class="btn btn-primary"
              >
                {{ savingContent ? 'Saving...' : 'Save Changes' }}
              </button>
              <button @click="editingTemplateDefinitionId = null" class="btn btn-secondary">
                Cancel
              </button>
            </div>
          </div>
          <div class="flex-1 overflow-hidden bg-secondary-100">
            <InlineDocumentEditor 
              ref="inlineEditorRef"
              :template-id="editingTemplateDefinitionId"
            />
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Delete Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="templateToDelete" class="modal-overlay" @click.self="templateToDelete = null">
          <div class="modal">
            <div class="modal-header">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 class="text-lg font-semibold text-secondary-900">Delete Template</h3>
              </div>
            </div>
            <div class="modal-body">
              <p class="text-secondary-700">
                Are you sure you want to delete <strong>{{ templateToDelete.name }}</strong>?
              </p>
              <p class="text-sm text-secondary-500 mt-2">
                This action cannot be undone. Existing statements using this template will keep their content.
              </p>
            </div>
            <div class="modal-footer">
              <button @click="templateToDelete = null" class="btn btn-secondary">Cancel</button>
              <button @click="deleteTemplate" class="btn btn-danger" :disabled="deleting">
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
import StructuredTemplateRenderer from '../../components/StructuredTemplateRenderer.vue'
import InlineDocumentEditor from '../../components/InlineDocumentEditor.vue'

const templates = ref([])
const templateDefinitions = ref([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const searchQuery = ref('')
const showCreateModal = ref(false)
const editingTemplate = ref(null)
const templateToDelete = ref(null)
const previewingTemplateId = ref(null)
const editingTemplateDefinitionId = ref(null)
const editingTemplateName = ref('')
const inlineEditorRef = ref(null)
const savingContent = ref(false)

const templateForm = ref({
  name: '',
  description: '',
  content: ''
})

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
      (t.description && t.description.toLowerCase().includes(query))
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
    const [simpleResponse, structuredResponse] = await Promise.all([
      dataService.getTemplates().catch(() => ({ data: [] })),
      dataService.getTemplateDefinitions().catch(() => ({ data: [] }))
    ])
    
    templates.value = simpleResponse.data?.data || simpleResponse.data || []
    templateDefinitions.value = structuredResponse.data || []
  } catch (error) {
    console.error('Error fetching templates:', error)
    alert('Error loading templates: ' + error.message)
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
  templateForm.value = { name: '', description: '', content: '' }
}

async function saveTemplate() {
  saving.value = true
  try {
    if (editingTemplate.value) {
      await dataService.updateTemplate(editingTemplate.value.id, templateForm.value)
    } else {
      await dataService.createTemplate(templateForm.value)
    }
    closeModal()
    await fetchAllTemplates()
  } catch (error) {
    alert('Error saving template: ' + error.message)
  } finally {
    saving.value = false
  }
}

function togglePreview(templateId) {
  previewingTemplateId.value = previewingTemplateId.value === templateId ? null : templateId
}

function editTemplateContent(templateDefinitionId) {
  editingTemplateDefinitionId.value = templateDefinitionId
  previewingTemplateId.value = null
  
  const template = templateDefinitions.value.find(t => t.id === templateDefinitionId)
  editingTemplateName.value = template?.name || 'Template'
}

async function createNewTemplate() {
  try {
    saving.value = true
    
    const response = await dataService.createTemplateDefinition({
      name: 'New Template',
      description: '',
      template_type: 'multipage',
      total_pages: 1,
      structure: JSON.stringify({
        pages: [{ id: 'page-1', sections: [] }]
      }),
      styles: null
    })
    
    editingTemplateDefinitionId.value = response.data.id
    editingTemplateName.value = 'New Template'
    await fetchAllTemplates()
  } catch (error) {
    console.error('Error creating template:', error)
    alert('Error creating template: ' + error.message)
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
    await fetchAllTemplates()
  } catch (error) {
    console.error('Error updating template name:', error)
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
    templateToDelete.value = null
    await fetchAllTemplates()
  } catch (error) {
    alert('Error deleting template: ' + error.message)
  } finally {
    deleting.value = false
  }
}

async function handleSaveInlineContent() {
  if (!inlineEditorRef.value || !editingTemplateDefinitionId.value) return
  
  savingContent.value = true
  try {
    const documentData = inlineEditorRef.value.getDocumentData()
    const documentJson = JSON.stringify(documentData)
    
    await dataService.upsertTemplateContent(editingTemplateDefinitionId.value, {
      page_number: 1,
      section_id: 'document',
      element_id: 'full_content',
      content_value: documentJson,
      content_type: 'html'
    })
    
    if (editingTemplateName.value.trim()) {
      await dataService.updateTemplateDefinition(editingTemplateDefinitionId.value, {
        name: editingTemplateName.value.trim()
      })
    }
    
    editingTemplateDefinitionId.value = null
    editingTemplateName.value = ''
    await fetchAllTemplates()
  } catch (error) {
    console.error('Error saving content:', error)
    alert('Error saving template content: ' + error.message)
  } finally {
    savingContent.value = false
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

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
