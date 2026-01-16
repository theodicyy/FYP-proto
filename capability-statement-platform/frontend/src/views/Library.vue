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
                <span :class="[
                  'px-2 py-1 rounded-full text-xs font-medium',
                  statement.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                ]">
                  {{ statement.status }}
                </span>
              </td>
              <td>{{ formatDate(statement.created_at) }}</td>
              <td>{{ statement.latest_version?.version_number || '-' }}</td>
              <td>
                <div class="flex gap-2">
                  <button @click="viewStatement(statement.id)" class="text-primary-600 hover:text-primary-800 text-sm">
                    View
                  </button>
                  <button @click="duplicateStatement(statement.id)" class="text-primary-600 hover:text-primary-800 text-sm">
                    Duplicate
                  </button>
                </div>
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

    <!-- View Modal -->
    <div v-if="viewingStatement" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
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
            v-if="!capStore.isEditing"
          >
            Edit
          </button>
          <button 
            @click="saveEdits(viewingStatement.id)" 
            class="btn btn-primary"
            v-if="capStore.isEditing"
            :disabled="capStore.loading"
          >
            {{ capStore.loading ? 'Saving...' : 'Save Edits' }}
          </button>
          <button 
            @click="cancelEdits" 
            class="btn btn-secondary"
            v-if="capStore.isEditing"
          >
            Cancel
          </button>
        </div>

        <!-- Edit Mode -->
        <div v-if="capStore.isEditing" class="space-y-4">
          <textarea
            v-model="capStore.editedContent"
            class="input font-mono text-sm"
            rows="20"
            placeholder="Edit the capability statement content..."
          ></textarea>
        </div>
        <!-- View Mode -->
        <div v-else class="bg-gray-50 p-6 rounded-lg font-mono text-sm whitespace-pre-wrap">
          {{ currentVersionContent }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCapStatementStore } from '../stores/capStatementStore'

const capStore = useCapStatementStore()
const viewingStatement = ref(null)
const selectedVersion = ref(null)

const currentVersionContent = computed(() => {
  if (!viewingStatement.value) return ''
  // If editing, show edited content from store
  if (capStore.isEditing) {
    return capStore.editedContent
  }
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

function formatDate(dateString) {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString()
}

async function viewStatement(id) {
  try {
    await capStore.fetchStatementById(id)
    viewingStatement.value = capStore.currentStatement
    if (viewingStatement.value.latest_version) {
      selectedVersion.value = viewingStatement.value.latest_version.id
    }
    // Reset editing state when viewing
    capStore.isEditing = false
  } catch (error) {
    alert('Error loading statement: ' + error.message)
  }
}

function editStatement(id) {
  if (!viewingStatement.value) {
    viewStatement(id)
    return
  }
  capStore.startEditing()
}

function cancelEdits() {
  capStore.cancelEditing()
  // Reload statement to revert
  if (viewingStatement.value) {
    viewStatement(viewingStatement.value.id)
  }
}

async function saveEdits(id) {
  try {
    await capStore.saveEdits(id)
    // Reload statement to show updated content
    await viewStatement(id)
    alert('Edits saved successfully!')
  } catch (error) {
    alert('Error saving edits: ' + error.message)
  }
}

function loadVersion() {
  // Version content is loaded via computed property
  // Reset editing when changing versions
  if (capStore.isEditing) {
    capStore.cancelEditing()
  }
}

function duplicateStatement(id) {
  // Mock duplicate functionality
  alert('Duplicate functionality - to be implemented')
}

onMounted(async () => {
  await capStore.fetchStatements()
})
</script>
