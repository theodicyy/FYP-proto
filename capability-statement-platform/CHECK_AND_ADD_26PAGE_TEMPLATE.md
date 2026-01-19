# Check and Add 26-Page Template to Database

## Step 1: Check if Template Exists

Open phpMyAdmin and run this SQL query to check what templates you have:

```sql
USE capability_statement_db;
SELECT id, name, description FROM templates;
```

## Step 2: Add the 26-Page Template (if it doesn't exist)

If you don't see a template with "26-Page" in the name, run this SQL in phpMyAdmin:

```sql
USE capability_statement_db;

INSERT INTO templates (name, description, content) VALUES
('26-Page Proposal Template', 'Multi-page client-ready proposal template with cover page and structured sections. This template uses Vue components for rendering.', 
'[26-PAGE-MULTI-PAGE-TEMPLATE]
This template uses the MultiPageTemplate Vue component system.
Pages are rendered as individual Vue components.
Template ID will be used to identify and load the 26-page structure.
');
```

## Step 3: Verify

After running the INSERT, refresh your Templates Management page in the app. You should now see:
- A template named "26-Page Proposal Template"
- A "Show Preview" button in the Actions column
- Clicking it will expand to show Page 1 preview inline

## Important Notes

- The template name MUST contain "26-page" or "26 page" (case insensitive) for the preview button to appear
- If you want to use a different name, the preview button won't show unless you update the detection logic
- The preview feature only works for templates with "26-page" in the name
