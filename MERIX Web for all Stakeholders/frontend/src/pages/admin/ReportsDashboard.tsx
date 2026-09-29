import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Chip,
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
  Alert
} from '@mui/material';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  FileSpreadsheet,
  Award,
  ShieldCheck,
  Ban,
  Activity,
  Zap,
  Download,
  X
} from 'lucide-react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { ApiService } from '../../services/api';
import { Certificate, Instrument } from '../../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export const ReportsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [revokeOpen, setRevokeOpen] = useState(false);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [revokeReason, setRevokeReason] = useState('Instrument failed surprise field verification inspection (tampered lead seal).');
  const [revokeSuccess, setRevokeSuccess] = useState(false);

  useEffect(() => {
    setInstruments(ApiService.getInstruments());
    setCertificates(ApiService.getCertificates());
  }, []);

  const handleRevoke = () => {
    if (!selectedCert) return;
    ApiService.addAuditLog(
      'ADMIN',
      'Department Admin',
      'ADMIN',
      'REVOKE_CERTIFICATE',
      'CERTIFICATE',
      selectedCert.certificateNumber,
      `Certificate ${selectedCert.certificateNumber} revoked. Reason: ${revokeReason}`
    );
    setRevokeSuccess(true);
    setRevokeOpen(false);
    setTimeout(() => setRevokeSuccess(false), 5000);
  };

  // Chart: District-wise verifications
  const districtData = {
    labels: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tiruppur', 'Erode'],
    datasets: [
      {
        label: 'Verifications Completed',
        data: [580, 490, 420, 310, 240, 190, 150],
        backgroundColor: '#1e40af',
        borderRadius: 8
      },
      {
        label: 'Pending Inspections',
        data: [60, 52, 45, 30, 20, 15, 12],
        backgroundColor: '#93c5fd',
        borderRadius: 8
      }
    ]
  };

  // Chart: Instrument Type Breakdown
  const typeData = {
    labels: [
      'Non-Automatic Weighing',
      'Counter Machine',
      'Rail Weighbridges',
      'Petrol/Diesel Dispenser',
      'Beam Scale / Load Cell'
    ],
    datasets: [
      {
        data: [42, 23, 15, 12, 8],
        backgroundColor: ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4']
      }
    ]
  };

  // Chart: Predictive Drift Trend
  const driftTrendData = {
    labels: ['Month 1', 'Month 3', 'Month 6', 'Month 9', 'Month 12', 'Month 15', 'Month 18', 'Month 24'],
    datasets: [
      {
        label: 'Mean Load Drift Error (% MPE)',
        data: [0.05, 0.08, 0.12, 0.22, 0.35, 0.58, 0.85, 1.25],
        borderColor: '#dc2626',
        backgroundColor: 'rgba(220, 38, 38, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3.5 } }}>
      {/* Header Banner */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <BarChart3 size={28} color="#1e40af" />
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', fontFamily: '"Outfit", sans-serif' }}>
              State Legal Metrology Reports &amp; Analytics
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
            Statutory registers, LMO performance rankings, predictive drift risk, and certificate governance.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Download size={16} />}
          onClick={() => alert('Exporting Official Legal Metrology Annual Register (CSV/PDF)...')}
          sx={{ borderColor: '#bfdbfe', color: '#1e40af', fontWeight: 700 }}
        >
          Export Register (PDF/CSV)
        </Button>
      </Box>

      {revokeSuccess && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
          Certificate has been officially REVOKED. Status updated across public verification registry and QR scanner.
        </Alert>
      )}

      {/* Tabs */}
      <Paper variant="outlined" sx={{ borderRadius: '14px', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ px: 2, '& .MuiTab-root': { fontWeight: 700, fontSize: '0.85rem' } }}
        >
          <Tab label="District Compliance Heatmap" />
          <Tab label="LMO & GATC Performance" />
          <Tab label="Predictive Reverification Risk (Drift Engine)" />
          <Tab label="Certificate Register & Revocation" />
        </Tabs>
      </Paper>

      {/* Tab 0: District Compliance */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: '10px', height: 420 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 2 }}>
                District-wise Verifications &amp; Pending Workload (Tamil Nadu)
              </Typography>
              <Box sx={{ height: 320 }}>
                <Bar data={districtData} options={{ responsive: true, maintainAspectRatio: false }} />
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} lg={4}>
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: '10px', height: 420 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 2 }}>
                Instrument Category Breakdown
              </Typography>
              <Box sx={{ height: 320 }}>
                <Doughnut data={typeData} options={{ responsive: true, maintainAspectRatio: false }} />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Tab 1: LMO & GATC Performance */}
      {activeTab === 1 && (
        <Paper variant="outlined" sx={{ borderRadius: '10px', overflow: 'hidden' }}>
          <Box sx={{ p: 2.5, backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
              Legal Metrology Officers (LMO) &amp; GATC Performance Scorecard
            </Typography>
          </Box>
          <Table>
            <TableHead sx={{ backgroundColor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Officer / Centre</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Jurisdiction / Zone</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Verifications Done</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Avg. Turnaround Time</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>SLA Compliance</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Performance Rating</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[
                { name: 'K. Murugan (LMO)', zone: 'Chennai Central Sub-Division', done: 142, tat: '1.4 days', sla: '98.5%', rating: '5.0 ★ Top Performer', color: '#10b981' },
                { name: 'Tamil Nadu GATC Lab (Guindy)', zone: 'State Testing Lab Zone 01', done: 89, tat: '2.1 days', sla: '96.2%', rating: '4.8 ★ Accredited', color: '#7c3aed' },
                { name: 'S. Anitha (LMO)', zone: 'Coimbatore Industrial Sub-Division', done: 128, tat: '1.8 days', sla: '95.0%', rating: '4.7 ★ Excellent', color: '#2563eb' },
                { name: 'Dr. R. Senthil Nathan (LMO)', zone: 'Madurai Urban Zone', done: 96, tat: '2.6 days', sla: '89.4%', rating: '4.2 ★ Good', color: '#f59e0b' }
              ].map((row, idx) => (
                <TableRow key={idx} hover>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.85rem' }}>{row.name}</TableCell>
                  <TableCell sx={{ fontSize: '0.82rem', color: '#64748b' }}>{row.zone}</TableCell>
                  <TableCell sx={{ fontSize: '0.82rem', fontWeight: 700 }}>{row.done}</TableCell>
                  <TableCell sx={{ fontSize: '0.82rem' }}>{row.tat}</TableCell>
                  <TableCell sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#059669' }}>{row.sla}</TableCell>
                  <TableCell>
                    <Chip
                      label={row.rating}
                      size="small"
                      sx={{ fontSize: '0.72rem', fontWeight: 800, backgroundColor: `${row.color}15`, color: row.color }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      {/* Tab 2: Predictive Reverification Risk (Drift Engine) */}
      {activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} lg={7}>
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: '10px', height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Zap size={20} color="#dc2626" />
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                  AI Predictive Calibration Drift Model (IoT + Aging Curves)
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
                Predicts measurement drift beyond statutory MPE limits before consumers are shortchanged.
              </Typography>
              <Box sx={{ height: 280 }}>
                <Line data={driftTrendData} options={{ responsive: true, maintainAspectRatio: false }} />
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} lg={5}>
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: '10px', height: '100%' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 2 }}>
                High Drift Risk Instruments (Early Notice Dispatched)
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {instruments.map((inst) => (
                  <Box
                    key={inst.id}
                    sx={{
                      p: 1.8,
                      borderRadius: '10px',
                      backgroundColor: inst.isAtDriftRisk ? '#fff5f5' : '#f8fafc',
                      border: inst.isAtDriftRisk ? '1px solid #fecaca' : '1px solid #e2e8f0'
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                          {inst.businessName}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                          {inst.instrumentType} • {inst.id}
                        </Typography>
                      </Box>
                      {inst.isAtDriftRisk ? (
                        <Chip label="HIGH RISK (DRIFT)" size="small" sx={{ fontSize: '0.65rem', fontWeight: 800, backgroundColor: '#fee2e2', color: '#b91c1c' }} />
                      ) : (
                        <Chip label="HEALTHY" size="small" sx={{ fontSize: '0.65rem', fontWeight: 700, backgroundColor: '#ecfdf5', color: '#059669' }} />
                      )}
                    </Box>
                    <Typography variant="caption" sx={{ display: 'block', mt: 0.8, color: '#475569' }}>
                      Trust Score: <strong>{inst.trustScore}/100</strong> • Last verified: 14 months ago
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Tab 3: Certificate Register & Revocation */}
      {activeTab === 3 && (
        <Paper variant="outlined" sx={{ borderRadius: '10px', overflow: 'hidden' }}>
          <Box sx={{ p: 2.5, backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
              Master Digital Certificate Register &amp; Revocation Console
            </Typography>
          </Box>
          <Table>
            <TableHead sx={{ backgroundColor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Certificate No.</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Business Name</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Instrument</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Issue Date</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Expiry Date</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Admin Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {certificates.map((cert) => (
                <TableRow key={cert.id} hover>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.82rem', color: '#1e40af' }}>
                    {cert.certificateNumber}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.82rem' }}>
                    {cert.instrument?.businessName || 'Sundar Industries Pvt Ltd'}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.82rem' }}>
                    {cert.instrument?.instrumentType || 'Non-Automatic Weighing Instruments'}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.78rem' }}>{cert.issueDate}</TableCell>
                  <TableCell sx={{ fontSize: '0.78rem', fontWeight: 700 }}>{cert.expiryDate}</TableCell>
                  <TableCell>
                    <Chip
                      label={cert.status}
                      size="small"
                      sx={{
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        backgroundColor: cert.status === 'VALID' ? '#ecfdf5' : '#fee2e2',
                        color: cert.status === 'VALID' ? '#059669' : '#dc2626'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Ban size={13} />}
                      onClick={() => {
                        setSelectedCert(cert);
                        setRevokeOpen(true);
                      }}
                      sx={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: '#dc2626',
                        borderColor: '#fecaca',
                        py: 0.3
                      }}
                    >
                      Revoke
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      {/* Revoke Certificate Modal */}
      <Dialog
        open={revokeOpen}
        onClose={() => setRevokeOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px' } }}
      >
        <DialogTitle sx={{ backgroundColor: '#fff5f5', borderBottom: '1px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Ban size={20} color="#dc2626" />
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#991b1b' }}>
              Confirm Certificate Revocation ({selectedCert?.certificateNumber})
            </Typography>
          </Box>
          <Button onClick={() => setRevokeOpen(false)} size="small" sx={{ minWidth: 32, p: 0.5 }}>
            <X size={18} />
          </Button>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <Alert severity="error" sx={{ mb: 2.5, borderRadius: '10px' }}>
            Revoking this certificate immediately flags the instrument as UNVERIFIED on the public registry, notifies the owner, and triggers Legal Metrology enforcement.
          </Alert>

          <TextField
            label="Statutory Reason for Revocation"
            fullWidth
            multiline
            rows={3}
            size="small"
            value={revokeReason}
            onChange={(e) => setRevokeReason(e.target.value)}
          />
        </DialogContent>

        <DialogActions sx={{ p: 2, backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
          <Button onClick={() => setRevokeOpen(false)} sx={{ color: '#64748b' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleRevoke}
            sx={{ backgroundColor: '#dc2626', fontWeight: 700, '&:hover': { backgroundColor: '#b91c1c' } }}
          >
            Confirm Statutory Revocation
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
