import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Paper, Button, Chip, Card, CardContent,
  Tabs, Tab, Table, TableHead, TableBody, TableRow, TableCell,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, Alert, IconButton
} from '@mui/material';
import {
  FileText, CheckCircle2, BadgeCheck, MapPin,
  Clock, ShieldAlert, AlertTriangle, Scale, Eye,
  Siren, Gavel, X, Sparkles
} from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { FieldVerificationPage } from '../shared/FieldVerificationPage';
import { DigitalCertificateModal } from '../../components/certificates/DigitalCertificateModal';
import { ApplicationDetailPage } from '../shared/ApplicationDetailPage';
import { InstrumentDetailPage } from '../shared/InstrumentDetailPage';
import { StatCard } from '../../components/common/StatCard';
import { ApiService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Allocation, Certificate, CitizenReport, Instrument, VerificationApplication } from '../../types';

export const LmoDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [citizenReports, setCitizenReports] = useState<CitizenReport[]>([]);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [selectedAlloc, setSelectedAlloc] = useState<Allocation | null>(null);
  const [verifyingAppId, setVerifyingAppId] = useState<string | null>(null);
  const [generatedCert, setGeneratedCert] = useState<Certificate | null>(null);
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [certFilterStatus, setCertFilterStatus] = useState<string>('ALL');

  // Application & Instrument Details
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [selectedInst, setSelectedInst] = useState<Instrument | null>(null);

  // Enforcement Modal State
  const [raidModalOpen, setRaidModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<CitizenReport | null>(null);
  const [actionType, setActionType] = useState<'NOTICE' | 'SEIZURE' | 'COMPOUNDING'>('NOTICE');
  const [penaltyAmount, setPenaltyAmount] = useState('5000');
  const [enforcementRemarks, setEnforcementRemarks] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const loadData = () => {
    const allocs = ApiService.getAllocations(user?.id);
    const reports = ApiService.getCitizenReports();
    const insts = ApiService.getInstruments();
    const certs = ApiService.getCertificates();
    setAllocations(allocs);
    setCitizenReports(reports);
    setInstruments(insts);
    setCertificates(certs);
  };

  useEffect(() => { loadData(); }, [user]);

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
    loadData();
  };

  const handleOpenEnforcement = (report: CitizenReport) => {
    setSelectedReport(report);
    setEnforcementRemarks(`Enforcement inspection initiated for complaint ${report.id} (${report.issueCategory}) at ${report.businessName}.`);
    setRaidModalOpen(true);
  };

  const handleExecuteEnforcement = () => {
    if (!selectedReport) return;
    
    // Update report status
    ApiService.updateCitizenReportStatus(
      selectedReport.id,
      'ACTION_TAKEN',
      `Legal Action [${actionType}]: ${enforcementRemarks} Statutory Compounding Fee: ₹${penaltyAmount}. Legal Metrology Act Sec 24/30.`
    );

    // Audit Log
    ApiService.addAuditLog(
      user?.id || 'USR-003',
      user?.fullName || 'K. Murugan (LMO)',
      'LMO_OFFICER',
      `ENFORCEMENT_${actionType}`,
      'CITIZEN_REPORT',
      selectedReport.id,
      `Issued ${actionType} against ${selectedReport.businessName}. Penalty ₹${penaltyAmount}. ${enforcementRemarks}`
    );

    setActionSuccessMsg(`Enforcement action (${actionType}) recorded successfully with statutory notice.`);
    setRaidModalOpen(false);
    loadData();
    setTimeout(() => setActionSuccessMsg(null), 6000);
  };

  const pending = allocations.filter(a => a.status === 'SCHEDULED' || a.status === 'IN_TRANSIT');
  const done = allocations.filter(a => a.status === 'COMPLETED');
  const driftWatchlist = instruments.filter(i => i.isAtDriftRisk || i.trustScore < 85);
  const openReports = citizenReports.filter(r => r.status === 'OPEN' || r.status === 'UNDER_INVESTIGATION');

  return (
    <Box sx={{ p: 3.5 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', fontFamily: '"Outfit", sans-serif' }}>
            LMO Field Verification &amp; Enforcement Console
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.3 }}>
            {user?.fullName} · {user?.jurisdictionZone} · State Legal Metrology Enforcement Officer
          </Typography>
        </Box>
        <Chip
          icon={<ShieldAlert size={14} color="#059669" />}
          label="Statutory Enforcement Authority Active"
          sx={{ backgroundColor: '#ecfdf5', color: '#065f46', fontWeight: 700, fontSize: '0.78rem', py: 0.5 }}
        />
      </Box>

      {/* Success Alert */}
      {actionSuccessMsg && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: '8px' }} onClose={() => setActionSuccessMsg(null)}>
          {actionSuccessMsg}
        </Alert>
      )}

      {/* Top Stats Row */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="ASSIGNED VISITS"
            value={allocations.length || 3}
            icon={FileText}
            accentColor="#1e40af"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="SCHEDULED / TRANSIT"
            value={pending.length || 2}
            icon={Clock}
            accentColor="#f59e0b"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="GRIEVANCES / RAIDS"
            value={openReports.length || 3}
            icon={Siren}
            accentColor="#dc2626"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="AI DRIFT WATCHLIST"
            value={driftWatchlist.length || 1}
            icon={AlertTriangle}
            accentColor="#7c3aed"
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
            }
          }}
        >
          <Tab icon={<FileText size={16} />} iconPosition="start" label={`Verification Work Queue (${allocations.length})`} />
          <Tab icon={<BadgeCheck size={16} />} iconPosition="start" label={`Issued Certificates & Seals (${certificates.length})`} />
          <Tab icon={<Siren size={16} />} iconPosition="start" label={`Citizen Grievances & Raids (${openReports.length})`} />
          <Tab icon={<Gavel size={16} />} iconPosition="start" label="Statutory Enforcement & Penalties" />
          <Tab icon={<AlertTriangle size={16} />} iconPosition="start" label={`AI Drift Watchlist (${driftWatchlist.length})`} />
        </Tabs>
      </Paper>

      {/* TAB 0: ASSIGNED VERIFICATION WORK QUEUE */}
      {activeTab === 0 && (
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 2 }}>
            📋 Assigned Verification Work Queue
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
                            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9rem' }}>
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
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.3 }}>
                              <MapPin size={12} color="#64748b" style={{ width: 12, height: 12, flexShrink: 0 }} />
                              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem' }}>
                                {app.instrument?.installationAddress || 'Packing Section, Koyambedu Market Hub, Chennai 600107'}
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
                            color: '#1e40af',
                            borderColor: '#bfdbfe',
                            '&:hover': { backgroundColor: '#eff6ff' }
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
                            backgroundColor: '#059669',
                            borderRadius: '8px',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            py: 1,
                            '&:hover': { backgroundColor: '#047857' }
                          }}
                        >
                          {alloc.status === 'COMPLETED' ? '✓ Completed' : 'Start Verification & Testing →'}
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

      {/* TAB 1: ISSUED CERTIFICATES & SEALS WITH DYNAMIC FILTER CARDS */}
      {activeTab === 1 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                📜 Issued Legal Metrology Verification Certificates &amp; Security Seals
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Click any summary card below to filter certificates by statutory status.
              </Typography>
            </Box>
          </Box>

          {/* Interactive Filter Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {[
              { key: 'ALL', label: 'All Certificates', count: certificates.length, color: '#1e40af' },
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

          {/* Certificates Table */}
          <Paper variant="outlined" sx={{ borderRadius: '10px', overflow: 'hidden' }}>
            <Table>
              <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>CERTIFICATE NO</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>ENTERPRISE &amp; APPARATUS</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>STAMP &amp; SEAL ID</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>ISSUE DATE</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>EXPIRY DATE</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>STATUS</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>ACTION</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(certFilterStatus === 'ALL' ? certificates : certificates.filter(c => c.status === certFilterStatus)).map(cert => (
                  <TableRow key={cert.id} hover sx={{ cursor: 'pointer' }} onClick={() => { setGeneratedCert(cert); setCertModalOpen(true); }}>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.82rem', color: '#1e40af' }}>
                      {cert.certificateNumber}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.82rem' }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
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
                        startIcon={<Eye size={13} />}
                        onClick={() => { setGeneratedCert(cert); setCertModalOpen(true); }}
                        sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#1e40af', borderColor: '#bfdbfe', py: 0.3 }}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Box>
      )}

      {/* TAB 2: CITIZEN GRIEVANCES & SPOT RAIDS */}
      {activeTab === 2 && (
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 2 }}>
            🚨 Consumer Grievances &amp; Impromptu Spot Checks
          </Typography>

          <Grid container spacing={2.5}>
            {citizenReports.map(rep => (
              <Grid item xs={12} md={6} key={rep.id}>
                <Card sx={{ borderRadius: '10px', border: '1px solid #e2e8f0', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <CardContent sx={{ p: 2.2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.2 }}>
                      <Box>
                        <Chip
                          label={rep.issueCategory.replace(/_/g, ' ')}
                          size="small"
                          sx={{
                            backgroundColor: rep.issueCategory === 'SHORT_WEIGHT' ? '#fef2f2' : '#fffbeb',
                            color: rep.issueCategory === 'SHORT_WEIGHT' ? '#b91c1c' : '#b45309',
                            fontWeight: 700,
                            fontSize: '0.7rem',
                            mb: 0.5
                          }}
                        />
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9rem' }}>
                          {rep.businessName}
                        </Typography>
                      </Box>
                      <StatusBadge status={rep.status} />
                    </Box>

                    <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.8rem', mb: 1.5 }}>
                      "{rep.description}"
                    </Typography>

                    <Box sx={{ p: 1, backgroundColor: '#f8fafc', borderRadius: '6px', mb: 1.5 }}>
                      <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                        👤 Reported By: {rep.reportedByName} ({rep.reportedByPhone || 'Confidential'}) · {rep.createdAt}
                      </Typography>
                      {rep.resolutionNotes && (
                        <Typography variant="caption" sx={{ color: '#059669', fontWeight: 600, display: 'block', mt: 0.5 }}>
                          Resolution: {rep.resolutionNotes}
                        </Typography>
                      )}
                    </Box>

                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => handleOpenEnforcement(rep)}
                      disabled={rep.status === 'ACTION_TAKEN'}
                      sx={{
                        backgroundColor: '#dc2626',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        py: 0.8,
                        '&:hover': { backgroundColor: '#b91c1c' }
                      }}
                    >
                      {rep.status === 'ACTION_TAKEN' ? '✓ Legal Action Completed' : '🚨 Dispatch Raid / Issue Notice →'}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* TAB 3: STATUTORY ENFORCEMENT & PENALTIES */}
      {activeTab === 3 && (
        <Paper sx={{ p: 3, borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>
            ⚖️ Legal Metrology Act, 2009 — Enforcement Provisions
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
            Statutory compounding powers under Sections 24, 30, and 48 of the Legal Metrology Act.
          </Typography>

          <Grid container spacing={2.5}>
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 2, border: '1px solid #fee2e2', backgroundColor: '#fff5f5', borderRadius: '8px' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#991b1b' }}>
                  Section 24: Unverified Measuring Instrument
                </Typography>
                <Typography variant="caption" sx={{ color: '#7f1d1d', display: 'block', mt: 0.5 }}>
                  Using unverified or unstamped weights/measures for trade.
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 800, color: '#991b1b', mt: 1.5 }}>
                  Statutory Compounding Fee: ₹2,000 – ₹10,000
                </Typography>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ p: 2, border: '1px solid #ffedd5', backgroundColor: '#fffaf0', borderRadius: '8px' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#9a3412' }}>
                  Section 30: Tampering of Security Lead Seal
                </Typography>
                <Typography variant="caption" sx={{ color: '#7c2d12', display: 'block', mt: 0.5 }}>
                  Altering, breaking, or removing verification seal/stamp.
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 800, color: '#9a3412', mt: 1.5 }}>
                  Statutory Compounding Fee: ₹25,000 + Seizure
                </Typography>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ p: 2, border: '1px solid #e0e7ff', backgroundColor: '#f5f7ff', borderRadius: '8px' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#3730a3' }}>
                  Section 38: Non-Registration of Weight/Measure
                </Typography>
                <Typography variant="caption" sx={{ color: '#312e81', display: 'block', mt: 0.5 }}>
                  Manufacturing, importing, or selling without statutory registration.
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 800, color: '#3730a3', mt: 1.5 }}>
                  Statutory Compounding Fee: ₹5,000 – ₹20,000
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* TAB 4: AI DRIFT WATCHLIST */}
      {activeTab === 4 && (
        <Paper sx={{ p: 3, borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                🛡️ AI Drift &amp; Risk Prediction Watchlist
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                Instruments flagged by AI for calibration drift, high error risk, or consumer dispute correlation.
              </Typography>
            </Box>
          </Box>

          <Table>
            <TableHead sx={{ backgroundColor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>INSTRUMENT ID</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>BUSINESS / LOCATION</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>TYPE</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>TRUST SCORE</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>DRIFT STATUS</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>ENFORCEMENT ACTION</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {driftWatchlist.map(inst => (
                <TableRow key={inst.id} hover>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.82rem', color: '#1e40af' }}>{inst.id}</TableCell>
                  <TableCell sx={{ fontSize: '0.82rem' }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.82rem' }}>{inst.businessName}</Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>{inst.installationAddress}</Typography>
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.82rem' }}>{inst.instrumentType}</TableCell>
                  <TableCell>
                    <Chip
                      label={`${inst.trustScore}%`}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        backgroundColor: inst.trustScore > 85 ? '#ecfdf5' : '#fef2f2',
                        color: inst.trustScore > 85 ? '#065f46' : '#b91c1c'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={inst.isAtDriftRisk ? 'DRIFT FLAGGED' : 'MONITORED'}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        backgroundColor: inst.isAtDriftRisk ? '#fee2e2' : '#f1f5f9',
                        color: inst.isAtDriftRisk ? '#991b1b' : '#475569'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        ApiService.addAuditLog(
                          user?.id || 'USR-003',
                          user?.fullName || 'K. Murugan (LMO)',
                          'LMO_OFFICER',
                          'ISSUE_EARLY_REVERIFICATION_NOTICE',
                          'INSTRUMENT',
                          inst.id,
                          `Statutory 7-Day Early Reverification Notice served to ${inst.businessName} for flagged drift risk.`
                        );
                        setActionSuccessMsg(`Statutory 7-Day Early Reverification Notice served for ${inst.id}.`);
                      }}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        borderColor: '#dc2626',
                        color: '#dc2626',
                        '&:hover': { backgroundColor: '#fef2f2' }
                      }}
                    >
                      Issue 7-Day Notice
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      {/* Enforcement Raid Modal */}
      <Dialog open={raidModalOpen} onClose={() => setRaidModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, color: '#0f172a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>🚨 Legal Metrology Enforcement Action</span>
          <IconButton onClick={() => setRaidModalOpen(false)} size="small"><X size={18} /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedReport && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ p: 1.5, backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                <Typography variant="caption" sx={{ color: '#64748b' }}>Target Business Premise</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{selectedReport.businessName}</Typography>
                <Typography variant="caption" sx={{ color: '#475569' }}>Complaint: "{selectedReport.description}"</Typography>
              </Box>

              <TextField
                select
                fullWidth
                label="Statutory Enforcement Action"
                value={actionType}
                onChange={(e) => setActionType(e.target.value as any)}
                size="small"
              >
                <MenuItem value="NOTICE">Issue Form-A Inspection Notice (Section 24)</MenuItem>
                <MenuItem value="COMPOUNDING">Issue Statutory Compounding Penalty Challan</MenuItem>
                <MenuItem value="SEIZURE">Order Seizure &amp; Detainment of Non-Compliant Device (Section 30)</MenuItem>
              </TextField>

              <TextField
                fullWidth
                label="Compounding Fine Amount (₹)"
                type="number"
                value={penaltyAmount}
                onChange={(e) => setPenaltyAmount(e.target.value)}
                size="small"
              />

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Official Enforcement & Seizure Remarks"
                value={enforcementRemarks}
                onChange={(e) => setEnforcementRemarks(e.target.value)}
                size="small"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setRaidModalOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleExecuteEnforcement}
            sx={{ backgroundColor: '#dc2626', fontWeight: 700, '&:hover': { backgroundColor: '#b91c1c' } }}
          >
            Execute Legal Action &amp; Log Notice
          </Button>
        </DialogActions>
      </Dialog>

      {/* Generated Certificate Modal */}
      <DigitalCertificateModal
        open={certModalOpen}
        onClose={() => setCertModalOpen(false)}
        certificate={generatedCert}
      />
    </Box>
  );
};
