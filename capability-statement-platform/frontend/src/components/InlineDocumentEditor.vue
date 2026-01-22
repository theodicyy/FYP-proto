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
      <div class="toolbar-group table-selector-container" @mouseleave="hideTableGrid">
        <button
          @mouseenter="showTableGrid = true"
          class="toolbar-btn"
          title="Insert Table"
        >
          Table
        </button>
        <!-- Table Grid Selector (Google Docs style) -->
        <div v-if="showTableGrid" class="table-grid-selector" @mouseleave="hideTableGrid">
          <div class="table-grid">
            <div
              v-for="row in 10"
              :key="`row-${row}`"
              class="table-grid-row"
            >
              <div
                v-for="col in 10"
                :key="`cell-${row}-${col}`"
                class="table-grid-cell"
                :class="{ 'selected': selectedTableSize.rows >= row && selectedTableSize.cols >= col }"
                @mouseenter="selectedTableSize = { rows: row, cols: col }"
                @click="insertTableWithSize(row, col)"
              ></div>
            </div>
          </div>
          <div class="table-grid-label">
            {{ selectedTableSize.rows }} × {{ selectedTableSize.cols }}
          </div>
        </div>
      </div>
      
      <!-- Table Editing Controls (shown when table is selected) -->
      <div v-if="isTableActive" class="toolbar-group">
        <button
          @click="addTableRow"
          class="toolbar-btn"
          title="Add Row After"
        >
          +Row
        </button>
        <button
          @click="deleteTableRow"
          class="toolbar-btn"
          title="Delete Row"
        >
          -Row
        </button>
        <button
          @click="addTableColumn"
          class="toolbar-btn"
          title="Add Column After"
        >
          +Col
        </button>
        <button
          @click="deleteTableColumn"
          class="toolbar-btn"
          title="Delete Column"
        >
          -Col
        </button>
        <button
          @click="deleteTable"
          class="toolbar-btn"
          title="Delete Table"
        >
          ✕
        </button>
      </div>
      
      <!-- Insert Image -->
      <div class="toolbar-group">
        <input
          type="file"
          ref="imageInput"
          @change="handleImageUpload"
          accept="image/*"
          class="hidden-input"
          id="image-upload-inline"
        />
        <button
          @click="triggerImageUpload"
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

  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watch, nextTick } from 'vue'
import { Editor, EditorContent } from '@tiptap/vue-3'
import { dataService } from '../services/dataService.js'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'

// Extend Image extension to support width and height attributes for resizing
const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: element => element.getAttribute('width') || element.style.width?.replace('px', '') || null,
        renderHTML: attributes => {
          if (!attributes.width) return {}
          return { width: attributes.width, style: `width: ${attributes.width}px` }
        },
      },
      height: {
        default: null,
        parseHTML: element => element.getAttribute('height') || element.style.height?.replace('px', '') || null,
        renderHTML: attributes => {
          if (!attributes.height) return {}
          return { height: attributes.height, style: `height: ${attributes.height}px` }
        },
      },
    }
  },
})
import { Table } from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'

const props = defineProps({
  initialContent: {
    type: String,
    default: ''
  },
  templateId: {
    type: Number,
    default: null
  },
  statementId: {
    type: Number,
    default: null
  }
})

const emit = defineEmits(['content-changed'])

// Pages management
const pages = ref([])
const imageInput = ref(null)
const showTableGrid = ref(false)
const selectedTableSize = ref({ rows: 3, cols: 3 })

// Initialize first page
function createPage(pageId = null) {
  const pageIdValue = pageId || `page-${Date.now()}`
  const editor = new Editor({
    extensions: [
      StarterKit.configure({
        // Disable heading if needed, or keep for structure
      }),
      ResizableImage.configure({
        inline: false,
        allowBase64: false, // CRITICAL: Only allow persistent URLs, no base64
        HTMLAttributes: {
          class: 'editor-image',
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'editor-table',
          style: 'border-collapse: collapse; border: 1px solid #000000;',
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
    editorProps: {
      attributes: {
        class: 'page-editor',
      },
      handlePaste: (view, event, slice) => {
        const items = Array.from(event.clipboardData?.items || [])
        const imageItem = items.find(item => item.type.indexOf('image') !== -1)
        
        if (imageItem) {
          event.preventDefault()
          const file = imageItem.getAsFile()
          if (file) {
            handleImageFile(file)
          }
          return true
        }
        return false
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          const file = event.dataTransfer.files[0]
          if (file.type.indexOf('image') !== -1) {
            event.preventDefault()
            handleImageFile(file)
            return true
          }
        }
        return false
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

function insertTableWithSize(rows, cols) {
  if (pages.value.length === 0) return
  
  const currentPage = pages.value[pages.value.length - 1]
  if (!currentPage || !currentPage.editor) return
  
  const editor = currentPage.editor
  
  editor.chain().focus().insertTable({ 
    rows: rows, 
    cols: cols, 
    withHeaderRow: false 
  }).run()
  
  showTableGrid.value = false
  
  setTimeout(() => {
    try {
      const { state } = editor
      const { $anchor } = state.selection
      
      let tablePos = null
      state.doc.descendants((node, pos) => {
        if (node.type.name === 'table') {
          tablePos = pos
          return false
        }
      })
      
      if (tablePos !== null) {
        const firstCellPos = tablePos + 3
        editor.commands.setTextSelection(firstCellPos)
        editor.commands.focus()
      }
    } catch (error) {
      console.warn('Could not explicitly position cursor in first cell:', error)
    }
  }, 10)
}

function hideTableGrid() {
  setTimeout(() => {
    showTableGrid.value = false
  }, 200)
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

const isTableActive = computed(() => {
  const editor = getCurrentEditor()
  if (!editor) return false
  return editor.isActive('table')
})

function addTableRow() {
  const editor = getCurrentEditor()
  if (!editor) return
  editor.chain().focus().addRowAfter().run()
}

function deleteTableRow() {
  const editor = getCurrentEditor()
  if (!editor) return
  editor.chain().focus().deleteRow().run()
}

function addTableColumn() {
  const editor = getCurrentEditor()
  if (!editor) return
  editor.chain().focus().addColumnAfter().run()
}

function deleteTableColumn() {
  const editor = getCurrentEditor()
  if (!editor) return
  editor.chain().focus().deleteColumn().run()
}

function deleteTable() {
  const editor = getCurrentEditor()
  if (!editor) return
  editor.chain().focus().deleteTable().run()
}

function triggerImageUpload() {
  console.log('Image button clicked, triggering file input...')
  if (imageInput.value) {
    imageInput.value.click()
  } else {
    console.error('Image input ref not found!')
  }
}

async function handleImageUpload(event) {
  console.log('handleImageUpload called')
  console.log('Event target:', event.target)
  console.log('Files:', event.target.files)
  
  const file = event.target.files?.[0]
  if (!file) {
    console.log('No file selected')
    return
  }
  
  console.log('File selected:', file.name, file.type, file.size)
  
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    alert(`Invalid file type: ${file.type}\n\nPlease select a valid image file (PNG, JPEG, WebP, or GIF)`)
    if (imageInput.value) {
      imageInput.value.value = ''
    }
    return
  }
  
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    alert(`File size (${(file.size / 1024 / 1024).toFixed(2)} MB) exceeds the 10MB limit`)
    if (imageInput.value) {
      imageInput.value.value = ''
    }
    return
  }
  
  try {
    await handleImageFile(file)
  } catch (error) {
    console.error('Image upload failed:', error)
  } finally {
    if (imageInput.value) {
      imageInput.value.value = ''
    }
  }
}

async function handleImageFile(file) {
  if (pages.value.length === 0) {
    alert('Please wait for the editor to initialize')
    return
  }
  
  const currentPage = pages.value[pages.value.length - 1]
  if (!currentPage || !currentPage.editor) {
    alert('Editor not ready')
    return
  }
  
  if (!props.templateId && !props.statementId) {
    alert('Cannot upload image: Please save first to enable image uploads.')
    return
  }
  
  let imageUrl = null
  
  try {
    const formData = new FormData()
    formData.append('image', file)
    
    console.log('Uploading image to server...')
    
    let response
    if (props.templateId) {
      response = await dataService.uploadTemplateImage(props.templateId, formData)
    } else if (props.statementId) {
      response = await dataService.uploadStatementImage(props.statementId, formData)
    }
    console.log('Upload response:', response)
    
    if (response?.data?.url) {
      imageUrl = response.data.url
    } else if (response?.data?.imageUrl) {
      imageUrl = response.data.imageUrl
    } else if (response?.url) {
      imageUrl = response.url
    } else if (response?.imageUrl) {
      imageUrl = response.imageUrl
    } else if (typeof response === 'string' && response.length > 0) {
      imageUrl = response
    }
    
    if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim() === '') {
      console.error('Invalid image URL extracted. Full response:', response)
      throw new Error('No valid image URL returned from server. Response: ' + JSON.stringify(response))
    }
    
    imageUrl = imageUrl.trim()
    
    if (imageUrl.startsWith('/')) {
      const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
      const baseUrl = backendUrl.replace(/\/$/, '')
      imageUrl = baseUrl + imageUrl
    } else if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
      imageUrl = '/' + imageUrl
      const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
      const baseUrl = backendUrl.replace(/\/$/, '')
      imageUrl = baseUrl + imageUrl
    }
    
    if (imageUrl.includes('blob:') || imageUrl.startsWith('data:') || imageUrl === 'undefined' || imageUrl === 'null') {
      throw new Error('Invalid image URL format: ' + imageUrl)
    }
    
    console.log('Valid image URL extracted (absolute):', imageUrl)
    
    const editor = currentPage.editor
    
    editor.chain().focus()
    
    const insertResult = editor.chain().focus().setImage({ src: imageUrl }).run()
    
    if (!insertResult) {
      throw new Error('Failed to insert image into editor')
    }
    
    console.log('Image inserted successfully with URL:', imageUrl)
    
    setTimeout(() => {
      attachResizeHandles(editor)
      console.log('Resize handles attached to new image')
    }, 200)
    
  } catch (uploadError) {
    console.error('Image upload/insertion failed:', uploadError)
    console.error('Error details:', {
      message: uploadError.message,
      response: uploadError.response?.data,
      stack: uploadError.stack
    })
    
    const errorMessage = uploadError.response?.data?.error?.message || uploadError.message || 'Image upload failed'
    alert(`Error uploading image: ${errorMessage}\n\nPlease ensure:\n- File is a valid image (PNG, JPEG, WebP)\n- File size is under 10MB\n- Template is saved`)
    
    throw uploadError
  }
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
  pages.value.forEach(page => {
    if (page.editor) {
      page.editor.destroy()
    }
  })
  
  if (documentData && documentData.pages && documentData.pages.length > 0) {
    pages.value = documentData.pages.map(pageData => {
      const page = createPage(pageData.id)
      setTimeout(() => {
        if (page.editor && !page.editor.isDestroyed) {
          page.editor.commands.setContent(pageData.content || '')
        }
      }, 0)
      return page
    })
  } else {
    pages.value = [createPage()]
  }
}

async function loadExistingDocument() {
  if (!props.templateId) {
    pages.value = [createPage()]
    return
  }

  try {
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
        pages.value.forEach(page => {
          if (page.editor) {
            page.editor.destroy()
          }
        })
        pages.value = []
        
        if (documentData.pages && documentData.pages.length > 0) {
          pages.value = documentData.pages.map(pageData => {
            const page = createPage(pageData.id)
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
        pages.value.forEach(page => {
          if (page.editor) {
            page.editor.destroy()
          }
        })
        pages.value = [createPage()]
      }
    } else {
      pages.value.forEach(page => {
        if (page.editor) {
          page.editor.destroy()
        }
      })
      pages.value = [createPage()]
    }
  } catch (error) {
    console.error('Error loading existing document:', error)
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
    loadExistingDocument().then(() => {
      setTimeout(() => {
        initializeImageResize()
      }, 500)
    })
  }
}, { immediate: true })

onMounted(() => {
  if (!props.templateId) {
    pages.value = [createPage()]
  }
  
  nextTick(() => {
    initializeImageResize()
  })
})

onBeforeUnmount(() => {
  cleanupImageResize()
  
  pages.value.forEach(page => {
    if (page.editor) {
      page.editor.destroy()
    }
  })
})

// Image resize functionality (Google Docs style)
let resizeHandlers = []

function initializeImageResize() {
  pages.value.forEach(page => {
    if (page.editor) {
      page.editor.on('selectionUpdate', () => {
        nextTick(() => {
          attachResizeHandles(page.editor)
        })
      })
      
      page.editor.on('update', () => {
        nextTick(() => {
          attachResizeHandles(page.editor)
        })
      })
      
      page.editor.on('transaction', () => {
        nextTick(() => {
          attachResizeHandles(page.editor)
        })
      })
    }
  })
  
  setTimeout(() => {
    pages.value.forEach(page => {
      if (page.editor) {
        attachResizeHandles(page.editor)
      }
    })
  }, 100)
}

function cleanupImageResize() {
  resizeHandlers.forEach(cleanup => cleanup())
  resizeHandlers = []
}

function attachResizeHandles(editor) {
  const editorElement = editor.view.dom
  const images = editorElement.querySelectorAll('img')
  
  console.log('attachResizeHandles called, found images:', images.length)
  
  images.forEach(img => {
    if (img.dataset.resizeEnabled === 'true') {
      return
    }
    
    img.dataset.resizeEnabled = 'true'
    
    console.log('Adding resize capability to image:', img.src?.substring(0, 80))
    
    img.style.cursor = 'pointer'
    
    const onClick = (e) => {
      e.preventDefault()
      e.stopPropagation()
      showImageResizeUI(img, editor)
    }
    
    img.addEventListener('click', onClick)
    
    resizeHandlers.push(() => {
      img.removeEventListener('click', onClick)
      img.dataset.resizeEnabled = 'false'
    })
  })
}

let activeResizeOverlay = null

function showImageResizeUI(img, editor) {
  console.log('showImageResizeUI called for image')
  
  hideImageResizeUI()
  
  const rect = img.getBoundingClientRect()
  const scrollTop = window.scrollY || document.documentElement.scrollTop
  const scrollLeft = window.scrollX || document.documentElement.scrollLeft
  
  const overlay = document.createElement('div')
  overlay.id = 'image-resize-overlay'
  overlay.style.cssText = `
    position: absolute;
    top: ${rect.top + scrollTop}px;
    left: ${rect.left + scrollLeft}px;
    width: ${rect.width}px;
    height: ${rect.height}px;
    border: 2px solid #1a73e8;
    box-sizing: border-box;
    pointer-events: none;
    z-index: 9999;
  `
  
  const handles = ['nw', 'ne', 'sw', 'se']
  const handlePositions = {
    'nw': { top: '-6px', left: '-6px', cursor: 'nwse-resize' },
    'ne': { top: '-6px', right: '-6px', cursor: 'nesw-resize' },
    'sw': { bottom: '-6px', left: '-6px', cursor: 'nesw-resize' },
    'se': { bottom: '-6px', right: '-6px', cursor: 'nwse-resize' }
  }
  
  handles.forEach(handle => {
    const handleEl = document.createElement('div')
    handleEl.className = `resize-handle-${handle}`
    handleEl.style.cssText = `
      position: absolute;
      width: 12px;
      height: 12px;
      background: #1a73e8;
      border: 2px solid white;
      border-radius: 2px;
      cursor: ${handlePositions[handle].cursor};
      pointer-events: auto;
      z-index: 10000;
    `
    
    Object.entries(handlePositions[handle]).forEach(([prop, value]) => {
      if (prop !== 'cursor') {
        handleEl.style[prop] = value
      }
    })
    
    handleEl.addEventListener('mousedown', (e) => {
      e.preventDefault()
      e.stopPropagation()
      startImageResize(e, img, handle, editor, overlay)
    })
    
    overlay.appendChild(handleEl)
  })
  
  document.body.appendChild(overlay)
  activeResizeOverlay = overlay
  
  const closeOnClickOutside = (e) => {
    if (!overlay.contains(e.target) && e.target !== img) {
      hideImageResizeUI()
      document.removeEventListener('click', closeOnClickOutside)
    }
  }
  
  setTimeout(() => {
    document.addEventListener('click', closeOnClickOutside)
  }, 100)
  
  console.log('Resize overlay shown')
}

function hideImageResizeUI() {
  if (activeResizeOverlay) {
    activeResizeOverlay.remove()
    activeResizeOverlay = null
  }
}

function startImageResize(e, img, handle, editor, overlay) {
  console.log('startImageResize:', handle)
  
  const startX = e.clientX
  const startY = e.clientY
  const startWidth = img.offsetWidth
  const startHeight = img.offsetHeight
  const aspectRatio = startWidth / startHeight
  
  const onMouseMove = (moveEvent) => {
    const deltaX = moveEvent.clientX - startX
    const deltaY = moveEvent.clientY - startY
    
    let newWidth = startWidth
    
    if (handle === 'se' || handle === 'ne') {
      newWidth = Math.max(50, startWidth + deltaX)
    } else {
      newWidth = Math.max(50, startWidth - deltaX)
    }
    
    const newHeight = newWidth / aspectRatio
    
    img.style.width = `${newWidth}px`
    img.style.height = `${newHeight}px`
    
    const rect = img.getBoundingClientRect()
    const scrollTop = window.scrollY || document.documentElement.scrollTop
    const scrollLeft = window.scrollX || document.documentElement.scrollLeft
    overlay.style.width = `${rect.width}px`
    overlay.style.height = `${rect.height}px`
    overlay.style.top = `${rect.top + scrollTop}px`
    overlay.style.left = `${rect.left + scrollLeft}px`
  }
  
  const onMouseUp = () => {
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
    
    const newWidth = img.offsetWidth
    const newHeight = img.offsetHeight
    updateImageNodeSize(img, newWidth, newHeight, editor)
    
    console.log('Resize complete:', newWidth, 'x', newHeight)
  }
  
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}

function updateImageNodeSize(img, width, height, editor) {
  const { state } = editor
  let imagePos = null
  
  const numWidth = Math.round(typeof width === 'string' ? parseFloat(width) : width)
  const numHeight = Math.round(typeof height === 'string' ? parseFloat(height) : height)
  
  console.log('updateImageNodeSize called with:', { width: numWidth, height: numHeight })
  
  state.doc.descendants((node, pos) => {
    if (node.type.name === 'image' && node.attrs.src === img.src) {
      imagePos = pos
      console.log('Found image at position:', pos, 'Current attrs:', node.attrs)
      return false
    }
  })
  
  if (imagePos !== null) {
    const { tr } = state
    tr.setNodeMarkup(imagePos, undefined, {
      ...state.doc.nodeAt(imagePos).attrs,
      width: numWidth,
      height: numHeight,
    })
    editor.view.dispatch(tr)
    
    console.log('Image node size updated in TipTap:', { width: numWidth, height: numHeight })
    
    setTimeout(() => {
      const newState = editor.state
      newState.doc.descendants((node, pos) => {
        if (node.type.name === 'image' && node.attrs.src === img.src) {
          console.log('Verified image attrs after update:', node.attrs)
          return false
        }
      })
    }, 100)
  } else {
    console.warn('Could not find image node to update')
  }
}


// Watch for page changes to reinitialize resize handles
watch(() => pages.value.length, () => {
  nextTick(() => {
    pages.value.forEach(page => {
      if (page.editor) {
        attachResizeHandles(page.editor)
      }
    })
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
  box-sizing: border-box;
  object-fit: contain;
}

:deep(.editor-image[src=""]) {
  display: none;
}

:deep(.editor-image:not([src])) {
  display: none;
}

:deep(.editor-image:focus),
:deep(.editor-image.selected) {
  outline: 2px solid #008080;
  outline-offset: 2px;
}

/* Image resize wrapper and handles (Google Docs style) - MUST use :deep() for dynamic elements */
:deep(.image-resize-wrapper) {
  position: relative !important;
  display: inline-block !important;
  max-width: 100% !important;
  margin: 1rem 0 !important;
}

:deep(.image-resize-wrapper.selected .editor-image) {
  outline: 2px solid #1a73e8 !important;
  outline-offset: 2px !important;
}

:deep(.resize-handle) {
  position: absolute !important;
  width: 10px !important;
  height: 10px !important;
  background: #1a73e8 !important;
  border: 2px solid white !important;
  border-radius: 2px !important;
  z-index: 1000 !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3) !important;
}

:deep(.resize-handle-nw) {
  top: -5px !important;
  left: -5px !important;
  cursor: nwse-resize !important;
}

:deep(.resize-handle-ne) {
  top: -5px !important;
  right: -5px !important;
  cursor: nesw-resize !important;
}

:deep(.resize-handle-sw) {
  bottom: -5px !important;
  left: -5px !important;
  cursor: nesw-resize !important;
}

:deep(.resize-handle-se) {
  bottom: -5px !important;
  right: -5px !important;
  cursor: nwse-resize !important;
}

:deep(.resize-handle:hover) {
  background: #1557b0 !important;
  transform: scale(1.2) !important;
}

/* Ensure image wrapper doesn't break layout */
:deep(.image-resize-wrapper .editor-image) {
  margin: 0 !important;
  display: block !important;
}

/* Google Docs-like Table Styling - BLACK BORDERS (MANDATORY) */
:deep(.page-editor) table,
:deep(.page-editor) table.editor-table,
:deep(.page-editor table),
:deep(.page-editor .editor-table),
:deep(.editor-table),
:deep(table.editor-table) {
  border-collapse: collapse !important;
  margin: 1rem 0 !important;
  width: 100% !important;
  border: 2px solid #000000 !important;
  background-color: #fff !important;
  table-layout: auto !important;
  border-spacing: 0 !important;
}

:deep(.page-editor) table td,
:deep(.page-editor) table th,
:deep(.page-editor) table.editor-table td,
:deep(.page-editor) table.editor-table th,
:deep(.page-editor table td),
:deep(.page-editor table th),
:deep(.page-editor .editor-table td),
:deep(.page-editor .editor-table th),
:deep(.editor-table td),
:deep(.editor-table th),
:deep(table.editor-table td),
:deep(table.editor-table th) {
  border: 1px solid #000000 !important;
  padding: 8px 12px !important;
  min-width: 50px !important;
  vertical-align: top !important;
  font-family: inherit !important;
  font-size: inherit !important;
  line-height: inherit !important;
  background-color: #fff !important;
}

:deep(.page-editor) table th,
:deep(.page-editor) table.editor-table th,
:deep(.page-editor table th),
:deep(.page-editor .editor-table th),
:deep(.editor-table th),
:deep(table.editor-table th) {
  background-color: #f8f9fa !important;
  font-weight: 600 !important;
  text-align: left !important;
}

:deep(.page-editor) table tbody tr:hover,
:deep(.page-editor) table.editor-table tbody tr:hover,
:deep(.page-editor table tbody tr:hover),
:deep(.page-editor .editor-table tbody tr:hover),
:deep(.editor-table tbody tr:hover),
:deep(table.editor-table tbody tr:hover) {
  background-color: #f8f9fa !important;
}

:deep(.page-editor) table .selectedCell,
:deep(.page-editor) table.editor-table .selectedCell,
:deep(.page-editor table .selectedCell),
:deep(.page-editor .editor-table .selectedCell),
:deep(.editor-table .selectedCell),
:deep(table.editor-table .selectedCell) {
  background-color: #e8f0fe !important;
}

:deep(.page-editor) table td:first-child,
:deep(.page-editor) table th:first-child,
:deep(.editor-table td:first-child),
:deep(.editor-table th:first-child) {
  border-left: 1px solid #000000 !important;
}

:deep(.page-editor) table td:last-child,
:deep(.page-editor) table th:last-child,
:deep(.editor-table td:last-child),
:deep(.editor-table th:last-child) {
  border-right: 1px solid #000000 !important;
}

:deep(.page-editor) table tr:first-child td,
:deep(.page-editor) table thead th,
:deep(.editor-table tr:first-child td),
:deep(.editor-table thead th) {
  border-top: 1px solid #000000 !important;
}

:deep(.page-editor) table tr:last-child td,
:deep(.editor-table tr:last-child td) {
  border-bottom: 1px solid #000000 !important;
}

/* Table cell paragraph styling */
:deep(.page-editor table p),
:deep(.editor-table p) {
  margin: 0 !important;
}

/* Hidden file input */
.hidden-input {
  display: none;
}

/* Table Grid Selector (Google Docs style) */
.table-selector-container {
  position: relative;
}

.table-grid-selector {
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 0.5rem;
  z-index: 1000;
  margin-top: 0.25rem;
}

.table-grid {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 2px;
  margin-bottom: 0.5rem;
}

.table-grid-row {
  display: contents;
}

.table-grid-cell {
  width: 16px;
  height: 16px;
  border: 1px solid #d1d5db;
  background: white;
  cursor: pointer;
  transition: background-color 0.1s;
}

.table-grid-cell:hover,
.table-grid-cell.selected {
  background: #008080;
  border-color: #008080;
}

.table-grid-label {
  text-align: center;
  font-size: 0.75rem;
  color: #6b7280;
  padding: 0.25rem;
  border-top: 1px solid #e5e7eb;
}
</style>
