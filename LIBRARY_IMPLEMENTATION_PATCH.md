# Library.vue Implementation Patch

This document contains the exact code changes needed to implement:
1. Download Version button (PDF download)
2. Inline Status Editing (with 3 status options)

## Quick Reference: All Changes Needed

Since automated edits aren't applying, here are the exact changes:

### Change 1: Status Column (Lines 25-32)
Replace the status `<span>` with inline editor

### Change 2: Actions Column (Lines 35-44)  
Remove Duplicate button

### Change 3: Download Button (Lines 106-113)
Add Download Version button

### Change 4: Import html2pdf (Line 173)
Add import statement

### Change 5: Add reactive variables (Line 180)
Add status editing refs

### Change 6: Add computed properties (After line 194)
Add hasSelectedVersion and selectedVersionData

### Change 7: Add functions (Before isHTMLContent, line 384)
Add all status and download functions

### Change 8: Remove duplicateStatement (Line 379-382)
Delete the function

### Change 9: Add CSS (After line 397)
Add status-select styles

## File Location
`/capability-statement-platform/frontend/src/views/Library.vue`

## Note
The detailed implementation guide is in:
- `/STATUS_EDIT_CHANGES.md` (for status editing)
- `/LIBRARY_PDF_CHANGES.md` (for PDF download)
