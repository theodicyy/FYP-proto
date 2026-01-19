-- Insert Page 1 Template Definition (Step 2)
-- This inserts the JSON structure for Page 1 into template_definitions table
-- 
-- TESTING: Run this after Step 1 tables are created
-- Then run the test query at the bottom to verify the data was inserted

USE capability_statement_db;

-- Insert Page 1 template definition
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
    'Multi-page client-ready proposal template with cover page and structured sections. Page 1 structure stored as JSON schema.',
    'multipage',
    26,
    '{"templateName":"26-Page Proposal Template","templateType":"multipage","totalPages":26,"pages":[{"pageNumber":1,"pageType":"cover","pageId":"page-1-cover","pageClass":"page-1-cover","pageStyles":{"width":"210mm","minHeight":"297mm","backgroundColor":"#ffffff","position":"relative","margin":"0","padding":"25mm","boxSizing":"border-box","overflow":"hidden","pageBreakAfter":"always"},"sections":[{"sectionId":"logo-top","sectionClass":"page-1-logo-top","elementType":"image","position":{"position":"absolute","top":"25mm","left":"25mm"},"styles":{"maxWidth":"120mm"},"content":{"contentKey":"logo-top-image","contentType":"asset","defaultValue":"/images/template/Wong_Partnership_Logo_HD_Transparent.png","editable":false,"assetPath":"Wong_Partnership_Logo_HD_Transparent.png"}},{"sectionId":"w-graphic","sectionClass":"page-1-w-graphic","elementType":"image","position":{"position":"absolute","top":"140mm","left":"30mm","width":"160mm","height":"120mm","zIndex":1},"styles":{"width":"100%","height":"100%","objectFit":"contain"},"content":{"contentKey":"w-graphic-image","contentType":"asset","defaultValue":"/images/template/WongP_W_Logo_HD_Transparent.png","editable":false,"assetPath":"WongP_W_Logo_HD_Transparent.png"}},{"sectionId":"title-section","sectionClass":"page-1-title-section","elementType":"container","position":{"position":"absolute","top":"240mm","left":"35mm","zIndex":2},"elements":[{"elementId":"title-text","elementType":"heading","elementTag":"h1","elementClass":"page-1-title","styles":{"fontFamily":"\'Helvetica Neue\', Arial, sans-serif","fontSize":"32pt","fontWeight":"600","color":"#008080","textTransform":"uppercase","letterSpacing":"0.15em","margin":"0","padding":"0","lineHeight":"1.2","whiteSpace":"nowrap"},"content":{"contentKey":"title-text","contentType":"text","defaultValue":"PROPOSAL FOR [INSERT CLIENT NAME]","editable":true,"placeholder":"[INSERT CLIENT NAME]"}},{"elementId":"date-text","elementType":"text","elementTag":"p","elementClass":"page-1-date","styles":{"fontFamily":"\'Helvetica Neue\', Arial, sans-serif","fontSize":"14pt","fontWeight":"400","color":"#555555","margin":"0","marginTop":"12mm","padding":"0","lineHeight":"1.4"},"content":{"contentKey":"date-text","contentType":"text","defaultValue":"INSERT DATE [DDMonthYYYY]","editable":true,"placeholder":"[DDMonthYYYY]"}}]},{"sectionId":"footer","sectionClass":"page-1-footer","elementType":"container","position":{"position":"absolute","bottom":"25mm","left":"25mm","right":"25mm","display":"flex","justifyContent":"space-between","alignItems":"flex-end"},"elements":[{"elementId":"footer-left-text","elementType":"text","elementTag":"div","elementClass":"page-1-footer-left","styles":{"fontFamily":"\'Helvetica Neue\', Arial, sans-serif","fontSize":"9pt","color":"#666666","textTransform":"uppercase","letterSpacing":"0.1em"},"content":{"contentKey":"footer-left-text","contentType":"text","defaultValue":"ASEAN | CHINA | MIDDLE EAST","editable":true}},{"elementId":"footer-right","elementType":"container","elementClass":"page-1-footer-right","styles":{"display":"flex","flexDirection":"column","alignItems":"flex-end"},"elements":[{"elementId":"footer-logo","elementType":"image","elementTag":"img","elementClass":"page-1-footer-logo","styles":{"maxWidth":"80mm","height":"auto","display":"block","objectFit":"contain","marginBottom":"3mm"},"content":{"contentKey":"footer-logo-image","contentType":"asset","defaultValue":"/images/template/Wong_Partnership_Logo_HD_Transparent.png","editable":false,"assetPath":"Wong_Partnership_Logo_HD_Transparent.png"}},{"elementId":"footer-subtext","elementType":"text","elementTag":"p","elementClass":"page-1-footer-subtext","styles":{"fontFamily":"\'Helvetica Neue\', Arial, sans-serif","fontSize":"8pt","color":"#666666","margin":"0","padding":"0"},"content":{"contentKey":"footer-subtext","contentType":"text","defaultValue":"a regional law network","editable":true}}]}]}]}',
    '{"@media print":{".page-1-cover":{"margin":"0","padding":"25mm","boxShadow":"none"}}}',
    1,
    TRUE
);

-- Insert default content values for Page 1 editable fields
-- These are the editable text values that users can modify

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
-- TEST QUERIES
-- ============================================

-- Test 1: Verify template definition was inserted
SELECT 
    id,
    name,
    template_type,
    total_pages,
    version,
    is_active,
    LENGTH(structure_json) as structure_json_length,
    created_at
FROM template_definitions
WHERE name = '26-Page Proposal Template';

-- Test 2: Verify content values were inserted
SELECT 
    id,
    page_number,
    section_id,
    element_id,
    content_type,
    content_value,
    is_enabled
FROM template_content
WHERE template_definition_id = (SELECT id FROM template_definitions WHERE name = '26-Page Proposal Template' LIMIT 1)
ORDER BY page_number, section_id, element_id;

-- Test 3: Count editable content fields
SELECT 
    COUNT(*) as total_content_fields,
    SUM(CASE WHEN is_enabled = TRUE THEN 1 ELSE 0 END) as enabled_fields
FROM template_content
WHERE template_definition_id = (SELECT id FROM template_definitions WHERE name = '26-Page Proposal Template' LIMIT 1);
