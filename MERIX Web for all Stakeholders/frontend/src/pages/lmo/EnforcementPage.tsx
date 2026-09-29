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
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  IconButton,
  Divider,
  Rating
} from '@mui/material';
import {
  Siren,
  Gavel,
  ShieldAlert,
  AlertTriangle,
  Scale,
  Eye,
  CheckCircle2,
  Clock,
  MapPin,
  FileText,
  DollarSign,
  Download,
  X,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ApiService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { CitizenReport, Instrument, AuditLog } from '../../types';

export const EnforcementPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [citizenReports, setCitizenReports] = useState<CitizenReport[]>([]);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Enforcement Modal State
  const [raidModalOpen, setRaidModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<CitizenReport | null>(null);
  const [actionType, setActionType] = useState<'NOTICE' | 'SEIZURE' | 'COMPOUNDING'>('NOTICE');
  const [penaltyAmount, setPenaltyAmount] = useState('5000');
  const [enforcementRemarks, setEnforcementRemarks] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const loadData = () => {
    const reports = ApiService.getCitizenReports();
    const insts = ApiService.getInstruments();
    const logs = ApiService.getAuditLogs();
    setCitizenReports(reports);
    setInstruments(insts);
    setAuditLogs(logs.filter(l => l.actionType.startsWith('ENFORCEMENT') || l.actionType.includes('NOTICE') || l.resourceType === 'CITIZEN_REPORT'));
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const openReports = citizenReports.filter(r => r.status === 'OPEN' || r.status === 'UNDER_INVESTIGATION');
  const resolvedReports = citizenReports.filter(r => r.status === 'ACTION_TAKEN' || r.status === 'DISMISSED');
  const driftWatchlist = instruments.filter(i => i.isAtDriftRisk || i.trustScore < 80);

  const handleOpenEnforcement = (report: CitizenReport) => {
    setSelectedReport(report);
    setEnforcementRemarks(`Enforcement inspection initiated for complaint ${report.id} (${report.issueCategory.replace(/_/g, ' ')}) at ${report.businessName}. Inspection verified non-compliance under Legal Metrology Act, 2009.`);
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

    setActionSuccessMsg(`Enforcement action (${actionType}) recorded successfully with official notice and compounding order.`);
    setRaidModalOpen(false);
    loadData();
    setTimeout(() => setActionSuccessMsg(null), 6000);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3.5 }, maxWidth: '1600px', margin: '0 auto' }}>
      {/* Header Banner */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Siren size={28} color="#dc2626" />
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', fontFamily: '"Outfit", sans-serif' }}>
              Legal Metrology Statutory Enforcement &amp; Surprise Raids
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.4 }}>
            Statutory enforcement workbench for Legal Metrology Officers under Legal Metrology Act, 2009 (Sections 24, 30, 38, 39).
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Chip
            icon={<Gavel size={14} color="#991b1b" />}
            label="Officer Compounding Powers Active"
            sx={{ fontWeight: 800, fontSize: '0.78rem', backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' }}
          />
        </Box>
      </Box>

      {actionSuccessMsg && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: '10px' }} onClose={() => setActionSuccessMsg(null)}>
          {actionSuccessMsg}
        </Alert>
      )}

      {/* 4 KPI Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="ACTIVE GRIEVANCES / RAIDS"
            value={openReports.length || 3}
            icon={Siren}
            accentColor="#dc2626"
            badgeText="URGENT"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="ENFORCEMENT ACTIONS TAKEN"
            value={resolvedReports.length || 2}
            icon={Gavel}
            accentColor="#059669"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="AI DRIFT RISK WATCHLIST"
            value={driftWatchlist.length || 2}
            icon={AlertTriangle}
            accentColor="#d97706"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="TOTAL STATUTORY PENALTIES"
            value="₹37,500"
            icon={DollarSign}
            accentColor="#7c3aed"
          />
        </Grid>
      </Grid>

      {/* Navigation Sub-Tabs */}
      <Paper sx={{ mb: 3, borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
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
          <Tab icon={<Siren size={16} />} iconPosition="start" label={`Citizen Grievances & Surprise Raids (${openReports.length})`} />
          <Tab icon={<AlertTriangle size={16} />} iconPosition="start" label={`AI Calibration Drift Watchlist (${driftWatchlist.length})`} />
          <Tab icon={<Gavel size={16} />} iconPosition="start" label="Statutory Penalties & Compounding Provisions" />
          <Tab icon={<FileText size={16} />} iconPosition="start" label={`Enforcement Audit Trail (${auditLogs.length})`} />
        </Tabs>
      </Paper>

      {/* TAB 0: CITIZEN GRIEVANCES & SURPRISE RAIDS */}
      {activeTab === 0 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
              🚨 Citizen Tampering Reports &amp; Field Inspection Raids
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
              {openReports.length} pending investigation / action
            </Typography>
          </Box>

          <Grid container spacing={2.5}>
            {citizenReports.map(rep => (
              <Grid item xs={12} md={6} key={rep.id}>
                <Card
                  sx={{
                    borderRadius: '12px',
                    border: rep.status === 'OPEN' ? '1.5px solid #fca5a5' : '1px solid #e2e8f0',
                    backgroundColor: rep.status === 'OPEN' ? '#fffbfb' : '#ffffff',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={rep.issueCategory.replace(/_/g, ' ')}
                            size="small"
                            sx={{
                              fontWeight: 800,
                              fontSize: '0.72rem',
                              backgroundColor: rep.issueCategory === 'ALTERED_MEASURE' || rep.issueCategory === 'SHORT_WEIGHT' ? '#fee2e2' : '#fef3c7',
                              color: rep.issueCategory === 'ALTERED_MEASURE' || rep.issueCategory === 'SHORT_WEIGHT' ? '#991b1b' : '#b45309'
                            }}
                          />
                          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>
                            {rep.id}
                          </Typography>
                        </Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mt: 0.8, fontSize: '0.95rem' }}>
                          {rep.businessName}
                        </Typography>
                      </Box>
                      <StatusBadge status={rep.status} />
                    </Box>

                    <Typography variant="body2" sx={{ color: '#334155', mb: 2, fontSize: '0.84rem', lineHeight: 1.4 }}>
                      {rep.description}
                    </Typography>

                    <Box sx={{ p: 1.2, backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', mb: 2 }}>
                      <Typography variant="caption" sx={{ color: '#475569', display: 'block', fontWeight: 600 }}>
                        👤 Reported By: {rep.reportedByName} ({rep.reportedByPhone || 'Confidential Citizen'}) · {rep.createdAt}
                      </Typography>
                      {rep.resolutionNotes && (
                        <Typography variant="caption" sx={{ color: '#059669', fontWeight: 700, display: 'block', mt: 0.6 }}>
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
                        fontWeight: 800,
                        fontSize: '0.82rem',
                        py: 1,
                        textTransform: 'none',
                        '&:hover': { backgroundColor: '#b91c1c' }
                      }}
                    >
                      {rep.status === 'ACTION_TAKEN' ? '✓ Legal Action Completed' : '🚨 Dispatch Surprise Raid / Issue Notice →'}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* TAB 1: AI CALIBRATION DRIFT WATCHLIST */}
      {activeTab === 1 && (
        <Paper variant="outlined" sx={{ p: 3, borderRadius: '12px', backgroundColor: '#ffffff' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                🛡️ AI Calibration Drift &amp; Risk Prediction Watchlist
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                Instruments flagged by automated drift algorithms for high weighing error probability or consumer dispute correlations.
              </Typography>
            </Box>
          </Box>

          <Table>
            <TableHead sx={{ backgroundColor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>INSTRUMENT ID</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>BUSINESS / LOCATION</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>APPARATUS TYPE</TableCell>
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
                          `Statutory 7-Day Early Reverification Notice served to ${inst.businessName} for flagged drift risk under LM General Rules.`
                        );
                        setActionSuccessMsg(`Statutory 7-Day Early Reverification Notice served for ${inst.id}.`);
                        loadData();
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
                      Serve 7-Day Notice
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      {/* TAB 2: STATUTORY PENALTIES & COMPOUNDING PROVISIONS */}
      {activeTab === 2 && (
        <Paper variant="outlined" sx={{ p: 3, borderRadius: '12px', backgroundColor: '#ffffff' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5 }}>
            ⚖️ Legal Metrology Act, 2009 — Statutory Compounding Provisions
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
            Statutory officer compounding powers under Section 48 of the Act in lieu of court prosecution for first-time contraventions.
          </Typography>

          <Grid container spacing={2.5}>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 2.5, border: '1px solid #fee2e2', backgroundColor: '#fff5f5', borderRadius: '10px' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#991b1b' }}>
                  Section 24: Unverified Measuring Instrument
                </Typography>
                <Typography variant="body2" sx={{ color: '#7f1d1d', mt: 0.5 }}>
                  Use of any unverified, unstamped, or expired weighing or measuring instrument in commercial transactions.
                </Typography>
                <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px dashed #fca5a5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#991b1b' }}>COMPOUNDING RANGE</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#991b1b' }}>₹2,000 – ₹10,000</Typography>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ p: 2.5, border: '1px solid #ffedd5', backgroundColor: '#fffaf0', borderRadius: '10px' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#9a3412' }}>
                  Section 30: Tampering of Security Lead Seal / Stamp
                </Typography>
                <Typography variant="body2" sx={{ color: '#7c2d12', mt: 0.5 }}>
                  Altering, tampering, removing or forging the verification seal, calibration screw, or digital jumper.
                </Typography>
                <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px dashed #fdba74', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#9a3412' }}>COMPOUNDING RANGE</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#9a3412' }}>₹25,000 + Immediate Seizure</Typography>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ p: 2.5, border: '1px solid #e0e7ff', backgroundColor: '#f5f7ff', borderRadius: '10px' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#3730a3' }}>
                  Section 38: Non-Registration of Weight or Measure
                </Typography>
                <Typography variant="body2" sx={{ color: '#312e81', mt: 0.5 }}>
                  Manufacturing, importing, repairing, or selling commercial weighing instruments without state license.
                </Typography>
                <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px dashed #c7d2fe', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#3730a3' }}>COMPOUNDING RANGE</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#3730a3' }}>₹5,000 – ₹20,000</Typography>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ p: 2.5, border: '1px solid #fef3c7', backgroundColor: '#fffdf5', borderRadius: '10px' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#b45309' }}>
                  Section 39: Delivery of Short Quantity / Altered Measure
                </Typography>
                <Typography variant="body2" sx={{ color: '#92400e', mt: 0.5 }}>
                  Dispensing or selling goods below the declared volume or mass exceeding Maximum Permissible Error (MPE).
                </Typography>
                <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px dashed #fde68a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#b45309' }}>COMPOUNDING RANGE</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#b45309' }}>₹10,000 – ₹50,000</Typography>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* TAB 3: ENFORCEMENT AUDIT TRAIL */}
      {activeTab === 3 && (
        <Paper variant="outlined" sx={{ p: 3, borderRadius: '12px', backgroundColor: '#ffffff' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
              📋 Official Legal Enforcement Audit Trail
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
              Immutable statutory record log
            </Typography>
          </Box>

          <Table>
            <TableHead sx={{ backgroundColor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>TIMESTAMP</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>OFFICER</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>LEGAL ACTION</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>TARGET REF</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>STATUTORY FINDINGS / DETAILS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {auditLogs.map(log => (
                <TableRow key={log.id} hover>
                  <TableCell sx={{ fontSize: '0.78rem', color: '#64748b' }}>{log.timestamp}</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#0f172a' }}>{log.actorName}</TableCell>
                  <TableCell>
                    <Chip
                      label={log.actionType.replace(/_/g, ' ')}
                      size="small"
                      sx={{
                        fontWeight: 800,
                        fontSize: '0.7rem',
                        backgroundColor: '#fee2e2',
                        color: '#991b1b'
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#1e40af' }}>{log.resourceId}</TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', color: '#334155' }}>{log.details}</TableCell>
                </TableRow>
              ))}
              {auditLogs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4, color: '#94a3b8' }}>
                    No enforcement records logged yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      )}

      {/* Enforcement Raid & Notice Modal */}
      <Dialog open={raidModalOpen} onClose={() => setRaidModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, color: '#0f172a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>🚨 Legal Metrology Enforcement Action</span>
          <IconButton onClick={() => setRaidModalOpen(false)} size="small"><X size={18} /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedReport && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ p: 1.5, backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#991b1b' }}>
                  {selectedReport.businessName}
                </Typography>
                <Typography variant="caption" sx={{ color: '#7f1d1d', display: 'block' }}>
                  Complaint ID: {selectedReport.id} • Issue: {selectedReport.issueCategory.replace(/_/g, ' ')}
                </Typography>
                <Typography variant="body2" sx={{ color: '#450a0a', fontSize: '0.8rem', mt: 0.5 }}>
                  {selectedReport.description}
                </Typography>
              </Box>

              <TextField
                select
                fullWidth
                label="Statutory Legal Action Type"
                value={actionType}
                onChange={(e) => setActionType(e.target.value as any)}
                size="small"
              >
                <MenuItem value="NOTICE">Statutory Rectification Notice (7 Days)</MenuItem>
                <MenuItem value="COMPOUNDING">Immediate Compounding Penalty Order (Section 48)</MenuItem>
                <MenuItem value="SEIZURE">Apparatus Seizure &amp; Forfeiture Order (Section 15)</MenuItem>
              </TextField>

              {actionType === 'COMPOUNDING' && (
                <TextField
                  fullWidth
                  label="Statutory Compounding Penalty (₹)"
                  type="number"
                  value={penaltyAmount}
                  onChange={(e) => setPenaltyAmount(e.target.value)}
                  size="small"
                  helperText="Section 48 compounding fee deposited to DoCA treasury."
                />
              )}

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Official Enforcement Findings &amp; Order Remarks"
                value={enforcementRemarks}
                onChange={(e) => setEnforcementRemarks(e.target.value)}
                size="small"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setRaidModalOpen(false)} sx={{ color: '#64748b' }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleExecuteEnforcement}
            sx={{ backgroundColor: '#dc2626', fontWeight: 800, textTransform: 'none', px: 2.5, '&:hover': { backgroundColor: '#b91c1c' } }}
          >
            Execute Legal Order &amp; Log Notice
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
