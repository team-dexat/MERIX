// ============================================================================
// MERIX: Legal Metrology TypeScript Domain Types
// ============================================================================

export type UserRole = 'BUSINESS_OWNER' | 'LMO_OFFICER' | 'GATC_CENTER' | 'ADMIN' | 'CITIZEN';

export interface User {
  id: string;
  email: string;
  fullName: string;
  businessName?: string;
  role: UserRole;
  phoneNumber?: string;
  district?: string;
  state?: string;
  jurisdictionZone?: string;
  licenseNo?: string;
  avatarUrl?: string;
}

export type AccuracyClass = 'Class I' | 'Class II' | 'Class III' | 'Class IIII' | 'Class 0.5' | 'Class 1';

export const INSTRUMENT_CATEGORIES_MAP: Record<string, string[]> = {
  'Weighing Instruments': [
    'Automatic Rail Weighbridges',
    'Beam Scale',
    'Counter Machine',
    'Load Cell',
    'Non-Automatic Weighing Instruments'
  ],
  'Weights (Other Categories)': [
    'Standard Weights',
    'Working Standards',
    'Commercial Cast Iron Weights',
    'Brass Bullion Weights',
    'Carat Weights'
  ],
  'Fuel Dispensers': [
    'CNG Dispenser',
    'Hydrogen Dispenser',
    'LNG Dispenser',
    'LPG Dispenser',
    'Petrol/Diesel Dispenser'
  ],
  'Utility and Flow Meters': [
    'Energy Meter',
    'Flow Meter',
    'Gas Meter',
    'Water Meter'
  ],
  'Medical and Safety Instruments': [
    'Breath Analyzer',
    'Clinical Thermometer',
    'Sphygmomanometer'
  ],
  'Dimensional and Physical Measurement': [
    'Moisture Meter',
    'Multi-Dimensional Measuring Instrument',
    'Tape Measures',
    'Vehicle Speed Meter'
  ]
};

export const INSTRUMENT_CATEGORIES = Object.keys(INSTRUMENT_CATEGORIES_MAP);

export type InstrumentCategory = 
  | 'Weighing Instruments'
  | 'Weights (Other Categories)'
  | 'Fuel Dispensers'
  | 'Utility and Flow Meters'
  | 'Medical and Safety Instruments'
  | 'Dimensional and Physical Measurement'
  | string;

export type InstrumentStatus = 'REGISTERED' | 'VERIFIED' | 'EXPIRED' | 'UNDER_INSPECTION' | 'FLAGGED';

export interface Instrument {
  id: string; // e.g. INS-000101
  userId: string;
  businessName: string;
  instrumentType: string; // Platform / Bench Scale, Weighbridge, Electronic Balance, Fuel Dispensing Pump, Flow Meter
  category: string;
  manufacturer: string;
  modelNumber: string;
  serialNumber: string;
  accuracyClass: AccuracyClass;
  maxCapacity: string; // 300 kg, 60,000 kg, 220 g, 60 L/min
  minCapacity?: string;
  verificationIntervalMonths: number;
  verificationScaleIntervalE?: string;
  actualScaleIntervalD?: string;
  latitude: number;
  longitude: number;
  installationAddress: string;
  pincode?: string;
  photoUrl?: string;
  qrCodeData?: string;
  trustScore: number; // 0-100
  isAtDriftRisk: boolean;
  status: InstrumentStatus;
  createdAt?: string;
}

export type ApplicationStatus = 
  | 'SUBMITTED' 
  | 'IN_SCRUTINY' 
  | 'APPROVED' 
  | 'ALLOCATED' 
  | 'SCHEDULED' 
  | 'IN_VERIFICATION' 
  | 'CERTIFICATE_GENERATED' 
  | 'REJECTED';

export type ApplicationType = 
  | 'INITIAL_VERIFICATION' 
  | 'PERIODIC_REVERIFICATION' 
  | 'REVERIFICATION_AFTER_REPAIR' 
  | 'SURPRISE_CHECK';

export type DocumentCategory = 
  | 'OWNERSHIP_DOC' 
  | 'PREVIOUS_CERTIFICATE' 
  | 'MANUFACTURER_INVOICE' 
  | 'CALIBRATION_REPORT' 
  | 'OTHER_DOC';

export interface AttachedDocument {
  id: string;
  category: DocumentCategory;
  categoryLabel: string;
  fileName: string;
  fileSize?: string;
  uploadedAt: string;
  fileDataUrl?: string;
  status: 'UPLOADED' | 'VERIFIED' | 'REJECTED';
  notes?: string;
}

export interface VerificationApplication {
  id: string; // Merix-2026-00102
  instrumentId: string;
  userId: string;
  instrument?: Instrument;
  user?: User;
  applicationType: ApplicationType;
  preferredDate: string;
  calculatedFee: number;
  feePaid: boolean;
  paymentReference?: string;
  status: ApplicationStatus;
  documentsUrl?: string;
  attachedDocuments?: AttachedDocument[];
  scrutinyRemarks?: string;
  scrutinyOfficerId?: string;
  filedOn: string;
  slaDueDate?: string;
  slaBreached?: boolean;
}

export interface Allocation {
  id: string;
  applicationId: string;
  application?: VerificationApplication;
  assignedToType: 'LMO' | 'GATC';
  assignedToId: string;
  assignedToName: string;
  scheduledDate: string;
  scheduledTimeSlot: string; // 10:00 AM - 01:00 PM
  instructions?: string;
  allocatedBy?: string;
  status: 'SCHEDULED' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED';
}

export interface TestReading {
  loadPoint: string; // Zero, 20%, 50%, 100% Max, Corner 1, Corner 2
  appliedLoad: number;
  observedReading: number;
  error: number;
  mpeLimit: number;
  unit: string;
  passed: boolean;
}

export interface InspectionRecord {
  id: string;
  applicationId: string;
  instrumentId: string;
  officerId: string;
  inspectorLatitude?: number;
  inspectorLongitude?: number;
  geoFenceVerified: boolean;
  checklistResults: { title: string; checked: boolean }[];
  testLoadReadings: TestReading[];
  eccentricityTestPassed: boolean;
  repeatabilityTestPassed: boolean;
  calculatedMaxError: number;
  maxPermissibleError: number;
  testVerdict: 'PASSED' | 'FAILED' | 'CALIBRATION_REQUIRED';
  stampNumber: string; // LM-STAMP-2026-9821
  securitySealNumber: string;
  inspectionPhotos?: string[];
  remarks?: string;
  verifiedAt: string;
}

export interface Certificate {
  id: string;
  certificateNumber: string; // DOCA-LM-2026-00892
  applicationId: string;
  instrumentId: string;
  instrument?: Instrument;
  userId: string;
  user?: User;
  officerId: string;
  officerName?: string;
  issueDate: string;
  expiryDate: string;
  stampId: string;
  qrCodeUrl: string;
  digitalSignatureHash: string;
  chainHashPrevious: string;
  chainHashCurrent: string;
  status: 'VALID' | 'EXPIRING_SOON' | 'EXPIRED' | 'CANCELLED';
}

export interface RuleEngineConfig {
  id: string;
  instrumentType: string;
  capacityMinVal?: number;
  capacityMaxVal?: number;
  capacityUnit?: string;
  verificationFee: number;
  reverificationFee: number;
  validityMonths: number;
  checklistTemplate: string[];
  slaScrutinyHours: number;
  slaVerificationDays: number;
}

export interface CitizenReport {
  id: string;
  instrumentId?: string;
  businessName: string;
  reportedByName: string;
  reportedByPhone?: string;
  issueCategory: 'SHORT_WEIGHT' | 'BROKEN_SEAL' | 'UNVERIFIED_DEVICE' | 'EXPIRED_STAMP' | 'ALTERED_MEASURE';
  description: string;
  photoEvidenceUrl?: string;
  reportedLatitude?: number;
  reportedLongitude?: number;
  status: 'OPEN' | 'UNDER_INVESTIGATION' | 'ACTION_TAKEN' | 'DISMISSED';
  officerAssigned?: string;
  resolutionNotes?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  actionType: string;
  resourceType: string;
  resourceId: string;
  ipAddress: string;
  details: string;
  payloadHash: string;
}

export type SupportedLanguage = 'en' | 'hi' | 'mr' | 'gu' | 'ta';
