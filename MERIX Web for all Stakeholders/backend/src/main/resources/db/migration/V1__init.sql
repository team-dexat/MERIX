-- ============================================================================
-- MERIX: Legal Metrology Online Verification System (SIH26036)
-- Complete PostgreSQL / Supabase Schema & Seed Migration
-- Department of Consumer Affairs, Government of India
-- ============================================================================

-- 0. Enable UUID extension if supported
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    business_name VARCHAR(255),
    role VARCHAR(50) NOT NULL, -- BUSINESS_OWNER, LMO_OFFICER, GATC_CENTER, ADMIN, CITIZEN
    phone_number VARCHAR(20),
    district VARCHAR(100),
    state VARCHAR(100) DEFAULT 'Tamil Nadu',
    jurisdiction_zone VARCHAR(100),
    license_no VARCHAR(100),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. INSTRUMENTS TABLE
CREATE TABLE IF NOT EXISTS instruments (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    business_name VARCHAR(255) NOT NULL,
    instrument_type VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    manufacturer VARCHAR(255) NOT NULL,
    model_number VARCHAR(100) NOT NULL,
    serial_number VARCHAR(100) UNIQUE NOT NULL,
    accuracy_class VARCHAR(20) NOT NULL,
    max_capacity VARCHAR(50) NOT NULL,
    min_capacity VARCHAR(50),
    verification_interval_months INT DEFAULT 12,
    verification_scale_interval_e VARCHAR(50),
    actual_scale_interval_d VARCHAR(50),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    installation_address TEXT NOT NULL,
    pincode VARCHAR(10),
    photo_url TEXT,
    qr_code_data TEXT,
    trust_score INT DEFAULT 100,
    is_at_drift_risk BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'REGISTERED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. VERIFICATION APPLICATIONS
CREATE TABLE IF NOT EXISTS verification_applications (
    id VARCHAR(64) PRIMARY KEY,
    instrument_id VARCHAR(64) REFERENCES instruments(id) ON DELETE CASCADE,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    application_type VARCHAR(50) NOT NULL,
    preferred_date DATE NOT NULL,
    calculated_fee DECIMAL(10, 2) NOT NULL,
    fee_paid BOOLEAN DEFAULT TRUE,
    payment_reference VARCHAR(100),
    status VARCHAR(50) DEFAULT 'SUBMITTED',
    documents_url TEXT,
    scrutiny_remarks TEXT,
    scrutiny_officer_id VARCHAR(64),
    filed_on TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    sla_due_date TIMESTAMP WITH TIME ZONE,
    sla_breached BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. ALLOCATIONS & FIELD SCHEDULES
CREATE TABLE IF NOT EXISTS allocations (
    id VARCHAR(64) PRIMARY KEY,
    application_id VARCHAR(64) REFERENCES verification_applications(id) ON DELETE CASCADE,
    assigned_to_type VARCHAR(50) NOT NULL, -- LMO, GATC
    assigned_to_id VARCHAR(64) REFERENCES users(id),
    assigned_to_name VARCHAR(255) NOT NULL,
    scheduled_date DATE NOT NULL,
    scheduled_time_slot VARCHAR(50) NOT NULL,
    instructions TEXT,
    allocated_by VARCHAR(64),
    status VARCHAR(50) DEFAULT 'SCHEDULED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. INSPECTION & DIGITAL TESTING RECORDS
CREATE TABLE IF NOT EXISTS inspection_records (
    id VARCHAR(64) PRIMARY KEY,
    application_id VARCHAR(64) REFERENCES verification_applications(id) ON DELETE CASCADE,
    instrument_id VARCHAR(64) REFERENCES instruments(id),
    officer_id VARCHAR(64) REFERENCES users(id),
    inspector_latitude DOUBLE PRECISION,
    inspector_longitude DOUBLE PRECISION,
    geo_fence_verified BOOLEAN DEFAULT TRUE,
    checklist_results JSONB,
    test_load_readings JSONB,
    eccentricity_test_passed BOOLEAN DEFAULT TRUE,
    repeatability_test_passed BOOLEAN DEFAULT TRUE,
    calculated_max_error DECIMAL(10, 4),
    max_permissible_error DECIMAL(10, 4),
    test_verdict VARCHAR(50) NOT NULL,
    stamp_number VARCHAR(100),
    security_seal_number VARCHAR(100),
    inspection_photos TEXT,
    remarks TEXT,
    verified_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. CERTIFICATES TABLE
CREATE TABLE IF NOT EXISTS certificates (
    id VARCHAR(64) PRIMARY KEY,
    certificate_number VARCHAR(100) UNIQUE NOT NULL,
    application_id VARCHAR(64) REFERENCES verification_applications(id),
    instrument_id VARCHAR(64) REFERENCES instruments(id),
    user_id VARCHAR(64) REFERENCES users(id),
    officer_id VARCHAR(64) REFERENCES users(id),
    issue_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    stamp_id VARCHAR(100) NOT NULL,
    qr_code_url TEXT NOT NULL,
    digital_signature_hash TEXT NOT NULL,
    chain_hash_previous TEXT,
    chain_hash_current TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'VALID',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. RULE ENGINE CONFIGURATIONS
CREATE TABLE IF NOT EXISTS rule_engine_configs (
    id VARCHAR(64) PRIMARY KEY,
    instrument_type VARCHAR(100) NOT NULL,
    capacity_min_val DECIMAL(12, 2),
    capacity_max_val DECIMAL(12, 2),
    capacity_unit VARCHAR(20),
    verification_fee DECIMAL(10, 2) NOT NULL,
    reverification_fee DECIMAL(10, 2) NOT NULL,
    validity_months INT DEFAULT 12,
    mpe_formula_class VARCHAR(50),
    checklist_template JSONB,
    sla_scrutiny_hours INT DEFAULT 48,
    sla_verification_days INT DEFAULT 7,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. CITIZEN REPORTS & CONSUMER PROTECTION
CREATE TABLE IF NOT EXISTS citizen_reports (
    id VARCHAR(64) PRIMARY KEY,
    instrument_id VARCHAR(64) REFERENCES instruments(id),
    business_name VARCHAR(255) NOT NULL,
    reported_by_name VARCHAR(255) DEFAULT 'Anonymous Citizen',
    reported_by_phone VARCHAR(20),
    issue_category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    photo_evidence_url TEXT,
    reported_latitude DOUBLE PRECISION,
    reported_longitude DOUBLE PRECISION,
    status VARCHAR(50) DEFAULT 'OPEN',
    officer_assigned VARCHAR(64),
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. AUDIT LOGS & TAMPER-EVIDENT TRAIL
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actor_id VARCHAR(64) NOT NULL,
    actor_name VARCHAR(255) NOT NULL,
    actor_role VARCHAR(50) NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(100) NOT NULL,
    ip_address VARCHAR(50) DEFAULT '127.0.0.1',
    details TEXT,
    payload_hash VARCHAR(64)
);

-- ============================================================================
-- INITIAL SEED DATA (TAMIL NADU JURISDICTION)
-- ============================================================================

-- 1. SEED USERS
INSERT INTO users (id, email, full_name, business_name, role, phone_number, district, state, jurisdiction_zone, license_no)
VALUES
('USR-001', 'sundar.industries@merix.tn.gov', 'S. Sundararaman', 'Sundar Industries Pvt Ltd', 'BUSINESS_OWNER', '+91 98401 23456', 'Chennai', 'Tamil Nadu', 'Zone-5 Chennai Central (George Town)', 'LM-TN-2022-048912'),
('USR-002', 'soundararajan.admin@merix.tn.gov', 'K. Rangarajan (Controller)', 'Dept of Legal Metrology, Govt of Tamil Nadu', 'ADMIN', '+91 44 2859 1234', 'Chennai', 'Tamil Nadu', 'Tamil Nadu State HQ, DMS Complex, Teynampet', NULL),
('USR-003', 'murugan.lmo@merix.tn.gov', 'K. Murugan, Inspector (LMO)', 'State Legal Metrology Dept, Chennai Circle', 'LMO_OFFICER', '+91 94441 56789', 'Chennai', 'Tamil Nadu', 'Chennai Central & Harbor Sub-Division', 'LMO-TN-044'),
('USR-004', 'senthil.gatc@merix.tn.gov', 'Tamil Nadu GATC Testing Center (GATC-01)', 'Govt Approved Test Center, Guindy Metrology Hub', 'GATC_CENTER', '+91 44 2254 3300', 'Chennai', 'Tamil Nadu', 'Guindy Industrial Estate Lab Zone', 'GATC-TN-DOCA-2023-04'),
('USR-005', 'anitha.citizen@gmail.com', 'M. Karthik Raja', 'Consumer Citizen', 'CITIZEN', '+91 98840 98765', 'Chennai', 'Tamil Nadu', 'Mylapore - T. Nagar Ward', NULL),
('USR-006', 'muthukumar@murugantextiles.tn', 'P. Muthukumar', 'Murugan Textiles & Ginning Mills', 'BUSINESS_OWNER', '+91 94432 11223', 'Coimbatore', 'Tamil Nadu', 'Coimbatore South - Peelamedu Industrial Zone', 'LM-TN-2021-039102'),
('USR-007', 'annamalai@pandianbullion.com', 'Dr. S. Annamalai', 'Pandian Bullion & Jewellery Exporters', 'BUSINESS_OWNER', '+91 98421 55667', 'Madurai', 'Tamil Nadu', 'Madurai East - South Avani Moola St', 'LM-TN-2023-078219'),
('USR-008', 'vijayalakshmi@ponnirice.tn', 'T. Vijayalakshmi', 'Ponni Modern Rice & Agro Processing Mills', 'BUSINESS_OWNER', '+91 94433 99881', 'Thanjavur', 'Tamil Nadu', 'Thanjavur Delta Agro Corridor', 'LM-TN-2022-019844'),
('USR-009', 'selvakumar.lmo@merix.tn.gov', 'N. Selvakumar, Inspector (LMO)', 'State Legal Metrology Dept, Coimbatore Circle', 'LMO_OFFICER', '+91 94443 78901', 'Coimbatore', 'Tamil Nadu', 'Coimbatore North & Tiruppur Hub', 'LMO-TN-042'),
('USR-010', 'jayachandran.lmo@merix.tn.gov', 'R. Jayachandran, Inspector (LMO)', 'State Legal Metrology Dept, Madurai Circle', 'LMO_OFFICER', '+91 94445 65432', 'Madurai', 'Tamil Nadu', 'Madurai South & Dindigul Corridor', 'LMO-TN-045')
ON CONFLICT (id) DO UPDATE SET
email = EXCLUDED.email,
full_name = EXCLUDED.full_name,
business_name = EXCLUDED.business_name,
district = EXCLUDED.district,
state = EXCLUDED.state,
jurisdiction_zone = EXCLUDED.jurisdiction_zone;

-- 2. SEED INSTRUMENTS
INSERT INTO instruments (id, user_id, business_name, instrument_type, category, manufacturer, model_number, serial_number, accuracy_class, max_capacity, min_capacity, verification_interval_months, verification_scale_interval_e, actual_scale_interval_d, latitude, longitude, installation_address, pincode, trust_score, is_at_drift_risk, status, photo_url)
VALUES
('INS-000101', 'USR-001', 'Sundar Industries Pvt Ltd', 'Non-Automatic Weighing Instruments', 'Weighing Instruments', 'Avery Weigh-Tronix India', 'AV-500B Heavy Duty', 'AV-TN-2024-88910', 'Class III', '300 kg', '2 kg', 24, '50 g', '10 g', 13.0694, 80.1948, 'Shop No. 45, Wholesale Grain Yard, Koyambedu Market, Chennai', '600107', 98, false, 'VERIFIED', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500'),
('INS-000102', 'USR-001', 'Sundar Industries Pvt Ltd', 'Counter Machine', 'Weighing Instruments', 'Essae Teraoka Limited', 'DS-215 Digital Counter', 'ES-TN-2023-44102', 'Class III', '150 kg', '1 kg', 24, '20 g', '5 g', 13.0405, 80.2337, 'Counter 3, No. 18 Ranganathan Street, T. Nagar, Chennai', '600017', 96, false, 'VERIFIED', 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=500'),
('INS-000103', 'USR-001', 'Sundar Industries Pvt Ltd', 'Beam Scale', 'Weighing Instruments', 'Mettler Toledo India', 'ME-204T Precision', 'MT-TN-2024-91023', 'Class II', '220 g', '0.02 g', 12, '1 mg', '0.1 mg', 13.0913, 80.2785, 'Bullion Counter, Mint Street, Sowcarpet, Chennai', '600079', 100, false, 'VERIFIED', 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=500'),
('INS-000104', 'USR-001', 'Sundar Industries Pvt Ltd', 'Automatic Rail Weighbridges', 'Weighing Instruments', 'Eagle Weighing Systems', 'WB-Pitless-60T Rail', 'EAG-TN-2022-7719', 'Class III', '60,000 kg', '400 kg', 12, '10 kg', '5 kg', 13.1255, 80.2982, 'Logistics Bay 2, Chennai Port Container Freight Terminal, Royapuram', '600013', 74, true, 'VERIFIED', 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500'),
('INS-000105', 'USR-001', 'Sundar Industries Pvt Ltd', 'Load Cell', 'Weighing Instruments', 'Contech Instruments', 'CAS-60K Industrial', 'CNT-TN-2025-1109', 'Class III', '60 kg', '400 g', 24, '10 g', '2 g', 13.0694, 80.1948, 'Automated Packing Line, Koyambedu Distribution Hub, Chennai', '600107', 99, false, 'REGISTERED', NULL),
('INS-000106', 'USR-001', 'Sundar Industries Pvt Ltd', 'Petrol/Diesel Dispenser', 'Fuel Dispensers', 'Midco Limited India', 'MD-SureFill-2X Dual', 'MD-TN-2023-90021', 'Class 0.5', '60 L/min', '2 L/min', 12, '0.01 L', '0.005 L', 12.9654, 80.2461, 'OMR Fuel Station, Rajiv Gandhi Salai, Perungudi, Chennai', '600096', 95, false, 'VERIFIED', NULL),
('INS-000107', 'USR-001', 'Sundar Industries Pvt Ltd', 'CNG Dispenser', 'Fuel Dispensers', 'Gilbarco Veeder-Root', 'SK-700-II CNG', 'GVR-TN-2024-3011', 'Class 0.5', '70 L/min', '2 L/min', 12, '0.01 L', '0.005 L', 13.0067, 80.2033, 'Guindy Industrial Estate Eco Fuel Bay 1, Chennai', '600032', 97, false, 'VERIFIED', NULL),
('INS-000108', 'USR-001', 'Sundar Industries Pvt Ltd', 'Platform Scale', 'Weighing Instruments', 'Essae Digital Systems', 'PR-1000 Heavy Duty', 'ES-TN-2024-77120', 'Class III', '1,000 kg', '5 kg', 24, '100 g', '20 g', 13.0732, 80.2609, 'Central Warehouse Dock 4, Egmore Cargo Terminal, Chennai', '600008', 94, false, 'REGISTERED', NULL),
('INS-000109', 'USR-001', 'Sundar Industries Pvt Ltd', 'Precision Electronic Balance', 'Weighing Instruments', 'Sartorius India', 'BSA-224S Analytical', 'SAR-TN-2024-55012', 'Class I', '220 g', '0.01 g', 12, '0.1 mg', '0.01 mg', 13.0827, 80.2707, 'Quality Assurance Testing Lab, Anna Salai, Chennai', '600002', 100, false, 'VERIFIED', NULL),
('INS-000110', 'USR-001', 'Sundar Industries Pvt Ltd', 'Pitless Road Weighbridge', 'Weighing Instruments', 'Avery India Ltd', 'WB-80T Agro Span', 'AV-TN-2023-11880', 'Class III', '80,000 kg', '500 kg', 12, '20 kg', '10 kg', 13.0298, 80.1704, 'Porur Goods Inward Yard, Trunk Road, Chennai', '600116', 91, false, 'REGISTERED', NULL),
('INS-000111', 'USR-001', 'Sundar Industries Pvt Ltd', 'Automated Liquid Flow Meter', 'Measuring Instruments', 'Yokogawa India', 'YOKO-ROTAMASS-500', 'YOK-TN-2024-40019', 'Class 0.3', '500 L/min', '10 L/min', 12, '0.05 L', '0.01 L', 13.1143, 80.2104, 'Bulk Edible Oil Transfer Bay, Madhavaram Milk Colony, Chennai', '600051', 99, false, 'REGISTERED', NULL),
('INS-000112', 'USR-001', 'Sundar Industries Pvt Ltd', 'Counter Machine', 'Weighing Instruments', 'Essae Teraoka', 'DS-852 Price Computing', 'ES-TN-2024-90211', 'Class III', '30 kg', '100 g', 24, '5 g', '1 g', 13.0382, 80.2125, 'Ashok Nagar Retail Store, 11th Avenue, Chennai', '600083', 97, false, 'REGISTERED', NULL),
('INS-000113', 'USR-006', 'Murugan Textiles & Ginning Mills', 'Crane Scale', 'Weighing Instruments', 'Eagle Scales India', 'CS-5T Wireless Hanging', 'EAG-TN-2024-33201', 'Class III', '5,000 kg', '20 kg', 12, '1 kg', '0.5 kg', 11.0168, 76.9558, 'Cotton Bales Overhead Crane Line, Avinashi Road, Coimbatore', '641004', 98, false, 'REGISTERED', NULL),
('INS-000114', 'USR-007', 'Pandian Bullion & Jewellery Exporters', 'Beam Scale', 'Weighing Instruments', 'Mettler Toledo', 'JP-303G Gold Balance', 'MT-MD-2024-88192', 'Class II', '300 g', '0.02 g', 12, '1 mg', '0.1 mg', 9.9252, 78.1198, 'Bullion Vault 1, South Avani Moola Street, Madurai', '625001', 100, false, 'VERIFIED', NULL)
ON CONFLICT (id) DO UPDATE SET
business_name = EXCLUDED.business_name,
instrument_type = EXCLUDED.instrument_type,
installation_address = EXCLUDED.installation_address,
latitude = EXCLUDED.latitude,
longitude = EXCLUDED.longitude;

-- 3. SEED APPLICATIONS
INSERT INTO verification_applications (id, instrument_id, user_id, application_type, preferred_date, calculated_fee, fee_paid, payment_reference, status, scrutiny_remarks, scrutiny_officer_id, filed_on)
VALUES
-- SUBMITTED
('Merix-TN-2026-00098', 'INS-000105', 'USR-001', 'INITIAL_VERIFICATION', '2026-09-29', 1000.00, true, 'PAY-TN-9912100', 'SUBMITTED', NULL, NULL, '2026-09-21 16:30:00+00'),
('Merix-TN-2026-00108', 'INS-000111', 'USR-001', 'PERIODIC_REVERIFICATION', '2026-10-04', 1500.00, true, 'PAY-TN-9912250', 'SUBMITTED', NULL, NULL, '2026-09-23 09:15:00+00'),
('Merix-TN-2026-00109', 'INS-000113', 'USR-006', 'INITIAL_VERIFICATION', '2026-10-05', 2000.00, true, 'PAY-TN-9912280', 'SUBMITTED', NULL, NULL, '2026-09-23 14:40:00+00'),

-- IN_SCRUTINY
('Merix-TN-2026-00103', 'INS-000108', 'USR-001', 'PERIODIC_REVERIFICATION', '2026-10-01', 800.00, true, 'PAY-TN-9912180', 'IN_SCRUTINY', 'Officer reviewing manufacturer test certificate and calibration log for 1000kg platform scale.', 'USR-002', '2026-09-22 11:20:00+00'),
('Merix-TN-2026-00110', 'INS-000109', 'USR-001', 'PERIODIC_REVERIFICATION', '2026-10-02', 1200.00, true, 'PAY-TN-9912210', 'IN_SCRUTINY', 'Verifying Class I precision balance certificate and laboratory environment compliance.', 'USR-002', '2026-09-22 15:45:00+00'),

-- SCHEDULED
('Merix-TN-2026-00104', 'INS-000110', 'USR-001', 'PERIODIC_REVERIFICATION', '2026-09-30', 5000.00, true, 'PAY-TN-9912190', 'SCHEDULED', 'Documents verified and approved. Allocated for on-site pitless road weighbridge testing.', 'USR-002', '2026-09-20 10:00:00+00'),
('Merix-TN-2026-00111', 'INS-000107', 'USR-001', 'PERIODIC_REVERIFICATION', '2026-10-02', 2500.00, true, 'PAY-TN-9912220', 'SCHEDULED', 'Scrutiny passed. Scheduled for CNG mass flow dispenser calibration verification.', 'USR-002', '2026-09-20 14:10:00+00'),

-- IN_VERIFICATION
('Merix-TN-2026-00105', 'INS-000106', 'USR-001', 'PERIODIC_REVERIFICATION', '2026-09-24', 2500.00, true, 'PAY-TN-9912150', 'IN_VERIFICATION', 'Officer K. Murugan active on-site at OMR Fuel Station conducting 5L and 10L standard proving tests.', 'USR-003', '2026-09-19 09:30:00+00'),
('Merix-TN-2026-00112', 'INS-000112', 'USR-001', 'PERIODIC_REVERIFICATION', '2026-09-24', 600.00, true, 'PAY-TN-9912160', 'IN_VERIFICATION', 'Field inspection in progress at Ashok Nagar retail branch. Repeatability tests underway.', 'USR-003', '2026-09-19 11:15:00+00'),

-- CERTIFICATE_GENERATED
('Merix-TN-2026-00102', 'INS-000101', 'USR-001', 'PERIODIC_REVERIFICATION', '2026-09-28', 800.00, true, 'PAY-TN-9912048', 'CERTIFICATE_GENERATED', NULL, NULL, '2026-09-18 10:14:00+00'),
('Merix-TN-2026-00101', 'INS-000102', 'USR-001', 'PERIODIC_REVERIFICATION', '2026-09-25', 600.00, true, 'PAY-TN-9912030', 'CERTIFICATE_GENERATED', NULL, NULL, '2026-09-17 11:20:00+00'),
('Merix-TN-2026-00100', 'INS-000103', 'USR-001', 'PERIODIC_REVERIFICATION', '2026-09-22', 1200.00, true, 'PAY-TN-9912012', 'CERTIFICATE_GENERATED', NULL, NULL, '2026-09-16 09:45:00+00'),
('Merix-TN-2026-00099', 'INS-000104', 'USR-001', 'PERIODIC_REVERIFICATION', '2026-09-20', 5000.00, true, 'PAY-TN-9911980', 'CERTIFICATE_GENERATED', NULL, NULL, '2026-09-15 14:10:00+00'),
('Merix-TN-2026-00097', 'INS-000106', 'USR-001', 'PERIODIC_REVERIFICATION', '2026-09-19', 2500.00, true, 'PAY-TN-9911950', 'CERTIFICATE_GENERATED', NULL, NULL, '2026-09-14 13:00:00+00'),
('Merix-TN-2026-00114', 'INS-000114', 'USR-007', 'PERIODIC_REVERIFICATION', '2026-09-18', 1200.00, true, 'PAY-TN-9911910', 'CERTIFICATE_GENERATED', NULL, NULL, '2026-09-12 10:30:00+00'),

-- REJECTED
('Merix-TN-2026-00106', 'INS-000104', 'USR-001', 'REVERIFICATION_AFTER_REPAIR', '2026-09-15', 5000.00, true, 'PAY-TN-9911890', 'REJECTED', 'Rejected: Observed corner eccentricity error (+240 kg) exceeds Legal Metrology MPE limit. Structural recalibration required.', 'USR-003', '2026-09-10 16:00:00+00'),
('Merix-TN-2026-00107', 'INS-000108', 'USR-001', 'INITIAL_VERIFICATION', '2026-09-12', 800.00, true, 'PAY-TN-9911850', 'REJECTED', 'Rejected: Incomplete model approval documentation under Section 22. Manufacturer certificate expired.', 'USR-002', '2026-09-08 14:20:00+00')
ON CONFLICT (id) DO UPDATE SET
status = EXCLUDED.status,
calculated_fee = EXCLUDED.calculated_fee,
scrutiny_remarks = EXCLUDED.scrutiny_remarks;

-- 4. SEED CERTIFICATES
INSERT INTO certificates (id, certificate_number, application_id, instrument_id, user_id, officer_id, issue_date, expiry_date, stamp_id, qr_code_url, digital_signature_hash, chain_hash_previous, chain_hash_current, status)
VALUES
('CERT-001', 'TN-DOCA-LM-2026-00892', 'Merix-TN-2026-00102', 'INS-000101', 'USR-001', 'USR-003', '2026-09-19', '2028-09-18', 'TN-LM-STAMP-2026-9821', 'https://merix.tn.gov.in/verify/TN-DOCA-LM-2026-00892', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 'GENESIS-CHAIN-HASH-000', '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069', 'VALID'),
('CERT-002', 'TN-DOCA-LM-2026-00891', 'Merix-TN-2026-00101', 'INS-000102', 'USR-001', 'USR-003', '2026-09-18', '2028-09-17', 'TN-LM-STAMP-2026-9818', 'https://merix.tn.gov.in/verify/TN-DOCA-LM-2026-00891', 'f3b1c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b866', '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069', 'a4d5b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9077', 'VALID'),
('CERT-003', 'TN-DOCA-LM-2026-00890', 'Merix-TN-2026-00100', 'INS-000103', 'USR-001', 'USR-003', '2026-09-17', '2027-09-16', 'TN-LM-STAMP-2026-9805', 'https://merix.tn.gov.in/verify/TN-DOCA-LM-2026-00890', 'd4e2c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b877', 'a4d5b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9077', 'b5e6b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9088', 'VALID'),
('CERT-004', 'TN-DOCA-LM-2025-00650', 'Merix-TN-2026-00099', 'INS-000104', 'USR-001', 'USR-003', '2025-10-15', '2026-10-14', 'TN-LM-STAMP-2025-7720', 'https://merix.tn.gov.in/verify/TN-DOCA-LM-2025-00650', 'c3f1c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b888', 'b5e6b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9088', 'c6f7b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9099', 'EXPIRING_SOON'),
('CERT-005', 'TN-DOCA-LM-2026-00888', 'Merix-TN-2026-00114', 'INS-000114', 'USR-007', 'USR-010', '2026-09-14', '2027-09-13', 'TN-LM-STAMP-2026-9792', 'https://merix.tn.gov.in/verify/TN-DOCA-LM-2026-00888', 'e4a1c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b899', 'c6f7b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9099', 'd7a8b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9100', 'VALID')
ON CONFLICT (id) DO UPDATE SET
certificate_number = EXCLUDED.certificate_number,
status = EXCLUDED.status;

-- 5. SEED ALLOCATIONS
INSERT INTO allocations (id, application_id, assigned_to_type, assigned_to_id, assigned_to_name, scheduled_date, scheduled_time_slot, instructions, allocated_by, status)
VALUES
('ALC-001', 'Merix-TN-2026-00098', 'LMO', 'USR-003', 'K. Murugan, Inspector (LMO)', '2026-09-29', '10:00 AM - 01:00 PM', 'Verify new 60kg packing load cell at Koyambedu distribution warehouse. Check corner eccentricity with 20kg weights.', 'USR-002', 'SCHEDULED'),
('ALC-002', 'Merix-TN-2026-00104', 'LMO', 'USR-003', 'K. Murugan, Inspector (LMO)', '2026-09-30', '10:00 AM - 01:30 PM', 'On-site verification of 80,000kg pitless road weighbridge at Porur Goods Inward Yard with calibration test vehicle.', 'USR-002', 'SCHEDULED'),
('ALC-003', 'Merix-TN-2026-00111', 'LMO', 'USR-003', 'K. Murugan, Inspector (LMO)', '2026-10-02', '02:00 PM - 04:30 PM', 'Verify 70 L/min CNG mass flow dispenser at Guindy Eco Fuel station Bay 1.', 'USR-002', 'SCHEDULED'),
('ALC-004', 'Merix-TN-2026-00105', 'LMO', 'USR-003', 'K. Murugan, Inspector (LMO)', '2026-09-24', '10:00 AM - 01:00 PM', 'Active field inspection for Petrol/Diesel dispenser at OMR Perungudi outlet.', 'USR-002', 'IN_TRANSIT'),
('ALC-005', 'Merix-TN-2026-00112', 'LMO', 'USR-003', 'K. Murugan, Inspector (LMO)', '2026-09-24', '02:30 PM - 05:00 PM', 'Verification of Ashok Nagar retail price computing counter scale.', 'USR-002', 'IN_TRANSIT')
ON CONFLICT (id) DO UPDATE SET
scheduled_date = EXCLUDED.scheduled_date,
status = EXCLUDED.status;

-- 6. SEED RULE ENGINE CONFIGS
INSERT INTO rule_engine_configs (id, instrument_type, capacity_min_val, capacity_max_val, capacity_unit, verification_fee, reverification_fee, validity_months, sla_scrutiny_hours, sla_verification_days)
VALUES
('RULE-01', 'Non-Automatic Weighing Instruments', 1, 500, 'kg', 800.00, 800.00, 24, 48, 7),
('RULE-02', 'Counter Machine', 1, 150, 'kg', 600.00, 600.00, 24, 24, 5),
('RULE-03', 'Beam Scale', 0.001, 20, 'kg', 1200.00, 1200.00, 12, 48, 5),
('RULE-04', 'Automatic Rail Weighbridges', 10000, 100000, 'kg', 5000.00, 5000.00, 12, 24, 10),
('RULE-05', 'Load Cell', 1, 2000, 'kg', 1000.00, 1000.00, 24, 24, 7),
('RULE-06', 'Petrol/Diesel Dispenser', 1, 100, 'L/min', 2500.00, 2500.00, 12, 24, 5),
('RULE-07', 'CNG Dispenser', 1, 100, 'L/min', 2500.00, 2500.00, 12, 24, 5),
('RULE-08', 'Platform Scale', 50, 2000, 'kg', 800.00, 800.00, 24, 48, 7),
('RULE-09', 'Precision Electronic Balance', 0.0001, 5, 'kg', 1200.00, 1200.00, 12, 24, 5),
('RULE-10', 'Pitless Road Weighbridge', 10000, 120000, 'kg', 5000.00, 5000.00, 12, 24, 10)
ON CONFLICT (id) DO UPDATE SET
verification_fee = EXCLUDED.verification_fee,
reverification_fee = EXCLUDED.reverification_fee;

-- 7. SEED CITIZEN REPORTS
INSERT INTO citizen_reports (id, instrument_id, business_name, reported_by_name, reported_by_phone, issue_category, description, photo_evidence_url, reported_latitude, reported_longitude, status, officer_assigned)
VALUES
('REP-001', 'INS-000104', 'Sri Balaji Supermarket - Freight Terminal Weighbridge', 'P. Annamalai', '+91 94440 12345', 'SHORT_WEIGHT', 'Rail weighbridge tare reading fluctuated by 120 kg during container dispatch at Royapuram Freight Terminal.', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500', 13.1255, 80.2982, 'OPEN', NULL),
('REP-002', 'INS-000106', 'OMR Fuel Station - Perungudi Outlet', 'Dr. S. Senthil Nathan', '+91 98410 88990', 'ALTERED_MEASURE', 'Dispenser Nozzle 2 stopped at 9.75L while digital display billed for 10.0L.', 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=500', 12.9654, 80.2461, 'UNDER_INVESTIGATION', 'USR-003'),
('REP-003', 'INS-000102', 'Sri Balaji Supermarket T. Nagar Branch', 'M. Karthik Raja', '+91 98840 98765', 'EXPIRED_STAMP', 'Physical verification stamp expired last month on Counter Machine at vegetable billing section.', 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=500', 13.0405, 80.2337, 'OPEN', NULL),
('REP-004', 'INS-000113', 'Murugan Textiles - Peelamedu Cotton Yard', 'K. Soundarapandian', '+91 94422 33445', 'BROKEN_SEAL', 'Lead seal on crane scale digital receiver was damaged during heavy bale loading.', 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=500', 11.0168, 76.9558, 'OPEN', NULL),
('REP-005', 'INS-000114', 'Pandian Bullion Gold Counter', 'S. Meenakshi Sundaram', '+91 98430 77665', 'UNVERIFIED_DEVICE', 'Customer noticed missing annual calibration seal sticker on gold weighing scale.', 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=500', 9.9252, 78.1198, 'ACTION_TAKEN', 'USR-010')
ON CONFLICT (id) DO UPDATE SET
status = EXCLUDED.status,
description = EXCLUDED.description;

-- 8. SEED AUDIT LOGS
INSERT INTO audit_logs (id, timestamp, actor_id, actor_name, actor_role, action_type, resource_type, resource_id, ip_address, details, payload_hash)
VALUES
('AUD-001', '2026-09-23 14:40:00+00', 'USR-006', 'Murugan Textiles & Ginning Mills', 'BUSINESS_OWNER', 'SUBMIT_APPLICATION', 'APPLICATION', 'Merix-TN-2026-00109', '117.201.44.18', 'Submitted Initial Verification application for Crane Scale INS-000113 with payment INR 2000.00', 'a1b2c3d4e5f60718'),
('AUD-002', '2026-09-22 15:45:00+00', 'USR-002', 'K. Rangarajan (Controller)', 'ADMIN', 'START_SCRUTINY', 'APPLICATION', 'Merix-TN-2026-00110', '10.0.4.12', 'Started scrutiny review of Class I Precision Analytical Balance calibration documentation', 'b2c3d4e5f6a10829'),
('AUD-003', '2026-09-21 16:30:00+00', 'USR-001', 'Sri Balaji Supermarket & Wholesale Traders', 'BUSINESS_OWNER', 'SUBMIT_APPLICATION', 'APPLICATION', 'Merix-TN-2026-00098', '103.21.124.9', 'Submitted Initial Verification application for Load Cell INS-000105 with payment INR 1000.00', 'f71928bc89104812'),
('AUD-004', '2026-09-20 14:10:00+00', 'USR-002', 'K. Rangarajan (Controller)', 'ADMIN', 'ALLOCATE_APPLICATION', 'ALLOCATION', 'ALC-002', '10.0.4.12', 'Allocated 80T Road Weighbridge application to Inspector K. Murugan for on-site verification on 2026-09-30', 'c3d4e5f6a1b20930'),
('AUD-005', '2026-09-19 14:00:00+00', 'USR-003', 'K. Murugan, Inspector (LMO)', 'LMO_OFFICER', 'GENERATE_CERTIFICATE', 'CERTIFICATE', 'TN-DOCA-LM-2026-00892', '14.139.122.4', 'Field verification completed at Koyambedu Market, stamped TN-LM-STAMP-2026-9821, digital certificate issued', 'bc8912ef019287fa'),
('AUD-006', '2026-09-18 10:14:00+00', 'USR-002', 'K. Rangarajan (Controller)', 'ADMIN', 'SCRUTINY_PASS', 'APPLICATION', 'Merix-TN-2026-00102', '10.0.4.12', 'Admin verified documents and approved scrutiny for periodic re-verification for Chennai Central jurisdiction', '10982bc812ef7190'),
('AUD-007', '2026-09-15 17:30:00+00', 'USR-003', 'K. Murugan, Inspector (LMO)', 'LMO_OFFICER', 'REJECT_APPLICATION', 'APPLICATION', 'Merix-TN-2026-00106', '14.139.122.4', 'Application rejected during field test: Corner eccentricity error exceeded permissible MPE limit', 'd4e5f6a1b2c31041')
ON CONFLICT (id) DO NOTHING;
