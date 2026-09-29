import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Alert,
  Paper,
  Divider,
  Chip,
  IconButton,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  FileText,
  CreditCard,
  CheckCircle2,
  Calendar,
  IndianRupee,
  X,
  UploadCloud,
  Lock,
  ArrowRight,
  FileCheck,
  Building,
  Award,
  Sparkles,
  Trash2,
  Eye,
  Paperclip,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { ApiService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  Instrument,
  VerificationApplication,
  ApplicationType,
  AttachedDocument,
  DocumentCategory
} from '../../types';
import { DemoPaymentGatewayModal } from '../payment/DemoPaymentGatewayModal';
import { PaymentSuccessModal } from '../payment/PaymentSuccessModal';

interface NewApplicationModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (newApp: VerificationApplication) => void;
  preselectedInstrumentId?: string;
}

export const NewApplicationModal: React.FC<NewApplicationModalProps> = ({
  open,
  onClose,
  onSuccess,
  preselectedInstrumentId
}) => {
  const { user } = useAuth();
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [selectedInstId, setSelectedInstId] = useState('');
  const [appType, setAppType] = useState<ApplicationType>('PERIODIC_REVERIFICATION');
  const [preferredDate, setPreferredDate] = useState('2026-09-30');
  const [calculatedFee, setCalculatedFee] = useState(800);
  
  // Document Attachments State
  const [attachedDocs, setAttachedDocs] = useState<AttachedDocument[]>([]);
  const [selectedDocCategory, setSelectedDocCategory] = useState<DocumentCategory>('OWNERSHIP_DOC');
  const [docNotes, setDocNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [docError, setDocError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Modals & Flow
  const [paymentGatewayOpen, setPaymentGatewayOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [completedApp, setCompletedApp] = useState<VerificationApplication | null>(null);
  const [previewDoc, setPreviewDoc] = useState<AttachedDocument | null>(null);
  const [paymentSummary, setPaymentSummary] = useState<{
    txId: string;
    bankRef: string;
    paymentMode: string;
    timestamp: string;
    amount: number;
  } | null>(null);

  const documentCategories: { key: DocumentCategory; label: string; desc: string; isRequired: boolean }[] = [
    {
      key: 'OWNERSHIP_DOC',
      label: 'Ownership / Commercial Invoice',
      desc: 'Purchase Bill, GST Certificate, Rental Lease, or Commercial Trade License',
      isRequired: true
    },
    {
      key: 'PREVIOUS_CERTIFICATE',
      label: 'Previous Certificate / Stamp Seal',
      desc: 'Previous Legal Metrology Stamping Certificate, Model Approval, or Calibration Seal',
      isRequired: appType === 'PERIODIC_REVERIFICATION' || appType === 'REVERIFICATION_AFTER_REPAIR'
    },
    {
      key: 'CALIBRATION_REPORT',
      label: 'Manufacturer Calibration Test Report',
      desc: 'NABL / OEM Factory standard load calibration certificate',
      isRequired: false
    },
    {
      key: 'OTHER_DOC',
      label: 'Other Supporting Documents',
      desc: 'Instrument serial plate photo, Maintenance receipt, or Authorized Dealer Declaration',
      isRequired: false
    }
  ];

  useEffect(() => {
    if (open) {
      const list = ApiService.getInstruments(user?.id);
      setInstruments(list);
      if (preselectedInstrumentId) {
        setSelectedInstId(preselectedInstrumentId);
      } else if (list.length > 0) {
        setSelectedInstId(list[0].id);
      }

      // Initial default sample attachment for quick experience
      setAttachedDocs([
        {
          id: `DOC-${Date.now()}-1`,
          category: 'OWNERSHIP_DOC',
          categoryLabel: 'Ownership / Commercial Invoice',
          fileName: 'GST_Commercial_Invoice_SundarIndustries.pdf',
          fileSize: '412 KB',
          uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          status: 'UPLOADED',
          notes: 'GSTIN: 33AAAAA0000A1Z5 Commercial premises ownership record'
        }
      ]);
      setDocError(null);
      setPaymentGatewayOpen(false);
      setSuccessModalOpen(false);
      setCompletedApp(null);
    }
  }, [open, user, preselectedInstrumentId]);

  useEffect(() => {
    if (selectedInstId) {
      const inst = instruments.find(i => i.id === selectedInstId);
      if (inst) {
        const fee = ApiService.calculateFee(inst.instrumentType, appType);
        setCalculatedFee(fee);
      }
    }
  }, [selectedInstId, appType, instruments]);

  // Handle Real File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setDocError(null);

    const file = files[0];
    const categoryInfo = documentCategories.find(c => c.key === selectedDocCategory);

    setTimeout(() => {
      const newDoc: AttachedDocument = {
        id: `DOC-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        category: selectedDocCategory,
        categoryLabel: categoryInfo?.label || 'Supporting Document',
        fileName: file.name,
        fileSize: `${Math.max(1, Math.round(file.size / 1024))} KB`,
        uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        status: 'UPLOADED',
        notes: docNotes.trim() || undefined
      };

      setAttachedDocs(prev => [...prev, newDoc]);
      setDocNotes('');
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }, 400);
  };

  // Attach Preset Sample Demo Document
  const handleAddSampleDoc = (category: DocumentCategory) => {
    const samples: Record<DocumentCategory, { fileName: string; size: string; notes: string }> = {
      OWNERSHIP_DOC: {
        fileName: 'Commercial_Purchase_Invoice_AV500.pdf',
        size: '348 KB',
        notes: 'Verified Commercial Invoice with Dealer Stamp'
      },
      PREVIOUS_CERTIFICATE: {
        fileName: 'Legal_Metrology_Cert_DOCA-LM-2025.pdf',
        size: '520 KB',
        notes: 'Previous Stamping Certificate Serial #TN-LM-STAMP-2025'
      },
      CALIBRATION_REPORT: {
        fileName: 'NABL_Factory_Calibration_Report_2026.pdf',
        size: '610 KB',
        notes: 'Standard Load MPE Repeatability Test Sheet'
      },
      MANUFACTURER_INVOICE: {
        fileName: 'OEM_Manufacturer_Bill_AveryIndia.pdf',
        size: '290 KB',
        notes: 'Original Manufacturer Type Approval Bill'
      },
      OTHER_DOC: {
        fileName: 'Instrument_Serial_Plate_Photo.jpg',
        size: '1.2 MB',
        notes: 'Clear photograph of physical serial tag'
      }
    };

    const target = samples[category] || samples.OTHER_DOC;
    const categoryInfo = documentCategories.find(c => c.key === category);

    const newDoc: AttachedDocument = {
      id: `DOC-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      category,
      categoryLabel: categoryInfo?.label || 'Document',
      fileName: target.fileName,
      fileSize: target.size,
      uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'UPLOADED',
      notes: target.notes
    };

    setAttachedDocs(prev => [...prev, newDoc]);
  };

  const handleRemoveDoc = (id: string) => {
    setAttachedDocs(prev => prev.filter(d => d.id !== id));
  };

  const handleOpenGateway = () => {
    if (!selectedInstId) {
      setDocError('Please select a registered instrument first.');
      return;
    }

    // Validation: Ownership document is required
    const hasOwnership = attachedDocs.some(d => d.category === 'OWNERSHIP_DOC');
    if (!hasOwnership) {
      setDocError('Ownership Document is required. Please upload a Purchase Invoice, GST Certificate, or Lease Agreement.');
      return;
    }

    setDocError(null);
    setPaymentGatewayOpen(true);
  };

  const handlePaymentSuccess = (
    paymentRef: string,
    details: {
      transactionId: string;
      bankRef: string;
      paymentMode: string;
      timestamp: string;
      amount: number;
    }
  ) => {
    // 1. Submit verified application to system with attached documents
    const newApp = ApiService.submitApplication({
      instrumentId: selectedInstId,
      userId: user?.id || 'USR-001',
      applicationType: appType,
      preferredDate,
      calculatedFee,
      feePaid: true,
      paymentReference: paymentRef,
      attachedDocuments: attachedDocs
    });

    setCompletedApp(newApp);
    setPaymentSummary({
      txId: details.transactionId,
      bankRef: details.bankRef,
      paymentMode: details.paymentMode,
      timestamp: details.timestamp,
      amount: details.amount
    });

    // 2. Transition from payment gateway to Success Animation Modal
    setPaymentGatewayOpen(false);
    setSuccessModalOpen(true);
  };

  const handleFinishAndRedirect = () => {
    setSuccessModalOpen(false);
    if (completedApp) {
      onSuccess(completedApp);
    }
    onClose();
  };

  const selectedInst = instruments.find(i => i.id === selectedInstId);
  const hasOwnershipDoc = attachedDocs.some(d => d.category === 'OWNERSHIP_DOC');
  const hasPreviousCert = attachedDocs.some(d => d.category === 'PREVIOUS_CERTIFICATE');

  return (
    <>
      <Dialog
        open={open && !paymentGatewayOpen && !successModalOpen}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: '18px', overflow: 'hidden' }
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            py: 1.8,
            px: 3
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            <FileText size={22} color="#10b981" />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                Apply for Verification &amp; Stamping
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Legal Metrology Act, 2009 · Statutory Verification Schedule
              </Typography>
            </Box>
          </Box>
          <Button onClick={onClose} size="small" sx={{ minWidth: 32, p: 0.5, color: '#64748b' }}>
            <X size={20} />
          </Button>
        </DialogTitle>

        <DialogContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {docError && (
              <Alert severity="error" icon={<AlertCircle size={20} />} sx={{ borderRadius: '10px' }}>
                {docError}
              </Alert>
            )}

            {/* SECTION 1: Instrument & Application Specifications */}
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: '14px', backgroundColor: '#ffffff' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e40af', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Building size={16} /> 1. Select Registered Instrument &amp; Verification Schedule
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="Select Registered Instrument *"
                    value={selectedInstId}
                    onChange={(e) => setSelectedInstId(e.target.value)}
                    size="small"
                  >
                    {instruments.map((inst) => (
                      <MenuItem key={inst.id} value={inst.id}>
                        {inst.id} — {inst.instrumentType} ({inst.modelNumber || 'Standard'})
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="Verification Type *"
                    value={appType}
                    onChange={(e) => setAppType(e.target.value as ApplicationType)}
                    size="small"
                  >
                    <MenuItem value="INITIAL_VERIFICATION">Initial Verification &amp; Stamping (New Device)</MenuItem>
                    <MenuItem value="PERIODIC_REVERIFICATION">Periodic Re-verification (Mandatory Rule 24)</MenuItem>
                    <MenuItem value="REVERIFICATION_AFTER_REPAIR">Re-verification After Maintenance / Repair</MenuItem>
                  </TextField>
                </Grid>

                {selectedInst && (
                  <Grid item xs={12}>
                    <Paper elevation={0} sx={{ p: 1.8, backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                      <Grid container spacing={1.5}>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>SERIAL NUMBER</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 800, fontFamily: 'monospace', color: '#1e40af' }}>{selectedInst.serialNumber || selectedInst.id}</Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>ACCURACY CLASS</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>{selectedInst.accuracyClass}</Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>CAPACITY</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>{selectedInst.maxCapacity}</Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>SITE ADDRESS</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {selectedInst.installationAddress}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                )}

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Preferred Inspection Date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    helperText="Officer allocated within 48h statutory SLA"
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* SECTION 2: Attach Documents (Ownership, Previous Certs, Other Docs) */}
            <Paper
              variant="outlined"
              sx={{
                p: 2.5,
                borderRadius: '14px',
                backgroundColor: '#ffffff',
                border: '1.5px solid #bfdbfe'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e40af', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Paperclip size={17} color="#1e40af" /> 2. Attach Required Commercial &amp; Stamping Documents
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    Upload Ownership Documents (Invoice/GST/Lease), Previous Certificates, or Calibration Reports.
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {hasOwnershipDoc ? (
                    <Chip size="small" icon={<CheckCircle2 size={13} color="#059669" />} label="Ownership Doc Attached" sx={{ backgroundColor: '#ecfdf5', color: '#047857', fontWeight: 700, fontSize: '0.72rem' }} />
                  ) : (
                    <Chip size="small" label="Ownership Doc Missing *" sx={{ backgroundColor: '#fee2e2', color: '#dc2626', fontWeight: 800, fontSize: '0.72rem' }} />
                  )}
                </Box>
              </Box>

              {/* Upload Action Card */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: '12px',
                  backgroundColor: '#f8fafc',
                  border: '1px dashed #94a3b8',
                  mb: 2
                }}
              >
                <Grid container spacing={1.5} alignItems="center">
                  <Grid item xs={12} sm={4}>
                    <TextField
                      select
                      fullWidth
                      label="Document Category *"
                      value={selectedDocCategory}
                      onChange={(e) => setSelectedDocCategory(e.target.value as DocumentCategory)}
                      size="small"
                      sx={{ backgroundColor: '#ffffff', borderRadius: '6px' }}
                    >
                      {documentCategories.map((cat) => (
                        <MenuItem key={cat.key} value={cat.key}>
                          {cat.label} {cat.isRequired ? '*' : ''}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={12} sm={5}>
                    <TextField
                      fullWidth
                      placeholder="Optional remarks (e.g. GSTIN, invoice #, serial tag)"
                      value={docNotes}
                      onChange={(e) => setDocNotes(e.target.value)}
                      size="small"
                      sx={{ backgroundColor: '#ffffff', borderRadius: '6px' }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={3}>
                    <input
                      type="file"
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                      accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                      onChange={handleFileUpload}
                    />
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<UploadCloud size={16} />}
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      sx={{
                        backgroundColor: '#1e40af',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        py: 0.9,
                        '&:hover': { backgroundColor: '#1e3a8a' }
                      }}
                    >
                      {uploading ? 'Attaching...' : 'Choose File'}
                    </Button>
                  </Grid>
                </Grid>

                {uploading && <LinearProgress sx={{ mt: 1.5, borderRadius: '4px' }} />}

                {/* 1-Click Fast Sample Document Attachments */}
                <Box sx={{ mt: 1.8, pt: 1.2, borderTop: '1px dashed #e2e8f0', display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>
                    ⚡ 1-Click Quick Attach:
                  </Typography>
                  <Chip
                    size="small"
                    label="+ Ownership Invoice"
                    onClick={() => handleAddSampleDoc('OWNERSHIP_DOC')}
                    sx={{ fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', backgroundColor: '#eff6ff', color: '#1e40af', '&:hover': { backgroundColor: '#dbeafe' } }}
                  />
                  <Chip
                    size="small"
                    label="+ Previous Stamping Cert"
                    onClick={() => handleAddSampleDoc('PREVIOUS_CERTIFICATE')}
                    sx={{ fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', backgroundColor: '#ecfdf5', color: '#047857', '&:hover': { backgroundColor: '#d1fae5' } }}
                  />
                  <Chip
                    size="small"
                    label="+ Calibration Report"
                    onClick={() => handleAddSampleDoc('CALIBRATION_REPORT')}
                    sx={{ fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', backgroundColor: '#faf5ff', color: '#7e22ce', '&:hover': { backgroundColor: '#f3e8ff' } }}
                  />
                  <Chip
                    size="small"
                    label="+ Instrument Photo"
                    onClick={() => handleAddSampleDoc('OTHER_DOC')}
                    sx={{ fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', backgroundColor: '#fffbeb', color: '#b45309', '&:hover': { backgroundColor: '#fef3c7' } }}
                  />
                </Box>
              </Paper>

              {/* List of Attached Documents */}
              <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, display: 'block', mb: 1 }}>
                ATTACHED DOCUMENTS ({attachedDocs.length})
              </Typography>

              {attachedDocs.length === 0 ? (
                <Box sx={{ p: 2.5, textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <Paperclip size={24} color="#94a3b8" style={{ marginBottom: 4 }} />
                  <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
                    No documents attached yet. Please attach your Ownership document to proceed.
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {attachedDocs.map((doc) => (
                    <Paper
                      key={doc.id}
                      elevation={0}
                      sx={{
                        p: 1.5,
                        px: 2,
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 1.5
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0 }}>
                        <FileCheck size={20} color={doc.category === 'OWNERSHIP_DOC' ? '#1e40af' : doc.category === 'PREVIOUS_CERTIFICATE' ? '#059669' : '#6b7280'} />
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {doc.fileName}
                            </Typography>
                            <Chip
                              size="small"
                              label={doc.categoryLabel}
                              sx={{
                                height: 18,
                                fontSize: '0.65rem',
                                fontWeight: 800,
                                backgroundColor: doc.category === 'OWNERSHIP_DOC' ? '#eff6ff' : doc.category === 'PREVIOUS_CERTIFICATE' ? '#ecfdf5' : '#f1f5f9',
                                color: doc.category === 'OWNERSHIP_DOC' ? '#1e40af' : doc.category === 'PREVIOUS_CERTIFICATE' ? '#047857' : '#475569'
                              }}
                            />
                            {doc.fileSize && (
                              <Typography variant="caption" sx={{ color: '#94a3b8' }}>({doc.fileSize})</Typography>
                            )}
                          </Box>
                          {doc.notes && (
                            <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.2 }}>
                              {doc.notes}
                            </Typography>
                          )}
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        <Tooltip title="Preview Document">
                          <IconButton
                            size="small"
                            onClick={() => alert(`Document Preview: ${doc.fileName}\nCategory: ${doc.categoryLabel}\nUploaded: ${doc.uploadedAt}\nNotes: ${doc.notes || 'None'}`)}
                            sx={{ color: '#1e40af' }}
                          >
                            <Eye size={16} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Remove Document">
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveDoc(doc.id)}
                            sx={{ color: '#ef4444' }}
                          >
                            <Trash2 size={16} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              )}
            </Paper>

            {/* SECTION 3: Statutory Fee Calculation & Payment */}
            <Paper
              variant="outlined"
              sx={{
                p: 2.2,
                borderRadius: '12px',
                backgroundColor: '#ecfdf5',
                borderColor: '#a7f3d0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <IndianRupee size={26} color="#059669" />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#065f46' }}>
                    Statutory Verification Fee (Rule Engine Auto-Computed)
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#047857' }}>
                    Legal Metrology (General) Rules 2011 Schedule IX · Includes Stamping Stamp &amp; Security Lead Seal Fee
                  </Typography>
                </Box>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#047857', fontFamily: '"Outfit", sans-serif' }}>
                ₹{calculatedFee.toLocaleString('en-IN')}
              </Typography>
            </Paper>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, px: 3, backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', justifyContent: 'space-between' }}>
          <Typography variant="caption" sx={{ color: '#64748b' }}>
            *Tamper-evident certificate will be generated upon field officer inspection.
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button onClick={onClose} sx={{ color: '#64748b', fontWeight: 600 }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleOpenGateway}
              startIcon={<CreditCard size={18} />}
              sx={{
                backgroundColor: '#10b981',
                px: 3.5,
                fontWeight: 800,
                textTransform: 'none',
                borderRadius: '10px',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
                '&:hover': { backgroundColor: '#059669' }
              }}
            >
              Pay ₹{calculatedFee} &amp; Submit Application →
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Demo Simulated Government Payment Gateway */}
      <DemoPaymentGatewayModal
        open={paymentGatewayOpen}
        onClose={() => setPaymentGatewayOpen(false)}
        amount={calculatedFee}
        instrumentType={selectedInst?.instrumentType || 'Measuring Device'}
        applicantName={user?.businessName || user?.fullName || 'Sundar Industries Pvt Ltd'}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* BHIM UPI / GPay / PhonePe Style Success Tick Animation Popup */}
      {completedApp && paymentSummary && (
        <PaymentSuccessModal
          open={successModalOpen}
          onClose={handleFinishAndRedirect}
          amount={paymentSummary.amount}
          transactionId={paymentSummary.txId}
          bankRef={paymentSummary.bankRef}
          paymentMode={paymentSummary.paymentMode}
          timestamp={paymentSummary.timestamp}
          applicationId={completedApp.id}
          instrumentType={selectedInst?.instrumentType}
          onViewApplication={handleFinishAndRedirect}
        />
      )}
    </>
  );
};
