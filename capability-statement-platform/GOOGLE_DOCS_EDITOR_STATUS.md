# Google Docs-like Inline Editor - Implementation Status

## ✅ Completed

1. **New InlineDocumentEditor Component** (`/frontend/src/components/InlineDocumentEditor.vue`)
   - Minimal toolbar with: Bold, Italic, Underline (needs extension), Font Color, Table, Image, Add Page
   - Multi-page document structure with A4 dimensions (816px × 1123px)
   - Page boundaries with subtle styling
   - Document serialization (JSON format)
   - Vertical scrolling only (no horizontal scroll)

2. **Page System**
   - A4-sized pages with proper margins (96px = 1 inch)
   - "Add Page" button functionality
   - Page break indicators
   - Multiple editable pages

3. **Toolbar Features**
   - Bold/Italic formatting
   - Font color picker
   - Table insertion
   - Image picker (from existing assets)
   - Add Page button

## ⚠️ Needs Installation

```bash
npm install @tiptap/extension-underline
```

Without this, the underline button will show an error in console but won't break the editor.

## 🔨 In Progress / TODO

### 1. Integration into TemplatesManagement
- Replace side-by-side preview/editor with full-width inline editor
- Update modal layout to single-column full-width
- Remove preview panel (editor is WYSIWYG)

### 2. Image Resize Handles (Complex - Needs Custom Implementation)
- TipTap's Image extension doesn't natively support drag-to-resize
- Options:
  - Use third-party extension (if available)
  - Custom TipTap extension with resize handles
  - CSS resize (limited browser support)
  - Custom Vue component wrapper around images

**Status**: Not implemented yet. This requires significant custom work.

### 3. Save on Confirm (Not Auto-save)
- Currently emits `content-changed` on every update
- Need to:
  - Remove auto-emit
  - Add explicit "Confirm/Save" button
  - Serialize full document structure to JSON
  - Save to database on confirm only

### 4. Data Model Updates
- Current: Stores HTML content per field
- Needed: Store full document structure (pages, content, image metadata)
- Database schema may need extension for:
  - Page structure
  - Image dimensions/position
  - Full document JSON

### 5. Document Loading
- `loadDocument()` function exists but needs integration
- Load existing template content into editor
- Parse stored JSON structure

## 📋 Next Steps

1. **Immediate**: Integrate InlineDocumentEditor into TemplatesManagement view
2. **High Priority**: Implement save-on-confirm (remove auto-save)
3. **Complex**: Image resize handles (requires custom TipTap extension or wrapper)
4. **Medium**: Update data model to support full document structure
5. **Testing**: Load/save cycle verification

## 🎯 Current Architecture

```
InlineDocumentEditor.vue
├── Toolbar (sticky, minimal)
├── Document Pages Container
│   ├── Page 1 (A4 dimensions)
│   ├── Page 2 (A4 dimensions)
│   └── ...
└── Image Picker Modal

Each page has its own TipTap Editor instance
Document serializes to: { pages: [{ id, content, json }, ...] }
```

## 🔄 Integration Plan

1. Replace `TemplateContentEditor` usage in `TemplatesManagement.vue`
2. Update modal to full-width layout
3. Connect save button to `serializeDocument()` method
4. Update backend API to handle document JSON structure
5. Implement image resize (custom solution needed)
