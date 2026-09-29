// ============================================================================
// MERIX: Unified API & Persistence Client
// Supports seamless offline local storage + optional Spring Boot REST API
// ============================================================================

import {
  User,
  Instrument,
  VerificationApplication,
  Certificate,
  RuleEngineConfig,
  CitizenReport,
  AuditLog,
  Allocation,
  InspectionRecord
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
import { SupabaseDb } from './supabaseClient';

const STORAGE_KEYS = {
  USERS: 'merix_users_v5',
  INSTRUMENTS: 'merix_instruments_v5',
  APPLICATIONS: 'merix_applications_v5',
  CERTIFICATES: 'merix_certificates_v5',
  RULES: 'merix_rules_v5',
  REPORTS: 'merix_citizen_reports_v5',
  AUDIT: 'merix_audit_logs_v5',
  ALLOCATIONS: 'merix_allocations_v5',
  INSPECTIONS: 'merix_inspections_v5',
  CURRENT_USER: 'merix_current_user_v5'
};

function getStorage<T>(key: string, defaultValue: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage error', e);
  }
}

// Initialize seed data if empty and trigger Supabase Cloud sync
export function initStorage(): void {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) setStorage(STORAGE_KEYS.USERS, initialUsers);
  if (!localStorage.getItem(STORAGE_KEYS.INSTRUMENTS)) setStorage(STORAGE_KEYS.INSTRUMENTS, initialInstruments);
  if (!localStorage.getItem(STORAGE_KEYS.APPLICATIONS)) setStorage(STORAGE_KEYS.APPLICATIONS, initialApplications);
  if (!localStorage.getItem(STORAGE_KEYS.CERTIFICATES)) setStorage(STORAGE_KEYS.CERTIFICATES, initialCertificates);
  if (!localStorage.getItem(STORAGE_KEYS.RULES)) setStorage(STORAGE_KEYS.RULES, initialRuleConfigs);
  if (!localStorage.getItem(STORAGE_KEYS.REPORTS)) setStorage(STORAGE_KEYS.REPORTS, initialCitizenReports);
  if (!localStorage.getItem(STORAGE_KEYS.AUDIT)) setStorage(STORAGE_KEYS.AUDIT, initialAuditLogs);
  if (!localStorage.getItem(STORAGE_KEYS.ALLOCATIONS)) setStorage(STORAGE_KEYS.ALLOCATIONS, initialAllocations);

  // Background initialization & remote cloud sync with Supabase
  SupabaseDb.initializeRemoteDatabase().then(async () => {
    try {
      const [remoteUsers, remoteInsts, remoteApps, remoteCerts, remoteRules, remoteReports, remoteAudit, remoteAllocs] = await Promise.all([
        SupabaseDb.fetchUsers(),
        SupabaseDb.fetchInstruments(),
        SupabaseDb.fetchApplications(),
        SupabaseDb.fetchCertificates(),
        SupabaseDb.fetchRules(),
        SupabaseDb.fetchCitizenReports(),
        SupabaseDb.fetchAuditLogs(),
        SupabaseDb.fetchAllocations()
      ]);

      if (remoteUsers && remoteUsers.length > 0) setStorage(STORAGE_KEYS.USERS, remoteUsers);
      if (remoteInsts && remoteInsts.length > 0) setStorage(STORAGE_KEYS.INSTRUMENTS, remoteInsts);
      if (remoteApps && remoteApps.length > 0) setStorage(STORAGE_KEYS.APPLICATIONS, remoteApps);
      if (remoteCerts && remoteCerts.length > 0) setStorage(STORAGE_KEYS.CERTIFICATES, remoteCerts);
      if (remoteRules && remoteRules.length > 0) setStorage(STORAGE_KEYS.RULES, remoteRules);
      if (remoteReports && remoteReports.length > 0) setStorage(STORAGE_KEYS.REPORTS, remoteReports);
      if (remoteAudit && remoteAudit.length > 0) setStorage(STORAGE_KEYS.AUDIT, remoteAudit);
      if (remoteAllocs && remoteAllocs.length > 0) setStorage(STORAGE_KEYS.ALLOCATIONS, remoteAllocs);
    } catch (e) {
      console.warn('Initial Supabase cloud sync warning:', e);
    }
  }).catch(e => console.warn('Supabase DB bootstrap note:', e));
}

// User & Auth
export const ApiService = {
  // Auth
  getCurrentUser(): User | null {
    return getStorage<User | null>(STORAGE_KEYS.CURRENT_USER, null);
  },

  setCurrentUser(user: User | null): void {
    if (user === null) {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    } else {
      setStorage(STORAGE_KEYS.CURRENT_USER, user);
    }
  },

  getAllUsers(): User[] {
    return getStorage<User[]>(STORAGE_KEYS.USERS, initialUsers);
  },

  // Instruments
  getInstruments(userId?: string): Instrument[] {
    const list = getStorage<Instrument[]>(STORAGE_KEYS.INSTRUMENTS, initialInstruments);
    if (userId) {
      return list.filter(i => i.userId === userId);
    }
    return list;
  },

  getInstrumentById(id: string): Instrument | undefined {
    const list = this.getInstruments();
    return list.find(i => i.id === id || i.serialNumber === id);
  },

  registerInstrument(instrument: Omit<Instrument, 'id' | 'trustScore' | 'isAtDriftRisk' | 'status'>, userId: string): Instrument {
    const list = this.getInstruments();
    const newId = `INS-${String(list.length + 101).padStart(6, '0')}`;
    const newInst: Instrument = {
      ...instrument,
      id: newId,
      userId,
      trustScore: 100,
      isAtDriftRisk: false,
      status: 'REGISTERED',
      qrCodeData: `https://merix.gov.in/verify/instrument/${newId}`
    };

    const updated = [newInst, ...list];
    setStorage(STORAGE_KEYS.INSTRUMENTS, updated);

    // Sync to Supabase in background
    SupabaseDb.syncInstrument(newInst);

    this.addAuditLog(userId, instrument.businessName, 'BUSINESS_OWNER', 'REGISTER_INSTRUMENT', 'INSTRUMENT', newId, `Registered ${newInst.instrumentType} (${newInst.serialNumber}) with GPS coords [${newInst.latitude.toFixed(4)}, ${newInst.longitude.toFixed(4)}]`);

    return newInst;
  },

  // Applications
  getApplications(userId?: string): VerificationApplication[] {
    const list = getStorage<VerificationApplication[]>(STORAGE_KEYS.APPLICATIONS, initialApplications);
    const instruments = this.getInstruments();
    const users = this.getAllUsers();

    const populated = list.map(app => ({
      ...app,
      instrument: instruments.find(i => i.id === app.instrumentId),
      user: users.find(u => u.id === app.userId)
    }));

    if (userId) {
      return populated.filter(a => a.userId === userId);
    }
    return populated;
  },

  getApplicationById(id: string): VerificationApplication | undefined {
    const list = this.getApplications();
    return list.find(a => a.id === id);
  },

  submitApplication(app: Omit<VerificationApplication, 'id' | 'status' | 'filedOn'>): VerificationApplication {
    const list = getStorage<VerificationApplication[]>(STORAGE_KEYS.APPLICATIONS, initialApplications);
    const newId = `Merix-2026-${String(list.length + 98).padStart(5, '0')}`;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const newApp: VerificationApplication = {
      ...app,
      id: newId,
      status: 'SUBMITTED',
      filedOn: now,
      slaDueDate: new Date(Date.now() + 48 * 3600 * 1000).toISOString()
    };

    const updated = [newApp, ...list];
    setStorage(STORAGE_KEYS.APPLICATIONS, updated);

    // Sync to Supabase in background
    SupabaseDb.syncApplication(newApp);

    this.addAuditLog(app.userId, 'Applicant', 'BUSINESS_OWNER', 'SUBMIT_APPLICATION', 'APPLICATION', newId, `Submitted verification application for ${app.instrumentId} with fee payment ₹${app.calculatedFee}`);

    return newApp;
  },

  updateApplicationStatus(id: string, status: VerificationApplication['status'], remarks?: string, officerId?: string): void {
    const list = getStorage<VerificationApplication[]>(STORAGE_KEYS.APPLICATIONS, initialApplications);
    let targetApp: VerificationApplication | undefined;

    const updated = list.map(a => {
      if (a.id === id) {
        targetApp = {
          ...a,
          status,
          scrutinyRemarks: remarks !== undefined ? remarks : a.scrutinyRemarks,
          scrutinyOfficerId: officerId !== undefined ? officerId : a.scrutinyOfficerId
        };
        return targetApp;
      }
      return a;
    });
    setStorage(STORAGE_KEYS.APPLICATIONS, updated);

    // Sync status change to Supabase
    if (targetApp) {
      SupabaseDb.syncApplication(targetApp);
    }
  },

  // Allocations
  getAllocations(officerId?: string): Allocation[] {
    const list = getStorage<Allocation[]>(STORAGE_KEYS.ALLOCATIONS, initialAllocations);
    const apps = this.getApplications();

    const populated = list.map(alc => ({
      ...alc,
      application: apps.find(a => a.id === alc.applicationId)
    }));

    if (officerId) {
      const match = populated.filter(a => a.assignedToId === officerId);
      if (match.length > 0) return match;
      // Fallback for demo LMO officers
      const lmoMatch = populated.filter(a => a.assignedToType === 'LMO');
      return lmoMatch.length > 0 ? lmoMatch : populated;
    }
    return populated;
  },

  createAllocation(allocation: Omit<Allocation, 'id' | 'status'>): Allocation {
    const list = getStorage<Allocation[]>(STORAGE_KEYS.ALLOCATIONS, initialAllocations);
    const newId = `ALC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const newAlc: Allocation = {
      ...allocation,
      id: newId,
      status: 'SCHEDULED'
    };

    setStorage(STORAGE_KEYS.ALLOCATIONS, [newAlc, ...list]);
    this.updateApplicationStatus(allocation.applicationId, 'SCHEDULED');

    // Sync allocation to Supabase
    SupabaseDb.syncAllocation(newAlc);

    this.addAuditLog(
      allocation.allocatedBy || 'ADMIN',
      'Department Admin',
      'ADMIN',
      'ALLOCATE_APPLICATION',
      'ALLOCATION',
      newId,
      `Allocated application ${allocation.applicationId} to ${allocation.assignedToName} on ${allocation.scheduledDate} (${allocation.scheduledTimeSlot})`
    );

    return newAlc;
  },

  // Certificates
  getCertificates(userId?: string): Certificate[] {
    const list = getStorage<Certificate[]>(STORAGE_KEYS.CERTIFICATES, initialCertificates);
    const instruments = this.getInstruments();
    const users = this.getAllUsers();

    const populated = list.map(c => ({
      ...c,
      instrument: instruments.find(i => i.id === c.instrumentId),
      user: users.find(u => u.id === c.userId)
    }));

    if (userId) {
      return populated.filter(c => c.userId === userId);
    }
    return populated;
  },

  getCertificateByNumber(certNumber: string): Certificate | undefined {
    if (!certNumber) return undefined;
    const clean = certNumber.trim().toLowerCase();
    const list = this.getCertificates();
    return list.find(c => 
      c.certificateNumber.toLowerCase() === clean ||
      c.id.toLowerCase() === clean ||
      c.stampId?.toLowerCase() === clean ||
      c.applicationId?.toLowerCase() === clean ||
      c.instrumentId?.toLowerCase() === clean ||
      clean.includes(c.certificateNumber.toLowerCase()) ||
      c.certificateNumber.toLowerCase().replace(/[^a-z0-9]/g, '') === clean.replace(/[^a-z0-9]/g, '')
    );
  },

  getCertificateByApplicationId(applicationId: string): Certificate | undefined {
    const list = this.getCertificates();
    return list.find(c => c.applicationId === applicationId);
  },

  // Complete Field Inspection & Issue Certificate
  submitFieldInspection(record: Omit<InspectionRecord, 'id' | 'verifiedAt'>): Certificate {
    const app = this.getApplicationById(record.applicationId);
    const instrument = app?.instrument || this.getInstrumentById(record.instrumentId);
    const certs = this.getCertificates();

    const certCount = certs.length + 893;
    const certNumber = `DOCA-LM-2026-${String(certCount).padStart(5, '0')}`;
    const today = new Date().toISOString().split('T')[0];
    
    // Validity duration
    const validityMonths = instrument?.verificationIntervalMonths || 24;
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + validityMonths);
    const expiryDate = expiry.toISOString().split('T')[0];

    const prevHash = certs[0]?.chainHashCurrent || 'GENESIS-CHAIN-HASH-000';
    const signatureHash = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
    const chainHashCurrent = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);

    const newCert: Certificate = {
      id: `CERT-${String(certs.length + 1).padStart(3, '0')}`,
      certificateNumber: certNumber,
      applicationId: record.applicationId,
      instrumentId: record.instrumentId,
      instrument,
      userId: app?.userId || 'USR-001',
      officerId: record.officerId,
      officerName: 'K. Murugan, Inspector (LMO)',
      issueDate: today,
      expiryDate,
      stampId: record.stampNumber || `TN-LM-STAMP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      qrCodeUrl: `https://merix-web.vercel.app/verify/${certNumber}`,
      digitalSignatureHash: signatureHash,
      chainHashPrevious: prevHash,
      chainHashCurrent,
      status: 'VALID'
    };

    setStorage(STORAGE_KEYS.CERTIFICATES, [newCert, ...certs]);
    this.updateApplicationStatus(record.applicationId, 'CERTIFICATE_GENERATED');

    // Sync Certificate to Supabase in background
    SupabaseDb.syncCertificate(newCert);

    // Sync Inspection Record to Supabase
    const inspectionId = `INSP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const fullRecord: InspectionRecord = {
      ...record,
      id: inspectionId,
      verifiedAt: new Date().toISOString()
    };
    SupabaseDb.syncInspectionRecord(fullRecord);

    // Update Instrument Status locally & in Supabase
    const instruments = this.getInstruments();
    let updatedTargetInst: Instrument | null = null;
    const updatedInsts = instruments.map(inst => {
      if (inst.id === record.instrumentId) {
        updatedTargetInst = {
          ...inst,
          status: 'VERIFIED' as const,
          isAtDriftRisk: false,
          trustScore: Math.min(100, inst.trustScore + 10)
        };
        return updatedTargetInst;
      }
      return inst;
    });
    setStorage(STORAGE_KEYS.INSTRUMENTS, updatedInsts);
    if (updatedTargetInst) {
      SupabaseDb.syncInstrument(updatedTargetInst);
    }

    this.addAuditLog(
      record.officerId,
      'K. Murugan (LMO)',
      'LMO_OFFICER',
      'GENERATE_CERTIFICATE',
      'CERTIFICATE',
      certNumber,
      `Field verification passed. Stamped ${record.stampNumber}, Seal: ${record.securitySealNumber}. Digital Certificate ${certNumber} generated.`
    );

    return newCert;
  },

  // Rule Engine
  getRules(): RuleEngineConfig[] {
    const rules = getStorage<RuleEngineConfig[]>(STORAGE_KEYS.RULES, initialRuleConfigs);
    return rules.map(r => {
      if (!r.checklistTemplate || r.checklistTemplate.length === 0) {
        const fallback = initialRuleConfigs.find(i => i.id === r.id || i.instrumentType.toLowerCase() === r.instrumentType.toLowerCase());
        return {
          ...r,
          checklistTemplate: fallback?.checklistTemplate || [
            'Visual physical inspection of scale body and platform',
            'Leveling bubble verified centered on surface',
            'Zero load balance verification (within +/- 0.25 e)',
            'Repeatability and MPE tolerance calibration test',
            'Tamper-evident stamping seal applied and documented'
          ]
        };
      }
      return r;
    });
  },

  updateRule(rule: RuleEngineConfig): void {
    const list = this.getRules();
    const exists = list.some(r => r.id === rule.id);
    const updated = exists ? list.map(r => r.id === rule.id ? rule : r) : [...list, rule];
    setStorage(STORAGE_KEYS.RULES, updated);

    // Sync to Supabase
    SupabaseDb.syncRule(rule);
  },

  calculateFee(instrumentType: string, appType: string = 'INITIAL_VERIFICATION'): number {
    const rules = this.getRules();
    const typeLower = (instrumentType || '').toLowerCase();
    const match = rules.find(r => 
      r.instrumentType.toLowerCase() === typeLower ||
      typeLower.includes(r.instrumentType.toLowerCase()) ||
      r.instrumentType.toLowerCase().includes(typeLower)
    );
    if (match) {
      return appType === 'INITIAL_VERIFICATION' ? match.verificationFee : match.reverificationFee;
    }
    if (typeLower.includes('rail') || typeLower.includes('weighbridge')) return 5000;
    if (typeLower.includes('dispenser') || typeLower.includes('fuel')) return 2500;
    if (typeLower.includes('meter')) return 1500;
    if (typeLower.includes('medical') || typeLower.includes('analyzer') || typeLower.includes('thermometer') || typeLower.includes('sphygmomanometer')) return 1200;
    return 1000;
  },

  // Citizen Reports
  getCitizenReports(): CitizenReport[] {
    return getStorage<CitizenReport[]>(STORAGE_KEYS.REPORTS, initialCitizenReports);
  },

  submitCitizenReport(report: Omit<CitizenReport, 'id' | 'status' | 'createdAt'>): CitizenReport {
    const list = this.getCitizenReports();
    const newId = `REP-${String(list.length + 1).padStart(3, '0')}`;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const newRep: CitizenReport = {
      ...report,
      id: newId,
      status: 'OPEN',
      createdAt: now
    };

    setStorage(STORAGE_KEYS.REPORTS, [newRep, ...list]);

    // Sync to Supabase in background
    SupabaseDb.syncCitizenReport(newRep);

    // Dock trust score on instrument if linked
    if (report.instrumentId) {
      const insts = this.getInstruments();
      let updatedInstObj: Instrument | null = null;
      const updatedInsts = insts.map(inst => {
        if (inst.id === report.instrumentId) {
          updatedInstObj = {
            ...inst,
            trustScore: Math.max(15, inst.trustScore - 25),
            isAtDriftRisk: true
          };
          return updatedInstObj;
        }
        return inst;
      });
      setStorage(STORAGE_KEYS.INSTRUMENTS, updatedInsts);
      if (updatedInstObj) {
        SupabaseDb.syncInstrument(updatedInstObj);
      }
    }

    this.addAuditLog(
      'PUBLIC_CITIZEN',
      report.reportedByName,
      'CITIZEN',
      'SUBMIT_CITIZEN_REPORT',
      'CITIZEN_REPORT',
      newId,
      `Citizen report filed for '${report.issueCategory}' against ${report.businessName}`
    );

    return newRep;
  },

  updateCitizenReportStatus(id: string, status: CitizenReport['status'], notes?: string): void {
    const list = this.getCitizenReports();
    let targetRep: CitizenReport | undefined;
    const updated = list.map(r => {
      if (r.id === id) {
        targetRep = { ...r, status, resolutionNotes: notes || r.resolutionNotes };
        return targetRep;
      }
      return r;
    });
    setStorage(STORAGE_KEYS.REPORTS, updated);

    if (targetRep) {
      SupabaseDb.syncCitizenReport(targetRep);
    }
  },

  // Audit Logs
  getAuditLogs(): AuditLog[] {
    return getStorage<AuditLog[]>(STORAGE_KEYS.AUDIT, initialAuditLogs);
  },

  addAuditLog(actorId: string, actorName: string, actorRole: string, actionType: string, resourceType: string, resourceId: string, details: string): void {
    const list = getStorage<AuditLog[]>(STORAGE_KEYS.AUDIT, initialAuditLogs);
    const newLog: AuditLog = {
      id: `AUD-${String(list.length + 1).padStart(3, '0')}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actorId,
      actorName,
      actorRole,
      actionType,
      resourceType,
      resourceId,
      ipAddress: '103.21.124.9',
      details,
      payloadHash: Math.random().toString(36).substring(2, 18)
    };
    setStorage(STORAGE_KEYS.AUDIT, [newLog, ...list]);

    // Sync to Supabase in background
    SupabaseDb.syncAuditLog(newLog);
  }
};

