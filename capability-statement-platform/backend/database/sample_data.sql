-- Sample Data for Capability Statement Platform
USE capability_statement_db;

-- Insert Sample Lawyers
INSERT INTO lawyers (first_name, last_name, email, practice_group, title, bio, years_experience, source_system) VALUES
('John', 'Smith', 'john.smith@lawfirm.com', 'Corporate Law', 'Partner', 'Expert in M&A transactions with 20+ years of experience', 20, 'HRIS'),
('Sarah', 'Johnson', 'sarah.johnson@lawfirm.com', 'Intellectual Property', 'Senior Associate', 'Specializes in patent law and IP litigation', 8, 'HRIS'),
('Michael', 'Chen', 'michael.chen@lawfirm.com', 'Corporate Law', 'Partner', 'Leading expert in securities law and regulatory compliance', 18, 'HRIS'),
('Emily', 'Rodriguez', 'emily.rodriguez@lawfirm.com', 'Litigation', 'Partner', 'Trial attorney with extensive experience in complex commercial disputes', 15, 'HRIS'),
('David', 'Kim', 'david.kim@lawfirm.com', 'Intellectual Property', 'Associate', 'Focuses on trademark and copyright matters', 5, 'HRIS');

-- Insert Sample Deals
INSERT INTO deals (deal_name, client_name, deal_value, deal_currency, industry, practice_group, deal_year, deal_description, deal_type, source_system) VALUES
('TechCorp Acquisition', 'TechCorp Inc.', 500000000.00, 'USD', 'Technology', 'Corporate Law', 2023, 'Represented TechCorp in acquisition of competitor', 'M&A', 'DealTracker'),
('PharmaCo IPO', 'PharmaCo Ltd.', 750000000.00, 'USD', 'Healthcare', 'Corporate Law', 2023, 'Led initial public offering for pharmaceutical company', 'IPO', 'DealTracker'),
('GlobalMerger Transaction', 'GlobalMerger Corp', 1200000000.00, 'USD', 'Manufacturing', 'Corporate Law', 2022, 'Advised on cross-border merger transaction', 'M&A', 'DealTracker'),
('StartupX Series B', 'StartupX Inc.', 50000000.00, 'USD', 'Technology', 'Corporate Law', 2023, 'Structured Series B financing round', 'Financing', 'DealTracker'),
('MedDevice Acquisition', 'MedDevice Co.', 300000000.00, 'USD', 'Healthcare', 'Corporate Law', 2022, 'Represented buyer in medical device acquisition', 'M&A', 'DealTracker');

-- Insert Deal-Lawyer Relationships
INSERT INTO deal_lawyers (deal_id, lawyer_id, role) VALUES
(1, 1, 'Lead Counsel'),
(1, 3, 'Securities Counsel'),
(2, 1, 'Lead Counsel'),
(2, 3, 'Securities Counsel'),
(3, 1, 'Lead Counsel'),
(3, 3, 'Co-Counsel'),
(4, 1, 'Lead Counsel'),
(5, 1, 'Lead Counsel'),
(5, 3, 'Co-Counsel');

-- Insert Sample Awards
INSERT INTO awards (award_name, awarding_organization, award_year, category, practice_group, industry, description, source_system) VALUES
('Lawyer of the Year - Corporate', 'Legal Excellence Awards', 2023, 'Individual', 'Corporate Law', 'General', 'Recognized for outstanding work in corporate transactions', 'AwardsDB'),
('Top M&A Deal', 'M&A Magazine', 2023, 'Deal', 'Corporate Law', 'Technology', 'TechCorp Acquisition named top M&A deal of the year', 'AwardsDB'),
('Rising Star', 'Legal 500', 2023, 'Individual', 'Intellectual Property', 'General', 'Recognized as rising star in IP practice', 'AwardsDB'),
('Best Law Firm - Corporate', 'Chambers & Partners', 2023, 'Firm', 'Corporate Law', 'General', 'Ranked as top-tier corporate law firm', 'AwardsDB'),
('Deal of the Year', 'International Finance Review', 2022, 'Deal', 'Corporate Law', 'Manufacturing', 'GlobalMerger Transaction recognized as deal of the year', 'AwardsDB');

-- Insert Award-Lawyer Relationships
INSERT INTO award_lawyers (award_id, lawyer_id) VALUES
(1, 1),
(1, 3),
(2, 1),
(3, 2),
(4, 1),
(4, 3),
(5, 1);

-- Insert Sample Capability Statements
INSERT INTO cap_statements (title, description, status, created_by) VALUES
('Q4 2023 Corporate Practice Overview', 'Quarterly capability statement for corporate practice', 'published', 'admin'),
('Technology Sector Capabilities', 'Focused capability statement for technology clients', 'draft', 'admin');

-- Insert Sample Cap Statement Versions
INSERT INTO cap_statement_versions (cap_statement_id, version_number, content, settings, selected_deal_ids, selected_award_ids, selected_lawyer_ids) VALUES
(1, 1, 'Our corporate practice has been at the forefront of major transactions in 2023. We represented clients in deals totaling over $2 billion...', 
 '{"includeDeals": true, "includeAwards": true, "includeLawyers": true, "format": "standard"}',
 '[1, 2, 3]', '[1, 2, 4]', '[1, 3]'),
(2, 1, 'Our technology practice combines deep industry knowledge with legal expertise. In 2023, we advised on several high-profile technology transactions...',
 '{"includeDeals": true, "includeAwards": true, "includeLawyers": true, "format": "focused"}',
 '[1, 4]', '[2]', '[1, 2]');
