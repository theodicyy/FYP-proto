# Footer Troubleshooting Guide

## Issue
Footer is not updating when generating the CAP statement.

## Available Footer Placeholders

The following footer-related placeholders are now available in your Word template:

### Combined Footer Text (Pre-formatted)
- `{footer_proposal_text}` - Full text: "Proposal for [Client Name] – [Tender Number]" (if tender exists)
- `{footer_text}` - Alias for footer_proposal_text
- `{proposal_footer}` - Alias for footer_proposal_text

### Individual Footer Fields
- `{footer_client_name}` - Client name only
- `{footer_tender_number}` - Tender number only
- `{client_name}` - Client name (also available in footer)
- `{tender_number}` - Tender number (also available in footer)

## How to Use in Word Template

### Option 1: Use Combined Placeholder (Recommended)
In your Word template footer, use:
```
{footer_proposal_text}
```

This will automatically show:
- "Proposal for Acme Corporation – T-2024-001" (if both client and tender exist)
- "Proposal for Acme Corporation" (if only client exists)
- "" (empty if no client)

### Option 2: Use Individual Placeholders
If your template has the text structure already, use:
```
Proposal for {client_name}{#tender_number} – {tender_number}{/tender_number}
```

Or simpler:
```
Proposal for {client_name} – {tender_number}
```
(Note: This will show " – " even if tender_number is empty)

### Option 3: Conditional Formatting (Advanced)
If using docxtemplater conditionals:
```
Proposal for {client_name}{#tender_number} – {tender_number}{/tender_number}
```

## Debugging Steps

1. **Check Backend Logs**: Look for "Footer mapping" log entries to see what values are being generated
2. **Check Console Logs**: Look for "Footer payload fields" to see what's being sent to docxtemplater
3. **Verify Template Placeholder**: Make sure the placeholder name in your Word template matches one of the available placeholders above
4. **Test with Simple Placeholder**: Try using `{client_name}` directly in the footer to verify footer placeholders work at all

## Common Issues

### Issue: Footer shows empty
**Possible causes:**
- Placeholder name doesn't match (check spelling, case sensitivity)
- Client name not provided in form
- Footer placeholder is in wrong location (should be in footer section, not body)

**Solution:**
- Verify `client_name` is filled in the Configuration form
- Check backend logs to see if `footer_proposal_text` has a value
- Try using `{client_name}` directly to test

### Issue: Footer shows placeholder text literally
**Possible causes:**
- Placeholder syntax incorrect (should be `{name}`, not `{{name}}` or `[name]`)
- Placeholder is in a text box or shape (docxtemplater may not process these)

**Solution:**
- Use plain text in footer, not text boxes
- Ensure placeholder uses single curly braces: `{footer_proposal_text}`

### Issue: Tender number not showing
**Possible causes:**
- Tender number not provided in form
- Conditional logic not working

**Solution:**
- Verify `tender_number` is filled in Configuration form
- Check logs to see if `footer_tender_number` has a value
- Use `{footer_proposal_text}` which handles conditional display automatically

## Testing

To test footer functionality:

1. Fill in Configuration form:
   - Client name: "Acme Corporation"
   - Tender number: "T-2024-001" (optional)

2. Generate document

3. Check backend logs for:
   ```
   Footer mapping: {
     client_name: "Acme Corporation",
     tender_number: "T-2024-001",
     footer_proposal_text: "Proposal for Acme Corporation – T-2024-001"
   }
   ```

4. Check console logs for:
   ```
   Footer payload fields: {
     footer_proposal_text: "Proposal for Acme Corporation – T-2024-001",
     ...
   }
   ```

## Next Steps

If footer still doesn't work:

1. **Check Template**: Open your Word template and verify:
   - Footer section is accessible
   - Placeholder name matches exactly (case-sensitive)
   - Placeholder is in plain text, not a text box

2. **Check Placeholder Name**: The placeholder in your template might be different. Common variations:
   - `{footer}`
   - `{footer_text}`
   - `{proposal_text}`
   - `{client_footer}`

3. **Contact Support**: If none of the above work, provide:
   - Screenshot of footer section in Word template
   - Exact placeholder text used
   - Backend log output showing footer mapping
