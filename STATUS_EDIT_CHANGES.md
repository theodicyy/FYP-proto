# Status Inline Editing & Actions Cleanup - Manual Changes

This document provides exact code changes needed for `/capability-statement-platform/frontend/src/views/Library.vue`.

## Change 1: Remove Duplicate Button (Step 1)

**Location:** Lines 35-44

**Find:**
```vue
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
```

**Replace with:**
```vue
              <td>
                <button @click="viewStatement(statement.id)" class="text-primary-600 hover:text-primary-800 text-sm">
                  View
                </button>
              </td>
```

## Change 2: Remove duplicateStatement Function

**Location:** Lines 379-382

**Find:**
```javascript
function duplicateStatement(id) {
  // Mock duplicate functionality
  alert('Duplicate functionality - to be implemented')
}

function isHTMLContent(content) {
```

**Replace with:**
```javascript
function isHTMLContent(content) {
```

## Change 3: Replace Status Display with Inline Editor (Step 2)

**Location:** Lines 25-32

**Find:**
```vue
              <td>
                <span :class="[
                  'px-2 py-1 rounded-full text-xs font-medium',
                  statement.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                ]">
                  {{ statement.status }}
                </span>
              </td>
```

**Replace with:**
```vue
              <td>
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
              </td>
```

## Change 4: Add Reactive Variables

**Location:** After line 180 (after `const showSaveModal = ref(false)`)

**Add:**
```javascript
const editingStatusId = ref(null)
const editingStatusValue = ref(null)
const statusSelectRef = ref(null)
```

## Change 5: Add Status Functions (Step 3)

**Location:** Before `function isHTMLContent` (around line 384)

**Add before `function isHTMLContent(content) {`:**
```javascript
function getStatusColorClass(status) {
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

```

## Change 6: Add CSS Styles

**Location:** In `<style scoped>` section (after line 397)

**Add:**
```css
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
```

## Summary

All changes implement:
- ✅ Removed Duplicate button (Step 1)
- ✅ Inline status dropdown with 3 options (Step 2)
- ✅ Color-coded status badges (Orange, Green, Red)
- ✅ Backend persistence with optimistic updates (Step 3)
- ✅ Click-to-edit, blur-to-cancel UX

The status values are: "In Progress" (orange), "Closed Won" (green), "Closed Lost" (red).
