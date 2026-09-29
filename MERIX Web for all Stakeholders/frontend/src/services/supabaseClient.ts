// ============================================================================
// MERIX: Complete Supabase Client & Real-time Cloud Backend Integration
// Project URL: https://cnczokysrenqmkloefqu.supabase.co
// ============================================================================

import { createClient } from '@supabase/supabase-js';
import {
  Instrument,
  VerificationApplication,
  Certificate,
  RuleEngineConfig,
  CitizenReport,
  AuditLog,
  Allocation,
  InspectionRecord,
  User
} from '../types';

import {
  initialUsers,
  initialInstruments,
  initialApplications,
  initialCertificates,
  initialRuleConfigs,
  initialCitizenReports,
  initialAuditLogs,
  initialAllocations
} from './mockData';

export const SUPABASE_URL = 'https://cnczokysrenqmkloefqu.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuY3pva3lzcmVucW1rbG9lZnF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwMDkyNzUsImV4cCI6MjEwNTU4NTI3NX0.KKCM9mRfneUnOUyH2yMU3K50P6U7cqY01cLrSL7Y9xo';

// Initialize the Supabase Client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

// Helper for testing Supabase connectivity
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase.from('users').select('id', { count: 'exact', head: true });
    if (error) {
      console.warn('Supabase connection warning:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase connection offline or unreachable:', err);
    return false;
  }
}

// Map Database Snake Case to TypeScript Domain Models
function mapDbInstrument(row: any): Instrument {
  return {
    id: row.id,
    userId: row.user_id,
    businessName: row.business_name,
    instrumentType: row.instrument_type,
    category: row.category,
    manufacturer: row.manufacturer,
    modelNumber: row.model_number,
    serialNumber: row.serial_number,
    accuracyClass: row.accuracy_class,
    maxCapacity: row.max_capacity,
    minCapacity: row.min_capacity,
    verificationIntervalMonths: row.verification_interval_months || 12,
    verificationScaleIntervalE: row.verification_scale_interval_e,
    actualScaleIntervalD: row.actual_scale_interval_d,
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    installationAddress: row.installation_address,
    pincode: row.pincode,
    photoUrl: row.photo_url,
    qrCodeData: row.qr_code_data,
    trustScore: row.trust_score ?? 100,
    isAtDriftRisk: !!row.is_at_drift_risk,
    status: row.status || 'REGISTERED',
    createdAt: row.created_at
  };
}

function mapDbApplication(row: any): VerificationApplication {
  return {
    id: row.id,
    instrumentId: row.instrument_id,
    userId: row.user_id,
    applicationType: row.application_type,
    preferredDate: row.preferred_date,
    calculatedFee: Number(row.calculated_fee),
    feePaid: !!row.fee_paid,
    paymentReference: row.payment_reference,
    status: row.status,
    documentsUrl: row.documents_url,
    scrutinyRemarks: row.scrutiny_remarks,
    scrutinyOfficerId: row.scrutiny_officer_id,
    filedOn: row.filed_on,
    slaDueDate: row.sla_due_date,
    slaBreached: !!row.sla_breached
  };
}

function mapDbCertificate(row: any): Certificate {
  return {
    id: row.id,
    certificateNumber: row.certificate_number,
    applicationId: row.application_id,
    instrumentId: row.instrument_id,
    userId: row.user_id,
    officerId: row.officer_id,
    officerName: row.officer_name || 'K. Murugan, Inspector (LMO)',
    issueDate: row.issue_date,
    expiryDate: row.expiry_date,
    stampId: row.stamp_id,
    qrCodeUrl: row.qr_code_url,
    digitalSignatureHash: row.digital_signature_hash,
    chainHashPrevious: row.chain_hash_previous,
    chainHashCurrent: row.chain_hash_current,
    status: row.status
  };
}

function mapDbAllocation(row: any): Allocation {
  return {
    id: row.id,
    applicationId: row.application_id,
    assignedToType: row.assigned_to_type,
    assignedToId: row.assigned_to_id,
    assignedToName: row.assigned_to_name,
    scheduledDate: row.scheduled_date,
    scheduledTimeSlot: row.scheduled_time_slot,
    instructions: row.instructions,
    allocatedBy: row.allocated_by,
    status: row.status
  };
}

function mapDbCitizenReport(row: any): CitizenReport {
  return {
    id: row.id,
    instrumentId: row.instrument_id,
    businessName: row.business_name,
    reportedByName: row.reported_by_name,
    reportedByPhone: row.reported_by_phone,
    issueCategory: row.issue_category,
    description: row.description,
    photoEvidenceUrl: row.photo_evidence_url,
    reportedLatitude: Number(row.reported_latitude),
    reportedLongitude: Number(row.reported_longitude),
    status: row.status,
    officerAssigned: row.officer_assigned,
    resolutionNotes: row.resolution_notes,
    createdAt: row.created_at
  };
}

function mapDbAuditLog(row: any): AuditLog {
  return {
    id: row.id,
    timestamp: row.timestamp,
    actorId: row.actor_id,
    actorName: row.actor_name,
    actorRole: row.actor_role,
    actionType: row.action_type,
    resourceType: row.resource_type,
    resourceId: row.resource_id,
    ipAddress: row.ip_address,
    details: row.details,
    payloadHash: row.payload_hash
  };
}

function mapDbRuleConfig(row: any): RuleEngineConfig {
  return {
    id: row.id,
    instrumentType: row.instrument_type,
    capacityMinVal: Number(row.capacity_min_val),
    capacityMaxVal: Number(row.capacity_max_val),
    capacityUnit: row.capacity_unit,
    verificationFee: Number(row.verification_fee),
    reverificationFee: Number(row.reverification_fee),
    validityMonths: row.validity_months || 12,
    checklistTemplate: Array.isArray(row.checklist_template) ? row.checklist_template : [],
    slaScrutinyHours: row.sla_scrutiny_hours || 48,
    slaVerificationDays: row.sla_verification_days || 7
  };
}

// Complete Supabase Backend Operations
export const SupabaseDb = {
  // --------------------------------------------------------------------------
  // Auto-Seed Check: populate remote Supabase database if tables are fresh/empty
  // --------------------------------------------------------------------------
  async initializeRemoteDatabase(): Promise<void> {
    try {
      const isOnline = await checkSupabaseConnection();
      if (!isOnline) return;

      const { count } = await supabase.from('users').select('id', { count: 'exact', head: true });
      if (count === 0 || count === null) {
        console.log('Seeding initial Tamil Nadu data into remote Supabase database...');
        
        // 1. Seed Users
        for (const u of initialUsers) {
          await this.syncUser(u);
        }
        // 2. Seed Instruments
        for (const inst of initialInstruments) {
          await this.syncInstrument(inst);
        }
        // 3. Seed Applications
        for (const app of initialApplications) {
          await this.syncApplication(app);
        }
        // 4. Seed Certificates
        for (const cert of initialCertificates) {
          await this.syncCertificate(cert);
        }
        // 5. Seed Allocations
        for (const alloc of initialAllocations) {
          await this.syncAllocation(alloc);
        }
        // 6. Seed Rules
        for (const r of initialRuleConfigs) {
          await this.syncRule(r);
        }
        // 7. Seed Citizen Reports
        for (const rep of initialCitizenReports) {
          await this.syncCitizenReport(rep);
        }
        // 8. Seed Audit Logs
        for (const log of initialAuditLogs) {
          await this.syncAuditLog(log);
        }
        console.log('Supabase remote database seeding complete!');
      }
    } catch (err) {
      console.warn('Auto-seed check non-blocking note:', err);
    }
  },

  // --------------------------------------------------------------------------
  // USERS
  // --------------------------------------------------------------------------
  async fetchUsers(): Promise<User[] | null> {
    try {
      const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: true });
      if (error || !data || data.length === 0) return null;
      return data.map(u => ({
        id: u.id,
        email: u.email,
        fullName: u.full_name,
        businessName: u.business_name,
        role: u.role,
        phoneNumber: u.phone_number,
        district: u.district,
        state: u.state,
        jurisdictionZone: u.jurisdiction_zone,
        licenseNo: u.license_no,
        avatarUrl: u.avatar_url
      }));
    } catch {
      return null;
    }
  },

  async syncUser(user: User): Promise<void> {
    try {
      await supabase.from('users').upsert({
        id: user.id,
        email: user.email,
        full_name: user.fullName,
        business_name: user.businessName,
        role: user.role,
        phone_number: user.phoneNumber,
        district: user.district,
        state: user.state || 'Tamil Nadu',
        jurisdiction_zone: user.jurisdictionZone,
        license_no: user.licenseNo,
        avatar_url: user.avatarUrl
      });
    } catch (e) {
      console.warn('Supabase syncUser fallback:', e);
    }
  },

  // --------------------------------------------------------------------------
  // INSTRUMENTS
  // --------------------------------------------------------------------------
  async fetchInstruments(userId?: string): Promise<Instrument[] | null> {
    try {
      let query = supabase.from('instruments').select('*').order('created_at', { ascending: false });
      if (userId) {
        query = query.eq('user_id', userId);
      }
      const { data, error } = await query;
      if (error || !data || data.length === 0) return null;
      return data.map(mapDbInstrument);
    } catch {
      return null;
    }
  },

  async syncInstrument(inst: Instrument): Promise<void> {
    try {
      await supabase.from('instruments').upsert({
        id: inst.id,
        user_id: inst.userId,
        business_name: inst.businessName,
        instrument_type: inst.instrumentType,
        category: inst.category,
        manufacturer: inst.manufacturer,
        model_number: inst.modelNumber,
        serial_number: inst.serialNumber,
        accuracy_class: inst.accuracyClass,
        max_capacity: inst.maxCapacity,
        min_capacity: inst.minCapacity,
        verification_interval_months: inst.verificationIntervalMonths,
        verification_scale_interval_e: inst.verificationScaleIntervalE,
        actual_scale_interval_d: inst.actualScaleIntervalD,
        latitude: inst.latitude,
        longitude: inst.longitude,
        installation_address: inst.installationAddress,
        pincode: inst.pincode,
        photo_url: inst.photoUrl,
        qr_code_data: inst.qrCodeData,
        trust_score: inst.trustScore,
        is_at_drift_risk: inst.isAtDriftRisk,
        status: inst.status
      });
    } catch (e) {
      console.warn('Supabase syncInstrument fallback:', e);
    }
  },

  // --------------------------------------------------------------------------
  // VERIFICATION APPLICATIONS
  // --------------------------------------------------------------------------
  async fetchApplications(userId?: string): Promise<VerificationApplication[] | null> {
    try {
      let query = supabase.from('verification_applications').select('*').order('filed_on', { ascending: false });
      if (userId) {
        query = query.eq('user_id', userId);
      }
      const { data, error } = await query;
      if (error || !data || data.length === 0) return null;
      return data.map(mapDbApplication);
    } catch {
      return null;
    }
  },

  async syncApplication(app: VerificationApplication): Promise<void> {
    try {
      await supabase.from('verification_applications').upsert({
        id: app.id,
        instrument_id: app.instrumentId,
        user_id: app.userId,
        application_type: app.applicationType,
        preferred_date: app.preferredDate,
        calculated_fee: app.calculatedFee,
        fee_paid: app.feePaid,
        payment_reference: app.paymentReference,
        status: app.status,
        documents_url: app.documentsUrl,
        scrutiny_remarks: app.scrutinyRemarks,
        scrutiny_officer_id: app.scrutinyOfficerId,
        filed_on: app.filedOn,
        sla_due_date: app.slaDueDate,
        sla_breached: app.slaBreached
      });
    } catch (e) {
      console.warn('Supabase syncApplication fallback:', e);
    }
  },

  // --------------------------------------------------------------------------
  // ALLOCATIONS
  // --------------------------------------------------------------------------
  async fetchAllocations(assignedToId?: string): Promise<Allocation[] | null> {
    try {
      let query = supabase.from('allocations').select('*').order('created_at', { ascending: false });
      if (assignedToId) {
        query = query.eq('assigned_to_id', assignedToId);
      }
      const { data, error } = await query;
      if (error || !data || data.length === 0) return null;
      return data.map(mapDbAllocation);
    } catch {
      return null;
    }
  },

  async syncAllocation(alloc: Allocation): Promise<void> {
    try {
      await supabase.from('allocations').upsert({
        id: alloc.id,
        application_id: alloc.applicationId,
        assigned_to_type: alloc.assignedToType,
        assigned_to_id: alloc.assignedToId,
        assigned_to_name: alloc.assignedToName,
        scheduled_date: alloc.scheduledDate,
        scheduled_time_slot: alloc.scheduledTimeSlot,
        instructions: alloc.instructions,
        allocated_by: alloc.allocatedBy,
        status: alloc.status
      });
    } catch (e) {
      console.warn('Supabase syncAllocation fallback:', e);
    }
  },

  // --------------------------------------------------------------------------
  // CERTIFICATES
  // --------------------------------------------------------------------------
  async fetchCertificates(userId?: string): Promise<Certificate[] | null> {
    try {
      let query = supabase.from('certificates').select('*').order('issue_date', { ascending: false });
      if (userId) {
        query = query.eq('user_id', userId);
      }
      const { data, error } = await query;
      if (error || !data || data.length === 0) return null;
      return data.map(mapDbCertificate);
    } catch {
      return null;
    }
  },

  async syncCertificate(cert: Certificate): Promise<void> {
    try {
      await supabase.from('certificates').upsert({
        id: cert.id,
        certificate_number: cert.certificateNumber,
        application_id: cert.applicationId,
        instrument_id: cert.instrumentId,
        user_id: cert.userId,
        officer_id: cert.officerId,
        issue_date: cert.issueDate,
        expiry_date: cert.expiryDate,
        stamp_id: cert.stampId,
        qr_code_url: cert.qrCodeUrl,
        digital_signature_hash: cert.digitalSignatureHash,
        chain_hash_previous: cert.chainHashPrevious,
        chain_hash_current: cert.chainHashCurrent,
        status: cert.status
      });
    } catch (e) {
      console.warn('Supabase syncCertificate fallback:', e);
    }
  },

  // --------------------------------------------------------------------------
  // INSPECTION RECORDS
  // --------------------------------------------------------------------------
  async syncInspectionRecord(record: InspectionRecord): Promise<void> {
    try {
      await supabase.from('inspection_records').upsert({
        id: record.id,
        application_id: record.applicationId,
        instrument_id: record.instrumentId,
        officer_id: record.officerId,
        inspector_latitude: record.inspectorLatitude,
        inspector_longitude: record.inspectorLongitude,
        geo_fence_verified: record.geoFenceVerified,
        checklist_results: record.checklistResults,
        test_load_readings: record.testLoadReadings,
        eccentricity_test_passed: record.eccentricityTestPassed,
        repeatability_test_passed: record.repeatabilityTestPassed,
        calculated_max_error: record.calculatedMaxError,
        max_permissible_error: record.maxPermissibleError,
        test_verdict: record.testVerdict,
        stamp_number: record.stampNumber,
        security_seal_number: record.securitySealNumber,
        remarks: record.remarks,
        verified_at: record.verifiedAt
      });
    } catch (e) {
      console.warn('Supabase syncInspectionRecord fallback:', e);
    }
  },

  // --------------------------------------------------------------------------
  // RULE ENGINE
  // --------------------------------------------------------------------------
  async fetchRules(): Promise<RuleEngineConfig[] | null> {
    try {
      const { data, error } = await supabase.from('rule_engine_configs').select('*');
      if (error || !data || data.length === 0) return null;
      return data.map(mapDbRuleConfig);
    } catch {
      return null;
    }
  },

  async syncRule(rule: RuleEngineConfig): Promise<void> {
    try {
      await supabase.from('rule_engine_configs').upsert({
        id: rule.id,
        instrument_type: rule.instrumentType,
        capacity_min_val: rule.capacityMinVal,
        capacity_max_val: rule.capacityMaxVal,
        capacity_unit: rule.capacityUnit,
        verification_fee: rule.verificationFee,
        reverification_fee: rule.reverificationFee,
        validity_months: rule.validityMonths,
        checklist_template: rule.checklistTemplate,
        sla_scrutiny_hours: rule.slaScrutinyHours,
        sla_verification_days: rule.slaVerificationDays
      });
    } catch (e) {
      console.warn('Supabase syncRule fallback:', e);
    }
  },

  // --------------------------------------------------------------------------
  // CITIZEN REPORTS
  // --------------------------------------------------------------------------
  async fetchCitizenReports(): Promise<CitizenReport[] | null> {
    try {
      const { data, error } = await supabase.from('citizen_reports').select('*').order('created_at', { ascending: false });
      if (error || !data || data.length === 0) return null;
      return data.map(mapDbCitizenReport);
    } catch {
      return null;
    }
  },

  async syncCitizenReport(report: CitizenReport): Promise<void> {
    try {
      await supabase.from('citizen_reports').upsert({
        id: report.id,
        instrument_id: report.instrumentId,
        business_name: report.businessName,
        reported_by_name: report.reportedByName,
        reported_by_phone: report.reportedByPhone,
        issue_category: report.issueCategory,
        description: report.description,
        photo_evidence_url: report.photoEvidenceUrl,
        reported_latitude: report.reportedLatitude,
        reported_longitude: report.reportedLongitude,
        status: report.status,
        officer_assigned: report.officerAssigned,
        resolution_notes: report.resolutionNotes
      });
    } catch (e) {
      console.warn('Supabase syncCitizenReport fallback:', e);
    }
  },

  // --------------------------------------------------------------------------
  // AUDIT LOGS
  // --------------------------------------------------------------------------
  async fetchAuditLogs(): Promise<AuditLog[] | null> {
    try {
      const { data, error } = await supabase.from('audit_logs').select('*').order('timestamp', { ascending: false });
      if (error || !data || data.length === 0) return null;
      return data.map(mapDbAuditLog);
    } catch {
      return null;
    }
  },

  async syncAuditLog(log: AuditLog): Promise<void> {
    try {
      await supabase.from('audit_logs').insert({
        id: log.id,
        timestamp: log.timestamp,
        actor_id: log.actorId,
        actor_name: log.actorName,
        actor_role: log.actorRole,
        action_type: log.actionType,
        resource_type: log.resourceType,
        resource_id: log.resourceId,
        ip_address: log.ipAddress,
        details: log.details,
        payload_hash: log.payloadHash
      });
    } catch (e) {
      console.warn('Supabase syncAuditLog fallback:', e);
    }
  },

  // --------------------------------------------------------------------------
  // REAL-TIME SUBSCRIPTION HELPER
  // --------------------------------------------------------------------------
  subscribeToChanges(table: string, onUpdate: (payload: any) => void) {
    return supabase
      .channel(`public:${table}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, onUpdate)
      .subscribe();
  }
};
