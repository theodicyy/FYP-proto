# Manual Testing Guide for Step 2

## Prerequisites

✅ You should have already run `insert_page1_template_simple.sql` in phpMyAdmin

## Quick Test (phpMyAdmin)

### Step 1: Verify Template Definition Exists

Run this query in phpMyAdmin:

```sql
SELECT 
    id,
    name,
    template_type,
    total_pages,
    version,
    is_active,
    LENGTH(structure_json) as json_length,
    created_at
FROM template_definitions
WHERE name = '26-Page Proposal Template';
```

**Expected Result:**
- Should return **1 row**
- `name`: "26-Page Proposal Template"
- `template_type`: "multipage"
- `total_pages`: 26
- `version`: 1
- `is_active`: 1 (TRUE)
- `json_length`: > 50 (even minimal JSON has some length)

### Step 2: Verify Content Values

Run this query:

```sql
SELECT 
    page_number,
    section_id,
    element_id,
    content_type,
    content_value,
    is_enabled
FROM template_content
WHERE template_definition_id = (
    SELECT id FROM template_definitions WHERE name = '26-Page Proposal Template' LIMIT 1
)
ORDER BY page_number, section_id, element_id;
```

**Expected Result:**
Should return **4 rows**:

1. `page_number: 1`, `section_id: title-section`, `element_id: title-text`
   - `content_value`: "PROPOSAL FOR [INSERT CLIENT NAME]"
   - `is_enabled`: 1

2. `page_number: 1`, `section_id: title-section`, `element_id: date-text`
   - `content_value`: "INSERT DATE [DDMonthYYYY]"
   - `is_enabled`: 1

3. `page_number: 1`, `section_id: footer`, `element_id: footer-left-text`
   - `content_value`: "ASEAN | CHINA | MIDDLE EAST"
   - `is_enabled`: 1

4. `page_number: 1`, `section_id: footer`, `element_id: footer-subtext`
   - `content_value`: "a regional law network"
   - `is_enabled`: 1

### Step 3: Count Verification

Run this to double-check:

```sql
SELECT 
    COUNT(*) as total_content_fields,
    SUM(CASE WHEN is_enabled = 1 THEN 1 ELSE 0 END) as enabled_count
FROM template_content
WHERE template_definition_id = (
    SELECT id FROM template_definitions WHERE name = '26-Page Proposal Template' LIMIT 1
);
```

**Expected Result:**
- `total_content_fields`: 4
- `enabled_count`: 4

## ✅ Success Criteria

- ✅ Template definition exists with correct name and type
- ✅ 4 content entries exist
- ✅ All content entries have `is_enabled = 1`
- ✅ Content values match expected text

## ❌ Common Issues

**Issue**: "No rows returned" for template_definitions query
- **Solution**: Run `insert_page1_template_simple.sql` first

**Issue**: Only 1-3 content rows instead of 4
- **Solution**: Re-run the INSERT statements for template_content in the SQL script

**Issue**: Template exists but content is missing
- **Solution**: The subquery `(SELECT id FROM...)` might have failed. Check if template_definitions.id exists first.

## Next Steps

Once all tests pass, proceed to **Step 3: Backend Repository Layer**
