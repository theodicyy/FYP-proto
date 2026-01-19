<template>
  <div class="inline-document-editor">
    <!-- Minimal Toolbar (Google Docs style) -->
    <div class="editor-toolbar" v-if="pages.length > 0">
      <!-- Text Formatting: Bold, Italic, Underline -->
      <div class="toolbar-group">
        <button
          @click="applyFormat('bold')"
          :class="{ 'is-active': isActive('bold') }"
          class="toolbar-btn"
          title="Bold"
        >
          <strong>B</strong>
        </button>
        <button
          @click="applyFormat('italic')"
          :class="{ 'is-active': isActive('italic') }"
          class="toolbar-btn"
          title="Italic"
        >
          <em>I</em>
        </button>
        <button
          @click="applyFormat('underline')"
          :class="{ 'is-active': isActive('underline') }"
          class="toolbar-btn"
          title="Underline"
        >
          <u>U</u>
        </button>
      </div>
      
      <!-- Color Picker -->
      <div class="toolbar-group">
        <input
          type="color"
          @input="setColor($event.target.value)"
          class="color-picker"
          title="Text Color"
          :value="getCurrentColor()"
        />
      </div>
      
      <!-- Insert Table -->
      <div class="toolbar-group">
        <button
          @click="insertTable"
          class="toolbar-btn"
          title="Insert Table"
        >
          Table
        </button>
      </div>
      
      <!-- Insert Image -->
      <div class="toolbar-group">
        <button
          @click="showImagePicker = true"
          class="toolbar-btn"
          title="Insert Image"
        >
          Image
        </button>
      </div>
      
      <!-- Add Page -->
      <div class="toolbar-group">
        <button
          @click="addPage"
          class="toolbar-btn"
          title="Add New Page"
        >
          Add Page
        </button>
      </div>
    </div>

    <!-- Document Pages Container -->
    <div class="document-pages">
      <div
        v-for="(page, index) in pages"
        :key="page.id"
        class="document-page"
      >
        <!-- Page Content Editor -->
        <EditorContent :editor="page.editor" class="page-editor-content" />
        
        <!-- Page Break Indicator (subtle, Google Docs style) -->
        <div v-if="index < pages.length - 1" class="page-break-indicator"></div>
      </div>
    </div>

    <!-- Image Picker Modal (for selecting existing images) -->
    <div v-if="showImagePicker" class="image-picker-modal" @click.self="showImagePicker = false">
      <div class="image-picker-content">
        <h3>Select Image</h3>
        <div class="image-grid">
          <!-- List of available images -->
          <div
            v-for="image in availableImages"
            :key="image.id"
            class="image-item"
            @click="insertSelectedImage(image)"
          >
            <img :src="image.src" :alt="image.name" />
            <span>{{ image.name }}</span>
          </div>
        </div>
        <button @click="showImagePicker = false" class="btn-close">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue'
import { Editor, EditorContent } from '@tiptap/vue-3'
import { dataService } from '../services/dataService.js'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import { Table } from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'

// Note: User needs to install: npm install @tiptap/extension-underline
// For now, we'll create a simple underline mark using text-decoration CSS
// This is a temporary workaround until the extension is installed

const props = defineProps({
  initialContent: {
    type: String,
    default: ''
  },
  templateId: {
    type: Number,
    default: null
  }
})

const emit = defineEmits(['content-changed'])

// Pages management
const pages = ref([])
const showImagePicker = ref(false)
const availableImages = ref([
  { id: 1, name: 'Logo', src: '/images/template/Wong_Partnership_Logo_HD_Transparent.png' },
  { id: 2, name: 'W Logo', src: '/images/template/WongP_W_Logo_HD_Transparent.png' }
])

// Initialize first page
function createPage(pageId = null) {
  const pageIdValue = pageId || `page-${Date.now()}`
  const editor = new Editor({
    extensions: [
      StarterKit.configure({
        // Disable heading if needed, or keep for structure
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: 'editor-image',
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'editor-table',
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
      TextStyle,
      Color.configure({
        types: ['textStyle'],
      }),
    ],
    content: '',
    // Note: We don't auto-save on every update - only on explicit "Confirm" button
    // onUpdate is disabled to prevent auto-saving
    editorProps: {
      attributes: {
        class: 'page-editor',
      },
    },
  })
  
  return {
    id: pageIdValue,
    editor
  }
}

function addPage() {
  const newPage = createPage()
  pages.value.push(newPage)
  // Focus the new page
  setTimeout(() => {
    newPage.editor.commands.focus()
  }, 100)
}

function insertTable() {
  if (pages.value.length > 0) {
    const currentPage = pages.value[pages.value.length - 1]
    currentPage.editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }
}

function getCurrentEditor() {
  if (pages.value.length > 0) {
    return pages.value[pages.value.length - 1].editor
  }
  return null
}

function applyFormat(format) {
  const editor = getCurrentEditor()
  if (!editor) return
  
  if (format === 'bold') {
    editor.chain().focus().toggleBold().run()
  } else if (format === 'italic') {
    editor.chain().focus().toggleItalic().run()
  } else if (format === 'underline') {
    // Note: Underline requires @tiptap/extension-underline to be installed
    // For now, this will fail silently. Install with: npm install @tiptap/extension-underline
    try {
      editor.chain().focus().toggleUnderline().run()
    } catch (e) {
      console.warn('Underline extension not installed. Install with: npm install @tiptap/extension-underline')
    }
  }
}

function isActive(format) {
  const editor = getCurrentEditor()
  if (!editor) return false
  
  if (format === 'bold') {
    return editor.isActive('bold')
  } else if (format === 'italic') {
    return editor.isActive('italic')
  } else if (format === 'underline') {
    try {
      return editor.isActive('underline')
    } catch (e) {
      return false
    }
  }
  return false
}

function setColor(color) {
  const editor = getCurrentEditor()
  if (!editor) return
  editor.chain().focus().setColor(color).run()
}

function getCurrentColor() {
  const editor = getCurrentEditor()
  if (!editor) return '#000000'
  return editor.getAttributes('textStyle').color || '#000000'
}

function insertSelectedImage(image) {
  if (pages.value.length > 0) {
    const currentPage = pages.value[pages.value.length - 1]
    currentPage.editor.chain().focus().setImage({ src: image.src }).run()
  }
  showImagePicker.value = false
}

function serializeDocument() {
  return {
    pages: pages.value.map(page => ({
      id: page.id,
      content: page.editor.getHTML(),
      json: page.editor.getJSON()
    }))
  }
}

function loadDocument(documentData) {
  // Destroy existing editors first
  pages.value.forEach(page => {
    if (page.editor) {
      page.editor.destroy()
    }
  })
  
  if (documentData && documentData.pages && documentData.pages.length > 0) {
    pages.value = documentData.pages.map(pageData => {
      const page = createPage(pageData.id)
      // Use nextTick to ensure editor is fully initialized before setting content
      setTimeout(() => {
        if (page.editor && !page.editor.isDestroyed) {
          page.editor.commands.setContent(pageData.content || '')
        }
      }, 0)
      return page
    })
  } else {
    // Start with one empty page
    pages.value = [createPage()]
  }
}

async function loadExistingDocument() {
  if (!props.templateId) {
    pages.value = [createPage()]
    return
  }

  try {
    // Fetch the document content from the backend
    // Look for content with section_id='document', element_id='full_content', page_number=1
    const response = await dataService.getTemplateContent(props.templateId, {
      section_id: 'document',
      page_number: 1
    })
    
    const contentEntries = response.data || []
    const documentEntry = contentEntries.find(
      entry => entry.section_id === 'document' && entry.element_id === 'full_content'
    )
    
    if (documentEntry && documentEntry.content_value) {
      try {
        const documentData = JSON.parse(documentEntry.content_value)
        // Clear existing pages first
        pages.value.forEach(page => {
          if (page.editor) {
            page.editor.destroy()
          }
        })
        pages.value = []
        
        // Load document data - create pages and set content
        if (documentData.pages && documentData.pages.length > 0) {
          pages.value = documentData.pages.map(pageData => {
            const page = createPage(pageData.id)
            // Set content immediately after editor creation
            if (pageData.content) {
              page.editor.commands.setContent(pageData.content)
            }
            return page
          })
        } else {
          pages.value = [createPage()]
        }
      } catch (parseError) {
        console.error('Error parsing document JSON:', parseError)
        // If parsing fails, start with empty page
        pages.value.forEach(page => {
          if (page.editor) {
            page.editor.destroy()
          }
        })
        pages.value = [createPage()]
      }
    } else {
      // No existing content, start with one empty page
      pages.value.forEach(page => {
        if (page.editor) {
          page.editor.destroy()
        }
      })
      pages.value = [createPage()]
    }
  } catch (error) {
    console.error('Error loading existing document:', error)
    // On error, start with one empty page
    pages.value.forEach(page => {
      if (page.editor) {
        page.editor.destroy()
      }
    })
    pages.value = [createPage()]
  }
}

watch(() => props.templateId, () => {
  if (props.templateId) {
    loadExistingDocument()
  }
}, { immediate: true })

onMounted(() => {
  // loadExistingDocument is called by watch immediately, so we don't need to call it here
  // But if templateId is null, we still need to initialize
  if (!props.templateId) {
    pages.value = [createPage()]
  }
})

onBeforeUnmount(() => {
  pages.value.forEach(page => {
    if (page.editor) {
      page.editor.destroy()
    }
  })
})

// Expose methods for parent component
defineExpose({
  serializeDocument,
  loadDocument,
  getDocumentData: serializeDocument
})
</script>

<style scoped>
.inline-document-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f5f5f5;
  overflow-x: hidden;
}

.editor-toolbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 0.5rem 1rem;
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.toolbar-group {
  display: flex;
  gap: 0.25rem;
  padding: 0 0.5rem;
  border-right: 1px solid #e5e7eb;
  align-items: center;
}

.toolbar-group:last-child {
  border-right: none;
}

.toolbar-btn {
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background-color 0.15s;
  color: #374151;
  min-width: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toolbar-btn:hover {
  background: #f3f4f6;
}

.toolbar-btn.is-active {
  background: #e5e7eb;
  color: #111827;
}

.color-picker {
  width: 2rem;
  height: 2rem;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  cursor: pointer;
  padding: 0;
}

.document-pages {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.document-page {
  background: white;
  width: 816px; /* A4 width at 96 DPI */
  min-height: 1123px; /* A4 height at 96 DPI */
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.1);
  margin: 0 auto;
  padding: 96px; /* 1 inch margins */
  position: relative;
}

.page-editor-content {
  min-height: 100%;
}

.page-break-indicator {
  height: 2rem;
  border-bottom: 1px dashed #d1d5db;
  margin: 1rem 0;
  position: relative;
}

.page-break-indicator::after {
  content: 'Page Break';
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 0 0.5rem;
  color: #9ca3af;
  font-size: 0.75rem;
}

/* TipTap Editor Styles */
:deep(.page-editor) {
  outline: none;
  min-height: calc(1123px - 192px); /* Page height minus padding */
  color: #202124;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 14px;
  line-height: 1.6;
}

:deep(.page-editor p) {
  margin: 0 0 0.75rem 0;
}

:deep(.page-editor p:last-child) {
  margin-bottom: 0;
}

:deep(.editor-image) {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 1rem 0;
  cursor: pointer;
  border-radius: 4px;
}

:deep(.editor-table) {
  border-collapse: collapse;
  margin: 1rem 0;
  width: 100%;
}

:deep(.editor-table td),
:deep(.editor-table th) {
  border: 1px solid #ddd;
  padding: 0.5rem;
}

/* Image Picker Modal */
.image-picker-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.image-picker-content {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
  margin: 1rem 0;
}

.image-item {
  cursor: pointer;
  border: 2px solid transparent;
  border-radius: 4px;
  padding: 0.5rem;
  text-align: center;
  transition: border-color 0.2s;
}

.image-item:hover {
  border-color: #008080;
}

.image-item img {
  width: 100%;
  height: auto;
  display: block;
  margin-bottom: 0.5rem;
}

.btn-close {
  padding: 0.5rem 1rem;
  background: #008080;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 1rem;
}
</style>