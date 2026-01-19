#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'capability-statement-platform/frontend/src/views/Library.vue');

console.log('Reading Library.vue...');
let content = fs.readFileSync(filePath, 'utf8');

console.log('Applying changes...');

// Change 1: Replace status column
const oldStatus = `              <td>
                <span :class="[
                  'px-2 py-1 rounded-full text-xs font-medium',
                  statement.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                ]">
                  {{ statement.status }}
                </span>
              </td>`;

const newStatus = `              <td>
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
              </td>`;

content = content.replace(oldStatus, newStatus);
console.log('✓ Status column updated');

// Change 2: Remove duplicate button
const oldActions = `              <td>
                <div class="flex gap-2">
                  <button @click="viewStatement(statement.id)" class="text-primary-600 hover:text-primary-800 text-sm">
                    View
                  </button>
                  <button @click="duplicateStatement(statement.id)" class="text-primary-600 hover:text-primary-800 text-sm">
                    Duplicate
                  </button>
                </div>
              </td>`;

const newActions = `              <td>
                <button @click="viewStatement(statement.id)" class="text-primary-600 hover:text-primary-800 text-sm">
                  View
                </button>
              </td>`;

content = content.replace(oldActions, newActions);
console.log('✓ Duplicate button removed');

// Change 3: Add Download button
const oldDownload = `        <div class="mb-4 flex gap-2">
          <button 
            @click="editStatement(viewingStatement.id)" 
            class="btn btn-primary"
          >
            Edit
          </button>
        </div>`;

const newDownload = `        <div class="mb-4 flex gap-2">
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
        </div>`;

content = content.replace(oldDownload, newDownload);
console.log('✓ Download button added');

// Change 4: Add html2pdf import
content = content.replace(
  "import dataService from '../services/dataService'",
  "import dataService from '../services/dataService'\nimport html2pdf from 'html2pdf.js'"
);
console.log('✓ html2pdf import added');

// Change 5: Add reactive variables
content = content.replace(
  'const showSaveModal = ref(false)',
  `const showSaveModal = ref(false)
const editingStatusId = ref(null)
const editingStatusValue = ref(null)
const statusSelectRef = ref(null)`
);
console.log('✓ Reactive variables added');

// Change 6: Add computed properties
content = content.replace(
  `  return viewingStatement.value.latest_version?.content || ''
})

function formatDate(dateString) {`,
  `  return viewingStatement.value.latest_version?.content || ''
})

const hasSelectedVersion = computed(() => {
  if (!viewingStatement.value || !selectedVersion.value) return false
  return viewingStatement.value.versions?.some(v => v.id === selectedVersion.value) || false
})

const selectedVersionData = computed(() => {
  if (!viewingStatement.value || !selectedVersion.value) return null
  return viewingStatement.value.versions?.find(v => v.id === selectedVersion.value) || null
})

function formatDate(dateString) {`
);
console.log('✓ Computed properties added');

// Change 7: Replace duplicateStatement function with new functions
const oldDuplicate = `function duplicateStatement(id) {
  // Mock duplicate functionality
  alert('Duplicate functionality - to be implemented')
}

function isHTMLContent(content) {`;

const newFunctions = `function getStatusColorClass(status) {
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
    
    // Create a temporary container for PDF generation
    const tempDiv = document.createElement('div')
    tempDiv.style.position = 'absolute'
    tempDiv.style.left = '-9999px'
    tempDiv.style.width = '816px' // A4 width in pixels
    tempDiv.style.padding = '96px' // 1 inch margins
    tempDiv.style.fontFamily = 'Times New Roman, serif'
    tempDiv.style.fontSize = '14px'
    tempDiv.style.lineHeight = '1.6'
    tempDiv.style.color = '#202124'
    tempDiv.style.background = 'white'
    
    // Set content
    if (isHTMLContent(content)) {
      tempDiv.innerHTML = content
    } else {
      tempDiv.textContent = content
      tempDiv.style.whiteSpace = 'pre-wrap'
    }
    
    document.body.appendChild(tempDiv)
    
    // Generate PDF
    const opt = {
      margin: 0,
      filename: \`\${viewingStatement.value.title || 'capability-statement'}_v\${version.version_number}.pdf\`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }
    
    await html2pdf().set(opt).from(tempDiv).save()
    
    // Cleanup
    document.body.removeChild(tempDiv)
  } catch (error) {
    console.error('Error generating PDF:', error)
    alert('Error generating PDF: ' + error.message)
  }
}

function isHTMLContent(content) {`;

content = content.replace(oldDuplicate, newFunctions);
console.log('✓ Functions replaced');

// Change 8: Add CSS styles
const oldStyle = `<style scoped>
.editor-container {
  min-height: 600px;
}
</style>`;

const newStyle = `<style scoped>
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
</style>`;

content = content.replace(oldStyle, newStyle);
console.log('✓ CSS styles added');

// Write the file
fs.writeFileSync(filePath, content, 'utf8');
console.log('\n✅ All changes applied successfully!');
console.log('File saved to:', filePath);
