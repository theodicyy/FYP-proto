<template>
  <div>
    <h1 class="text-3xl font-bold mb-6">Preview</h1>
    
    <div v-if="capStore.error" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
      {{ capStore.error }}
    </div>

    <div class="card mb-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold">Statement Content</h2>
        <div class="flex gap-2">
          <!-- Edit Mode Controls -->
          <template v-if="capStore.isEditing">
            <button @click="saveEdits" class="btn btn-primary" :disabled="capStore.loading || saving">
              {{ saving ? 'Saving...' : 'Save Edits' }}
            </button>
            <button @click="cancelEdits" class="btn btn-secondary" :disabled="capStore.loading">
              Cancel
            </button>
          </template>
          <!-- View Mode Controls -->
          <template v-else>
            <button @click="startEditing" class="btn btn-primary" :disabled="capStore.loading">
              Edit
            </button>
            <button @click="saveStatement" class="btn btn-primary" :disabled="capStore.loading || saving">
              {{ saving ? 'Saving...' : 'Save Statement' }}
            </button>
            <button @click="exportStatement" class="btn btn-secondary">
              Export
            </button>
          </template>
        </div>
      </div>
      
      <div v-if="capStore.loading" class="text-center py-8">Generating statement...</div>
      <!-- Edit Mode -->
      <div v-else-if="capStore.isEditing" class="space-y-4">
        <textarea
          v-model="capStore.editedContent"
          class="input font-mono text-sm"
          rows="20"
          placeholder="Edit the capability statement content..."
        ></textarea>
        <p class="text-sm text-gray-500">
          Make your edits above. Click "Save Edits" to persist changes or "Cancel" to revert.
        </p>
      </div>
      <!-- View Mode -->
      <div v-else class="bg-gray-50 p-6 rounded-lg">
        <!-- Render as HTML if content appears to be HTML, otherwise as plain text -->
        <div 
          v-if="isHTMLContent(displayContent)" 
          v-html="displayContent"
          class="generated-report-html"
        ></div>
        <div 
          v-else
          class="font-mono text-sm whitespace-pre-wrap generated-report-text"
        >{{ displayContent }}</div>
      </div>
    </div>

    <!-- Save Modal -->
    <div v-if="showSaveModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 class="text-xl font-semibold mb-4">Save Statement</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Title *</label>
            <input v-model="saveData.title" type="text" class="input" placeholder="Enter statement title" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Description</label>
            <textarea v-model="saveData.description" class="input" rows="3" placeholder="Optional description"></textarea>
          </div>
          <div class="flex gap-2 justify-end">
            <button @click="showSaveModal = false" class="btn btn-secondary">Cancel</button>
            <button @click="confirmSave" class="btn btn-primary" :disabled="!saveData.title">
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useDataStore } from '../stores/dataStore'
import { useCapStatementStore } from '../stores/capStatementStore'

const router = useRouter()
const dataStore = useDataStore()
const capStore = useCapStatementStore()

const showSaveModal = ref(false)
const saving = ref(false)
const saveData = ref({
  title: '',
  description: ''
})

// Display content: edited if exists, else generated
const displayContent = computed(() => {
  if (capStore.currentStatement) {
    return capStore.currentStatement.display_content || 
           capStore.currentStatement.edited_content || 
           capStore.currentStatement.generated_content || 
           'No content available.'
  }
  return capStore.generatedContent || 'No content generated yet.'
})

function startEditing() {
  capStore.startEditing()
}

function cancelEdits() {
  capStore.cancelEditing()
}

async function saveEdits() {
  if (!capStore.currentStatement) {
    alert('No statement loaded. Please save the statement first.')
    return
  }

  saving.value = true
  try {
    await capStore.saveEdits(capStore.currentStatement.id)
    alert('Edits saved successfully!')
  } catch (error) {
    alert('Error saving edits: ' + error.message)
  } finally {
    saving.value = false
  }
}

function saveStatement() {
  showSaveModal.value = true
}

async function confirmSave() {
  if (!saveData.value.title) {
    alert('Title is required')
    return
  }

  saving.value = true
  try {
    const dealIds = dataStore.selectedDeals.map(d => d.id)
    const awardIds = dataStore.selectedAwards.map(a => a.id)
    const lawyerIds = dataStore.selectedLawyers.map(l => l.id)

    await capStore.saveStatement(
      saveData.value.title,
      saveData.value.description,
      dealIds,
      awardIds,
      lawyerIds,
      capStore.generatedContent
    )
    
    alert('Statement saved successfully!')
    showSaveModal.value = false
    router.push('/library')
  } catch (error) {
    alert('Error saving statement: ' + error.message)
  } finally {
    saving.value = false
  }
}

function exportStatement() {
  // Export current display content
  const content = displayContent.value
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'capability-statement.txt'
  a.click()
  URL.revokeObjectURL(url)
}

function isHTMLContent(content) {
  if (!content || typeof content !== 'string') return false
  // Check if content contains HTML tags
  const htmlTagPattern = /<[a-z][\s\S]*>/i
  return htmlTagPattern.test(content)
}
</script>

<style scoped>
.generated-report-html {
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

.generated-report-html :deep(p) {
  margin: 0 0 0.75rem 0;
}

.generated-report-html :deep(p:last-child) {
  margin-bottom: 0;
}

.generated-report-html :deep(img) {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 1rem 0;
}

.generated-report-html :deep(table) {
  border-collapse: collapse;
  margin: 1rem 0;
  width: 100%;
}

.generated-report-html :deep(table td),
.generated-report-html :deep(table th) {
  border: 1px solid #ddd;
  padding: 0.5rem;
}

.generated-report-text {
  background: white;
  padding: 2rem;
  border-radius: 4px;
}
</style>