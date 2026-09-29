import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  X,
  Scale,
  Calendar,
  DollarSign,
  UserCheck,
  Send
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { VerificationApplication, ApplicationStatus } from '../../types';
import { ApiService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { ScrutinyAllocationModal } from './ScrutinyAllocationModal';
import { createMapPin } from '../../utils/leafletIcons';

interface ApplicationDetailModalProps {
  open: boolean;
  onClose: () => void;
  application: VerificationApplication | null;
  isAdmin?: boolean;
  onUpdated?: () => void;
  onOpenInstrument?: (instrumentId: string) => void;
}

const STAGES: { key: ApplicationStatus; label: string }[] = [
  { key: 'SUBMITTED', label: 'SUBMITTED' },
  { key: 'IN_SCRUTINY', label: 'UNDER SCRUTINY' },
  { key: 'APPROVED', label: 'APPROVED' },
  { key: 'SCHEDULED', label: 'SCHEDULED' },
  { key: 'ALLOCATED', label: 'ASSIGNED' },
  { key: 'IN_VERIFICATION', label: 'VERIFICATION IN PROGRESS' },
  { key: 'CERTIFICATE_GENERATED', label: 'VERIFIED' },
  { key: 'CERTIFICATE_GENERATED', label: 'CERTIFICATE GENERATED' }
];

export const ApplicationDetailModal: React.FC<ApplicationDetailModalProps> = ({
  open,
  onClose,
  application,
  onUpdated,
  onOpenInstrument
}) => {
  const { user, role } = useAuth();
  const [scrutinyNote, setScrutinyNote] = useState('');
  const [decisionNote, setDecisionNote] = useState('');
  const [actionAlert, setActionAlert] = useState<string | null>(null);
  const [allocOpen, setAllocOpen] = useState(false);
  const [allocTarget, setAllocTarget] = useState<'LMO' | 'GATC'>('LMO');
  const [officerId, setOfficerId] = useState('USR-003');
  const [allocDate, setAllocDate] = useState('2026-10-05');
  const [allocTimeSlot, setAllocTimeSlot] = useState('10:00 AM - 01:00 PM');
  const [smartAllocOpen, setSmartAllocOpen] = useState(false);

  if (!application) return null;

  const inst = application.instrument || ApiService.getInstrumentById(application.instrumentId);
  const lat = inst?.latitude || 13.0827;
  const lng = inst?.longitude || 80.2707;
  const isAdmin = role === 'ADMIN';

  const getStageIndex = (status: ApplicationStatus) => {
    switch (status) {
      case 'SUBMITTED': return 0;
      case 'IN_SCRUTINY': return 1;
      case 'APPROVED': return 2;
      case 'SCHEDULED': return 3;
      case 'ALLOCATED': return 4;
      case 'IN_VERIFICATION': return 5;
      case 'CERTIFICATE_GENERATED': return 7;
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
    setActionAlert('Application status updated to UNDER SCRUTINY.');
    if (onUpdated) onUpdated();
  };

  const handleApprove = () => {
    ApiService.updateApplicationStatus(
      application.id,
      'APPROVED',
      decisionNote || 'Application scrutiny approved. Complies with Legal Metrology Act specifications.',
      user?.id
    );
    setActionAlert('Application APPROVED. You may now allocate to LMO Officer or GATC Laboratory.');
    if (onUpdated) onUpdated();
  };

  const handleReject = () => {
    ApiService.updateApplicationStatus(
      application.id,
      'REJECTED',
      decisionNote || 'Rejected during administrative scrutiny. Required documents or model approvals missing.',
      user?.id
    );
    setActionAlert('Application REJECTED with statutory feedback notes.');
    if (onUpdated) onUpdated();
  };

  const handleAllocate = () => {
    const assignedName = allocTarget === 'LMO'
      ? (officerId === 'USR-003' ? 'K. Murugan, Inspector (LMO)' : 'R. Jayachandran, Inspector (LMO)')
      : 'Tamil Nadu GATC Testing Center (GATC-01)';

    ApiService.createAllocation({
      applicationId: application.id,
      assignedToType: allocTarget,
      assignedToId: officerId,
      assignedToName: assignedName,
      scheduledDate: allocDate,
      scheduledTimeSlot: allocTimeSlot,
      instructions: decisionNote || `Statutory inspection for ${inst?.instrumentType || 'Measuring Scale'}`,
      allocatedBy: user?.fullName || 'Admin Controller'
    });

    setActionAlert(`Application successfully allocated to ${assignedName} on ${allocDate}.`);
    setAllocOpen(false);
    if (onUpdated) onUpdated();
  };

  const handleOpenGoogleMaps = () => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
  };

  const handleNavigate = () => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          overflow: 'hidden',
          backgroundColor: '#f8fafc'
        }
      }}
    >
      {/* Top Header matching Screenshot 1 */}
      <Box
        sx={{
          p: 3,
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 2
        }}
      >
        <Box>
          <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.78rem', fontWeight: 600 }}>
            Applications / {application.id}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.5 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', fontFamily: '"Outfit", sans-serif' }}>
              Application {application.id}
            </Typography>
            <Chip
              label={application.status.replace(/_/g, ' ')}
              size="small"
              sx={{
                fontWeight: 800,
                fontSize: '0.72rem',
                backgroundColor: application.status === 'CERTIFICATE_GENERATED' ? '#dcfce7' : application.status === 'REJECTED' ? '#fee2e2' : '#eff6ff',
                color: application.status === 'CERTIFICATE_GENERATED' ? '#166534' : application.status === 'REJECTED' ? '#991b1b' : '#1e40af'
              }}
            />
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => onOpenInstrument && onOpenInstrument(application.instrumentId)}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.8rem',
              color: '#334155',
              borderColor: '#cbd5e1',
              backgroundColor: '#f8fafc'
            }}
          >
            Instrument {application.instrumentId}
          </Button>
          <IconButton onClick={onClose} size="small" sx={{ color: '#64748b' }}>
            <X size={20} />
          </IconButton>
        </Box>
      </Box>

      <DialogContent sx={{ p: 3, backgroundColor: '#f8fafc' }}>
        {actionAlert && (
          <Alert severity="success" sx={{ mb: 2.5, borderRadius: '10px' }} onClose={() => setActionAlert(null)}>
            {actionAlert}
          </Alert>
        )}

        {/* Horizontal Process Stage Tracker (Exact match to Screenshot 1) */}
        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            mb: 2.5,
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
            overflowX: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          {STAGES.map((stg, idx) => {
            const isCompleted = currentStageIdx >= idx && application.status !== 'REJECTED';
            const isCurrent = currentStageIdx === idx;
            return (
              <Box
                key={idx}
                sx={{
                  py: 0.8,
                  px: 1.6,
                  borderRadius: '8px',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  whiteSpace: 'nowrap',
                  backgroundColor: isCurrent ? '#fef3c7' : isCompleted ? '#eff6ff' : '#f8fafc',
                  color: isCurrent ? '#b45309' : isCompleted ? '#1e40af' : '#94a3b8',
                  border: isCurrent ? '1.5px solid #fde68a' : isCompleted ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.6
                }}
              >
                {isCompleted && !isCurrent && <CheckCircle2 size={12} color="#2563eb" />}
                {isCurrent && <Clock size={12} color="#b45309" />}
                <span>{stg.label}</span>
              </Box>
            );
          })}
        </Paper>

        {/* Site Location Header + Map Section (Exact match to Screenshot 1) */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
            overflow: 'hidden',
            mb: 2.5
          }}
        >
          <Box
            sx={{
              p: 1.8,
              px: 2.5,
              backgroundColor: '#ffffff',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 1.5
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <MapPin size={16} color="#2563eb" />
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                Site: {inst?.installationAddress || 'Industrial Corridor, Chennai, Tamil Nadu'}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<Navigation size={13} />}
                onClick={handleNavigate}
                sx={{
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  borderColor: '#cbd5e1',
                  color: '#334155'
                }}
              >
                Navigate
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<ExternalLink size={13} />}
                onClick={handleOpenGoogleMaps}
                sx={{
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  borderColor: '#cbd5e1',
                  color: '#334155'
                }}
              >
                Open map
              </Button>
            </Box>
          </Box>

          {/* Interactive Leaflet Map */}
          <Box sx={{ height: 240, width: '100%' }}>
            <MapContainer
              center={[lat, lng]}
              zoom={14}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={false}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              <Marker position={[lat, lng]} icon={createMapPin('#dc2626', '📍', true)}>
                <Popup>
                  <strong>{inst?.businessName || 'Sundar Industries Pvt Ltd'}</strong><br />
                  {inst?.instrumentType}<br />
                  App ID: {application.id}
                </Popup>
              </Marker>
            </MapContainer>
          </Box>
        </Paper>

        {/* 2-Column Bottom Cards (Exact match to Screenshot 1) */}
        <Grid container spacing={2.5}>
          {/* Left Column: Application Details */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                height: '100%'
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 2 }}>
                Application
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Instrument</Typography>
                  <Typography
                    variant="body2"
                    onClick={() => onOpenInstrument && onOpenInstrument(application.instrumentId)}
                    sx={{ fontWeight: 700, color: '#2563eb', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                  >
                    {application.instrumentId} — {inst?.instrumentType || 'Weighbridge'}
                  </Typography>
                </Box>

                <Divider sx={{ borderColor: '#f1f5f9' }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Applicant</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                    {inst?.businessName || 'Sundar Industries Pvt Ltd'}
                  </Typography>
                </Box>

                <Divider sx={{ borderColor: '#f1f5f9' }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Verification type</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>
                    {application.applicationType.toLowerCase().replace(/_/g, ' ')}
                  </Typography>
                </Box>

                <Divider sx={{ borderColor: '#f1f5f9' }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Preferred date</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>
                    {application.preferredDate}
                  </Typography>
                </Box>

                <Divider sx={{ borderColor: '#f1f5f9' }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Applied on</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>
                    {application.filedOn}
                  </Typography>
                </Box>

                <Divider sx={{ borderColor: '#f1f5f9' }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Applicable rule</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>
                    Rule 27 — Periodical verification - {inst?.instrumentType || 'Weighbridge'}
                  </Typography>
                </Box>

                <Divider sx={{ borderColor: '#f1f5f9' }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Verification period</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>
                    {inst?.verificationIntervalMonths || 12} months
                  </Typography>
                </Box>

                <Divider sx={{ borderColor: '#f1f5f9' }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Fee</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                      ₹ {application.calculatedFee.toLocaleString('en-IN')}.00
                    </Typography>
                    <Chip
                      label="paid"
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        backgroundColor: '#dcfce7',
                        color: '#15803d'
                      }}
                    />
                  </Box>
                </Box>

                <Divider sx={{ borderColor: '#f1f5f9' }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Assigned to</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: application.status === 'SCHEDULED' || application.status === 'ALLOCATED' ? '#059669' : '#94a3b8' }}>
                    {application.scrutinyOfficerId ? 'K. Murugan, Inspector (LMO)' : '— not allocated —'}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Right Column: Actions (Exact match to Screenshot 1) */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 2 }}>
                  Actions
                </Typography>

                {/* Scrutiny Section */}
                <Box sx={{ mb: 2.5 }}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block', mb: 0.8 }}>
                    Note
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Scrutiny remark"
                    value={scrutinyNote}
                    onChange={(e) => setScrutinyNote(e.target.value)}
                    sx={{
                      mb: 1.5,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        backgroundColor: '#f8fafc'
                      }
                    }}
                  />
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleTakeScrutiny}
                    disabled={!isAdmin || application.status !== 'SUBMITTED'}
                    sx={{
                      backgroundColor: '#0d9488',
                      borderRadius: '8px',
                      textTransform: 'none',
                      fontWeight: 700,
                      py: 1,
                      '&:hover': { backgroundColor: '#0f766e' }
                    }}
                  >
                    Take up for scrutiny
                  </Button>
                </Box>

                {/* Decision Note & Approve/Reject */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block', mb: 0.8 }}>
                    Decision note
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Reason / remark"
                    value={decisionNote}
                    onChange={(e) => setDecisionNote(e.target.value)}
                    sx={{
                      mb: 1.5,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        backgroundColor: '#f8fafc'
                      }
                    }}
                  />
                  <Grid container spacing={1.5}>
                    <Grid item xs={6}>
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={handleApprove}
                        disabled={!isAdmin || (application.status !== 'IN_SCRUTINY' && application.status !== 'SUBMITTED')}
                        sx={{
                          backgroundColor: '#059669',
                          borderRadius: '8px',
                          textTransform: 'none',
                          fontWeight: 700,
                          py: 1,
                          '&:hover': { backgroundColor: '#047857' }
                        }}
                      >
                        Approve
                      </Button>
                    </Grid>
                    <Grid item xs={6}>
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={handleReject}
                        disabled={!isAdmin || application.status === 'REJECTED' || application.status === 'CERTIFICATE_GENERATED'}
                        sx={{
                          backgroundColor: '#dc2626',
                          borderRadius: '8px',
                          textTransform: 'none',
                          fontWeight: 700,
                          py: 1,
                          '&:hover': { backgroundColor: '#b91c1c' }
                        }}
                      >
                        Reject
                      </Button>
                    </Grid>
                  </Grid>
                </Box>

                {/* Smart Allocation Action for Admin */}
                {isAdmin && (application.status === 'APPROVED' || application.status === 'IN_SCRUTINY' || application.status === 'ALLOCATED' || application.status === 'SCHEDULED') && (
                  <Box sx={{ mt: 2, p: 1.5, backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#166534', mb: 1 }}>
                      Smart Allocation — LMO / GATC (Rule-Based)
                    </Typography>
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<Send size={14} />}
                      onClick={() => setSmartAllocOpen(true)}
                      sx={{
                        backgroundColor: '#16a34a',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        '&:hover': { backgroundColor: '#15803d' }
                      }}
                    >
                      Open Smart Allocation Engine
                    </Button>
                  </Box>
                )}
                {/* Smart Allocation Modal */}
                <ScrutinyAllocationModal
                  open={smartAllocOpen}
                  onClose={() => setSmartAllocOpen(false)}
                  application={application}
                  onSuccess={() => {
                    setSmartAllocOpen(false);
                    setActionAlert('Application allocated successfully. Officer / GATC centre notified.');
                    if (onUpdated) onUpdated();
                  }}
                />
              </Box>

              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Button
                  size="small"
                  onClick={onClose}
                  sx={{ color: '#64748b', textTransform: 'none', fontWeight: 600, fontSize: '0.8rem' }}
                >
                  Cancel application / Close
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};
