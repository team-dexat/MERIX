import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Button,
  Chip,
  Paper,
  TextField,
  MenuItem,
  IconButton,
  Divider,
  Alert
} from '@mui/material';
import {
  FileText,
  MapPin,
  ExternalLink,
  Navigation,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  ArrowLeft,
  Scale,
  Calendar,
  DollarSign,
  UserCheck,
  Send,
  Download,
  Building,
  Hash,
  Award,
  AlertTriangle
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { VerificationApplication, ApplicationStatus, Instrument } from '../../types';
import { ApiService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { ScrutinyAllocationModal } from '../../components/forms/ScrutinyAllocationModal';
import { InstrumentDetailPage } from './InstrumentDetailPage';
import { DigitalCertificateModal } from '../../components/certificates/DigitalCertificateModal';
import { createMapPin } from '../../utils/leafletIcons';

interface ApplicationDetailPageProps {
  applicationId: string;
  onBack: () => void;
  onOpenInstrument?: (instrumentId: string) => void;
  onStartVerification?: (applicationId: string) => void;
}

const STAGES: { key: ApplicationStatus; label: string }[] = [
  { key: 'SUBMITTED', label: 'SUBMITTED' },
  { key: 'IN_SCRUTINY', label: 'UNDER SCRUTINY' },
  { key: 'APPROVED', label: 'APPROVED' },
  { key: 'SCHEDULED', label: 'SCHEDULED' },
  { key: 'ALLOCATED', label: 'ASSIGNED' },
  { key: 'IN_VERIFICATION', label: 'VERIFICATION IN PROGRESS' },
  { key: 'CERTIFICATE_GENERATED', label: 'VERIFIED & CERTIFIED' }
];

export const ApplicationDetailPage: React.FC<ApplicationDetailPageProps> = ({
  applicationId,
  onBack,
  onOpenInstrument,
  onStartVerification
}) => {
  const { user, role } = useAuth();
  const [application, setApplication] = useState<VerificationApplication | null>(null);
  const [scrutinyNote, setScrutinyNote] = useState('');
  const [decisionNote, setDecisionNote] = useState('');
  const [actionAlert, setActionAlert] = useState<{ message: string; severity: 'success' | 'error' | 'info' } | null>(null);
  
  // Modals & Sub-pages
  const [smartAllocOpen, setSmartAllocOpen] = useState(false);
  const [selectedInst, setSelectedInst] = useState<Instrument | null>(null);
  const [certModalOpen, setCertModalOpen] = useState(false);

  const isAdmin = role === 'ADMIN';

  const loadData = () => {
    const app = ApiService.getApplicationById(applicationId);
    if (app) {
      setApplication(app);
    }
  };

  useEffect(() => {
    loadData();
  }, [applicationId]);

  // If an instrument detail page is opened internally
  if (selectedInst) {
    return (
      <InstrumentDetailPage
        instrument={selectedInst}
        onBack={() => {
          setSelectedInst(null);
          loadData();
        }}
      />
    );
  }

  if (!application) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ color: '#64748b', mb: 2 }}>
          Application not found or loading...
        </Typography>
        <Button variant="outlined" startIcon={<ArrowLeft size={16} />} onClick={onBack}>
          Back to Applications
        </Button>
      </Box>
    );
  }

  const inst = application.instrument || ApiService.getInstrumentById(application.instrumentId);
  const lat = inst?.latitude || 13.0827;
  const lng = inst?.longitude || 80.2707;
  const cert = ApiService.getCertificateByApplicationId(application.id);

  const getStageIndex = (status: ApplicationStatus) => {
    switch (status) {
      case 'SUBMITTED': return 0;
      case 'IN_SCRUTINY': return 1;
      case 'APPROVED': return 2;
      case 'SCHEDULED': return 3;
      case 'ALLOCATED': return 4;
      case 'IN_VERIFICATION': return 5;
      case 'CERTIFICATE_GENERATED': return 6;
      case 'REJECTED': return -1;
      default: return 0;
    }
  };

  const currentStageIdx = getStageIndex(application.status);

  const handleTakeScrutiny = () => {
    ApiService.updateApplicationStatus(
      application.id,
      'IN_SCRUTINY',
      scrutinyNote || 'Taken up for officer scrutiny and document verification.',
      user?.id
    );
    ApiService.addAuditLog(
      user?.id || 'USR-002',
      user?.fullName || 'Admin Controller',
      'ADMIN',
      'START_SCRUTINY',
      'APPLICATION',
      application.id,
      `Application ${application.id} taken up for scrutiny. Remarks: ${scrutinyNote || 'Under Review'}`
    );
    setActionAlert({ message: 'Application status updated to UNDER SCRUTINY.', severity: 'success' });
    loadData();
  };

  const handleApprove = () => {
    ApiService.updateApplicationStatus(
      application.id,
      'APPROVED',
      decisionNote || 'Application scrutiny approved. Complies with Legal Metrology Act specifications.',
      user?.id
    );
    setActionAlert({ message: 'Application APPROVED. You may now allocate to LMO Officer or GATC Laboratory.', severity: 'success' });
    loadData();
  };

  const handleReject = () => {
    ApiService.updateApplicationStatus(
      application.id,
      'REJECTED',
      decisionNote || 'Rejected during administrative scrutiny. Required documents or model approvals missing.',
      user?.id
    );
    setActionAlert({ message: 'Application REJECTED with statutory feedback notes.', severity: 'error' });
    loadData();
  };

  const handleOpenInstrumentModal = () => {
    if (onOpenInstrument) {
      onOpenInstrument(application.instrumentId);
    } else if (inst) {
      setSelectedInst(inst);
    }
  };

  const handleOpenGoogleMaps = () => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
  };

  const handleNavigate = () => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3.5 }, maxWidth: '1400px', margin: '0 auto' }}>
      {/* Top Breadcrumb & Navigation Bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<ArrowLeft size={16} />}
            onClick={onBack}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.82rem',
              color: '#1e40af',
              borderColor: '#bfdbfe',
              backgroundColor: '#ffffff',
              '&:hover': { backgroundColor: '#eff6ff' }
            }}
          >
            Back
          </Button>
          <Box>
            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.78rem', fontWeight: 600 }}>
              Applications / {application.id}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', fontFamily: '"Outfit", sans-serif', lineHeight: 1.2 }}>
              Application {application.id}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Chip
            label={application.status.replace(/_/g, ' ')}
            size="medium"
            sx={{
              fontWeight: 800,
              fontSize: '0.78rem',
              px: 1,
              backgroundColor: application.status === 'CERTIFICATE_GENERATED' ? '#dcfce7' : application.status === 'REJECTED' ? '#fee2e2' : '#eff6ff',
              color: application.status === 'CERTIFICATE_GENERATED' ? '#166534' : application.status === 'REJECTED' ? '#991b1b' : '#1e40af',
              border: `1px solid ${application.status === 'CERTIFICATE_GENERATED' ? '#86efac' : application.status === 'REJECTED' ? '#fca5a5' : '#bfdbfe'}`
            }}
          />
          <Button
            variant="outlined"
            size="small"
            startIcon={<Scale size={15} />}
            onClick={handleOpenInstrumentModal}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.8rem',
              color: '#334155',
              borderColor: '#cbd5e1',
              backgroundColor: '#ffffff'
            }}
          >
            Instrument {application.instrumentId}
          </Button>
        </Box>
      </Box>

      {actionAlert && (
        <Alert severity={actionAlert.severity} sx={{ mb: 2.5, borderRadius: '10px' }} onClose={() => setActionAlert(null)}>
          {actionAlert.message}
        </Alert>
      )}

      {/* Horizontal Workflow Stepper */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          backgroundColor: '#ffffff',
          overflowX: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: 1.2
        }}
      >
        {STAGES.map((stg, idx) => {
          const isCompleted = currentStageIdx >= idx && application.status !== 'REJECTED';
          const isCurrent = currentStageIdx === idx;
          return (
            <Box
              key={idx}
              sx={{
                py: 1,
                px: 1.8,
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 800,
                whiteSpace: 'nowrap',
                backgroundColor: isCurrent ? '#fef3c7' : isCompleted ? '#eff6ff' : '#f8fafc',
                color: isCurrent ? '#b45309' : isCompleted ? '#1e40af' : '#94a3b8',
                border: isCurrent ? '1.5px solid #fde68a' : isCompleted ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                gap: 0.8
              }}
            >
              {isCompleted && !isCurrent && <CheckCircle2 size={14} color="#2563eb" />}
              {isCurrent && <Clock size={14} color="#b45309" />}
              {application.status === 'REJECTED' && idx === 0 && <XCircle size={14} color="#dc2626" />}
              <span>{stg.label}</span>
            </Box>
          );
        })}
      </Paper>

      {/* Main Grid Content */}
      <Grid container spacing={3}>
        {/* Left Column: Summary, Instrument, Enterprise, Documents */}
        <Grid item xs={12} lg={7}>
          {/* Summary Card */}
          <Paper variant="outlined" sx={{ p: 2.5, mb: 3, borderRadius: '12px', backgroundColor: '#ffffff' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <FileText size={18} color="#1e40af" /> Application Summary &amp; Statutory Fees
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={6} sm={4}>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>APPLICATION TYPE</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                  {application.applicationType?.replace(/_/g, ' ')}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>FILED DATE</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                  {application.filedOn}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>PREFERRED DATE</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                  {application.preferredDate || 'Earliest Slot'}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>STATUTORY FEE</Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#059669', fontSize: '1.05rem' }}>
                  ₹{application.calculatedFee.toLocaleString('en-IN')}{' '}
                  <Chip label="PAID" size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 800, backgroundColor: '#dcfce7', color: '#166534' }} />
                </Typography>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>PAYMENT REF</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                  {application.paymentReference || 'PAY-TN-882910'}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>SLA DUE DATE</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: application.slaBreached ? '#dc2626' : '#0f172a' }}>
                  {application.slaDueDate || '2026-10-02'}
                  {application.slaBreached && (
                    <Chip label="SLA BREACHED" size="small" sx={{ ml: 0.5, height: 16, fontSize: '0.6rem', fontWeight: 800, backgroundColor: '#fee2e2', color: '#991b1b' }} />
                  )}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Instrument Details Card */}
          <Paper variant="outlined" sx={{ p: 2.5, mb: 3, borderRadius: '12px', backgroundColor: '#ffffff' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Scale size={18} color="#1e40af" /> Apparatus / Instrument Specifications
              </Typography>
              <Button
                size="small"
                variant="text"
                onClick={handleOpenInstrumentModal}
                sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e40af', p: 0 }}
              >
                View Full Specifications →
              </Button>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>INSTRUMENT TYPE</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                  {inst?.instrumentType || 'Platform Scale / Bench Scale'}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={6}>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>SERIAL NUMBER</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                  {inst?.serialNumber || 'SN-TN-2024-0091'}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>MANUFACTURER &amp; MODEL</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                  {inst?.manufacturer || 'Essae'} • {inst?.modelNumber || 'DS-215'}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>ACCURACY CLASS</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                  {inst?.accuracyClass || 'Class III'}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>MAX CAPACITY</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                  {inst?.maxCapacity || '300 kg'}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Applicant & Business Details */}
          <Paper variant="outlined" sx={{ p: 2.5, mb: 3, borderRadius: '12px', backgroundColor: '#ffffff' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Building size={18} color="#1e40af" /> Enterprise &amp; Location Details
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>ENTERPRISE NAME</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                  {inst?.businessName || 'Sundar Industries Pvt Ltd'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>INSTALLATION ADDRESS</Typography>
                <Typography variant="body2" sx={{ color: '#334155', fontWeight: 500 }}>
                  {inst?.installationAddress || 'Plot 42, Guindy Industrial Estate, Chennai, Tamil Nadu - 600032'}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Attached Statutory & Commercial Documents */}
          <Paper variant="outlined" sx={{ p: 2.5, mb: 3, borderRadius: '12px', backgroundColor: '#ffffff' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1 }}>
                <FileText size={18} color="#1e40af" /> Attached Commercial &amp; Stamping Documents
              </Typography>
              <Chip
                size="small"
                label={`${application.attachedDocuments?.length || 2} Documents Attached`}
                sx={{ backgroundColor: '#eff6ff', color: '#1e40af', fontWeight: 800, fontSize: '0.72rem' }}
              />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {application.attachedDocuments && application.attachedDocuments.length > 0 ? (
                application.attachedDocuments.map((doc) => (
                  <Box
                    key={doc.id}
                    sx={{
                      p: 1.8,
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backgroundColor: '#f8fafc',
                      flexWrap: { xs: 'wrap', sm: 'nowrap' },
                      gap: 1.5
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0 }}>
                      <FileText size={20} color={doc.category === 'OWNERSHIP_DOC' ? '#1e40af' : doc.category === 'PREVIOUS_CERTIFICATE' ? '#059669' : '#7e22ce'} />
                      <Box sx={{ minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                            {doc.fileName}
                          </Typography>
                          <Chip
                            size="small"
                            label={doc.categoryLabel}
                            sx={{
                              height: 18,
                              fontSize: '0.65rem',
                              fontWeight: 800,
                              backgroundColor: doc.category === 'OWNERSHIP_DOC' ? '#eff6ff' : doc.category === 'PREVIOUS_CERTIFICATE' ? '#ecfdf5' : '#faf5ff',
                              color: doc.category === 'OWNERSHIP_DOC' ? '#1e40af' : doc.category === 'PREVIOUS_CERTIFICATE' ? '#047857' : '#7e22ce'
                            }}
                          />
                          {doc.fileSize && (
                            <Typography variant="caption" sx={{ color: '#94a3b8' }}>({doc.fileSize})</Typography>
                          )}
                        </Box>
                        <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.3 }}>
                          Uploaded: {doc.uploadedAt} {doc.notes ? `• ${doc.notes}` : ''}
                        </Typography>
                      </Box>
                    </Box>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Download size={14} />}
                      onClick={() => alert(`Downloading verified document: ${doc.fileName}\nCategory: ${doc.categoryLabel}`)}
                      sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.75rem', borderColor: '#bfdbfe', color: '#1e40af' }}
                    >
                      View / Download
                    </Button>
                  </Box>
                ))
              ) : (
                <>
                  {/* Default sample documents if no custom uploads */}
                  <Box sx={{ p: 1.8, borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <FileText size={20} color="#1e40af" />
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                            GST_Commercial_Invoice_SundarIndustries.pdf
                          </Typography>
                          <Chip size="small" label="Ownership Doc" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 800, backgroundColor: '#eff6ff', color: '#1e40af' }} />
                        </Box>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                          PDF • 412 KB • GSTIN: 33AAAAA0000A1Z5 Commercial premises ownership record
                        </Typography>
                      </Box>
                    </Box>
                    <Button size="small" variant="outlined" startIcon={<Download size={14} />} onClick={() => alert('Downloading Ownership Commercial Invoice')} sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.75rem' }}>
                      Download
                    </Button>
                  </Box>

                  <Box sx={{ p: 1.8, borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <FileText size={20} color="#059669" />
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                            Legal_Metrology_Previous_Cert_2025.pdf
                          </Typography>
                          <Chip size="small" label="Previous Certificate" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 800, backgroundColor: '#ecfdf5', color: '#047857' }} />
                        </Box>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                          PDF • 520 KB • Previous Stamping Certificate Serial #TN-LM-STAMP-2025
                        </Typography>
                      </Box>
                    </Box>
                    <Button size="small" variant="outlined" startIcon={<Download size={14} />} onClick={() => alert('Downloading Previous Stamping Certificate')} sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.75rem' }}>
                      Download
                    </Button>
                  </Box>
                </>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Right Column: GPS Map, Certificate (if issued), Admin Actions (ONLY for Admin) */}
        <Grid item xs={12} lg={5}>
          {/* GPS Geolocation Map */}
          <Paper variant="outlined" sx={{ p: 2.5, mb: 3, borderRadius: '12px', backgroundColor: '#ffffff' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1 }}>
                <MapPin size={18} color="#dc2626" /> Geofenced Installation Site
              </Typography>
              <Chip
                label="Geofence Valid"
                size="small"
                sx={{ backgroundColor: '#dcfce7', color: '#166534', fontWeight: 700, fontSize: '0.7rem' }}
              />
            </Box>

            <Box sx={{ height: 220, borderRadius: '8px', overflow: 'hidden', mb: 1.5, border: '1px solid #cbd5e1' }}>
              <MapContainer
                center={[lat, lng]}
                zoom={14}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[lat, lng]} icon={createMapPin('#dc2626', '📍', true)}>
                  <Popup>
                    <strong>{inst?.businessName}</strong><br />
                    {inst?.instrumentType} (ID: {application.instrumentId})
                  </Popup>
                </Marker>
              </MapContainer>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                GPS: {lat.toFixed(4)}° N, {lng.toFixed(4)}° E
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<ExternalLink size={13} />}
                  onClick={handleOpenGoogleMaps}
                  sx={{ textTransform: 'none', fontSize: '0.72rem', fontWeight: 700 }}
                >
                  Maps
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<Navigation size={13} />}
                  onClick={handleNavigate}
                  sx={{ textTransform: 'none', fontSize: '0.72rem', fontWeight: 700, backgroundColor: '#1e40af' }}
                >
                  Directions
                </Button>
              </Box>
            </Box>
          </Paper>

          {/* Generated Certificate Banner (If Available) */}
          {cert && (
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                mb: 3,
                borderRadius: '12px',
                border: '1px solid #86efac',
                backgroundColor: '#f0fdf4'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                <Award size={24} color="#16a34a" />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#166534' }}>
                    Digital Certificate Issued
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#15803d', fontWeight: 600 }}>
                    Certificate No: {cert.certificateNumber}
                  </Typography>
                </Box>
              </Box>

              <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#166534', mb: 2 }}>
                Valid through <strong>{cert.expiryDate}</strong>. Stamped under Legal Metrology Act, 2009.
              </Typography>

              <Button
                variant="contained"
                fullWidth
                onClick={() => setCertModalOpen(true)}
                sx={{
                  backgroundColor: '#16a34a',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  textTransform: 'none',
                  borderRadius: '8px',
                  py: 1,
                  '&:hover': { backgroundColor: '#15803d' }
                }}
              >
                View &amp; Print Official Certificate
              </Button>
            </Paper>
          )}

          {/* Verification & Stamping Action Card for Field Officers */}
          {onStartVerification && application.status !== 'CERTIFICATE_GENERATED' && (
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                mb: 3,
                borderRadius: '12px',
                border: '1.5px solid #059669',
                backgroundColor: '#f0fdf4'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                <Scale size={24} color="#059669" />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#065f46' }}>
                    Field Verification &amp; Stamping Console
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#047857', fontWeight: 600 }}>
                    Execute MPE standard tests, seal validation &amp; Aadhaar e-sign
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="contained"
                fullWidth
                onClick={() => onStartVerification(application.id)}
                sx={{
                  backgroundColor: '#059669',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  textTransform: 'none',
                  borderRadius: '8px',
                  py: 1.1,
                  boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)',
                  '&:hover': { backgroundColor: '#047857' }
                }}
              >
                ⚡ Open Field Verification Console →
              </Button>
            </Paper>
          )}

          {/* ADMINISTRATIVE SCRUTINY & ALLOCATION PANEL - ONLY VISIBLE TO ADMIN */}
          {isAdmin ? (
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: '12px',
                border: '1.5px solid #bfdbfe',
                backgroundColor: '#f8fafc'
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e40af', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Shield size={18} /> Administrative Scrutiny &amp; Allocation Controls
              </Typography>

              {/* Scrutiny Notes Input */}
              <TextField
                fullWidth
                multiline
                rows={2.5}
                size="small"
                label="Scrutiny Remarks & Statutory Findings"
                placeholder="Enter document verification findings, tare check compliance, or deficiency notes..."
                value={scrutinyNote}
                onChange={(e) => setScrutinyNote(e.target.value)}
                sx={{ mb: 2, backgroundColor: '#ffffff' }}
              />

              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Clock size={15} />}
                  onClick={handleTakeScrutiny}
                  disabled={application.status === 'IN_SCRUTINY'}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    borderColor: '#93c5fd',
                    color: '#1e40af',
                    backgroundColor: '#ffffff'
                  }}
                >
                  Take Scrutiny
                </Button>

                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<CheckCircle2 size={15} />}
                  onClick={handleApprove}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    backgroundColor: '#059669',
                    '&:hover': { backgroundColor: '#047857' }
                  }}
                >
                  Approve
                </Button>

                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<XCircle size={15} />}
                  onClick={handleReject}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    backgroundColor: '#dc2626',
                    '&:hover': { backgroundColor: '#b91c1c' }
                  }}
                >
                  Reject
                </Button>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', mb: 1.5, fontSize: '0.85rem' }}>
                Officer / Testing Center Allocation
              </Typography>

              <Button
                fullWidth
                variant="contained"
                startIcon={<UserCheck size={16} />}
                onClick={() => setSmartAllocOpen(true)}
                sx={{
                  backgroundColor: '#1e40af',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  textTransform: 'none',
                  borderRadius: '8px',
                  py: 1.2,
                  '&:hover': { backgroundColor: '#1e3a8a' }
                }}
              >
                Smart Auto-Allocate (LMO / GATC)
              </Button>
            </Paper>
          ) : (
            /* Non-Admin User Info Card: Read-only Progress & Support */
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: '12px', backgroundColor: '#ffffff' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Clock size={18} color="#1e40af" /> Application Processing Status
              </Typography>
              <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.82rem', mb: 2 }}>
                Your verification application is being processed according to the statutory timelines under Legal Metrology Rules, 2011.
              </Typography>

              <Box sx={{ p: 1.8, borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block' }}>
                  CURRENT ACTION / NEXT STEP
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e40af', mt: 0.5 }}>
                  {application.status === 'SUBMITTED' && 'Awaiting administrative scrutiny by Legal Metrology Department.'}
                  {application.status === 'IN_SCRUTINY' && 'Document scrutiny in progress by designated scrutiny officer.'}
                  {application.status === 'APPROVED' && 'Scrutiny approved. Field inspection allocation in progress.'}
                  {application.status === 'SCHEDULED' || application.status === 'ALLOCATED' && 'Inspector assigned. Field verification scheduled.'}
                  {application.status === 'IN_VERIFICATION' && 'Inspector conducting physical testing and calibration verification.'}
                  {application.status === 'CERTIFICATE_GENERATED' && 'Verification completed. Digital Certificate generated.'}
                  {application.status === 'REJECTED' && 'Application rejected. Please check statutory feedback notes.'}
                </Typography>
              </Box>
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* Smart Allocation Modal (For Admin) */}
      <ScrutinyAllocationModal
        open={smartAllocOpen}
        onClose={() => setSmartAllocOpen(false)}
        application={application}
        onSuccess={() => {
          setSmartAllocOpen(false);
          loadData();
          setActionAlert({ message: 'Inspection successfully allocated to testing officer.', severity: 'success' });
        }}
      />

      {/* Digital Certificate Modal */}
      <DigitalCertificateModal
        open={certModalOpen}
        onClose={() => setCertModalOpen(false)}
        certificate={cert || null}
      />
    </Box>
  );
};
