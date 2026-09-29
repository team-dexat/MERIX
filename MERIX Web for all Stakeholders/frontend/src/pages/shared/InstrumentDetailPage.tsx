import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Button,
  Chip,
  Paper,
  Divider,
  IconButton,
  Card,
  CardContent,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Alert
} from '@mui/material';
import {
  Scale,
  MapPin,
  QrCode,
  ShieldCheck,
  AlertTriangle,
  Award,
  ArrowLeft,
  ExternalLink,
  Calendar,
  Layers,
  FileCheck,
  FileText,
  Building,
  CheckCircle2,
  Navigation,
  Printer,
  History,
  Clock,
  Sparkles
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Instrument, Certificate, VerificationApplication } from '../../types';
import { ApiService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { createMapPin } from '../../utils/leafletIcons';
import { DigitalCertificateModal } from '../../components/certificates/DigitalCertificateModal';
import { QrCodeModal } from '../../components/common/QrCodeModal';

interface InstrumentDetailPageProps {
  instrumentId?: string;
  instrument?: Instrument | null;
  onBack: () => void;
  onApplyVerification?: (inst: Instrument) => void;
  onOpenApplication?: (appId: string) => void;
}

export const InstrumentDetailPage: React.FC<InstrumentDetailPageProps> = ({
  instrumentId,
  instrument: initialInstrument,
  onBack,
  onApplyVerification,
  onOpenApplication
}) => {
  const { user, role } = useAuth();
  const [instrument, setInstrument] = useState<Instrument | null>(initialInstrument || null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [applications, setApplications] = useState<VerificationApplication[]>([]);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);

  useEffect(() => {
    if (instrumentId) {
      const found = ApiService.getInstrumentById(instrumentId);
      if (found) setInstrument(found);
    } else if (initialInstrument) {
      setInstrument(initialInstrument);
    }
  }, [instrumentId, initialInstrument]);

  useEffect(() => {
    if (instrument) {
      // Find all certificates for this instrument
      const allCerts = ApiService.getCertificates().filter(
        c => c.instrumentId === instrument.id || c.instrument?.id === instrument.id
      );
      setCertificates(allCerts);

      // Find all verification applications for this instrument
      const allApps = ApiService.getApplications().filter(
        a => a.instrumentId === instrument.id
      );
      setApplications(allApps);
    }
  }, [instrument]);

  if (!instrument) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ color: '#64748b', mb: 2 }}>
          Instrument record not found or loading...
        </Typography>
        <Button variant="outlined" startIcon={<ArrowLeft size={16} />} onClick={onBack}>
          Back to Instruments
        </Button>
      </Box>
    );
  }

  const lat = instrument.latitude || 13.0827;
  const lng = instrument.longitude || 80.2707;

  const getTrustColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const latestCert = certificates[0] || null;

  const handleOpenGoogleMaps = () => {
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3.5 }, maxWidth: '1400px', margin: '0 auto' }}>
      {/* Top Header & Breadcrumbs */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<ArrowLeft size={16} />}
            onClick={onBack}
            sx={{
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: '8px',
              color: '#1e40af',
              borderColor: '#bfdbfe',
              backgroundColor: '#ffffff',
              '&:hover': { backgroundColor: '#eff6ff' }
            }}
          >
            Back
          </Button>

          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
              <Scale size={24} color="#1e40af" />
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  color: '#0f172a',
                  fontFamily: '"Outfit", sans-serif',
                  letterSpacing: '-0.3px'
                }}
              >
                {instrument.id} — {instrument.instrumentType}
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 1, mt: 0.3 }}>
              <span>{instrument.businessName}</span>
              <span>•</span>
              <span>Tamil Nadu Legal Metrology Registered Device</span>
            </Typography>
          </Box>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 1.2, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<QrCode size={16} />}
            onClick={() => setQrModalOpen(true)}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.82rem',
              color: '#059669',
              borderColor: '#a7f3d0',
              borderRadius: '8px',
              backgroundColor: '#ffffff',
              '&:hover': { backgroundColor: '#ecfdf5' }
            }}
          >
            Digital QR Verification Tag
          </Button>

          {role === 'BUSINESS_OWNER' && (
            <Button
              variant="contained"
              startIcon={<FileCheck size={16} />}
              onClick={() => onApplyVerification?.(instrument)}
              sx={{
                backgroundColor: '#2563eb',
                fontWeight: 700,
                fontSize: '0.82rem',
                textTransform: 'none',
                borderRadius: '8px',
                px: 2,
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                '&:hover': { backgroundColor: '#1d4ed8' }
              }}
            >
              Apply for Reverification
            </Button>
          )}
        </Box>
      </Box>

      {/* Drift Alert if Flagged */}
      {instrument.isAtDriftRisk && (
        <Alert
          severity="warning"
          icon={<AlertTriangle size={20} />}
          sx={{ mb: 3, borderRadius: '10px', border: '1px solid #fed7aa', fontWeight: 600 }}
        >
          <strong>AI Drift Risk Detected:</strong> Mathematical calibration models indicate potential measurement drift on this instrument based on past verification cycles. Immediate reverification is recommended under Section 24 of the Legal Metrology Act.
        </Alert>
      )}

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Left Column: Specs & Verification */}
        <Grid item xs={12} lg={8}>
          {/* Statutory Status (Left) & AI Trust Score (Right) in Grid View */}
          <Grid container spacing={2.5} sx={{ mb: 3 }}>
            {/* Left Card: Statutory Status */}
            <Grid item xs={12} sm={6}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  height: '100%',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                }}
              >
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Statutory Status
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mt: 1, flexWrap: 'wrap' }}>
                    <Chip
                      label={instrument.status}
                      size="small"
                      sx={{
                        fontWeight: 800,
                        fontSize: '0.82rem',
                        py: 1.8,
                        px: 0.8,
                        borderRadius: '8px',
                        backgroundColor: instrument.status === 'VERIFIED' ? '#ecfdf5' : '#eff6ff',
                        color: instrument.status === 'VERIFIED' ? '#059669' : '#1e40af',
                        border: `1px solid ${instrument.status === 'VERIFIED' ? '#a7f3d0' : '#bfdbfe'}`
                      }}
                    />
                    {latestCert && (
                      <Chip
                        icon={<Award size={14} color="#16a34a" />}
                        label={`Cert: ${latestCert.certificateNumber}`}
                        size="small"
                        onClick={() => {
                          setSelectedCert(latestCert);
                          setCertModalOpen(true);
                        }}
                        sx={{
                          cursor: 'pointer',
                          fontWeight: 700,
                          fontSize: '0.78rem',
                          backgroundColor: '#f0fdf4',
                          color: '#166534',
                          border: '1px solid #bbf7d0'
                        }}
                      />
                    )}
                  </Box>
                </Box>

                <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                    Re-verification Cycle:
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#0f172a', fontWeight: 700 }}>
                    Every {instrument.verificationIntervalMonths} Months
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            {/* Right Card: AI Metrology Trust Score */}
            <Grid item xs={12} sm={6}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  height: '100%',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      AI Metrology Trust Score
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mt: 0.5 }}>
                      <Typography variant="h4" sx={{ fontWeight: 900, color: getTrustColor(instrument.trustScore), lineHeight: 1.1 }}>
                        {instrument.trustScore}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#94a3b8', fontWeight: 700 }}>
                        /100
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: getTrustColor(instrument.trustScore), fontWeight: 700, display: 'block', mt: 0.3 }}>
                      {instrument.trustScore >= 80 ? '✓ High Statutory Compliance' : instrument.trustScore >= 50 ? '⚠ Moderate Drift Risk' : '⛔ Urgent Verification Needed'}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      border: `3px solid ${getTrustColor(instrument.trustScore)}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#f8fafc',
                      flexShrink: 0
                    }}
                  >
                    <ShieldCheck size={26} color={getTrustColor(instrument.trustScore)} />
                  </Box>
                </Box>

                <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                    Predictive Calibration:
                  </Typography>
                  <Typography variant="caption" sx={{ color: instrument.isAtDriftRisk ? '#b91c1c' : '#15803d', fontWeight: 700 }}>
                    {instrument.isAtDriftRisk ? 'Drift Risk Flagged' : 'Normal / Stable'}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Technical Specifications Paper */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff'
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 2.5, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Scale size={18} color="#1e40af" /> Technical &amp; Legal Metrology Specifications
            </Typography>

            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>INSTRUMENT CATEGORY</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>{instrument.category || 'Weighing Instruments'}</Typography>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>MANUFACTURER / MAKE</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>{instrument.manufacturer}</Typography>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>MODEL NUMBER</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>{instrument.modelNumber}</Typography>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>SERIAL NUMBER</Typography>
                <Typography variant="body2" sx={{ fontWeight: 800, color: '#1e40af', fontFamily: 'monospace' }}>{instrument.serialNumber}</Typography>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>ACCURACY CLASS</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>{instrument.accuracyClass}</Typography>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>MAX CAPACITY</Typography>
                <Typography variant="body2" sx={{ fontWeight: 800, color: '#0f172a' }}>{instrument.maxCapacity}</Typography>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>MIN CAPACITY</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>{instrument.minCapacity || '—'}</Typography>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>SCALE INTERVAL (e)</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>{instrument.verificationScaleIntervalE || '50 g'}</Typography>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>ACTUAL INTERVAL (d)</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>{instrument.actualScaleIntervalD || '10 g'}</Typography>
              </Grid>

              <Grid item xs={12} sm={6} md={6}>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>MANDATORY RE-VERIFICATION PERIODICITY</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#059669' }}>
                  Every {instrument.verificationIntervalMonths} Months (Legal Metrology Rules 2011)
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6} md={6}>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>TYPE APPROVAL / RRSL CERTIFICATE</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>
                  IND-DOCA-2024-MA (Regional Reference Standards Lab)
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Historical Certificates & Verification Records */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff'
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <History size={18} color="#1e40af" /> Verification History &amp; Official Digital Certificates ({certificates.length})
            </Typography>

            {certificates.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                  No digital verification certificates issued yet for this instrument.
                </Typography>
              </Box>
            ) : (
              <Table size="small">
                <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>CERTIFICATE NO</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>ISSUED DATE</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>EXPIRY DATE</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>OFFICER / GATC</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>SECURITY SEAL</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>ACTION</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {certificates.map(cert => (
                    <TableRow key={cert.id} hover>
                      <TableCell sx={{ fontWeight: 800, fontSize: '0.8rem', color: '#166534' }}>
                        {cert.certificateNumber}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.8rem' }}>{cert.issueDate}</TableCell>
                      <TableCell sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#059669' }}>{cert.expiryDate}</TableCell>
                      <TableCell sx={{ fontSize: '0.8rem' }}>{cert.officerName || 'Inspector (LMO)'}</TableCell>
                      <TableCell sx={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>{cert.stampId || 'LM-STAMP-2026'}</TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            setSelectedCert(cert);
                            setCertModalOpen(true);
                          }}
                          sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.75rem', py: 0.2 }}
                        >
                          View Certificate
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Paper>
        </Grid>

        {/* Right Column: Location & Enterprise */}
        <Grid item xs={12} lg={4}>
          {/* Enterprise Information Card */}
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              mb: 3,
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff'
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Building size={18} color="#1e40af" /> Commercial Enterprise &amp; Location
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>BUSINESS NAME</Typography>
              <Typography variant="body1" sx={{ fontWeight: 800, color: '#0f172a' }}>{instrument.businessName}</Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>REGISTERED INSTALLATION ADDRESS</Typography>
              <Typography variant="body2" sx={{ color: '#334155', fontWeight: 500, mt: 0.3 }}>
                {instrument.installationAddress}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, backgroundColor: '#f8fafc', borderRadius: '8px' }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>PINCODE / JURISDICTION</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                  {instrument.pincode || '600032'} • Tamil Nadu Circle
                </Typography>
              </Box>
              <MapPin size={20} color="#1e40af" />
            </Box>
          </Paper>

          {/* Interactive GPS Geofence Map */}
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              mb: 3,
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1 }}>
                <MapPin size={18} color="#dc2626" /> Geofence &amp; GPS Coordinates
              </Typography>
              <Chip label="GPS Locked" size="small" sx={{ backgroundColor: '#dcfce7', color: '#166534', fontWeight: 800, fontSize: '0.7rem' }} />
            </Box>

            <Box sx={{ height: 230, borderRadius: '8px', overflow: 'hidden', mb: 1.5, border: '1px solid #cbd5e1' }}>
              <MapContainer
                center={[lat, lng]}
                zoom={14}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[lat, lng]} icon={createMapPin('#1e40af', '📍', true)}>
                  <Popup>
                    <strong>{instrument.businessName}</strong><br />
                    {instrument.instrumentType} (ID: {instrument.id})
                  </Popup>
                </Marker>
              </MapContainer>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                {lat.toFixed(4)}° N, {lng.toFixed(4)}° E
              </Typography>
              <Button
                size="small"
                variant="outlined"
                startIcon={<ExternalLink size={13} />}
                onClick={handleOpenGoogleMaps}
                sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 700 }}
              >
                Open Maps
              </Button>
            </Box>
          </Paper>

          {/* Quick Applications list */}
          {applications.length > 0 && (
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#ffffff'
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <FileText size={18} color="#1e40af" /> Associated Applications ({applications.length})
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {applications.map(app => (
                  <Box
                    key={app.id}
                    onClick={() => onOpenApplication?.(app.id)}
                    sx={{
                      p: 1.2,
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      backgroundColor: '#f8fafc',
                      cursor: onOpenApplication ? 'pointer' : 'default',
                      '&:hover': onOpenApplication ? { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' } : {}
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.82rem', color: '#1e40af' }}>
                        {app.id}
                      </Typography>
                      <Chip label={app.status} size="small" sx={{ fontSize: '0.68rem', fontWeight: 700 }} />
                    </Box>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                      Filed on {app.filedOn} • {app.applicationType.replace(/_/g, ' ')}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* Digital Certificate Modal */}
      <DigitalCertificateModal
        open={certModalOpen}
        onClose={() => setCertModalOpen(false)}
        certificate={selectedCert}
      />

      {/* QR Code Tag Modal */}
      <QrCodeModal
        open={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        title={instrument.id}
        subtitle={`${instrument.instrumentType} · ${instrument.manufacturer} ${instrument.modelNumber}`}
        qrValue={instrument.qrCodeData || `https://merix.tn.gov.in/verify/instrument/${instrument.id}`}
        badgeText="Registered Legal Metrology Device"
      />
    </Box>
  );
};
