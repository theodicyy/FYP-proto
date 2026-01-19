<template>
  <div class="structured-template-renderer">
    <div v-if="loading" class="loading">
      Loading template...
    </div>
    <div v-else-if="error" class="error">
      Error: {{ error }}
    </div>
    <div v-else-if="templateData">
      <!-- Render inline editor template (HTML content) -->
      <div 
        v-if="templateData.type === 'inline-editor'"
        class="inline-editor-preview"
        v-html="templateData.htmlContent"
      ></div>
      <!-- Render old structured template format (Page1Cover) -->
      <Page1Cover
        v-else-if="templateData.pageNumber === 1"
        :title="templateData.content.title"
        :date="templateData.content.date"
        :footerLeft="templateData.content.footerLeft"
        :footerSubtext="templateData.content.footerSubtext"
      />
    </div>
    <div v-else class="text-center text-gray-500 py-8">
      <p>No template content available.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { dataService } from '../services/dataService.js'
import Page1Cover from './pages/Page1Cover.vue'

const props = defineProps({
  templateId: {
    type: Number,
    required: true
  },
  pagesToShow: {
    type: Array,
    default: () => [1]
  },
  contentKey: {
    type: Number,
    default: 0
  }
})

const templateData = ref(null)
const loading = ref(true)
const error = ref(null)

async function loadTemplate() {
  try {
    loading.value = true
    error.value = null

    const response = await dataService.getTemplateDefinitionWithContent(props.templateId)
    const definition = response.data
    
    // Check if this is a new inline editor template (uses document/full_content format)
    const hasDocumentContent = definition.content && Array.isArray(definition.content) &&
      definition.content.some(item => item.section_id === 'document' && item.element_id === 'full_content')
    
    if (hasDocumentContent) {
      // This is a new inline editor template - extract and render the HTML content
      const documentEntry = definition.content.find(
        item => item.section_id === 'document' && item.element_id === 'full_content'
      )
      
      if (documentEntry && documentEntry.content_value) {
        try {
          const documentData = JSON.parse(documentEntry.content_value)
          
          // Extract HTML content from pages
          let htmlContent = ''
          if (documentData.pages && Array.isArray(documentData.pages)) {
            htmlContent = documentData.pages.map(page => page.content || '').join('')
          }
          
          templateData.value = {
            type: 'inline-editor',
            htmlContent: htmlContent
          }
        } catch (parseError) {
          console.error('Error parsing document content:', parseError)
          templateData.value = null
        }
      } else {
        templateData.value = null
      }
      loading.value = false
      return
    }
    
    // Extract content for Page 1 (old structured format)
    const content = {}
    if (definition.content && Array.isArray(definition.content)) {
      definition.content.forEach(item => {
        if (item.page_number === 1) {
          if (item.section_id === 'title-section' && item.element_id === 'title-text') {
            content.title = item.content_value
          } else if (item.section_id === 'title-section' && item.element_id === 'date-text') {
            content.date = item.content_value
          } else if (item.section_id === 'footer' && item.element_id === 'footer-left-text') {
            content.footerLeft = item.content_value
          } else if (item.section_id === 'footer' && item.element_id === 'footer-subtext') {
            content.footerSubtext = item.content_value
          }
        }
      })
    }
    
    templateData.value = {
      pageNumber: 1,
      content: content
    }
  } catch (err) {
    error.value = err.message || 'Failed to load template'
    console.error('Error loading template:', err)
  } finally {
    loading.value = false
  }
}

watch(() => props.templateId, () => {
  if (props.templateId) {
    loadTemplate()
  }
}, { immediate: true })

// Watch for content updates (if key prop changes, reload)
watch(() => props.contentKey, () => {
  if (props.templateId) {
    loadTemplate()
  }
})

onMounted(() => {
  if (props.templateId) {
    loadTemplate()
  }
})

// Expose reload method for parent
defineExpose({
  reload: loadTemplate
})
</script>

<style scoped>
.structured-template-renderer {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.loading,
.error {
  padding: 2rem;
  text-align: center;
}

.error {
  color: #d32f2f;
}

.inline-editor-preview {
  width: 100%;
  max-width: 816px; /* A4 width */
  margin: 0 auto;
  background: white;
  padding: 96px; /* 1 inch margins */
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.1);
  min-height: 1123px; /* A4 height */
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 14px;
  line-height: 1.6;
  color: #202124;
}

.inline-editor-preview :deep(p) {
  margin: 0 0 0.75rem 0;
}

.inline-editor-preview :deep(p:last-child) {
  margin-bottom: 0;
}

.inline-editor-preview :deep(img) {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 1rem 0;
}

.inline-editor-preview :deep(table) {
  border-collapse: collapse;
  margin: 1rem 0;
  width: 100%;
}

.inline-editor-preview :deep(table td),
.inline-editor-preview :deep(table th) {
  border: 1px solid #ddd;
  padding: 0.5rem;
}
</style>
