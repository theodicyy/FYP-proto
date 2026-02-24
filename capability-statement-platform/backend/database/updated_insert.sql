-- ============================================================
-- Capability Statement Platform - Data (all inserts)
-- Run after schema.sql. Appends/replaces all data for the DB.
-- ============================================================

USE capability_statement_db;

-- Clear tables in dependency order (child tables first). Uses DELETE so it works with foreign keys.
-- Do not use TRUNCATE on deals/lawyers/awards here; they are referenced by other tables.
DELETE FROM deal_awards;
DELETE FROM deal_lawyers;
DELETE FROM lawyer_awards;
DELETE FROM deals;
DELETE FROM awards;
DELETE FROM lawyers;

-- Reset auto-increment so new rows get ids starting from 1
ALTER TABLE deals AUTO_INCREMENT = 1;
ALTER TABLE awards AUTO_INCREMENT = 1;
ALTER TABLE lawyers AUTO_INCREMENT = 1;

START TRANSACTION;

-- ======================
-- USERS (seed)
-- ======================
INSERT INTO users (email, password_hash, first_name, last_name, role_type)
VALUES
('admin@lawfirm.com', '$2b$10$IgnDq53RVBLdLvlMEqEV4uoGH7pv9NxPGjvzUNtiBcaYV2tzPKwx6', 'Admin', 'User', 'admin'),
('associate@lawfirm.com', '$2b$10$lHNjd8.21I2g9wT5JBylGuyatDnaRHgCk1xWWs6dwhvplaZjdpX7m', 'Associate', 'User', 'associate')
ON DUPLICATE KEY UPDATE email = email;

-- ======================
-- LAWYERS
-- ======================
INSERT INTO lawyers (first_name, last_name, email, practice_group, title, designation, lawyer_designation, phone, qualifications, admissions, bio, years_experience) VALUES
('Adnaan', 'NOOR', 'adnaan.noor@wongpartnership.com', 'Restructuring & Insolvency, Special Situations Advisory, Indonesia', 'Partner', 'Partner', 'Partner', '+65 6416 2477', 'Singapore Management University (LL.B., Hons.)', NULL, NULL, NULL),
('Alessa', 'PANG', 'alessa.pang@wongpartnership.com', 'Commercial & Corporate Disputes, International Arbitration, Shipping, International Trade & Commodities Disputes', 'Partner', 'Partner', 'Partner', '+65 64168107', 'National University of Singapore (LL.B., Hons.)', NULL, NULL, NULL),
('Alvin', 'CHIA', 'alvin.chia@wongpartnership.com', 'Banking & Finance, Special Situations Advisory, Malaysia', 'Partner', 'Partner', 'Partner', '+65 6416 8214', 'National University of Singapore (LL.B., Hons.)', NULL, NULL, NULL),
('Alvin', 'CHUA', 'alvin.chua@wongpartnership.com', 'Debt Capital Markets, Insurance', 'Partner', 'Partner', 'Partner', '+65 6416 2531', 'National University of Singapore (LL.B., Hons.)', NULL, NULL, NULL),
('Ameera', 'ASHRAF', 'ameera.ashraf@wongpartnership.com', 'Antitrust & Competition, Corporate Regulatory & Licensing, Mergers & Acquisitions', 'Partner', 'Partner', 'Partner', '+65 6416 8113', 'National University of Singapore (LL.B., Hons.)', NULL, NULL, NULL),
('Andre', 'SOH', 'andre.soh@wongpartnership.com', 'Energy, Projects and Construction', 'Partner', 'Partner', 'Partner', '+65 6517 3793', 'Singapore Management University (JD, Summa Cum Laude; BSc Economics, Cum Laude)', NULL, NULL, NULL),
('Andrew', 'ANG', 'andrew.ang@wongpartnership.com', 'Malaysia, Mergers & Acquisitions, Private Equity, Real Estate Investment Trusts, Vietnam', 'Partner', 'Partner', 'Partner', '+65 6416 8007', 'University of Nottingham (LL.B., Hons.)', NULL, NULL, NULL),
('Angela', 'LIM', 'angela.lim@wongpartnership.com', 'Corporate Real Estate', 'Partner', 'Partner', 'Partner', '+65 6416 8012', 'University College London, University of London (LL.M.)', NULL, NULL, NULL),
('Anna', 'TAN', 'anna.tan@wongpartnership.com', 'Mergers & Acquisitions, Private Equity, Vietnam', 'Partner', 'Partner', 'Partner', '+65 6416 8030', 'National University of Singapore (LL.B., Hons.)', NULL, NULL, NULL),
('Annabel', 'KANG', 'annabel.kang@wongpartnership.com', 'Corporate Real Estate', 'Partner', 'Partner', 'Partner', '+65 6416 2483', 'University of Nottingham (LL.B., Hons.)', NULL, NULL, NULL),
('Annabelle', 'YIP', 'annabelle.yip@wongpartnership.com', 'Business Establishment, Corporate Governance & Compliance, Mergers & Acquisitions, Professional Services', 'Senior Consultant', 'Senior Consultant', 'Senior Consultant', '+65 6416 8249', 'King''s College London, University of London (LL.M.)
National University of Singapore (LL.B., Hons.)', NULL, NULL, NULL),
('Audrey', 'CHNG', 'audrey.chng@wongpartnership.com', 'Mergers & Acquisitions, Private Equity, Real Estate Investment Trusts', 'Partner', 'Partner', 'Partner', '+65 6416 2427', 'National University of Singapore (LL.B)', NULL, NULL, NULL),
('AW Wen', 'Ni', 'wenni.aw@wongpartnership.com', 'Specialist & Private Client Disputes, Private Wealth', 'Partner', 'Partner', 'Partner', '+65 6416 6870', 'National University of Singapore (LL.B., Hons.)', NULL, NULL, NULL),
('Bernadette', 'TAN', 'bernadette.tan@wongpartnership.com', 'nan', 'Partner', 'Partner', 'Partner', '+65 6517 8718', 'National University of Singapore (LL.B., Hons.)', NULL, NULL, NULL),
('CHAN Hock', 'Keng', 'hockkeng.chan@wongpartnership.com', 'China, Commercial & Corporate Disputes, Insurance, International Arbitration', 'Partner', 'Partner', 'Partner', '+65 6416 8139', 'University of Bristol (LL.B., Hons.)', NULL, NULL, NULL),
('CHAN Jia', 'Hui', 'jiahui.chan@wongpartnership.com', 'Antitrust & Competition, Corporate Regulatory & Licensing, Financial Services Regulatory', 'Partner', 'Partner', 'Partner', '+65 6416 2794', 'National University of Singapore (LL.B., Hons.)', NULL, NULL, NULL),
('CHAN Sing', 'Yee', 'singyee.chan@wongpartnership.com', 'Mergers & Acquisitions, Private Equity', 'Partner', 'Partner', 'Partner', '+65 6416 8018', 'National University of Singapore (LL.B., Hons.)', NULL, NULL, NULL),
('CHAN Yu', 'Xin', 'yuxin.chan@wongpartnership.com', 'Specialist & Private Client Disputes, Private Wealth', 'Partner', 'Partner', 'Partner', '+65 6517 3759', 'National University of Singapore (LL.B., Hons.)', NULL, NULL, NULL),
('CHANG Man', 'Phing', 'manphing.chang@wongpartnership.com', 'Professional and Enterprise Disputes, White Collar & Enforcement, Health Sciences & Biotechnology', 'Partner', 'Partner', 'Partner', '+65 6416 8105', 'National University of Singapore (LL.B., Hons.)', NULL, NULL, NULL),
('CHANG', 'Qi-Yang', 'qiyang.chang@wongpartnership.com', 'Commercial & Corporate Disputes', 'Partner', 'Partner', 'Partner', '+65 6517 3754', 'National University of Singapore (LL.B., Hons.)', NULL, NULL, NULL),
('CHIANG Yuan', 'Bo', 'yuanbo.chiang@wongpartnership.com', 'Mergers & Acquisitions', 'Partner', 'Partner', 'Partner', '+65 6517 8688', 'National University of Singapore (LL.B., Hons (First Class Honours))', NULL, NULL, NULL),
('CHONG Hong', 'Chiang', 'hongchiang.chong@wongpartnership.com', 'China, Equity Capital Markets', 'Partner', 'Partner', 'Partner', '+65 6416 8005', 'National University of Singapore (LL.B., Hons.)', NULL, NULL, NULL),
('CHOU Sean', 'Yu', 'seanyu.chou@wongpartnership.com', 'Banking & Financial Disputes, Financial Services Regulatory, International Arbitration, Malaysia', 'Managing Partner', 'Managing Partner', 'Managing Partner', '+65 6416 8133', 'University of Bristol (LL.B., Hons.)', NULL, NULL, NULL),
('Christopher', 'CASSIM', 'christopher.cassim@wongpartnership.com', 'Corporate Real Estate', 'Consultant', 'Consultant', 'Consultant', '+65 6416 8217', 'National University of Singapore (B.L. Ed., Articleship)', NULL, NULL, NULL),
('Christy', 'LIM', 'christy.lim@wongpartnership.com', 'Banking & Finance, Private Credit, Private Equity', 'Partner', 'Partner', 'Partner', '+65 6416 2403', 'National University of Singapore (LL.B., Hons.)', NULL, NULL, NULL),
('CHUA Si', 'Ya', 'siya.chua@wongpartnership.com', 'Mergers & Acquisitions', 'Partner', 'Partner', 'Partner', '+65 6517 8695', 'Singapore Management University (LL.B.)', NULL, NULL, NULL),
('Clarence', 'KANG', 'clarence.kang@wongpartnership.com', 'Banking & Finance', 'Partner', 'Partner', 'Partner', '+65 6416 2419', 'Singapore Management University (LL.B., Hons.)', NULL, NULL, NULL),
('Clarissa', 'KOH', 'clarissa.koh@wongpartnership.com', 'Antitrust & Competition, Corporate Regulatory & Licensing', 'Partner', 'Partner', 'Partner', '+65 6517 8685', 'University of Leeds (LL.B., Hons.) ', NULL, NULL, NULL),
('Clayton', 'CHONG', 'clayton.chong@wongpartnership.com', 'Special Situations Advisory, Restructuring & Insolvency', 'Partner', 'Partner', 'Partner', '+65 6416 2472', 'Singapore Management University (LL.B., Hons.)', NULL, NULL, NULL),
('Cornelia', 'FONG', 'cornelia.fong@wongpartnership.com', 'Corporate Real Estate', 'Partner', 'Partner', 'Partner', '+65 6416 8216', 'University of Nottingham (LL.B., Hons.)', NULL, NULL, NULL),
('Daniel', 'GAW', 'daniel.gaw@wongpartnership.com', 'Commercial & Corporate Disputes, International Arbitration, Shipping, International Trade & Commodities Disputes', 'Partner', 'Partner', 'Partner', '+65 6416 6863', 'National University of Singapore (LL.B., Hons.)', NULL, NULL, NULL),
('Daniel', 'LIU', 'zhaoxiang.liu@wongpartnership.com', 'Restructuring & Insolvency, Special Situations Advisory', 'Partner', 'Partner', 'Partner', '+65 6416 2470', 'Singapore Management University (LL.B., Hons.)', NULL, NULL, NULL),
('Daryl', 'WONG', 'daryl.wong@wongpartnership.com', 'Banking & Financial Disputes', 'Partner', 'Partner', 'Partner', '+65 6416 8697', 'University of Tasmania (LL.B., First Class Honours)', NULL, NULL, NULL),
('David', 'CHEE', 'david.chee@wongpartnership.com', 'Middle East, Private Wealth', 'Partner', 'Partner', 'Partner', '+65 6416 8202', 'National University of Singapore (LL.B., Hons.)', NULL, NULL, NULL),
('Dorothy Marie', 'NG', 'dorothymarie.ng@wongpartnership.com', 'Corporate Real Estate, Real Estate Investment Trusts', 'Partner', 'Partner', 'Partner', '+65 6416 2408', 'National University of Singapore (LL.B., Hons.)', NULL, NULL, NULL),
('Eden', 'LI', 'eden.li@wongpartnership.com', 'Restructuring & Insolvency, Special Situations Advisory', 'Partner', 'Partner', 'Partner', '+65 6517 3766', 'Singapore Management University (LL.B., Hons; BBM (Finance), Hons.)', NULL, NULL, NULL),
('Edward', 'TI', 'edward.ti@wongpartnership.com', 'Litigation & Dispute Resolution, Real Estate', 'Consultant', 'Consultant', 'Consultant', '+65 6416 8000', 'University of Cambridge (PhD)', NULL, NULL, NULL),
('Elaine', 'CHAN', 'elaine.chan@wongpartnership.com', 'Asset Management & Funds, Financial Services Regulatory, FinTech', 'Partner', 'Partner', 'Partner', '+65 6416 8010', 'National University of Singapore (LL.B., Hons.)', NULL, NULL, NULL),
('Evan', 'ONG', 'evan.ong@wongpartnership.com', 'Private Wealth', 'Partner', 'Partner', 'Partner', '+65 6416 2792', 'University of Exeter (LL.B., Hons.)', NULL, NULL, NULL),
('Felicia', 'NG', 'felicia.ng@wongpartnership.com', 'Asset Management & Funds', 'Partner', 'Partner', 'Partner', '+65 6416 8203', 'National University of Singapore (LL.B., Hons.)', NULL, NULL, NULL),
('Felix', 'LEE', 'felix.lee@wongpartnership.com', 'Banking & Finance, Private Credit', 'Partner', 'Partner', 'Partner', '+65 6416 8035', 'National University of Singapore (LL.B., Hons.)', NULL, NULL, NULL),
('Frank OH Sheng', 'Loong', 'shengloong.oh@wongpartnership.com', 'Asset Recovery & International Enforcement, Banking & Financial Disputes, International Arbitration', 'Partner', 'Partner', 'Partner', '+65 6517 3795', 'National University of Singapore (LL.B., Hons.)', NULL, NULL, NULL),
('Gail', 'ONG', 'gail.ong@wongpartnership.com', 'Equity Capital Markets, Malaysia, Real Estate Investment Trusts, Thailand', 'Partner', 'Partner', 'Partner', '+65 6416 8205', 'National University of Singapore (LL.B., Hons.)', NULL, NULL, NULL),
('Gavin', 'NEO', 'Gavin.Neo@wongpartnership.com', 'Professional & Enterprise Disputes, White Collar & Enforcement', 'Partner', 'Partner', 'Partner', '+65 6517 3769', 'King‚Äôs College London, University of London (LL.B., Hons.)', NULL, NULL, NULL),
('GOH Wei', 'Wei', 'weiwei.goh@wongpartnership.com', 'Commercial & Corporate Disputes', 'Partner', 'Partner', 'Partner', '+65 6517 3757', 'National University of Singapore (LL.B., Hons.)', NULL, NULL, NULL),
('GOH', 'Ziluo', 'ziluo.goh@wongpartnership.com', 'Tax', 'Partner', 'Partner', 'Partner', '+65 6416 8189', 'Singapore Management University (LL.B., Hons; BAcc, Hons.)', NULL, NULL, NULL),
('Hannah', 'LEE', 'Hannah.Lee@wongpartnership.com', 'Commercial & Corporate Disputes', 'Partner', 'Partner', 'Partner', '+65 6517 3756', 'National University of Singapore (LL.B., Hons.)', NULL, NULL, NULL),
('HO Soon', 'Keong', 'SoonKeong.Ho@wongpartnership.com', 'Debt Capital Markets, Mergers & Acquisitions', 'Partner', 'Partner', 'Partner', '+65 6416 2421', 'Singapore Management University (LL.B., Hons.)', NULL, NULL, NULL),
('HO Wei', 'Jie', 'weijie.ho@wongpartnership.com', 'Commercial & Corporate Disputes, Employment', 'Partner', 'Partner', 'Partner', '+65 6517 3780', 'Singapore Management University (LL.B, cum laude)', NULL, NULL, NULL),
('HO Yi', 'Jie', 'yijie.ho@wongpartnership.com', 'Commercial & Corporate Disputes', 'Partner', 'Partner', 'Partner', '+65 6517 8726', 'National University of Singapore (LL.B. Hons)', NULL, NULL, NULL),
('HUI Choon', 'Yuen', 'choonyuen.hui@wongpartnership.com', 'Debt Capital Markets, Financial Services Regulatory, Insurance, Private Credit, Private Wealth, Special Situations Advisory', 'Partner', 'Partner', 'Partner', '+65 6416 8204', 'University of Bristol (LL.B., Hons.)', NULL, NULL, NULL),
('Ian DE', 'VAZ', 'ian.devaz@wongpartnership.com', 'Infrastructure, Construction & Engineering, International Arbitration, Middle East', 'Partner', 'Partner', 'Partner', '+65 6416 8128', 'Senior Accredited Specialist (Building & Construction), Singapore Academy of Law', NULL, NULL, NULL),
('Ian', 'KOH', 'ian.koh@wongpartnership.com', 'nan', 'Senior Consultant', 'Senior Consultant', 'Senior Consultant', '+65 6416 8109', 'University of Cambridge (B.A. Hons.; M.A.)', NULL, NULL, NULL),
('Jaclyn NEO', '(Dr)', 'jaclyn.neo@wongpartnership.com', 'nan', 'Consultant', 'Consultant', 'Consultant', '+65 6416 8000', 'National University of Singapore (LL.B., Hons.)', NULL, NULL, NULL),
('James', 'CHOO', 'james.choo@wongpartnership.com', 'Equity Capital Markets, Indonesia', 'Partner', 'Partner', 'Partner', '+65 6416 2418', 'University of Durham (LL.B.)', NULL, NULL, NULL),
('Jayne', 'LEE', 'jayne.lee@wongpartnership.com', 'Corporate Governance and Compliance, Mergers & Acquisitions', 'Partner', 'Partner', 'Partner', '+65 6416 8256', 'University of Nottingham (LL.B., Hons.)(Senior Status)', NULL, NULL, NULL),
('Jenny', 'TSIN', 'jenny.tsin@wongpartnership.com', 'Commercial & Corporate Disputes, Corporate Governance & Compliance, Corporate & Regulatory Investigations, Employment, Professional Services', 'Partner', 'Partner', 'Partner', '+65 6416 8110', 'National University of Singapore (LL.B., Hons.)', NULL, NULL, NULL),
('Jerry', 'TAN', 'jerry.tan@wongpartnership.com', 'Corporate Real Estate', 'Partner', 'Partner', 'Partner', '+65 6416 2534', 'National University of Singapore (LL.B., Hons.)', NULL, NULL, NULL),
('Jill Ann', 'KOH', 'jillann.koh@wongpartnership.com', 'Commercial & Corporate Disputes, International Arbitration', 'Partner', 'Partner', 'Partner', '+65 6517 8720', 'Singapore Management University (LL.B., Hons.)', NULL, NULL, NULL),
('Joel', 'CHNG', 'joel.chng@wongpartnership.com', 'China, Restructuring & Insolvency, Special Situations Advisory', 'Partner', 'Partner', 'Partner', '+65 6517 8707', 'National University of Singapore (LL.B. Hons.)', NULL, NULL, NULL),
('Joel', 'QUEK', 'joel.quek@wongpartnership.com', 'Commercial & Corporate Disputes, International Arbitration, Asset Recovery & International Enforcement, Vietnam', 'Partner', 'Partner', 'Partner', '+65 6416 8124', 'University College London (LL.B., Hons.)', NULL, NULL, NULL),
('Jolyn', 'KHOO', 'jolyn.khoo@wongpartnership.com', 'Professional & Enterprise Disputes', 'Partner', 'Partner', 'Partner', '+65 6517 3750', 'Singapore Management University (LL.B., Hons.)', NULL, NULL, NULL),
('Joseph HO Yan', 'Jun', 'yanjun.ho@wongpartnership.com', 'China, Mergers & Acquisitions', 'Partner', 'Partner', 'Partner', '+65 6416 8218', 'Yunnan University (B.A)', NULL, NULL, NULL),
('Josephine', 'CHOO', 'josephine.choo@wongpartnership.com', 'Specialist & Private Client Disputes', 'Partner', 'Partner', 'Partner', '+65 6416 8120', 'University of London (LL.B., Hons.)', NULL, NULL, NULL),
('Joy', 'TAN', 'joy.tan@wongpartnership.com', 'nan', 'Partner', 'Partner', 'Partner', '+65 6416 8138', 'Cambridge University (B.A. Hons.; M.A.)', NULL, NULL, NULL),
('Karen', 'YEOH', 'karen.yeoh@wongpartnership.com', 'Equity Capital Markets', 'Partner', 'Partner', 'Partner', '+65 6416 2482', 'National University of Singapore (LL.B., Hons.)', NULL, NULL, NULL),
('Kevin', 'HO', 'kevin.ho@wongpartnership.com', 'nan', 'Partner', 'Partner', 'Partner', '+65 6416 2555', 'National University of Singapore (LL.B., Hons.)', NULL, NULL, NULL),
('KOH Swee Yen, Senior', 'Counsel', 'sweeyen.koh@wongpartnership.com', 'Asset Recovery & International Enforcement, Commercial & Corporate Disputes, International Arbitration, Shipping, International Trade & Commodities Disputes, China, India, Vietnam', 'Partner', 'Partner', 'Partner', '+65 6416 6876', 'National University of Singapore (LL.B., Hons.)', NULL, NULL, NULL),
('KUA Lay', 'Theng', 'laytheng.kua@wongpartnership.com', 'Infrastructure, Construction & Engineering, Malaysia', 'Partner', 'Partner', 'Partner', '+65 6517 3788', 'University of Leicester, UK (LL.B., Second Class (Upper Division) Honours)', NULL, NULL, NULL),
('Kyle', 'LEE', 'kyle.lee@wongpartnership.com', 'FinTech, Mergers & Acquisitions, Private Equity, WPGrow: Start-Up / Venture Capital', 'Partner', 'Partner', 'Partner', '+65 6517 8738', 'National University of Singapore (LL.B., Hons.)', NULL, NULL, NULL),
('Kylie', 'PEH', 'kylie.peh@wongpartnership.com', 'Data Protection, FinTech, Intellectual Property, Technology & Media, Telecommunications', 'Partner', 'Partner', 'Partner', '+65 6416 8259', 'National University of Singapore (LL.B., Hons.)', NULL, NULL, NULL),
('LAM Chung', 'Nian', 'chungnian.lam@wongpartnership.com', 'Cyber Security, Data Protection, FinTech, Health Sciences & Biotechnology, Intellectual Property, Technology & Media, Telecommunications', 'Partner', 'Partner', 'Partner', '+65 6416 8271', 'National University of Singapore (LL.B., Hons.)', NULL, NULL, NULL),
('LEE Si', 'Min', 'simin.lee@wongpartnership.com', 'Corporate Real Estate', 'Partner', 'Partner', 'Partner', '+65 6517 8653', 'National University of Singapore (LL.B., Hons.)', NULL, NULL, NULL),
('Lesley', 'FU', 'lesley.fu@wongpartnership.com', 'Infrastructure, Construction & Engineering', 'Partner', 'Partner', 'Partner', '+65 6517 3786', 'Accredited Specialist (Building & Construction), Singapore Academy of Law', NULL, NULL, NULL),
('Lesley', 'TAN', 'lesley.tan@wongpartnership.com', 'Energy, Projects & Construction', 'Partner', 'Partner', 'Partner', '+65 6416 8111', 'National University of Singapore (LL.B., Hons.)', NULL, NULL, NULL),
('LIANG', 'Weitan', 'weitan.liang@wongpartnership.com', 'China, Mergers & Acquisitions', 'Partner', 'Partner', 'Partner', '+65 6416 2556', 'National University of Singapore (LL.B., Hons.)', NULL, NULL, NULL),
('LIM Jia', 'Ying', 'jiaying.lim@wongpartnership.com', 'Mergers & Acquisitions', 'Partner', 'Partner', 'Partner', '+65 6416 8247', 'National University of Singapore (LL.B., Hons.)', NULL, NULL, NULL),
('LIN', 'Chunlong', 'chunlong.lin@wongpartnership.com', 'Commercial & Corporate Disputes, Shipping, International Trade & Commodities Disputes', 'Partner', 'Partner', 'Partner', '+65 6416 8119', 'Singapore Management University (LL.B., Magna Cum Laude)', NULL, NULL, NULL),
('Linda', 'LOW', 'linda.low@wongpartnership.com', 'Energy, Projects & Construction', 'Partner', 'Partner', 'Partner', '+65 6416 8187', 'University of Nottingham (LL.B., Hons.)', NULL, NULL, NULL),
('LING Pei', 'Lih', 'peilih.ling@wongpartnership.com', 'Mergers & Acquisitions', 'Partner', 'Partner', 'Partner', '+65 6416 8678', 'National University of Singapore (LL.B., Hons.)', NULL, NULL, NULL),
('Lionel', 'LEO', 'lionel.leo@wongpartnership.com', 'Restructuring & Insolvency, Special Situations Advisory', 'Partner', 'Partner', 'Partner', '+65 6517 3758', 'National University of Singapore (LL.B., Hons.)', NULL, NULL, NULL),
('LOH Jen', 'Vern', 'jenvern.loh@wongpartnership.com', 'Equity Capital Markets, Real Estate Investment Trusts', 'Partner', 'Partner', 'Partner', '+65 6416 6465', 'University of Nottingham (LL.B., Hons.)', NULL, NULL, NULL),
('LONG Chee', 'Shan', 'cheeshan.long@wongpartnership.com', 'Equity Capital Markets, Real Estate Investment Trusts', 'Partner', 'Partner', 'Partner', '+65 6416 8210', 'National University of Singapore (LL.B., Hons.)', NULL, NULL, NULL),
('LOW Kah', 'Keong', 'kahkeong.low@wongpartnership.com', 'Asset Management & Funds, Financial Services Regulatory, Mergers & Acquisitions, Myanmar, Private Equity, Special Situations Advisory', 'Partner', 'Partner', 'Partner', '+65 6416 8209', 'National University of Singapore (LL.B., Hons.)', NULL, NULL, NULL),
('Mark', 'CHOY', 'mark.choy@wongpartnership.com', 'Indonesia, Mergers & Acquisitions, Middle East, Private Equity, Special Situations Advisory, WPGrow: Start-Up / Venture Capital', 'Partner', 'Partner', 'Partner', '+65 6416 8014', 'University of Nottingham (LL.B., Hons.)', NULL, NULL, NULL),
('Melanie', 'HO', 'melanie.ho@wongpartnership.com', 'Asset Recovery & International Enforcement, Health Sciences & Biotechnology, International Arbitration, Intellectual Property Disputes, Professional and Enterprise Disputes, Professional Services, Shipping, International Trade & Commodities Disputes, White Collar & Enforcement', 'Partner', 'Partner', 'Partner', '+65 6416 8127', 'National University of Singapore (LL.B., Hons.)', NULL, NULL, NULL),
('Melissa', 'THAM', 'melissasm.tham@wongpartnership.com', 'Financial Services Regulatory', 'Partner', 'Partner', 'Partner', '+65 6416 8226', 'National University of Singapore (LL.B., Hons.)', NULL, NULL, NULL),
('Monica', 'CHONG', 'monica.chong@wongpartnership.com', 'Banking & Financial Disputes', 'Partner', 'Partner', 'Partner', '+65 6416 8126', 'University of Leicester (LL.B., Hons.)', NULL, NULL, NULL),
('Monica CHONG Wan', 'Yee', 'monicawy.chong@wongpartnership.com', 'Commercial & Corporate Disputes', 'Partner', 'Partner', 'Partner', '+65 6517 3748', 'National University of Singapore (LL.B., Hons.)', NULL, NULL, NULL),
('Monica', 'YIP', 'monica.yip@wongpartnership.com', 'Corporate Real Estate, Real Estate Investment Trusts', 'Partner', 'Partner', 'Partner', '+65 6416 8208', 'National University of Singapore (LL.B., Hons.)', NULL, NULL, NULL),
('Muhammed Ismail', 'NOORDIN', 'muhammedismail.konoordin@wongpartnership.com', 'Restructuring & Insolvency, Special Situations Advisory', 'Partner', 'Partner', 'Partner', '+65 6517 3760', 'Singapore Management University (LL.B., Hons.)', NULL, NULL, NULL),
('NG Wai', 'King', 'waiking.ng@wongpartnership.com', 'Mergers & Acquisitions, Private Equity, Telecommunications', 'Chairman & Senior Partner', 'Chairman & Senior Partner', 'Chairman & Senior Partner', '+65 6416 8022', 'National University of Singapore (LL.B., Hons.)', NULL, NULL, NULL),
('ONG Kuan', 'Chung', 'KuanChung.Ong@wongpartnership.com', 'Equity Capital Markets, Real Estate Investment Trusts', 'Partner', 'Partner', 'Partner', '+65 6416 2415', 'University of Oxford (BCL)', NULL, NULL, NULL),
('ONG Pei', 'Chin', 'peichin.ong@wongpartnership.com', 'Commercial & Corporate Disputes, Corporate & Regulatory Investigations', 'Partner', 'Partner', 'Partner', '+65 6416 8103', 'National University of Singapore (LL.B., Hons.)', NULL, NULL, NULL),
('ONG Sin', 'Wei', 'sinwei.ong@wongpartnership.com', 'FinTech, India, Mergers & Acquisitions, WPGrow: Start-Up / Venture Capital', 'Partner', 'Partner', 'Partner', '+65 6517 8665', 'University of Birmingham (LL.B., Hons.)', NULL, NULL, NULL),
('Paul', 'LOY', 'paul.loy@wongpartnership.com', 'Specialist & Private Client Disputes, White Collar & Enforcement', 'Partner', 'Partner', 'Partner', '+65 6416 8255', 'University of Nottingham (LL.B., Hons.)', NULL, NULL, NULL),
('POON Chun', 'Wai', 'chunwai.poon@wongpartnership.com', 'Private Wealth, Specialist & Private Client Disputes', 'Partner', 'Partner', 'Partner', '+65 6517 3752', 'Singapore Management University (LL.B.) ', NULL, NULL, NULL),
('QUAK Fi', 'Ling', 'filing.quak@wongpartnership.com', 'Mergers & Acquisitions, Private Equity, Sustainability & Responsible Business', 'Partner', 'Partner', 'Partner', '+65 6416 8023', 'National University of Singapore (LL.B., Hons.)', NULL, NULL, NULL),
('Rachel', 'TAN', 'rachel.tan@wongpartnership.com', 'nan', 'Partner', 'Partner', 'Partner', '+65 6517 8673', 'University College London (LL. B Hons.)', NULL, NULL, NULL),
('Rosabel', 'NG', 'rosabel.ng@wongpartnership.com', 'Derivatives & Structured Products, Financial Services Regulatory, FinTech, Sustainability & Responsible Business', 'Partner', 'Partner', 'Partner', '+65 6416 8269', 'National University of Singapore (LL.B., Hons.)', NULL, NULL, NULL),
('Samuel', 'NAVINDRAN', 'samuel.navindran@wongpartnership.com', 'Specialist & Private Client Disputes, White Collar & Enforcement', 'Partner', 'Partner', 'Partner', '+65 6416 6463', 'National University of Singapore (LL.B., Hons.)', NULL, NULL, NULL),
('Samuel', 'YAP', 'Samuel.yap@wongpartnership.com', 'Commercial & Corporate Disputes', 'Partner', 'Partner', 'Partner', '+65 6416 8135', 'Singapore Management University (LL.B.)', NULL, NULL, NULL),
('Serene', 'SOH', 'serene.soh@wongpartnership.com', 'Corporate Real Estate', 'Partner', 'Partner', 'Partner', '+65 6416 2426', 'National University of Singapore (LL.B., Hons.)', NULL, NULL, NULL),
('Shawn', 'ANG', 'weiming.ang@wongpartnership.com', 'Equity Capital Markets', 'Partner', 'Partner', 'Partner', '+65 6416 2412', 'National University of Singapore (LL.B. Hons)', NULL, NULL, NULL),
('SIM Bock', 'Eng', 'bockeng.sim@wongpartnership.com', 'Private Wealth, Specialist & Private Client Disputes', 'Partner', 'Partner', 'Partner', '+65 6416 8108', 'National University of Singapore (LL.M., MBA, LL.B., Hons.)', NULL, NULL, NULL),
('Simon', 'TAY', 'simon.tay@wongpartnership.com', 'nan', 'Senior Consultant', 'Senior Consultant', 'Senior Consultant', '+65 6416 8008', 'National University of Singapore (LL.B., Hons.)', NULL, NULL, NULL),
('Smitha', 'MENON', 'smitha.menon@wongpartnership.com', 'India, International Arbitration, Restructuring & Insolvency, Special Situations Advisory', 'Partner', 'Partner', 'Partner', '+65 6416 8129', 'King''s College, London (LL.B., Hons.)', NULL, NULL, NULL),
('SOONG Wen', 'E', 'wene.soong@wongpartnership.com', 'Mergers & Acquisitions', 'Partner', 'Partner', 'Partner', '+65 6416 8017', 'Singapore Management University (LL.B., Magna Cum Laude)', NULL, NULL, NULL),
('Sue-Ann', 'PHAY', 'SueAnn.Phay@wongpartnership.com', 'Corporate Governance and Compliance, Mergers & Acquisitions', 'Partner', 'Partner', 'Partner', '+65 6416 8206', 'University of Nottingham (LL.B., Hons.)', NULL, NULL, NULL),
('Suegene', 'ANG', 'suegene.ang@wongpartnership.com', 'Commercial & Corporate Disputes, Corporate & Regulatory Investigations, Employment, Myanmar, Philippines, Vietnam', 'Partner', 'Partner', 'Partner', '+65 6416 6862', 'National University of Singapore (LL.B., Hons.)', NULL, NULL, NULL),
('Susan', 'WONG', 'susan.wong@wongpartnership.com', 'Banking & Finance, Private Credit, Private Equity', 'Partner', 'Partner', 'Partner', '+65 6416 2402', 'National University of Singapore (LL.B., Hons.)', NULL, NULL, NULL),
('TAN Chee Meng, Senior', 'Counsel', 'cheemeng.tan@wongpartnership.com', 'Corporate & Regulatory Investigations, White Collar & Enforcement, Special Situations Advisory', 'Deputy Chairman', 'Deputy Chairman', 'Deputy Chairman', '+65 6416 8188', 'University of Cambridge (LL.M.)', NULL, NULL, NULL),
('TAN Cheng Han, Senior', 'Counsel', 'chenghan.tan@wongpartnership.com', 'International Arbitration', 'Senior Consultant', 'Senior Consultant', 'Senior Consultant', '+65 6416 8004', 'National University of Singapore (LL.B., Hons.) ', NULL, NULL, NULL),
('TAN Choo', 'Leng', 'chooleng.tan@wongpartnership.com', 'nan', 'Senior Consultant', 'Senior Consultant', 'Senior Consultant', '+65 6416 8262', 'National University of Singapore (LL.B., Hons.)', NULL, NULL, NULL),
('TAN Kai', 'Yun', 'kaiyun.tan@wongpartnership.com', 'Restructuring & Insolvency, Special Situations Advisory', 'Partner', 'Partner', 'Partner', '+65 6416 6869', 'Singapore Management University (LL.B., Hons.)', NULL, NULL, NULL),
('TAN Li', 'Wen', 'liwen.tan@wongpartnership.com', 'Banking & Finance', 'Partner', 'Partner', 'Partner', '+65 6416 2542', 'King''s College, London (LL.B., Hons.)', NULL, NULL, NULL),
('TAN Shao', 'Tong', 'shaotong.tan@wongpartnership.com', 'Tax', 'Partner', 'Partner', 'Partner', '+65 6416 8186', 'National University of Singapore (LL.B., Hons.)', NULL, NULL, NULL),
('TAN Teck', 'Howe', 'teckhowe.tan@wongpartnership.com', 'Corporate Real Estate, Myanmar', 'Partner', 'Partner', 'Partner', '+65 6416 8013', 'Mansfield College, Oxford (BA in Jurisprudence)', NULL, NULL, NULL),
('TANG', 'Shangwei', 'shangwei.tang@wongpartnership.com', 'Professional & Enterprise Disputes, White Collar & Enforcement', 'Partner', 'Partner', 'Partner', '+65 6517 3785', 'University of Manchester (LL.B., Hons.)', NULL, NULL, NULL),
('TAY Peng', 'Cheng', 'pengcheng.tay@wongpartnership.com', 'China, Energy, Projects & Construction, International Arbitration, Middle East, Shipping, International Trade & Commodities Disputes', 'Partner', 'Partner', 'Partner', '+65 6416 8121', 'National University of Singapore (LL.B., Hons.)', NULL, NULL, NULL),
('TIAN Sion', 'Yoong', 'sionyoong.tian@wongpartnership.com', 'Derivatives & Structured Products, Fintech, Financial Services Regulatory', 'Partner', 'Partner', 'Partner', '+65 6416 2488', 'National University of Singapore (LL.B., Hons.)', NULL, NULL, NULL),
('TIONG Teck', 'Wee', 'teckwee.tiong@wongpartnership.com', 'Commercial & Corporate Disputes, International Arbitration, Sustainability & Responsible Business', 'Partner', 'Partner', 'Partner', '+65 6416 8112', 'National University of Singapore (LL.B. Hons.)', NULL, NULL, NULL),
('Trevor', 'CHUAN', 'trevor.chuan@wongpartnership.com', 'Debt Capital Markets, Private Credit, Sustainability & Responsible Business', 'Partner', 'Partner', 'Partner', '+65 6416 8265', 'National University of Singapore (LL.B.)', NULL, NULL, NULL),
('Valerie', 'LIM', 'valerie.lim@wongpartnership.com', 'Mergers & Acquisitions, Corporate Governance and Compliance', 'Partner', 'Partner', 'Partner', '+65 6517 8674', 'Singapore Management University (LL.B.)', NULL, NULL, NULL),
('Vincent', 'HO', 'vincent.ho@wongpartnership.com', 'Specialist & Private Client Disputes, Private Wealth', 'Partner', 'Partner', 'Partner', '+65 6416 6878', 'National University of Singapore (LL.B., Hons.)', NULL, NULL, NULL),
('Vithiya', 'RAJENDRA', 'vithiya.rajendra@wongpartnership.com', 'Banking & Financial Disputes', 'Partner', 'Partner', 'Partner', '+65 6416 8137', 'Singapore Management University (LL.B., Magna Cum Laude) (BBM, Magna Cum Laude)', NULL, NULL, NULL),
('Vivien', 'YUI', 'vivien.yui@wongpartnership.com', 'Business Establishment, Corporate Governance & Compliance, Employment, Health Sciences & Biotechnology, Mergers & Acquisitions, Philippines, Professional Services', 'Partner', 'Partner', 'Partner', '+65 6416 8009', 'National University of Singapore (LL.B., Hons.)', NULL, NULL, NULL),
('Wendy', 'LIN', 'wendy.lin@wongpartnership.com', 'Asset Recovery & International Enforcement, Commercial & Corporate Disputes, International Arbitration, Philippines, Thailand', 'Partner', 'Partner', 'Partner', '+65 6416 8181', 'National University of Singapore (LL.B., Hons.)', NULL, NULL, NULL);

-- Insert awards (36 rows)
-- ======================
-- AWARDS
-- ======================
INSERT INTO awards
(award_name, awarding_organization, award_year, category, description, award_pg, publications)
VALUES
('Tier 1 firm in Commerical and Transactions', NULL, 2025, NULL,
'Private Wealth 2024 – Singapore (Chambers Global Practice Guides)',
CAST('["Commercial and Corporate Disputes"]' AS JSON),
'Private Wealth 2024 – Singapore (Chambers Global Practice Guides)'),

('Tier 1 firm in Construction', NULL, 2025, NULL,
'Litigation 2024 – Singapore (Chambers Global Practice Guides)',
CAST('["Infrastructure, Constructions & Engineering , Litigation & Dispute Resolution"]' AS JSON),
'Litigation 2024 – Singapore (Chambers Global Practice Guides)'),

('Tier 1 firm in Family and Matrimonial', NULL, 2025, NULL,
'Private Wealth 2023 – Singapore (Chambers Global Practice Guides)',
CAST('["Specialist & Private Client Disputes"]' AS JSON),
'Private Wealth 2023 – Singapore (Chambers Global Practice Guides)'),

('Tier 1 firm in Insolvency', NULL, 2025, NULL,
'Banking & Finance 2023 (Chambers Global Practice Guides)',
CAST('["Restructuring & Insolvency"]' AS JSON),
'Banking & Finance 2023 (Chambers Global Practice Guides)'),

('Tier 1 firm in International Arbitration', NULL, 2025, NULL,
'Acquisition Finance 2023 (Chambers Global Practice Guides)',
CAST('["International Arbitration"]' AS JSON),
'Acquisition Finance 2023 (Chambers Global Practice Guides)'),

('Tier 1 firm in White-Collar Crime', NULL, 2025, NULL,
'Insolvency 2023 – Singapore (Chambers Global Practice Guides)',
CAST('["White Collar & Enforcement"]' AS JSON),
'Insolvency 2023 – Singapore (Chambers Global Practice Guides)'),

('Tier 1 firm in Labour and Employment', NULL, 2025, NULL,
'Acquisition Finance 2024 – Singapore (Chambers Global Practice Guides)',
CAST('["Employment"]' AS JSON),
'Acquisition Finance 2024 – Singapore (Chambers Global Practice Guides)'),

('Tier 1 firm in Private Client', NULL, 2025, NULL,
'SAL Practitioner: Insolvency Set-off in Judicial Management',
CAST('["Private Wealth, Professional Services"]' AS JSON),
'SAL Practitioner: Insolvency Set-off in Judicial Management'),

('Tier 3 firm in Shipping', NULL, 2025, NULL,
'International Comparative Legal Guide to: Enforcement of Foreign Judgments 2024 - Singapore Chapter',
CAST('["International Arbitration"]' AS JSON),
'International Comparative Legal Guide to: Enforcement of Foreign Judgments 2024 - Singapore Chapter'),

('Shipping Firm of the Year 2025', NULL, 2025, NULL,
'The Legal 500: Life Sciences Country Comparative Guide 2024 (Singapore)',
CAST('["International Arbitration"]' AS JSON),
'The Legal 500: Life Sciences Country Comparative Guide 2024 (Singapore)'),

('Impact Cases of the Year 2025 (Deutsche Telekom v The Republic of India)', NULL, 2025, NULL,
'The Legal 500: Corporate Governance Country Comparative Guide 2024 (Singapore)',
CAST('["International Arbitration"]' AS JSON),
'The Legal 500: Corporate Governance Country Comparative Guide 2024 (Singapore)'),

('Singapore Corporate & Finance Domestic Law Adviser of the Year 2025', NULL, 2025, NULL,
'Lexology In-Depth: Life Sciences Law (12th Edition) - Singapore',
CAST('["Antitrust & Competition, Banking & Finance, Corporate Governance & Compliance, Employment, FinTech, Health Sciences & Biotechnology, International Arbitration, Mergers & Acquisitions, Private Equity, Restructuring & Insolvency"]' AS JSON),
'Lexology In-Depth: Life Sciences Law (12th Edition) - Singapore'),

('Chambers Global Guide for Banking & Finance', NULL, 2025, NULL,
'The Legal 500: Employee Incentives Country Comparative Guide 2024 (Singapore)',
CAST('["Banking & Finance"]' AS JSON),
'The Legal 500: Employee Incentives Country Comparative Guide 2024 (Singapore)'),

('Chambers Global Guide for Banking & Finance: Regulatory, Capital Markets', NULL, 2025, NULL,
'International Comparative Legal Guide to: Private Client 2024 - Singapore Chapter',
CAST('["Banking & Finance, Debt Capital Markets, Equity Capital Markets"]' AS JSON),
'International Comparative Legal Guide to: Private Client 2024 - Singapore Chapter'),

('Chambers Global Guide for Corporate & Finance', NULL, 2025, NULL,
'Private Equity 2024 – Singapore (Chambers Global Practice Guides)',
CAST('["Antitrust & Competition, Banking & Finance, Corporate Governance & Compliance, Employment, FinTech, Health Sciences & Biotechnology, International Arbitration, Mergers & Acquisitions, Private Equity, Restructuring & Insolvency"]' AS JSON),
'Private Equity 2024 – Singapore (Chambers Global Practice Guides)'),

('Chambers Global Guide for Corporate/Mergers & Acquisitions', NULL, 2025, NULL,
'Restructuring & Insolvency 2024 – Singapore (Chambers Global Practice Guides)',
CAST('["Mergers & Acquisitions"]' AS JSON),
'Restructuring & Insolvency 2024 – Singapore (Chambers Global Practice Guides)'),

('Chambers Global Guide for Dispute Resolution: Arbitration', NULL, 2025, NULL,
'Banking Regulation 2024 – Singapore (Chambers Global Practice Guides)',
CAST('["International Arbitration"]' AS JSON),
'Banking Regulation 2024 – Singapore (Chambers Global Practice Guides)'),

('Chambers Global Guide for Dispute Resolution: Litigation', NULL, 2025, NULL,
'Corporate Investigations 2023 – Singapore (Chambers Global Practice Guides)',
CAST('["Asset Recovery & International Enforcement, Commercial & Corporate Disputes"]' AS JSON),
'Corporate Investigations 2023 – Singapore (Chambers Global Practice Guides)'),

('Chambers Global Guide for International & Cross-Border Capabilities', NULL, 2025, NULL,
'International Arbitration 2024 – Singapore (Chambers Global Practice Guides)',
CAST('["China, Indonesia, Middle East, Philippines, Vietnam"]' AS JSON),
'International Arbitration 2024 – Singapore (Chambers Global Practice Guides)'),

('Chambers Global Guide for Projects & Energy', NULL, 2025, NULL,
'Real Estate 2023 – Singapore (Chambers Global Practice Guides)',
CAST('["Energy, Projects & Construction"]' AS JSON),
'Real Estate 2023 – Singapore (Chambers Global Practice Guides)'),

('FT APAC Innovative Lawyers Report: Recognized in Practice of Law – Dispute Resolution', NULL, 2025, NULL,
'The Legal 500: Capital Markets Country Comparative Guide 2023 (Singapore)',
CAST('["Asset Recovery & International Enforcement, Commercial & Corporate Disputes"]' AS JSON),
'The Legal 500: Capital Markets Country Comparative Guide 2023 (Singapore)'),

('Top 100 in Global Investigation Review (GIR 100)', NULL, 2025, NULL,
'International Comparative Legal Guide to: Corporate Investigations 2024 - Singapore Chapter',
CAST('["White Collar & Enforcement, Corporate Governance & Compliance"]' AS JSON),
'International Comparative Legal Guide to: Corporate Investigations 2024 - Singapore Chapter'),

('Top 100 in Global Arbitration Review (GAR 100)', NULL, 2025, NULL,
'International Comparative Legal Guide to: International Arbitration 2023 - Singapore Chapter',
CAST('["International Arbitration"]' AS JSON),
'International Comparative Legal Guide to: International Arbitration 2023 - Singapore Chapter'),

('Top 100 in Global Restructuring Review (GRR 100)', NULL, 2025, NULL,
'International Comparative Legal Guide to: Banking Regulation 2024 - Singapore Chapter',
CAST('["Restructuring & Insolvency"]' AS JSON),
'International Comparative Legal Guide to: Banking Regulation 2024 - Singapore Chapter'),

('Pro-bono Work National Firm of the Year', NULL, 2025, NULL,
NULL,
CAST('["General"]' AS JSON),
NULL),

('Best National Firm for Women in Business Law', NULL, 2025, NULL,
NULL,
CAST('["General"]' AS JSON),
NULL),

('Country Award for Singapore at Euromoney LMG Asia Women in Business Law', NULL, 2025, NULL,
NULL,
CAST('["General"]' AS JSON),
NULL),

('FT APAC Innovative Lawyers Report: One of the Top Innovative Law Firms', NULL, 2025, NULL,
NULL,
CAST('["General"]' AS JSON),
NULL),

('FT APAC Innovative Lawyers Report: Winner in Innovation in Training and Development', NULL, 2025, NULL,
NULL,
CAST('["General"]' AS JSON),
NULL),

('FT APAC Innovative Lawyers Report: Recognized in Business of Law – AI Strategy', NULL, 2025, NULL,
NULL,
CAST('["General"]' AS JSON),
NULL),

('IFLR1000 Top Tier Firm', NULL, 2025, NULL,
NULL,
CAST('["General"]' AS JSON),
NULL),

('Lexology Index Leading Firm in SEA', NULL, 2025, NULL,
NULL,
CAST('["General"]' AS JSON),
NULL),

('Top 100 in Global Competition Review (GCR 100)', NULL, 2025, NULL,
NULL,
CAST('["General"]' AS JSON),
NULL),

('SmartLaw recognition by Law Society of Singapore', NULL, 2025, NULL,
NULL,
CAST('["General"]' AS JSON),
NULL),

('Legal500 APAC Top Tier Firm', NULL, 2025, NULL,
NULL,
CAST('["General"]' AS JSON),
NULL),

('Straits Times Survey: Singapore''s Best Law Firms', NULL, 2025, NULL,
NULL,
CAST('["General"]' AS JSON),
NULL);

-- ======================
-- DEALS
-- ======================
INSERT INTO deals (deal_name, client_name, deal_summary, significant_features, notability, notable_reason, acting_for, deal_value, currency, jurisdiction, deal_date, signing_date, completion_date, publicity_purposes, confidentiality, transaction_types, srb_related, pe_related, startup_or_vc_related, featured_other_areas, deal_pg, past_clients, remarks, partner_approval, partner_initial,deal_industry) VALUES
('Cryptocurrency Insolvency', 'Hodlnaut Pte Ltd (In Liquidation)', 'Acted for the Interim Judicial Managers and subsequently Liquidators of Hodlnaut Pte Ltd, a Singapore cryptocurrency lending platform, in multiple court proceedings including successfully resisting an application by the directors to remove them and obtaining a landmark ruling that cryptocurrency debts can be relied upon to wind up a company.', 'Landmark cryptocurrency insolvency case where the High Court held that obligations to repay cryptocurrency to account holders are "debts" within section 125(1)(e) of the Insolvency, Restructuring and Dissolution Act 2018, so that the company''s inability to pay such liabilities justified a winding up order; court also found that the halt on withdrawals did not extinguish or postpone those liabilities.', 'Yes', 'First Singapore judgment expressly confirming that cryptocurrency liabilities constitute debts for insolvency purposes and may be used to wind up a company, widely cited as a key precedent for regulation of crypto platforms in Singapore.', 'Advisors', 500000000, 'SGD', 'Singapore', '2022-08-29', '2023-11-09', '2023-11-10', CAST('["Linkedin", "Practice Brochures", "Capability Statement/Proposals", "Website"]' AS JSON), CAST('["Client/Party Names"]' AS JSON), CAST('["Corporate and Commercial"]' AS JSON), CAST('false' AS JSON), CAST('false' AS JSON), CAST('["Start-up"]' AS JSON), CAST('["Specialised Practices", "FinTech", "Regulatory", "Corporate & Regulatory Investigations"]' AS JSON), CAST('["Litigation & Dispute Resolution", "Restructuring & Insolvency", "Commercial & Corporate Disputes", "Regulatory", "Corporate & Regulatory Investigations", "Specialised Practices", "FinTech"]' AS JSON), 'Hodlnaut Pte Ltd (Interim Judicial Managers and Liquidators)', 'The company entered interim judicial management on 29 August 2022 and was ordered to be wound up on 10 November 2023; the court''s decision clarified that cryptocurrency obligations are relevant debts for assessing cash flow insolvency under section 125 IRDA, rejected arguments that only fiat-denominated claims qualify, and found that Hodlnaut''s liabilities to thousands of account holders and losses from the Terra/UST collapse rendered it unable to pay its debts.', 'Yes', 'AN','Cryptocurrency & Digital Assets'),
('Mexican Oil Rig Insolvency', 'Guerra Gonzalez y Asociados SC (Mexican law firm representing non-party Mexican attorney)', 'Lead counsel before the Court of Appeal for a Mexican attorney (Jesus Angel Guerra Mendez) to vary an injunction restraining insolvency proceedings (concurso mercantil) in Mexico concerning the Oro Negro drilling rig group and six Singapore-incorporated rig-owning companies.', 'Court of Appeal decision examining whether Singapore injunctions restraining Mexican insolvency proceedings constituted anti-suit injunctions; involved complex cross-border insolvency dispute concerning USD 725 million bond default, Pemex charter contracts, and competing Mexican and Singapore insolvency processes; Court examined jurisdictional issues and anti-suit injunction principles.', 'Yes', 'Significant Court of Appeal decision on anti-suit injunctions and cross-border insolvency restraint principles; Court cast doubt on legal possibility of service out of jurisdiction where Singapore is not natural forum but substantial injustice alleged; precedent for conflicts between concurrent insolvency proceedings in multiple jurisdictions.', 'Offerees', 725000000, 'USD', 'Singapore, Mexico', '2017-09-01', '2019-11-26', '2019-11-26', CAST('["Practice Brochures", "Capability Statement/Proposals"]' AS JSON), CAST('["Client/Party Names"]' AS JSON), CAST('["Corporate and Commercial"]' AS JSON), CAST('false' AS JSON), CAST('false' AS JSON), CAST('false' AS JSON), CAST('["International Practices"]' AS JSON), CAST('["Litigation & Dispute Resolution", "Asset Recovery & International Enforcement", "Restructuring & Insolvency", "International Practices"]' AS JSON), 'Jesus Angel Guerra Mendez (Mexican attorney, non-party)', 'Dispute arose from default on USD 725 million bond issued by Oro Negro Drilling Pte Ltd following collapse in oil prices and termination of Pemex charter contracts worth USD 1.5 billion; six Singapore-incorporated rig-owning companies and Mexican parent company Integradora de Servicios Petroleros Oro Negro SAPI de CV all became insolvent in September 2017; competing insolvency processes initiated in Mexico (concurso mercantil) and Singapore; bondholders obtained Singapore injunctions restraining Mexican attorney from initiating Mexican proceedings.', 'Yes', 'AN','Oil & Gas Services'),
('GCB Construction Dispute', 'Chan Sau Yan Associates', 'Acted for architects in High Court proceedings arising from a dispute over the construction of three two-storey good class bungalows at 12 Leedon Park, including defending allegations of negligence and unlawful means conspiracy in relation to contract administration and certification issues under the SIA Conditions.', 'Judgment addresses claims/counterclaims and third party claims against the architect/architectural practice, involving interpretation and application of the Singapore Institute of Architects’ Articles and Conditions of Building Contract (Lump Sum Contract) (9th Ed, Sept 2010), including issues around extensions of time, completion certification, maintenance certification, payment certification, and an unlawful means conspiracy claim.', 'Yes', 'Matter involved extensive hearing dates spanning from 8 November 2018 to 29 October 2020 and addressed a wide range of construction law issues under the SIA Conditions together with allegations of conspiracy.', 'Offerees', 13130000, 'SGD', 'Singapore', '2018-11-08', '2018-11-08', '2020-10-29', CAST('["Practice Brochures", "Capability Statement/Proposals"]' AS JSON), CAST('["Client/Party Names"]' AS JSON), CAST('["Corporate and Commercial"]' AS JSON), CAST('false' AS JSON), CAST('false' AS JSON), CAST('false' AS JSON), CAST('["Professional Services"]' AS JSON), CAST('["Litigation & Dispute Resolution", "Commercial & Corporate Disputes", "Professional and Enterprise Disputes", "Construction Group", "Infrastructure", "Construction & Engineering"]' AS JSON), 'Chan Sau Yan Associates; Chan Sau Yan Sonny', 'Suit arose from construction of three two-storey good class bungalows (Units 12, 12A and 12B) at 12 Leedon Park for an agreed lump sum price of $13,130,000; the matter involved claims for certified payment claims, counterclaims and third party claims including allegations of unlawful means conspiracy and issues around EOTs and certification under the SIA Conditions.', 'Yes', 'AN','Construction & Engineering'),
('Breach of software licensing ag', 'SK Holdings and Korea Technologies', 'Acted for two Korean entities in an ICC arbitration against three respondents incorporated in the PRC, Cayman Islands and Republic of Korea, involving claims for breach of a software licensing agreement and conspiracy, with damages awarded to the claimants in excess of USD150 million.', 'Complex multi-party, multi-contract ICC arbitration involving multiple governing laws (Korean law, PRC/Chinese law and Singapore law) and claims framed in both contract (software licensing) and tort/conspiracy. ', 'Yes', 'Claimants obtained an award of damages exceeding USD150 million in a cross-border ICC arbitration involving multiple legal systems and parties. ', 'Advisors', 150000000, 'USD', 'Singapore; PRC; Cayman Islands; Republic of Korea', NULL, NULL, NULL, CAST('["Linkedin", "Practice Brochures", "Capability Statement/Proposals", "Website​"]' AS JSON), CAST('["Client/Party Names"]' AS JSON), CAST('["Corporate and Commercial"]' AS JSON), CAST('false' AS JSON), CAST('false' AS JSON), CAST('false' AS JSON), CAST('[]' AS JSON), CAST('["Litigation & Dispute Resolution", "International Arbitration", "Commercial & Corporate Disputes", "Intellectual Property", "Technology & Data", "Technology & Media"]' AS JSON), 'Korean Claimants (two entities)', 'ICC arbitration involving multiple parties and contracts and multiple legal issues under Korean law, Chinese law and Singapore law, relating to breach of a software licensing agreement and conspiracy; award of damages exceeded USD150 million.', 'Yes', 'CHK','Technology / Media'),
('SICC set-aside proceedings', 'CFJ and CFK', 'Acted for a leading multinational energy company and its subsidiary in Singapore International Commercial Court proceedings seeking to set aside two partial arbitral awards rendered under a SIAC arbitration, arising from a claim of approximately US$5.5 billion for fraudulent misrepresentation, breach of warranties and indemnity losses in relation to a North Sea oil venture.​', 'SICC application to set aside partial awards in a high-value SIAC arbitration; the dispute involved allegations of deceit/fraudulent misrepresentation, breach of contractual warranties, and indemnity-based recovery in connection with an oil & gas transaction.', 'Yes', 'Proceedings arose from a reported claim of approximately US$5.5 billion connected to a North Sea oil venture and involved applications to set aside two partial awards, engaging Singapore’s arbitration-law standards of curial non-intervention. ', 'Offerors', 5500000000, 'USD', 'Singapore​', NULL, NULL, NULL, CAST('["Linkedin", "Practice Brochures", "Capability Statement/Proposals", "Website​"]' AS JSON), CAST('["Client/Party Names"]' AS JSON), CAST('["Corporate and Commercial"]' AS JSON), CAST('false' AS JSON), CAST('false' AS JSON), CAST('false' AS JSON), CAST('[]' AS JSON), CAST('["Litigation & Dispute Resolution", "International Arbitration", "Commercial & Corporate Disputes", "Commodities & International Trade Disputes"]' AS JSON), 'CFJ and CFK​', 'SICC proceedings (reported under anonymised party names) involved applications to set aside two partial awards and an application to remove the presiding arbitrator; the court refused to set aside the partial awards, reflecting Singapore’s pro-arbitration stance and minimal curial intervention. ', 'Yes', 'CHK','Energy'),
('Set-aside of ICC Arbitral award', 'ABC Steelworks', 'Acted for a world-leading, LSE-listed steel plant designer and manufacturer in successfully setting aside an arbitral award rendered in an ICC arbitration involving claims exceeding £280 million.', 'Arbitration-related court proceedings; set-aside of an ICC arbitral award; high-value dispute (claims exceeding £280 million).', 'Yes', 'High-value arbitration-related court proceedings (claims exceeding £280 million) with a successful set-aside outcome.', 'Advisors', 280000000, 'GBP', '-', NULL, NULL, NULL, CAST('["Website"]' AS JSON), CAST('["Client/Party Names"]' AS JSON), CAST('["Corporate and Commercial"]' AS JSON), CAST('false' AS JSON), CAST('false' AS JSON), CAST('false' AS JSON), CAST('[]' AS JSON), CAST('["International Arbitration"]' AS JSON), 'ABC Steelworks', 'The profile describes a successful set-aside of an ICC arbitral award, but does not provide the case citation, seat, counterparty, or court level.', 'Yes', 'DW','Industrials'),
('Logistics Portfolio Acquisition', 'Asia Investments', 'Acted for the sponsors and the investment manager for the formation of Primus Partners Trust (backed by Hillhouse Capital and JINGDONG Property, Inc.) which acquired a Singapore logistics portfolio from ESR-Logos REIT for approximately S$350 million (including land premium), and also acted on the formation of 5 sub-trusts wholly held by Primus Partners Trust for the purpose of making the acquisition.', 'Acquisition structured via trust/sub-trust vehicles; portfolio comprises five logistics assets totalling 1.9 million sq ft of GFA; establishment of Primus Partners Management Asia Pte Ltd as a platform to manage the portfolio', 'Yes', 'Publicly announced cross-border logistics real estate acquisition in Singapore of ~S$350m involving five assets and creation of a new operating platform.', 'Advisors', 350000000, 'SGD', 'Singapore', '2023-06-23', '2023-06-23', '2023-10-17', CAST('["Website", "Proposals"]' AS JSON), CAST('["Client/Party Names"]' AS JSON), CAST('["Corporate and Commercial"]' AS JSON), CAST('false' AS JSON), CAST('["-"]' AS JSON), CAST('false' AS JSON), CAST('[]' AS JSON), CAST('["Asset Management & Funds"]' AS JSON), 'Hillhouse Capital; JINGDONG Property, Inc.; ESR-Logos REIT', 'ESR-Logos REIT publicly announced put and call option agreements on 23 June 2023 for divestment of a portfolio of 5 assets for S$313.5m (excluding divestment costs and GST), with purchasers being sub-trusts where Intertrust (Singapore) Limited acted as trustee for each sub-trust.', 'Yes', 'FNG','Asset Management / Funds'),
('DBS Structured Note Programme', 'DBS Bank Ltd. ​', 'Acted for DBS in updating its existing US$26,000,000,000 Structured Note Programme to facilitate the issuance of structured digital notes (“Digital Notes”), contemplating concurrent issuance of digital tokens representing rights and interests in the Digital Notes on relevant blockchain(s) to designated digital wallets.​', 'Update of an established structured note programme to support tokenisation; digital tokens represent rights/interests in the notes; distribution contemplated via designated digital wallets and (per public firm update) distribution through digital investment platforms.​', 'Yes​', 'Publicly announced “tokenised structured notes” programme update by Singapore’s largest bank, positioned as a new product class and a notable structured products market development.​', 'Advisors​', 26000000000, 'USD​', 'Singapore​', '2025-09-29', '2025-09-29', NULL, CAST('["Website", "Linkedin", "Practice Brochures/Proposals​"]' AS JSON), CAST('["-"]' AS JSON), CAST('["Corporate and Commercial"]' AS JSON), CAST('false' AS JSON), CAST('false' AS JSON), CAST('false' AS JSON), CAST('["Financial Services Regulatory (tokenisation aspects); Tax (team included Head of Tax)"]' AS JSON), CAST('["Debt Capital Markets; Financial Services Regulatory"]' AS JSON), 'DBS Bank Ltd. ​', 'inaugural issuance under the updated programme involved cash-settled, cryptocurrency-linked participation notes to be distributed via ADDX, DigiFT and HydraX, and that the tokenised notes contemplate issuance of digital tokens on a blockchain representing rights/interests. ​', 'Yes', 'HCY','Capital Markets / Debt Capital Markets​'),
('SATS-Mitsui partnership', 'SATS Ltd.', 'Acted for SATS Ltd. on its partnership with Mitsui & Co., Ltd., under which Mitsui would invest S$36.4 million for a 15% stake in Food Solutions Sapphire Holdings, a holding vehicle established by SATS, which would acquire interests in four SATS food solutions subsidiaries in Singapore, Thailand, India and China.​', 'Minority strategic investment (15%); holding company (Food Solutions Sapphire Holdings) used as the vehicle; downstream reorganisation of four operating subsidiaries across multiple jurisdictions (Singapore/Thailand/India/China).​', 'Yes​', 'Publicly announced cross-border strategic partnership combining SATS’ food solutions platform with Mitsui’s network to expand in Asian markets.', 'Advisors', 36400000, 'SGD​', 'Singapore​', '2024-07-18', '2024-07-18', NULL, CAST('["Website", "Press"]' AS JSON), CAST('["No"]' AS JSON), CAST('["Mergers & Acquisitions; Corporate and Commercial"]' AS JSON), CAST('false' AS JSON), CAST('false' AS JSON), CAST('false' AS JSON), CAST('["Corporate restructuring"]' AS JSON), CAST('["Debt Capital Markets; Mergers & Acquisitions"]' AS JSON), 'SATS Ltd.', 'Mitsui would invest ~S$36.4m for 15% in the holding vehicle, and that the structure would include interests in Country Foods (SG), SATS Food Solutions Thailand, SATS Food Solutions India and SATS (Tianjin) Food (CN); the amount also accounts for certain loans/bonds related to the food solutions entities.', 'Yes', 'HSK','M&A / Strategic investment​'),
('Acquisition of stake in Indones', 'KKR Asia Limited; Demeter Indo Investment Pte. Ltd. (KKR Asian Fund III affiliate)​', 'Acted for KKR Asia Limited in connection with Demeter Indo Investment Pte. Ltd. (an affiliate of KKR Asian Fund III) acquiring an approximate 12.64% stake in PT Nippon Indosari Corpindo Tbk (Indonesia’s mass-market bread company).', 'Minority public-company stake acquisition (~12.64%) by a KKR Asian Fund III affiliate through Demeter Indo Investment Pte. Ltd.​', 'Yes​', 'Reported cross-border private equity investment into a leading Indonesian listed consumer staples company.​', 'Advisors', 1000000000000, 'IDR​', 'Indonesia; Singapore', NULL, NULL, NULL, CAST('["Website", "Press"]' AS JSON), CAST('["No"]' AS JSON), CAST('["Corporate and Commercial; M&A / Minority investment​"]' AS JSON), CAST('false' AS JSON), CAST('["Yes​"]' AS JSON), CAST('false' AS JSON), CAST('[]' AS JSON), CAST('["Equity Capital Markets; Indonesia"]' AS JSON), 'KKR Asia Limited', 'The stake size is (~12.64%) and the investment was made from KKR Asian Fund III; Also, purchase price of IDR 1,275 per share and aggregate consideration of approximately IDR 1000 billion', 'Yes', 'JC','Private equity investment​'),
('Teochew Building property dispu', 'Teochew Poit Ip Huay Kuan​', 'Acted for Teochew Poit Ip Huay Kuan (“THK”) in The Ngee Ann Kongsi v Teochew Poit Ip Huay Kuan SGHC 256, a dispute involving the Teochew Building at 97 Tank Road, engaging issues including trust, equity and charitable purposes, arising in an originating summons where THK sought conversion to a writ action. ​', 'High-profile community-organisation property dispute; subject property is a four-storey building at 97 Tank Road; proceedings included an application to convert Originating Summons No 1499 of 2018 into a writ action under O 28 r 8 ROC, with the court considering whether substantial disputes of fact were likely to arise (including potential proprietary estoppel issues). ​', 'Yes', 'Reported Singapore High Court decision involving prominent Teochew organisations and ownership/occupation of a landmark community building at 97 Tank Road. ​', 'Advisors', NULL, '-', 'Singapore ​', NULL, NULL, NULL, CAST('["Website​"]' AS JSON), CAST('["No​"]' AS JSON), CAST('["Corporate and Commercial (Dispute Resolution)"]' AS JSON), CAST('false' AS JSON), CAST('false' AS JSON), CAST('false' AS JSON), CAST('["Trusts / charities aspects; property/land occupation issues; civil procedure (conversion). ​"]' AS JSON), CAST('["Specialist & Private Client Disputes", "Litigation & Dispute Resolution"]' AS JSON), 'Teochew Poit Ip Huay Kuan; The Ngee Ann Kongsi ​', 'The High Court allowed THK’s conversion application, finding substantial disputes of fact likely to arise (including around alleged representations and reliance relevant to proprietary estoppel), and noted the Teochew Building is located at 97 Tank Road and has housed THK’s office premises since 1963. ​', 'Yes', 'JC','Litigation / Dispute Resolution'),
('Sustainability Reporting platfo', 'Ant International ​', 'Acted for Ant International in Gprnt’s US$4.62 million seed funding round. Gprnt is a sustainability reporting and data platform launched by the Monetary Authority of Singapore (MAS) as a digital platform of the Global Finance and Technology Network, positioned as a nationwide utility to help companies in Singapore auto-generate basic sustainability metrics using government-sourced utilities data. ​', 'Seed round funding amount disclosed; platform launched by MAS/; stated focus on Singapore companies (especially SMEs) and automated generation of basic sustainability metrics using utilities data. ​', 'Yes​', 'Publicly announced seed funding tied to a MAS-launched platform and described as a “world’s first nationwide utility” for sustainability reporting. ​', 'Advisors', 4620000, 'USD ​', 'Singapore ​', NULL, NULL, NULL, CAST('["Website", "Press​"]' AS JSON), CAST('["No​"]' AS JSON), CAST('["Corporate and Commercial; Start-up / Venture Capital"]' AS JSON), CAST('false' AS JSON), CAST('false' AS JSON), CAST('true' AS JSON), CAST('["FinTech"]' AS JSON), CAST('["WPGrow: Start-Up / Venture Capital; FinTech"]' AS JSON), 'Ant International', 'Gprnt is supported by US$4.62m seed funding from Ant International and MUFG Bank; Gprnt was launched by MAS as a digital platform and is intended to help Singapore companies auto-generate basic sustainability metrics using government-sourced utilities data. ​', 'Yes', 'KL','Venture capital / Seed financing ​'),
('Second Changi NEWater plant pro', 'UE NEWater Pte. Ltd.; BEWG International Pte. Ltd.', 'Acted for the consortium comprising UE NEWater Pte. Ltd. and BEWG International Pte. Ltd. in relation to Singapore’s Second NEWater Plant at Changi, a 25-year DBOO project (2016–2041) with warranted capacity of 228,000 m³/day, which won “Water Deal of the Year” at the Global Water Awards 2016. ​', 'DBOO delivery model; 25-year term; 228,000 m³/day (50 mgd) capacity; identified as Changi NEWater II and recognised by Global Water Awards. ', 'Yes​', 'Won Global Water Awards 2016 “Water Deal of the Year”; described as a major contribution to private sector participation in the water sector and a foreign-led water PPP in Singapore. ​', 'Advisors', 180000000, 'SGD ​', 'Singapore ', NULL, NULL, NULL, CAST('["Website", "Awards citations"]' AS JSON), CAST('["No"]' AS JSON), CAST('["Projects / Infrastructure; PPP (DBOO) ​"]' AS JSON), CAST('false' AS JSON), CAST('false' AS JSON), CAST('false' AS JSON), CAST('[]' AS JSON), CAST('["Energy", "Projects & Construction"]' AS JSON), 'UE NEWater Pte. Ltd.; BEWG International Pte. Ltd.; PUB ​', 'S$180m financing package for a 25-year DB(O)O project producing 228,000 m³/day of NEWater from Changi WRP influent, BEWG–UEL is the winning consortium; the DBOO arrangement and capacity figure is 228,000 m³/day (50 mgd). ', 'Yes', 'LL','Infrastructure / Water ​'),
('Fundraising for Jollibee', 'Titan Dining II LP', 'Acted for the general partner and investment manager of Titan Dining II LP, a private equity fund investing in Asia which raised S$100 million with the support of anchor investor Jollibee Worldwide Pte. Ltd. (part of the Jollibee Group). ​', 'Private equity fund formation/fundraise; anchor investor disclosed as Jollibee Worldwide Pte. Ltd.; fund focus described publicly as strategic investments in food and beverage concepts to grow Asia-Pacific food service brands.', 'Yes​', 'Public reports frame Titan Dining II as a dedicated fund vehicle for F&B growth tied to the Tim Ho Wan platform and backed by the Jollibee group.', 'Advisors', 100000000, 'SGD ​', 'Singapore​', '2024-04-03', '2024-04-03', '2024-04-03', CAST('["Website", "Press​"]' AS JSON), CAST('["No​"]' AS JSON), CAST('["Corporate and Commercial; Asset Management & Funds"]' AS JSON), CAST('false' AS JSON), CAST('true' AS JSON), CAST('false' AS JSON), CAST('["Financial services regulatory / licensing and fund structuring"]' AS JSON), CAST('["Asset Management & Funds; Private Equity; Mergers & Acquisitions"]' AS JSON), 'Jollibee Worldwide Pte. Ltd.​', 'Jollibee Worldwide Pte. Ltd. participated and made a capital call commitment to Titan Dining II LP and the fund size is S$100m; the fund raised S$100m on 3 April 2024 with JWPL as anchor investor. ​', 'Yes', 'LKK','Investment funds / Fund formation'),
('Stablecoin Ecosystem collapse l', 'Terraform Labs Pte. Ltd.; Luna Foundation Guard', 'Acted for Terraform Labs Pte. Ltd. and Luna Foundation Guard in representative action litigation in Singapore following the Terra stablecoin ecosystem collapse in 2022, including proceedings in the Singapore International Commercial Court, where they successfully resisted the majority of claims brought by over 350 claimants in Singapore’s first large-scale representative action involving cryptocurrencies, with related trial and appellate proceedings ongoing.', 'Singapore representative action (“class action” style) involving cryptocurrencies; claims connected to TerraUSD (UST) collapse in May 2022; group litigation involving hundreds of claimants; proceedings include High Court and SICC stages in related Terraform matters. ', 'Yes', 'Described as Singapore’s first large-scale representative action involving cryptocurrencies and connected to the high-profile Terra/Luna collapse. ​', 'Advisors', NULL, '-', 'Singapore (High Court / SICC) ', NULL, NULL, NULL, CAST('["Website​"]' AS JSON), CAST('["No"]' AS JSON), CAST('["Corporate and Commercial (Dispute Resolution / Litigation)"]' AS JSON), CAST('false' AS JSON), CAST('false' AS JSON), CAST('false' AS JSON), CAST('["White collar / enforcement-adjacent issues"]' AS JSON), CAST('["Specialist & Private Client Disputes; White Collar & Enforcement; Litigation & Dispute Resolution"]' AS JSON), 'Terraform Labs Pte. Ltd.; Luna Foundation Guard', 'The representative action is brought by individuals on behalf of a group of claimants concerning TerraUSD (UST) and the Terra/Luna collapse, with related decisions including SGHC 340 and later SICC decisions in 2025.', 'Yes', 'SN','Litigation / Dispute Resolution');

-- NOTE: 18 lawyer names in Excel were not found in lawyers insert list, so they are omitted from deal_lawyers.
--   deal_id 1: Stephanie Yeo (Partner)
--   deal_id 1: Leo Zhen Wei Lionel (Senior Associate)
--   deal_id 4: Chan Hock Keng​ (Partner)
--   deal_id 5: Chan Hock Keng​ (Partner)
--   deal_id 6: Daryl Wong (Partner)
--   deal_id 7: Felicia Ng (Partner)
--   deal_id 8: Hui Choon Yuen; Trevor Chuan; Shao Tong Tan; Sion Yoong Tian​ (Partner)
--   deal_id 8: Alvin Chua; Wesley Aw​ (Senior Associate)
--   deal_id 8: Jia Sheng Loh; Grace Foo​ (Associate)
--   deal_id 9: Ho Soon Keong (Partner)
--   deal_id 10: James Choo (Partner)
--   deal_id 11: Tan Chee Meng SC; Josephine Choo ​ (Partner)
--   deal_id 11: Valerie Quay ​ (Senior Associate)
--   deal_id 11: Eugene Oh ​ (Associate)
--   deal_id 12: Kyle Lee (Partner)
--   deal_id 13: Linda Low (Partner)
--   deal_id 14: Low Kah Keong (Partner)
--   deal_id 15: Samuel Navindran (Partner)

-- ======================
-- RELATION TABLES (deal_lawyers, deal_awards, lawyer_awards)
-- ======================
INSERT INTO deal_lawyers (deal_id, lawyer_id, role) VALUES
(1, 1, 'Partner'),
(2, 1, 'Partner'),
(3, 1, 'Partner');
COMMIT;

-- Expected row counts after load:
--   lawyers: 128
--   awards : 36
--   deals  : 12
--   deal_lawyers: 15