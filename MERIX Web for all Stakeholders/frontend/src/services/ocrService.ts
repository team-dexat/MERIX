// ============================================================================
// MERIX: AI & Nameplate OCR Simulation Engine
// ============================================================================

export interface OcrExtractionResult {
  manufacturer: string;
  modelNumber: string;
  serialNumber: string;
  instrumentType: string;
  category: string;
  accuracyClass: 'Class I' | 'Class II' | 'Class III' | 'Class IIII';
  maxCapacity: string;
  minCapacity: string;
  verificationScaleIntervalE: string;
  actualScaleIntervalD: string;
  verificationIntervalMonths: number;
  confidenceScore: number;
  detectedFields: { [key: string]: string };
}

const OCR_TEMPLATES: OcrExtractionResult[] = [
  {
    manufacturer: 'Avery Weigh-Tronix India',
    modelNumber: 'AV-E1205 Pro',
    serialNumber: 'AV-2026-' + Math.floor(10000 + Math.random() * 90000),
    instrumentType: 'Non-Automatic Weighing Instruments',
    category: 'Weighing Instruments',
    accuracyClass: 'Class III',
    maxCapacity: '300 kg',
    minCapacity: '2 kg',
    verificationScaleIntervalE: '50 g',
    actualScaleIntervalD: '10 g',
    verificationIntervalMonths: 24,
    confidenceScore: 0.98,
    detectedFields: {
      'MANUFACTURER': 'Avery Weigh-Tronix India Pvt Ltd',
      'MODEL': 'E1205 Pro Platform Bench',
      'SERIAL_NO': 'AV-2026-88912',
      'MAX_CAPACITY': 'Max = 300 kg',
      'MIN_CAPACITY': 'Min = 2 kg',
      'VERIFICATION_INTERVAL': 'e = 50 g, d = 10 g',
      'ACCURACY_CLASS': 'Class III (Medium)',
      'APPROVAL_NO': 'IND/09/2021/441'
    }
  },
  {
    manufacturer: 'Mettler Toledo Inc.',
    modelNumber: 'ME-204 Analytical',
    serialNumber: 'MT-2026-' + Math.floor(10000 + Math.random() * 90000),
    instrumentType: 'Counter Machine',
    category: 'Weighing Instruments',
    accuracyClass: 'Class II',
    maxCapacity: '220 g',
    minCapacity: '0.02 g',
    verificationScaleIntervalE: '1 mg',
    actualScaleIntervalD: '0.1 mg',
    verificationIntervalMonths: 12,
    confidenceScore: 0.97,
    detectedFields: {
      'MANUFACTURER': 'Mettler Toledo Precision Instruments',
      'MODEL': 'ME204 MonoBloc Analytical',
      'SERIAL_NO': 'MT-2026-91023',
      'MAX_CAPACITY': 'Max = 220 g',
      'MIN_CAPACITY': 'Min = 0.02 g',
      'VERIFICATION_INTERVAL': 'e = 1 mg, d = 0.1 mg',
      'ACCURACY_CLASS': 'Class II (High)',
      'APPROVAL_NO': 'IND/12/2023/809'
    }
  },
  {
    manufacturer: 'Essae-Teraoka Ltd.',
    modelNumber: 'DS-215 Bench',
    serialNumber: 'ES-2026-' + Math.floor(10000 + Math.random() * 90000),
    instrumentType: 'Counter Machine',
    category: 'Weighing Instruments',
    accuracyClass: 'Class III',
    maxCapacity: '150 kg',
    minCapacity: '1 kg',
    verificationScaleIntervalE: '20 g',
    actualScaleIntervalD: '5 g',
    verificationIntervalMonths: 24,
    confidenceScore: 0.95,
    detectedFields: {
      'MANUFACTURER': 'Essae Teraoka Limited',
      'MODEL': 'DS-215 Digital Bench Scale',
      'SERIAL_NO': 'ES-2026-44102',
      'MAX_CAPACITY': 'Max = 150 kg',
      'MIN_CAPACITY': 'Min = 1 kg',
      'VERIFICATION_INTERVAL': 'e = 20 g, d = 5 g',
      'ACCURACY_CLASS': 'Class III (Medium)',
      'APPROVAL_NO': 'IND/04/2022/112'
    }
  },
  {
    manufacturer: 'Tokheim India Pvt Ltd',
    modelNumber: 'Quantium 510-M',
    serialNumber: 'TK-2026-' + Math.floor(10000 + Math.random() * 90000),
    instrumentType: 'Petrol/Diesel Dispenser',
    category: 'Fuel Dispensers',
    accuracyClass: 'Class III',
    maxCapacity: '70 L/min',
    minCapacity: '5 L/min',
    verificationScaleIntervalE: '10 mL',
    actualScaleIntervalD: '5 mL',
    verificationIntervalMonths: 12,
    confidenceScore: 0.96,
    detectedFields: {
      'MANUFACTURER': 'Tokheim Fuel Systems',
      'MODEL': 'Quantium 510 Multi-Product Dispenser',
      'SERIAL_NO': 'TK-2026-55901',
      'MAX_CAPACITY': 'Max Flow = 70 L/min',
      'MIN_CAPACITY': 'Min Flow = 5 L/min',
      'ACCURACY_CLASS': 'Class 0.5 (Liquid Fuel)',
      'APPROVAL_NO': 'IND/11/2023/502'
    }
  }
];

export async function processNameplateOcr(file: File | string): Promise<OcrExtractionResult> {
  // Simulate neural OCR text detection and Legal Metrology Act parsing delay
  await new Promise(resolve => setTimeout(resolve, 1400));
  const randomIndex = Math.floor(Math.random() * OCR_TEMPLATES.length);
  return { ...OCR_TEMPLATES[randomIndex] };
}
