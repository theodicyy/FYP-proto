-- Insert Page 1 Template Definition (Step 2 - Simplified Version)
-- This script inserts a minimal template definition for testing
-- Full JSON structure will be loaded via backend API in later steps
--
-- TESTING: Run this to create a template entry, then use backend API to load full JSON

USE capability_statement_db;

-- Step 1: Insert template definition (structure_json will be updated via API later)
INSERT INTO template_definitions (
    name,
    description,
    template_type,
    total_pages,
    structure_json,
    styles_json,
    version,
    is_active
) VALUES (
    '26-Page Proposal Template',
    'Multi-page client-ready proposal template. Page 1 structure stored as JSON schema.',
    'multipage',
    26,
    '{"templateName":"26-Page Proposal Template","templateType":"multipage","totalPages":26,"pages":[{"pageNumber":1,"pageType":"cover"}]}',
    '{}',
    1,
    TRUE
);

-- Step 2: Insert default content values for Page 1 editable fields
INSERT INTO template_content (
    template_definition_id,
    page_number,
    section_id,
    element_id,
    content_type,
    content_value,
    is_enabled
) VALUES
-- Title text (editable)
((SELECT id FROM template_definitions WHERE name = '26-Page Proposal Template' LIMIT 1), 1, 'title-section', 'title-text', 'text', 'PROPOSAL FOR [INSERT CLIENT NAME]', TRUE),
-- Date text (editable)
((SELECT id FROM template_definitions WHERE name = '26-Page Proposal Template' LIMIT 1), 1, 'title-section', 'date-text', 'text', 'INSERT DATE [DDMonthYYYY]', TRUE),
-- Footer left text (editable)
((SELECT id FROM template_definitions WHERE name = '26-Page Proposal Template' LIMIT 1), 1, 'footer', 'footer-left-text', 'text', 'ASEAN | CHINA | MIDDLE EAST', TRUE),
-- Footer subtext (editable)
((SELECT id FROM template_definitions WHERE name = '26-Page Proposal Template' LIMIT 1), 1, 'footer', 'footer-subtext', 'text', 'a regional law network', TRUE);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verify template was created
SELECT 
    id,
    name,
    template_type,
    total_pages,
    version,
    is_active,
    created_at
FROM template_definitions
WHERE name = '26-Page Proposal Template';

-- Verify content values
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
