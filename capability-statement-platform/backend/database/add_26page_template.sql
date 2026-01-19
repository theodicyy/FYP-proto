-- Add 26-Page Document Template
-- This script adds a NEW template for the 26-page document structure
-- Existing templates are NOT affected

USE capability_statement_db;

-- Insert the 26-page template
-- Note: The content field contains a placeholder that indicates this is a multi-page template
-- The actual content will be managed through the Vue components (MultiPageTemplate.vue)
INSERT INTO templates (name, description, content) VALUES
('26-Page Proposal Template', 'Multi-page client-ready proposal template with cover page and structured sections. This template uses Vue components for rendering.', 
'[26-PAGE-MULTI-PAGE-TEMPLATE]
This template uses the MultiPageTemplate Vue component system.
Pages are rendered as individual Vue components.
Template ID will be used to identify and load the 26-page structure.
');
