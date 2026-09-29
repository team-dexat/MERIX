import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Chip,
  Card,
  CardContent,
  Tabs,
  Tab,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Alert,
  IconButton
} from '@mui/material';
import {
  FlaskConical,
  CheckCircle2,
  BadgeCheck,
  MapPin,
  Clock,
  ShieldCheck,
  Scale,
  Eye,
  FileText,
  Award,
  Sparkles,
  QrCode
} from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { FieldVerificationPage } from '../shared/FieldVerificationPage';
import { DigitalCertificateModal } from '../../components/certificates/DigitalCertificateModal';
import { ApplicationDetailPage } from '../shared/ApplicationDetailPage';
import { InstrumentDetailPage } from '../shared/InstrumentDetailPage';
import { StatCard } from '../../components/common/StatCard';
import { ApiService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Allocation, Certificate, Instrument, VerificationApplication } from '../../types';

export const GatcDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [selectedAlloc, setSelectedAlloc] = useState<Allocation | null>(null);
  const [verifyingAppId, setVerifyingAppId] = useState<string | null>(null);
  const [generatedCert, setGeneratedCert] = useState<Certificate | null>(null);
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [certFilterStatus, setCertFilterStatus] = useState<string>('ALL');

  // Application & Instrument Details
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [selectedInst, setSelectedInst] = useState<Instrument | null>(null);

  const loadData = () => {
    const allAllocs = ApiService.getAllocations(user?.id);
    const certs = ApiService.getCertificates();
    const insts = ApiService.getInstruments();
    setAllocations(allAllocs);
    setCertificates(certs);
    setInstruments(insts);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // If verification console is active, render full-page Field Verification & Stamping Console
  if (verifyingAppId) {
    return (
      <FieldVerificationPage
        applicationId={verifyingAppId}
        onBack={() => {
          setVerifyingAppId(null);
          loadData();
        }}
        onCertificateGenerated={(cert) => {
          setVerifyingAppId(null);
          handleCertGenerated(cert);
        }}
      />
    );
  }

  // If an instrument is selected, render it as full page
  if (selectedInst) {
    return (
      <InstrumentDetailPage
        instrument={selectedInst}
        onBack={() => {
          setSelectedInst(null);
          loadData();
        }}
        onOpenApplication={(appId) => {
          setSelectedInst(null);
          setSelectedAppId(appId);
        }}
      />
    );
  }

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
        onStartVerification={(appId) => {
          setSelectedAppId(null);
          setVerifyingAppId(appId);
        }}
      />
    );
  }

  const handleStartInspection = (alloc: Allocation) => {
    setSelectedAlloc(alloc);
    setVerifyingAppId(alloc.applicationId);
  };

  const handleCertGenerated = (cert: Certificate) => {
    setGeneratedCert(cert);
    setCertModalOpen(true);
    setActionSuccessMsg(`GATC Laboratory Verification completed successfully. Digital Certificate ${cert.certificateNumber} generated and signed.`);
    loadData();
    setTimeout(() => setActionSuccessMsg(null), 6000);
  };

  const handleViewExistingCert = (cert: Certificate) => {
    setGeneratedCert(cert);
    setCertModalOpen(true);
  };

  const pending = allocations.filter(a => a.status === 'SCHEDULED' || a.status === 'IN_TRANSIT');
  const completed = allocations.filter(a => a.status === 'COMPLETED');

  return (
    <Box sx={{ p: { xs: 2, md: 3.5 } }}>
      {/* Header Banner */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <FlaskConical size={28} color="#7c3aed" />
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                color: '#0f172a',
                fontFamily: '"Outfit", sans-serif',
                letterSpacing: '-0.5px'
              }}
            >
              GATC Laboratory Testing &amp; Stamping Console
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
            {user?.fullName || 'Dr. Senthilkumar Ramanathan (GATC Lab Director)'} · {user?.jurisdictionZone || 'Tamil Nadu State Lab'} · Accredited Government Approved Test Centre
          </Typography>
        </Box>
        <Chip
          icon={<BadgeCheck size={14} color="#7c3aed" />}
          label="NABL & Legal Metrology Rules Accredited Lab"
          sx={{ backgroundColor: '#f5f3ff', color: '#6d28d9', fontWeight: 700, fontSize: '0.78rem', py: 0.5 }}
        />
      </Box>

      {/* Success Alert */}
      {actionSuccessMsg && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: '8px' }} onClose={() => setActionSuccessMsg(null)}>
          {actionSuccessMsg}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="ASSIGNED LAB QUEUE"
            value={allocations.length || 3}
            icon={FlaskConical}
            accentColor="#7c3aed"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="SCHEDULED / BENCH TESTS"
            value={pending.length || 2}
            icon={Clock}
            accentColor="#f59e0b"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="COMPLETED CERTIFICATIONS"
            value={certificates.length || 4}
            icon={CheckCircle2}
            accentColor="#10b981"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="LAB ACCURACY INDEX"
            value="99.8%"
            icon={Award}
            accentColor="#2563eb"
          />
        </Grid>
      </Grid>

      {/* Tabs Navigation */}
      <Paper sx={{ mb: 3, borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            px: 2,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.85rem',
              minHeight: 48
            },
            '& .Mui-selected': {
              color: '#7c3aed !important'
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#7c3aed'
            }
          }}
        >
          <Tab icon={<FlaskConical size={16} />} iconPosition="start" label={`Laboratory Verification Queue (${allocations.length})`} />
          <Tab icon={<Award size={16} />} iconPosition="start" label={`Completed Lab Certificates (${certificates.length})`} />
          <Tab icon={<Scale size={16} />} iconPosition="start" label="Pattern Approval & NABL Standards" />
        </Tabs>
      </Paper>

      {/* TAB 0: LABORATORY VERIFICATION WORK QUEUE */}
      {activeTab === 0 && (
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 2 }}>
            📋 Assigned Laboratory Verification &amp; Testing Work Queue
          </Typography>

          <Grid container spacing={2.5}>
            {allocations.map(alloc => {
              const app = alloc.application || ApiService.getApplicationById(alloc.applicationId);
              return (
                <Grid item xs={12} md={6} key={alloc.id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                      '&:hover': { boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }
                    }}
                  >
                    <CardContent sx={{ p: 2.2, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', '&:last-child': { pb: 2.2 } }}>
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.2 }}>
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#7c3aed', fontSize: '0.9rem' }}>
                              {alloc.applicationId}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem' }}>
                              {alloc.scheduledDate} · {alloc.scheduledTimeSlot}
                            </Typography>
                          </Box>
                          <StatusBadge status={alloc.status} />
                        </Box>

                        {app && (
                          <Box sx={{ mb: 1.2, p: 1.2, backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                            <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.8rem' }}>
                              {app.instrument?.businessName || 'Sundar Industries Pvt Ltd'} · {app.instrument?.instrumentType || 'Non-Automatic Weighing Instruments'}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#475569', display: 'block', mt: 0.3 }}>
                              Class: <strong>{app.instrument?.accuracyClass || 'Class II'}</strong> • Max: <strong>{app.instrument?.maxCapacity || '220 g'}</strong> • Serial: {app.instrument?.serialNumber || 'SN-ME204-7781'}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                              <MapPin size={12} color="#64748b" style={{ width: 12, height: 12, flexShrink: 0 }} />
                              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem' }}>
                                {app.instrument?.installationAddress || 'SIPCOT Industrial Park, Sriperumbudur, Tamil Nadu 602106'}
                              </Typography>
                            </Box>
                          </Box>
                        )}

                        {alloc.instructions && (
                          <Typography variant="caption" sx={{ color: '#475569', display: 'block', mb: 1.2, fontStyle: 'italic', fontSize: '0.72rem' }}>
                            📌 {alloc.instructions}
                          </Typography>
                        )}
                      </Box>

                      <Box sx={{ display: 'flex', gap: 1.2, mt: 1 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => setSelectedAppId(alloc.applicationId)}
                          startIcon={<Eye size={14} />}
                          sx={{
                            borderRadius: '8px',
                            fontWeight: 700,
                            fontSize: '0.78rem',
                            color: '#7c3aed',
                            borderColor: '#ddd6fe',
                            '&:hover': { backgroundColor: '#f5f3ff' }
                          }}
                        >
                          View Details
                        </Button>
                        <Button
                          variant="contained"
                          fullWidth
                          onClick={() => handleStartInspection(alloc)}
                          disabled={alloc.status === 'COMPLETED'}
                          sx={{
                            backgroundColor: '#7c3aed',
                            borderRadius: '8px',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            py: 1,
                            '&:hover': { backgroundColor: '#6d28d9' }
                          }}
                        >
                          {alloc.status === 'COMPLETED' ? '✓ Lab Verification Completed' : 'Start Laboratory Testing & Stamping →'}
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}

      {/* TAB 1: COMPLETED LAB CERTIFICATES WITH INTERACTIVE FILTER CARDS */}
      {activeTab === 1 && (
        <Paper sx={{ p: 3, borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                📜 NABL &amp; GATC Lab Verification Certificates
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                Digitally signed legal metrology verification certificates chained on cryptographic ledger. Click any card below to filter.
              </Typography>
            </Box>
          </Box>

          {/* Interactive Filter Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {[
              { key: 'ALL', label: 'All Certificates', count: certificates.length, color: '#7c3aed' },
              { key: 'VALID', label: 'Valid / Active', count: certificates.filter(c => c.status === 'VALID').length, color: '#059669' },
              { key: 'EXPIRING_SOON', label: 'Expiring ≤ 90 Days', count: certificates.filter(c => c.status === 'EXPIRING_SOON').length, color: '#d97706' },
              { key: 'EXPIRED', label: 'Expired', count: certificates.filter(c => c.status === 'EXPIRED').length, color: '#dc2626' }
            ].map(stat => {
              const isSelected = certFilterStatus === stat.key;
              return (
                <Grid item xs={6} sm={3} key={stat.key}>
                  <Paper
                    elevation={0}
                    onClick={() => setCertFilterStatus(stat.key)}
                    sx={{
                      p: 2,
                      border: isSelected ? `2.5px solid ${stat.color}` : '1px solid #e2e8f0',
                      borderRadius: '10px',
                      textAlign: 'center',
                      borderTop: `4px solid ${stat.color}`,
                      backgroundColor: isSelected ? '#f8fafc' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }
                    }}
                  >
                    <Typography variant="h5" sx={{ fontWeight: 900, color: stat.color, fontFamily: '"Outfit", sans-serif' }}>
                      {stat.count}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, display: 'block', mt: 0.3 }}>
                      {stat.label.toUpperCase()}
                    </Typography>
                    {isSelected && (
                      <Chip label="FILTER ACTIVE" size="small" sx={{ height: 16, fontSize: '0.6rem', fontWeight: 800, mt: 0.8, backgroundColor: `${stat.color}20`, color: stat.color }} />
                    )}
                  </Paper>
                </Grid>
              );
            })}
          </Grid>

          <Table>
            <TableHead sx={{ backgroundColor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>CERTIFICATE NO</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>ENTERPRISE &amp; APPARATUS</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>STAMP &amp; SEAL ID</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>ISSUE DATE</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>EXPIRY DATE</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>STATUS</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(certFilterStatus === 'ALL' ? certificates : certificates.filter(c => c.status === certFilterStatus)).map(cert => (
                <TableRow key={cert.id} hover sx={{ cursor: 'pointer' }} onClick={() => handleViewExistingCert(cert)}>
                  <TableCell sx={{ fontWeight: 800, fontSize: '0.82rem', color: '#7c3aed' }}>
                    {cert.certificateNumber}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.82rem' }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.82rem' }}>
                      {cert.instrument?.businessName || 'Sundar Industries Pvt Ltd'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                      {cert.instrument?.instrumentType} · SN: {cert.instrument?.serialNumber}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.82rem', fontFamily: 'monospace', color: '#059669', fontWeight: 700 }}>
                    {cert.stampId}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.78rem', color: '#475569' }}>
                    {cert.issueDate}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.78rem', fontWeight: 700, color: cert.status === 'EXPIRING_SOON' ? '#b45309' : '#047857' }}>
                    {cert.expiryDate}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={cert.status} />
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Eye size={14} />}
                      onClick={() => handleViewExistingCert(cert)}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        borderColor: '#7c3aed',
                        color: '#7c3aed',
                        '&:hover': { backgroundColor: '#f5f3ff' }
                      }}
                    >
                      View Certificate
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      {/* TAB 2: PATTERN APPROVAL & NABL STANDARDS */}
      {activeTab === 2 && (
        <Paper sx={{ p: 3, borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>
            🔬 Pattern Approval &amp; NABL Laboratory Testing Protocols
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
            Standard calibration testing limits under Legal Metrology General Rules 2011 Schedule VII &amp; OIML R76.
          </Typography>

          <Grid container spacing={2.5}>
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 2.2, border: '1px solid #ddd6fe', backgroundColor: '#faf5ff', borderRadius: '8px' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#6d28d9' }}>
                  Class I / Special Accuracy Balances
                </Typography>
                <Typography variant="caption" sx={{ color: '#5b21b6', display: 'block', mt: 0.5 }}>
                  High precision analytical balances for bullion, gems, and pharmaceutical laboratories.
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#6d28d9', mt: 1.5 }}>
                  Max Permissible Error (MPE): &plusmn;0.5 e (0 &le; m &le; 50,000 e)
                </Typography>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ p: 2.2, border: '1px solid #bfdbfe', backgroundColor: '#eff6ff', borderRadius: '8px' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e40af' }}>
                  Class II / High Accuracy Scales
                </Typography>
                <Typography variant="caption" sx={{ color: '#1e3a8a', display: 'block', mt: 0.5 }}>
                  Electronic balances used in industrial manufacturing, metallurgy, and precision weighing.
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e40af', mt: 1.5 }}>
                  Max Permissible Error (MPE): &plusmn;0.5 e to &plusmn;1.5 e
                </Typography>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ p: 2.2, border: '1px solid #bbf7d0', backgroundColor: '#f0fdf4', borderRadius: '8px' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#166534' }}>
                  Class III / Medium Accuracy Instruments
                </Typography>
                <Typography variant="caption" sx={{ color: '#14532d', display: 'block', mt: 0.5 }}>
                  Platform scales, weighbridges, and retail counter weighing systems.
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#166534', mt: 1.5 }}>
                  Max Permissible Error (MPE): &plusmn;0.5 e to &plusmn;1.5 e (up to 20,000 e)
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Generated / Existing Certificate Modal */}
      <DigitalCertificateModal
        open={certModalOpen}
        onClose={() => setCertModalOpen(false)}
        certificate={generatedCert}
      />
    </Box>
  );
};
