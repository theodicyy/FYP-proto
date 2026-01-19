# PDF Download Implementation - Manual Changes

Since automated edits aren't applying, here are the exact changes needed for `/capability-statement-platform/frontend/src/views/Library.vue`:

## Change 1: Add Download Button (after line 112)

Find this section:
```vue
        <div class="mb-4 flex gap-2">
          <button 
            @click="editStatement(viewingStatement.id)" 
            class="btn btn-primary"
          >
            Edit
          </button>
        </div>
```

Replace with:
```vue
        <div class="mb-4 flex gap-2">
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
        </div>
```

## Change 2: Add html2pdf Import (after line 173)

Find:
```javascript
import dataService from '../services/dataService'
```

Replace with:
```javascript
import dataService from '../services/dataService'
import html2pdf from 'html2pdf.js'
```

## Change 3: Add Computed Properties (after line 194, before formatDate function)

Find:
```javascript
  return viewingStatement.value.latest_version?.content || ''
})

function formatDate(dateString) {
```

Replace with:
```javascript
  return viewingStatement.value.latest_version?.content || ''
})

const hasSelectedVersion = computed(() => {
  if (!viewingStatement.value || !selectedVersion.value) return false
  return viewingStatement.value.versions?.some(v => v.id === selectedVersion.value) || false
})

const selectedVersionData = computed(() => {
  if (!viewingStatement.value || !selectedVersion.value) return null
  return viewingStatement.value.versions?.find(v => v.id === selectedVersion.value) || null
})

function formatDate(dateString) {
```

## Change 4: Add downloadVersion Function (before onMounted, after isHTMLContent)

Find:
```javascript
function isHTMLContent(content) {
  if (!content || typeof content !== 'string') return false
  // Check if content contains HTML tags
  const htmlTagPattern = /<[a-z][\s\S]*>/i
  return htmlTagPattern.test(content)
}

onMounted(async () => {
```

Replace with:
```javascript
function isHTMLContent(content) {
  if (!content || typeof content !== 'string') return false
  // Check if content contains HTML tags
  const htmlTagPattern = /<[a-z][\s\S]*>/i
  return htmlTagPattern.test(content)
}

async function downloadVersion() {
  // Step 2: Version Selection - Ensure version is selected
  if (!selectedVersion.value || !viewingStatement.value || !selectedVersionData.value) {
    alert('Please select a version to download')
    return
  }
  
  // Step 3: PDF Generation - Generate PDF from selected version content
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
      filename: `${viewingStatement.value.title || 'capability-statement'}_v${version.version_number}.pdf`,
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

onMounted(async () => {
```

## Summary

All changes are ready. The implementation:
- ✅ Adds Download Version button (Step 1)
- ✅ Validates version selection (Step 2)  
- ✅ Generates PDF from database content (Step 3)
- ✅ Uses html2pdf.js (already installed)
- ✅ Only downloads saved versions
- ✅ No regeneration or mutation
