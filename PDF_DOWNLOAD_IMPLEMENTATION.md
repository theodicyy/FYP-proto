# PDF Download Implementation Guide

## Summary

I've implemented PDF download functionality for capability statement versions. The implementation follows the step-by-step approach requested.

## Changes Made

### Step 1: Download Button (UI Only)
- Added "Download Version" button next to "Edit" button
- Button is disabled when no version is selected
- Uses `btn btn-secondary` styling

### Step 2: Version Selection
- Version selection already exists via dropdown
- Added validation to ensure version is selected before download
- Added `hasSelectedVersion` computed property for button state
- Added `selectedVersionData` computed property to get version data

### Step 3: PDF Generation
- Imported `html2pdf.js` library (already installed)
- Created `downloadVersion()` function that:
  - Validates version selection
  - Gets content from selected version (from database, not editor)
  - Creates temporary DOM element with proper styling
  - Generates PDF using html2pdf.js
  - Downloads PDF with filename: `{title}_v{version_number}.pdf`
  - Cleans up temporary element

## File Changes

**File**: `/capability-statement-platform/frontend/src/views/Library.vue`

1. Added import: `import html2pdf from 'html2pdf.js'`
2. Added button in template (line ~113)
3. Added computed properties: `hasSelectedVersion`, `selectedVersionData`
4. Added function: `downloadVersion()`

## Key Features

✅ Downloads only saved versions (from database)
✅ Uses exact content from selected version
✅ No regeneration or placeholder parsing
✅ PDF filename includes version number
✅ Proper A4 formatting with margins
✅ Supports both HTML and plain text content
✅ Version identity is explicit (via dropdown selection)

## Usage

1. User opens capability statement
2. User selects a version from dropdown
3. User clicks "Download Version" button
4. PDF is generated and downloaded automatically

## Technical Details

- Uses `html2pdf.js` v0.14.0 (already in package.json)
- PDF format: A4 portrait
- Margins: 96px (1 inch)
- Font: Times New Roman, serif
- Line height: 1.6
- Scale: 2x for better quality
