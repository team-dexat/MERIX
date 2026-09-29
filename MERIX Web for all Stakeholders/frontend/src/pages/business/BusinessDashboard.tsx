import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Button,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import {
  FileText,
  BadgeCheck,
  Clock,
  Plus,
  Search,
  QrCode,
  AlertTriangle,
  ChevronRight,
  ArrowRight,
  Scale
} from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { RegisterInstrumentModal } from '../../components/forms/RegisterInstrumentModal';
import { NewApplicationModal } from '../../components/forms/NewApplicationModal';
import { DigitalCertificateModal } from '../../components/certificates/DigitalCertificateModal';
import { ApplicationDetailPage } from '../shared/ApplicationDetailPage';
import { InstrumentDetailPage } from '../shared/InstrumentDetailPage';
import { QrCodeModal } from '../../components/common/QrCodeModal';
import { ApiService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Instrument, VerificationApplication, Certificate } from '../../types';

interface BusinessDashboardProps {
  onNavigate: (tab: string) => void;
}

export const BusinessDashboard: React.FC<BusinessDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [applications, setApplications] = useState<VerificationApplication[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);

  // Modals & Page Navigation
  const [registerOpen, setRegisterOpen] = useState(false);
  const [newAppOpen, setNewAppOpen] = useState(false);
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [selectedInst, setSelectedInst] = useState<Instrument | null>(null);

  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrModalData, setQrModalData] = useState<{ title: string; subtitle: string; val: string }>({
    title: '',
    subtitle: '',
    val: ''
  });

  const loadData = () => {
    let insts = ApiService.getInstruments(user?.id);
    let apps = ApiService.getApplications(user?.id);
    let certs = ApiService.getCertificates(user?.id);

    // Guaranteed fallback to default enterprise demo dataset if user has no records
    if (insts.length === 0) insts = ApiService.getInstruments('USR-001');
    if (apps.length === 0) apps = ApiService.getApplications('USR-001');
    if (certs.length === 0) certs = ApiService.getCertificates('USR-001');

    setInstruments(insts);
    setApplications(apps);
    setCertificates(certs);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // If an instrument is selected, render it as full page
  if (selectedInst) {
    return (
      <InstrumentDetailPage
        instrument={selectedInst}
        onBack={() => {
          setSelectedInst(null);
          loadData();
        }}
        onApplyVerification={(inst) => {
          setSelectedInst(null);
          setNewAppOpen(true);
        }}
        onOpenApplication={(appId) => {
          setSelectedInst(null);
          setSelectedAppId(appId);
        }}
      />
    );
  }

  const handleOpenAppDetail = (app: VerificationApplication) => {
    setSelectedAppId(app.id);
  };

  // If an application is selected, render it as full page
  if (selectedAppId) {
    return (
      <ApplicationDetailPage
        applicationId={selectedAppId}
        onBack={() => {
          setSelectedAppId(null);
          loadData();
        }}
        onOpenInstrument={(instId) => {
          const found = ApiService.getInstrumentById(instId);
          if (found) {
            setSelectedInst(found);
          }
        }}
      />
    );
  }

  const handleOpenCertificate = (app: VerificationApplication) => {
    const cert = certificates.find(c => c.applicationId === app.id || c.instrumentId === app.instrumentId);
    if (cert) {
      setSelectedCert(cert);
      setCertModalOpen(true);
    } else {
      // Create preview certificate for demo if none exists yet
      const mockCert: Certificate = {
        id: `CERT-${app.id.substring(11)}`,
        certificateNumber: `DOCA-LM-2026-00${app.id.substring(11)}`,
        applicationId: app.id,
        instrumentId: app.instrumentId,
        instrument: app.instrument,
        userId: user?.id || 'USR-001',
        officerId: 'USR-003',
        officerName: 'K. Murugan, Inspector (LMO)',
        issueDate: '2026-09-18',
        expiryDate: '2028-09-17',
        stampId: `TN-LM-STAMP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        qrCodeUrl: `https://merix-web.vercel.app/verify/DOCA-LM-2026-00${app.id.substring(11)}`,
        digitalSignatureHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        chainHashPrevious: 'GENESIS-CHAIN-HASH-000',
        chainHashCurrent: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
        status: 'VALID'
      };
      setSelectedCert(mockCert);
      setCertModalOpen(true);
    }
  };

  const handleScanQrQuick = () => {
    onNavigate('scan_qr');
  };

  const handlePublicCheckQuick = () => {
    onNavigate('public_verify');
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3.5 } }}>
      {/* Welcome Banner */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.95rem' }}>
          {t('welcome_back', 'Welcome back')},
        </Typography>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            color: '#0f172a',
            fontFamily: '"Outfit", sans-serif',
            letterSpacing: '-0.5px'
          }}
        >
          {user?.businessName || 'Sundar Industries Pvt Ltd'}
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b', mt: 0.3 }}>
          {t('manage_sub', 'Manage your instruments, applications and certificates with ease.')}
        </Typography>
      </Box>

      {/* 4 Stat Cards Row */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Registered Instruments"
            value={instruments.length || 12}
            icon={Scale}
            accentColor="#2563eb"
            onClick={() => onNavigate('my_instruments')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Applications in Progress"
            value={applications.filter(a => a.status === 'SUBMITTED' || a.status === 'SCHEDULED' || a.status === 'IN_SCRUTINY' || a.status === 'IN_VERIFICATION').length || 6}
            icon={FileText}
            accentColor="#10b981"
            onClick={() => onNavigate('applications')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Certificates"
            value={certificates.length || 4}
            icon={BadgeCheck}
            accentColor="#8b5cf6"
            onClick={() => onNavigate('certificates')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Expiring ≤ 90 Days"
            value={1}
            icon={Clock}
            accentColor="#f59e0b"
            onClick={() => onNavigate('certificates')}
          />
        </Grid>
      </Grid>

      {/* Middle Row: Quick Actions Buttons & Attention Needed */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        <Grid item xs={12} lg={8}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 1.2, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 1 }}>
            ⚡ {t('quick_actions', 'Quick Actions')}
          </Typography>
          <Grid container spacing={1.5}>
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="contained"
                onClick={() => setRegisterOpen(true)}
                startIcon={<FileText size={17} />}
                endIcon={<ChevronRight size={17} />}
                sx={{
                  py: 1.4,
                  backgroundColor: '#2563eb',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 8px rgba(37, 99, 235, 0.2)',
                  '&:hover': { backgroundColor: '#1d4ed8' }
                }}
              >
                {t('register_instrument', 'Register Instrument')}
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="contained"
                onClick={() => setNewAppOpen(true)}
                startIcon={<Plus size={17} />}
                endIcon={<ChevronRight size={17} />}
                sx={{
                  py: 1.4,
                  backgroundColor: '#059669',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 8px rgba(5, 150, 105, 0.2)',
                  '&:hover': { backgroundColor: '#047857' }
                }}
              >
                {t('new_application', 'New Verification Application')}
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="contained"
                onClick={handlePublicCheckQuick}
                startIcon={<Search size={17} />}
                endIcon={<ChevronRight size={17} />}
                sx={{
                  py: 1.4,
                  backgroundColor: '#7c3aed',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 8px rgba(124, 58, 237, 0.2)',
                  '&:hover': { backgroundColor: '#6d28d9' }
                }}
              >
                {t('public_cert_check', 'Public Certificate Check')}
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleScanQrQuick}
                startIcon={<QrCode size={17} />}
                endIcon={<ChevronRight size={17} />}
                sx={{
                  py: 1.4,
                  backgroundColor: '#ea580c',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 8px rgba(234, 88, 12, 0.2)',
                  '&:hover': { backgroundColor: '#c2410c' }
                }}
              >
                {t('scan_qr', 'Scan QR')}
              </Button>
            </Grid>
          </Grid>
        </Grid>

        {/* Right Column: Attention Needed Alert Card */}
        <Grid item xs={12} lg={4} sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 1.2, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 1 }}>
            ⚠️ {t('attention_needed', 'Attention Needed')}
          </Typography>
          <Card
            onClick={() => onNavigate('certificates')}
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              borderRadius: '10px',
              border: '1px solid #fecaca',
              backgroundColor: '#fff5f5',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              '&:hover': { backgroundColor: '#fef2f2' }
            }}
          >
            <CardContent sx={{ p: 2, width: '100%', '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      minWidth: 36,
                      minHeight: 36,
                      borderRadius: '50%',
                      backgroundColor: '#ef4444',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '1rem',
                      flexShrink: 0
                    }}
                  >
                    !
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#991b1b', fontSize: '0.82rem', lineHeight: 1.3 }}>
                      {t('attention_expiring_desc', '1 certificate(s) expiring within 90 days.')}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#b91c1c', fontSize: '0.72rem' }}>
                      {t('weighbridge_expiring_sub', 'Weighbridge (WB-Pitless-60T) due on Oct 14, 2026.')}
                    </Typography>
                  </Box>
                </Box>
                <ChevronRight size={18} color="#b91c1c" style={{ width: 18, height: 18, flexShrink: 0 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Bottom Row: Recent Applications Table with Clickable Rows */}
      <Paper
        variant="outlined"
        sx={{
          borderRadius: '10px',
          backgroundColor: '#ffffff',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}
      >
        <Box
          sx={{
            p: 2.2,
            px: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #f1f5f9'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FileText size={20} color="#1e40af" />
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
              {t('recent_applications', 'Recent Applications')}
            </Typography>
          </Box>
          <Button
            size="small"
            onClick={() => onNavigate('applications')}
            endIcon={<ArrowRight size={15} />}
            sx={{ fontWeight: 700, color: '#1e40af', fontSize: '0.82rem' }}
          >
            {t('view_all', 'View All')}
          </Button>
        </Box>

        <Table size="small">
          <TableHead sx={{ backgroundColor: '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#475569' }}>{t('app_no', 'App No.')}</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#475569' }}>{t('instrument', 'Instrument')}</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#475569' }}>{t('type', 'Type')}</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#475569' }}>{t('status', 'Status')}</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#475569' }}>{t('filed_on', 'Filed On')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {applications.slice(0, 7).map((app) => (
              <TableRow
                key={app.id}
                hover
                sx={{ cursor: 'pointer', '&:last-child td': { border: 0 } }}
                onClick={() => handleOpenAppDetail(app)}
              >
                <TableCell sx={{ fontWeight: 600, fontSize: '0.82rem', color: '#1e40af' }}>
                  {app.id}
                </TableCell>
                <TableCell sx={{ fontSize: '0.82rem', color: '#475569' }}>
                  {app.instrumentId}
                </TableCell>
                <TableCell sx={{ fontSize: '0.82rem', color: '#334155' }}>
                  {app.instrument?.instrumentType || 'Non-Automatic Weighing Instruments'}
                </TableCell>
                <TableCell>
                  <StatusBadge status={app.status} />
                </TableCell>
                <TableCell sx={{ fontSize: '0.78rem', color: '#64748b' }}>
                  {app.filedOn?.split(' ')[0]}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Modals */}
      <RegisterInstrumentModal
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onSuccess={() => loadData()}
      />
      <NewApplicationModal
        open={newAppOpen}
        onClose={() => setNewAppOpen(false)}
        onSuccess={(newApp) => {
          loadData();
          if (newApp && newApp.id) {
            setSelectedAppId(newApp.id);
          }
        }}
      />
      <DigitalCertificateModal
        open={certModalOpen}
        onClose={() => setCertModalOpen(false)}
        certificate={selectedCert}
      />
      <QrCodeModal
        open={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        title={qrModalData.title}
        subtitle={qrModalData.subtitle}
        qrValue={qrModalData.val}
        badgeText="Verified Legal Metrology"
      />
    </Box>
  );
};
