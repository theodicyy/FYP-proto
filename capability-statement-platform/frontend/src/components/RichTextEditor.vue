<template>
  <div class="rich-text-editor">
    <!-- Toolbar -->
    <div class="editor-toolbar" v-if="editor">
      <!-- Text Formatting -->
      <div class="toolbar-group">
        <button
          @click="editor.chain().focus().toggleBold().run()"
          :class="{ 'is-active': editor.isActive('bold') }"
          class="toolbar-btn"
          title="Bold"
        >
          <strong>B</strong>
        </button>
        <button
          @click="editor.chain().focus().toggleItalic().run()"
          :class="{ 'is-active': editor.isActive('italic') }"
          class="toolbar-btn"
          title="Italic"
        >
          <em>I</em>
        </button>
      </div>
      
      <!-- Color Picker -->
      <div class="toolbar-group">
        <input
          type="color"
          @input="editor.chain().focus().setColor($event.target.value).run()"
          class="color-picker"
          title="Text Color"
          :value="getCurrentColor()"
        />
      </div>
      
      <!-- Table -->
      <div class="toolbar-group">
        <button
          @click="insertTable"
          class="toolbar-btn"
          title="Insert Table"
        >
          📊 Table
        </button>
        <button
          v-if="editor.isActive('table')"
          @click="editor.chain().focus().deleteTable().run()"
          class="toolbar-btn"
          title="Delete Table"
        >
          ✕ Table
        </button>
        <button
          v-if="editor.isActive('table')"
          @click="editor.chain().focus().addColumnBefore().run()"
          class="toolbar-btn"
          title="Add Column Before"
        >
          +Col
        </button>
        <button
          v-if="editor.isActive('table')"
          @click="editor.chain().focus().addColumnAfter().run()"
          class="toolbar-btn"
          title="Add Column After"
        >
          Col+
        </button>
        <button
          v-if="editor.isActive('table')"
          @click="editor.chain().focus().deleteColumn().run()"
          class="toolbar-btn"
          title="Delete Column"
        >
          -Col
        </button>
        <button
          v-if="editor.isActive('table')"
          @click="editor.chain().focus().addRowBefore().run()"
          class="toolbar-btn"
          title="Add Row Before"
        >
          +Row
        </button>
        <button
          v-if="editor.isActive('table')"
          @click="editor.chain().focus().addRowAfter().run()"
          class="toolbar-btn"
          title="Add Row After"
        >
          Row+
        </button>
        <button
          v-if="editor.isActive('table')"
          @click="editor.chain().focus().deleteRow().run()"
          class="toolbar-btn"
          title="Delete Row"
        >
          -Row
        </button>
      </div>
      
      <!-- Image -->
      <div class="toolbar-group">
        <input
          type="file"
          ref="imageInput"
          @change="handleImageUpload"
          accept="image/*"
          class="hidden-input"
          id="image-upload"
        />
        <button
          @click="$refs.imageInput?.click()"
          class="toolbar-btn"
          title="Insert Image"
        >
          🖼️ Image
        </button>
      </div>
    </div>

    <!-- Editor Content -->
    <EditorContent :editor="editor" class="editor-content" />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import { Table } from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import { dataService } from '../services/dataService.js'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Start typing...'
  },
  templateId: {
    type: Number,
    default: null
  }
})

const emit = defineEmits(['update:modelValue'])

const editor = ref(null)
const imageInput = ref(null)

onMounted(() => {
  editor.value = new Editor({
    extensions: [
      StarterKit,
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
    content: props.modelValue || '',
    onUpdate: ({ editor }) => {
      emit('update:modelValue', editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm focus:outline-none min-h-[300px] p-4',
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
})

onBeforeUnmount(() => {
  if (editor.value) {
    editor.value.destroy()
  }
})

watch(() => props.modelValue, (value) => {
  if (!editor.value) return
  const isSame = editor.value.getHTML() === value
  if (isSame) {
    return
  }
  editor.value.commands.setContent(value || '', false)
})

function insertTable() {
  editor.value.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
}

function getCurrentColor() {
  if (!editor.value) return '#000000'
  return editor.value.getAttributes('textStyle').color || '#000000'
}

function handleImageUpload(event) {
  const file = event.target.files?.[0]
  if (file && file.type.startsWith('image/')) {
    handleImageFile(file)
  }
  // Reset input
  if (imageInput.value) {
    imageInput.value.value = ''
  }
}

async function handleImageFile(file) {
  try {
    // Try to upload to server first (if templateId provided)
    if (props.templateId) {
      try {
        const formData = new FormData()
        formData.append('image', file)
        const response = await dataService.uploadTemplateImage(props.templateId, formData)
        const imageUrl = response.data.url || response.data.imageUrl
        editor.value.chain().focus().setImage({ src: imageUrl }).run()
        return
      } catch (uploadError) {
        console.warn('Image upload failed, using base64 fallback:', uploadError)
        // Fall through to base64
      }
    }
    
    // Fallback to base64 if upload fails or templateId not provided
    const reader = new FileReader()
    reader.onload = (e) => {
      const base64 = e.target.result
      editor.value.chain().focus().setImage({ src: base64 }).run()
    }
    reader.readAsDataURL(file)
  } catch (error) {
    console.error('Error handling image:', error)
  }
}
</script>

<style scoped>
.rich-text-editor {
  border: none;
  border-radius: 0;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.editor-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.125rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e5e7eb;
  background: #ffffff;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.toolbar-group {
  display: flex;
  gap: 0.125rem;
  padding: 0 0.5rem;
  border-right: 1px solid #e5e7eb;
  align-items: center;
}

.toolbar-group:last-child {
  border-right: none;
}

.toolbar-btn {
  padding: 0.5rem 0.625rem;
  border: none;
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background-color 0.15s;
  white-space: nowrap;
  color: #374151;
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
  background: white;
}

.hidden-input {
  display: none;
}

.editor-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  background: #f9fafb;
}

/* TipTap Editor Styles - Google Docs/Word-like appearance */
:deep(.ProseMirror) {
  outline: none;
  min-height: calc(100vh - 300px);
  background: white;
  margin: 0 auto;
  padding: 96px 96px 96px 96px;
  max-width: 816px; /* Letter size width in pixels at 96 DPI */
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05);
  color: #202124;
  font-family: 'Google Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 14px;
  line-height: 1.6;
}

:deep(.ProseMirror p.is-editor-empty:first-child::before) {
  color: #9ca3af;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
  font-style: italic;
}

/* Typography improvements */
:deep(.ProseMirror p) {
  margin: 0 0 0.75rem 0;
}

:deep(.ProseMirror p:last-child) {
  margin-bottom: 0;
}

:deep(.ProseMirror h1) {
  font-size: 2rem;
  font-weight: 400;
  margin: 1.5rem 0 0.75rem 0;
  line-height: 1.3;
  color: #202124;
}

:deep(.ProseMirror h2) {
  font-size: 1.5rem;
  font-weight: 400;
  margin: 1.25rem 0 0.5rem 0;
  line-height: 1.3;
  color: #202124;
}

:deep(.ProseMirror h3) {
  font-size: 1.25rem;
  font-weight: 400;
  margin: 1rem 0 0.5rem 0;
  line-height: 1.3;
  color: #202124;
}

:deep(.ProseMirror ul),
:deep(.ProseMirror ol) {
  margin: 0.5rem 0;
  padding-left: 2rem;
}

:deep(.ProseMirror li) {
  margin: 0.25rem 0;
}

:deep(.editor-table) {
  border-collapse: collapse;
  margin: 1rem 0;
  overflow: hidden;
  table-layout: fixed;
  width: 100%;
}

:deep(.editor-table td),
:deep(.editor-table th) {
  border: 1px solid #ddd;
  box-sizing: border-box;
  min-width: 1em;
  padding: 0.5rem;
  position: relative;
  vertical-align: top;
}

:deep(.editor-table th) {
  background-color: #f1f3f5;
  font-weight: 600;
}

:deep(.editor-image) {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 1rem 0;
  cursor: pointer;
  border-radius: 4px;
}

:deep(.editor-image:hover) {
  opacity: 0.9;
}

</style>