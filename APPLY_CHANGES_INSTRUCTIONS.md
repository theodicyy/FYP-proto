# Instructions to Apply Library.vue Changes

I've created a Node.js script to apply all the changes automatically. Here's how to run it:

## Option 1: Run the Script (Recommended)

1. Open your terminal
2. Navigate to the project root:
   ```bash
   cd "/Users/andy/Desktop/FYP proto"
   ```
3. Run the script:
   ```bash
   node apply_library_changes.js
   ```

The script will automatically apply all changes to `Library.vue`.

## Option 2: Manual Application

If the script doesn't work, you can apply the changes manually using the detailed guides:
- `/STATUS_EDIT_CHANGES.md` - For status editing changes
- `/LIBRARY_PDF_CHANGES.md` - For PDF download changes

## What the Script Does

The script applies these changes:
1. ✅ Replaces status column with inline dropdown editor
2. ✅ Removes Duplicate button from Actions column
3. ✅ Adds Download Version button
4. ✅ Adds html2pdf import
5. ✅ Adds reactive variables for status editing
6. ✅ Adds computed properties for version selection
7. ✅ Replaces duplicateStatement function with status/download functions
8. ✅ Adds CSS styles for status dropdown

## After Running

After the script runs successfully:
1. Check the file for any syntax errors
2. Restart your frontend dev server if needed
3. Test the new features:
   - Click on status badges to edit them
   - Click "Download Version" button to download PDFs
