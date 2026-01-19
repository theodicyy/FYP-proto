<template>
  <div class="template-content-editor">
    <div v-if="loading" class="loading">
      Loading content...
    </div>
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    <div v-else class="editor-content">
      <div class="content-fields">
        <div
          v-for="field in contentFields"
          :key="field.key"
          class="content-field"
        >
          <label :for="field.key" class="field-label">
            {{ field.label }}
            <span v-if="field.required" class="required">*</span>
          </label>
          <input
            v-if="field.type === 'text'"
            :id="field.key"
            v-model="editedContent[field.key]"
            type="text"
            class="field-input"
            :placeholder="field.placeholder"
          />
          <RichTextEditor
            v-else-if="field.type === 'html'"
            v-model="editedContent[field.key]"
            :template-id="props.templateId"
            :placeholder="field.placeholder"
          />
          <textarea
            v-else-if="field.type === 'textarea'"
            :id="field.key"
            v-model="editedContent[field.key]"
            class="field-textarea"
            :placeholder="field.placeholder"
            rows="3"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { dataService } from '../services/dataService.js'
import RichTextEditor from './RichTextEditor.vue'

const props = defineProps({
  templateId: {
    type: Number,
    required: true
  },
  pageNumber: {
    type: Number,
    default: 1
  }
})

const emit = defineEmits(['saved', 'cancelled'])

const loading = ref(true)
const saving = ref(false)
const error = ref(null)
const templateContent = ref([])
const editedContent = ref({})

const contentFields = computed(() => {
  // Define editable fields for Page 1
  if (props.pageNumber === 1) {
    return [
      {
        key: 'title-text',
        label: 'Title',
        type: 'text',
        required: true,
        placeholder: 'PROPOSAL FOR [INSERT CLIENT NAME]',
        page: 1,
        section: 'title-section',
        element: 'title-text'
      },
      {
        key: 'date-text',
        label: 'Date',
        type: 'text',
        required: false,
        placeholder: 'INSERT DATE [DDMonthYYYY]',
        page: 1,
        section: 'title-section',
        element: 'date-text'
      },
      {
        key: 'rich-content',
        label: 'Rich Content (Tables, Images, Colors)',
        type: 'html',
        required: false,
        placeholder: 'Use the toolbar to add tables, images, and format text...',
        page: 1,
        section: 'main-body',
        element: 'rich-content'
      },
      {
        key: 'footer-left-text',
        label: 'Footer Left Text',
        type: 'text',
        required: false,
        placeholder: 'ASEAN | CHINA | MIDDLE EAST',
        page: 1,
        section: 'footer',
        element: 'footer-left-text'
      },
      {
        key: 'footer-subtext',
        label: 'Footer Subtext',
        type: 'text',
        required: false,
        placeholder: 'a regional law network',
        page: 1,
        section: 'footer',
        element: 'footer-subtext'
      }
    ]
  }
  return []
})

async function loadContent() {
  try {
    loading.value = true
    error.value = null

    const response = await dataService.getTemplateContent(props.templateId, {
      page_number: props.pageNumber
    })

    templateContent.value = response.data || []

    // Initialize editedContent with current values
    editedContent.value = {}
    contentFields.value.forEach(field => {
      const contentItem = templateContent.value.find(
        c => c.page_number === field.page &&
             c.section_id === field.section &&
             c.element_id === field.element
      )
      editedContent.value[field.key] = contentItem?.content_value || ''
    })
  } catch (err) {
    error.value = err.message || 'Failed to load content'
    console.error('Error loading template content:', err)
  } finally {
    loading.value = false
  }
}

async function saveChanges() {
  try {
    saving.value = true
    error.value = null

    const updates = contentFields.value.map(field => ({
      page_number: field.page,
      section_id: field.section,
      element_id: field.element,
      content_value: editedContent.value[field.key] || '',
      content_type: field.type === 'html' ? 'html' : 'text'
    }))

    await dataService.updateTemplateContentBatch(props.templateId, updates)

    emit('saved', editedContent.value)
    
    // Reload content to get updated values
    await loadContent()
  } catch (err) {
    error.value = err.message || 'Failed to save content'
    console.error('Error saving template content:', err)
  } finally {
    saving.value = false
  }
}

function cancelEditing() {
  // Reset to original values
  loadContent()
  emit('cancelled')
}

watch(() => props.templateId, () => {
  if (props.templateId) {
    loadContent()
  }
}, { immediate: true })

onMounted(() => {
  if (props.templateId) {
    loadContent()
  }
})

// Expose saveChanges method for parent component
defineExpose({
  saveChanges
})
</script>

<style scoped>
.template-content-editor {
  padding: 0;
  background: transparent;
}

.loading,
.error {
  padding: 2rem;
  text-align: center;
}

.error {
  color: #d32f2f;
}


.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background-color 0.2s;
}

.btn-primary {
  background-color: #008080;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #006666;
}

.btn-primary:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #f5f5f5;
  color: #333;
}

.btn-secondary:hover {
  background-color: #e0e0e0;
}

.content-fields {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.content-field {
  display: flex;
  flex-direction: column;
}

.field-label {
  margin-bottom: 0.75rem;
  font-weight: 500;
  font-size: 0.875rem;
  color: #555;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.required {
  color: #d32f2f;
}

.field-input,
.field-textarea {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  font-family: inherit;
}

.field-input:focus,
.field-textarea:focus {
  outline: none;
  border-color: #008080;
  box-shadow: 0 0 0 2px rgba(0, 128, 128, 0.1);
}

.field-textarea {
  resize: vertical;
  min-height: 80px;
}
</style>
