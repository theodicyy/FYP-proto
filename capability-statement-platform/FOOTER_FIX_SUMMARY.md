# Footer Fix Summary

## Issue Identified

The footer in the generated CAP statement is not updating with client name and tender number.

## Root Cause Analysis

### Template Placeholders Found
Using the placeholder extraction script, I found that **footer3.xml** contains:
- `{client_name}` 
- `{tender_number}`

The template uses **separate placeholders**, not a combined one like `{footer_proposal_text}`.

### Current Code Status

✅ **What's Working:**
1. `capStatementService.js` extracts `client_name` and `tender_number` from `manualFields`
2. These values are passed in the payload (both via `...manualFields` spread and explicitly)
3. Multiple footer placeholder variations are provided for compatibility

✅ **Code Changes Made:**
1. Added more footer placeholder variations (`footer`, `proposal_text`, `client_footer`)
2. Added comprehensive debug logging to track footer values
3. Added validation to ensure values are strings and trimmed
4. Added payload verification logging

## Next Steps to Debug

### 1. Check Backend Logs
When you generate a document, check the backend console/logs for:

```
Manual fields received: {
  client_name: "...",
  tender_number: "..."
}

Footer mapping: {
  client_name: "...",
  tender_number: "...",
  ...
}

Payload verification: {
  has_client_name: true,
  client_name_value: "...",
  has_tender_number: true,
  tender_number_value: "..."
}
```

### 2. Check Console Logs
Look for:
```
=== FOOTER DEBUG INFO ===
Footer payload fields: { ... }
✅ Footer placeholders found: { ... }
```

### 3. Verify Frontend Data
Ensure the Configuration form is sending:
- `client_name` field is filled
- `tender_number` field is filled (optional)

### 4. Check Template Structure
Open `Cap Statement Template V1.docx` and:
1. Go to footer section (footer3.xml corresponds to footer on page 3)
2. Verify the placeholder text is exactly: `{client_name}` and `{tender_number}`
3. Check if there's any text like "Proposal for {client_name} – {tender_number}" in the footer

## Possible Issues

### Issue 1: Values Not Being Sent from Frontend
**Check:** Backend logs should show `client_name` and `tender_number` values
**Fix:** Ensure Configuration form is properly bound to `capStore.manualFields`

### Issue 2: Template Placeholder Mismatch
**Check:** Template might have different placeholder names
**Fix:** Use the extraction script to verify exact placeholder names:
```bash
cd backend
node scripts/extract-template-placeholders.js
```

### Issue 3: Footer Section Not Being Processed
**Check:** Docxtemplater might not be processing footer sections
**Fix:** Verify docxtemplater configuration includes footer processing

### Issue 4: Empty Values
**Check:** Values might be empty strings
**Fix:** Ensure form fields are filled before generating

## Testing

1. Fill in Configuration form:
   - Client name: "Test Client"
   - Tender number: "T-2024-001"

2. Generate document

3. Check logs for footer values

4. Open generated document and check footer

## Files Modified

1. `backend/src/services/capStatementService.js`
   - Added more footer placeholder variations
   - Added debug logging
   - Added value validation

2. `backend/src/services/docGenerator.js`
   - Added comprehensive footer debug logging
   - Added payload verification

3. `backend/scripts/extract-template-placeholders.js` (NEW)
   - Script to extract all placeholders from template

## Expected Behavior

When `client_name` = "Acme Corporation" and `tender_number` = "T-2024-001":
- Footer should show: "Proposal for Acme Corporation – T-2024-001" (if template has this structure)
- OR footer should show: "Acme Corporation – T-2024-001" (if template only has placeholders)

## If Still Not Working

1. Share backend logs showing footer values
2. Share the exact placeholder text from the template footer
3. Verify the generated document footer content
