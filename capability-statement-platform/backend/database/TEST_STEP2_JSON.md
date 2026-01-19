# Step 2 Testing Guide: JSON Schema Extraction

## What Was Created

1. **JSON Structure File**: `backend/templates/page1_structure.json`
   - Contains the complete structure of Page 1 extracted from `Page1Cover.vue`
   - Preserves all styling, positioning, and layout information
   - Identifies editable vs non-editable content

2. **SQL Insert Script**: `backend/database/insert_page1_template.sql`
   - Inserts the JSON structure into `template_definitions` table
   - Inserts default content values into `template_content` table

## How to Test

### Option A: Quick Test (Recommended for now)

Use the simplified SQL script:

1. Open phpMyAdmin
2. Select database: `capability_statement_db`
3. Go to SQL tab
4. Copy and paste the entire `insert_page1_template_simple.sql` file
5. Click "Go"

This creates a minimal template entry. The full JSON structure will be loaded via backend API in Step 3.

### Option B: Full JSON Insert (Advanced)

For testing the full JSON structure:
1. Use `insert_page1_template.sql` (contains full JSON)
2. Or wait for Step 3 when backend API will handle JSON loading

### 2. Verify Template Definition

Run this query:
```sql
SELECT 
    id,
    name,
    template_type,
    total_pages,
    version,
    is_active,
    LENGTH(structure_json) as json_length
FROM template_definitions
WHERE name = '26-Page Proposal Template';
```

**Expected Result:** 1 row with:
- name: "26-Page Proposal Template"
- template_type: "multipage"
- total_pages: 26
- json_length: should be > 1000 (JSON is stored)

### 3. Verify Content Values

Run this query:
```sql
SELECT 
    page_number,
    section_id,
    element_id,
    content_value,
    is_enabled
FROM template_content
WHERE template_definition_id = (
    SELECT id FROM template_definitions WHERE name = '26-Page Proposal Template' LIMIT 1
)
ORDER BY page_number, section_id, element_id;
```

**Expected Result:** 4 rows (editable content fields):
1. title-text: "PROPOSAL FOR [INSERT CLIENT NAME]"
2. date-text: "INSERT DATE [DDMonthYYYY]"
3. footer-left-text: "ASEAN | CHINA | MIDDLE EAST"
4. footer-subtext: "a regional law network"

### 4. Verify JSON Structure (Optional)

To view the actual JSON structure:
```sql
SELECT structure_json
FROM template_definitions
WHERE name = '26-Page Proposal Template';
```

Copy the result and paste into a JSON validator (like jsonlint.com) to verify it's valid JSON.

## Success Criteria

✅ Template definition inserted successfully  
✅ 4 content values inserted (all editable text fields)  
✅ JSON structure is valid and stored  
✅ All content fields are enabled (is_enabled = TRUE)  

## Key Points

- **Structure is immutable**: The JSON structure in `template_definitions` defines the layout
- **Content is editable**: The values in `template_content` can be modified
- **Assets are referenced**: Images are stored as asset paths, not uploaded data
- **Exact styling preserved**: All CSS styles from Page1Cover.vue are captured in JSON

## Next Steps

Once Step 2 is verified:
- ✅ Template definition exists in database
- ✅ Content values are stored
- ✅ JSON structure is valid

Then proceed to **Step 3: Backend Repository Layer**
