import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Button,
  Paper,
  Chip,
  Card,
  CardContent,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell
} from '@mui/material';
import {
  FileText,
  BadgeCheck,
  AlertTriangle,
  Clock,
  Scale,
  Users,
  Layers,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Activity,
  Eye,
  CheckCircle2,
  Sparkles,
  BarChart3,
  Calendar,
  UserCheck,
  Building2
} from 'lucide-react';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler
} from 'chart.js';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ApiService } from '../../services/api';
import { useLanguage } from '../../contexts/LanguageContext';
import { ApplicationDetailPage } from '../shared/ApplicationDetailPage';
import { InstrumentDetailPage } from '../shared/InstrumentDetailPage';
import { VerificationApplication, Instrument, Certificate } from '../../types';

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

interface AdminDashboardProps {
  onNavigate: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const [applications, setApplications] = useState<VerificationApplication[]>([]);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [selectedInst, setSelectedInst] = useState<Instrument | null>(null);

  const loadData = () => {
    const apps = ApiService.getApplications();
    const insts = ApiService.getInstruments();
    const certs = ApiService.getCertificates();
    setApplications(apps);
    setInstruments(insts);
    setCertificates(certs);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenApp = (app: VerificationApplication) => {
    setSelectedAppId(app.id);
  };

  const handleOpenInst = (inst: Instrument) => {
    setSelectedInst(inst);
  };

  // If an instrument is selected, render it as a full page
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

  // If an application is selected, render it as a full page
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

  // Donut Chart 1: Applications by status
  const appStatusData = {
    labels: ['Certificate Generated', 'Submitted', 'Scheduled', 'Under Scrutiny'],
    datasets: [
      {
        data: [10, 3, 2, 2],
        backgroundColor: ['#1e3a8a', '#2563eb', '#60a5fa', '#93c5fd'],
        borderColor: ['#ffffff', '#ffffff', '#ffffff', '#ffffff'],
        borderWidth: 2,
        cutout: '65%'
      }
    ]
  };

  // Donut Chart 2: Certificate validity mix
  const certValidityData = {
    labels: ['Valid', 'Expiring ≤ 90 days', 'Expired', 'Canceled'],
    datasets: [
      {
        data: [8, 3, 1, 0],
        backgroundColor: ['#10b981', '#f59e0b', '#dc2626', '#94a3b8'],
        borderColor: ['#ffffff', '#ffffff', '#ffffff', '#ffffff'],
        borderWidth: 2,
        cutout: '65%'
      }
    ]
  };

  // Bar Chart 3: Instruments by district (Tamil Nadu Districts)
  const districtChartData = {
    labels: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli'],
    datasets: [
      {
        label: 'Instruments',
        data: [10, 8, 5, 3],
        backgroundColor: '#1e3a8a',
        borderRadius: 4,
        barThickness: 45
      }
    ]
  };

  const districtChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
        ticks: { stepSize: 2 }
      },
      x: {
        grid: { display: false }
      }
    }
  };

  // Line/Area Chart 4: Certificates issued — last 6 months
  const certHistoryData = {
    labels: ['Apr 2026', 'May 2026', 'Jun 2026', 'Jul 2026', 'Aug 2026', 'Sep 2026'],
    datasets: [
      {
        label: 'Certificates',
        data: [0, 4, 0, 0, 2, 1],
        fill: true,
        backgroundColor: 'rgba(219, 234, 254, 0.45)',
        borderColor: '#1e3a8a',
        borderWidth: 2,
        tension: 0.4,
        pointBackgroundColor: '#1e3a8a',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4
      }
    ]
  };

  const certHistoryOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 4,
        ticks: { stepSize: 1 }
      },
      x: {
        grid: { display: false }
      }
    }
  };

  // Stacked Bar Chart 5: LMO workload — open vs completed (Tamil Nadu Officers)
  const lmoWorkloadData = {
    labels: ['K. Murugan (LMO)', 'N. Selvakumar (LMO)', 'R. Jayachandran (LMO)'],
    datasets: [
      {
        label: 'Open',
        data: [1, 2, 1],
        backgroundColor: '#d97706',
        borderRadius: 4,
        barThickness: 38
      },
      {
        label: 'Completed',
        data: [12, 8, 6],
        backgroundColor: '#15803d',
        borderRadius: 4,
        barThickness: 38
      }
    ]
  };

  const lmoWorkloadOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { boxWidth: 12, font: { size: 11, weight: '600' as any } }
      }
    },
    scales: {
      x: {
        stacked: true,
        grid: { display: false }
      },
      y: {
        stacked: true,
        beginAtZero: true,
        max: 14,
        ticks: { stepSize: 2 }
      }
    }
  };

  // Donut Chart 6: Predictive drift risk (Instruments with ≥2 verifications)
  const driftRiskData = {
    labels: ['Stable', 'Drifting', 'High risk'],
    datasets: [
      {
        data: [6, 1, 1],
        backgroundColor: ['#15803d', '#d97706', '#b91c1c'],
        borderColor: ['#ffffff', '#ffffff', '#ffffff'],
        borderWidth: 2,
        cutout: '65%'
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          boxWidth: 12,
          usePointStyle: true,
          font: { size: 11, weight: '600' as any }
        }
      }
    }
  };

  // Pending allocation applications
  const pendingAllocations = applications.filter(
    a => a.status === 'SUBMITTED' || a.status === 'APPROVED' || a.status === 'IN_SCRUTINY'
  );

  return (
    <Box sx={{ p: { xs: 2, md: 3.5 } }}>
      {/* Top Header Title & Admin Badge */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 1.5,
          mb: 3
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            <Activity size={24} color="#1e40af" />
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: '#0f172a',
                fontFamily: '"Outfit", sans-serif',
                letterSpacing: '-0.5px'
              }}
            >
              {t('dashboard', 'Dashboard')}
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.3 }}>
            {t('manage_sub', 'Overview of instruments, applications, certificates and compliance.')}
          </Typography>
        </Box>

        <Chip
          icon={<Users size={14} color="#1e40af" />}
          label={t('admin', 'Department Admin • State Directorate')}
          sx={{
            fontWeight: 700,
            fontSize: '0.78rem',
            backgroundColor: '#eff6ff',
            color: '#1e40af',
            border: '1px solid #bfdbfe',
            py: 0.5
          }}
        />
      </Box>

      {/* 11 Metric Cards Grid */}
      <Grid container spacing={2} sx={{ mb: 3.5 }}>
        {/* Row 1 */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="REGISTERED INSTRUMENTS"
            value={12}
            icon={FileText}
            accentColor="#2563eb"
            onClick={() => onNavigate('instruments')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="VALID CERTIFICATES"
            value={8}
            icon={BadgeCheck}
            accentColor="#10b981"
            onClick={() => onNavigate('certificates')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="APPLICATIONS IN SCRUTINY"
            value={2}
            icon={FileText}
            accentColor="#f59e0b"
            onClick={() => onNavigate('applications')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="VERIFICATION IN PROGRESS"
            value={2}
            icon={Clock}
            accentColor="#8b5cf6"
            onClick={() => onNavigate('applications')}
          />
        </Grid>

        {/* Row 2 */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="AWAITING ALLOCATION"
            value={1}
            icon={Clock}
            accentColor="#ef4444"
            onClick={() => onNavigate('applications')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="EXPIRING ≤ 90 DAYS"
            value={3}
            icon={Clock}
            accentColor="#f97316"
            onClick={() => onNavigate('certificates')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="EXPIRED"
            value={1}
            icon={AlertTriangle}
            accentColor="#991b1b"
            onClick={() => onNavigate('certificates')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="TOTAL APPLICATIONS"
            value={applications.length || 15}
            icon={Layers}
            accentColor="#3b82f6"
            onClick={() => onNavigate('applications')}
          />
        </Grid>

        {/* Row 3 - Alerts & SLA Breaches */}
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="INSTRUMENTS AT DRIFT RISK"
            value={2}
            icon={AlertTriangle}
            accentColor="#a855f7"
            onClick={() => onNavigate('reports')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="OPEN CITIZEN REPORTS"
            value={3}
            icon={Users}
            accentColor="#06b6d4"
            onClick={() => onNavigate('citizen_reports')}
          />
        </Grid>
        <Grid item xs={12} sm={12} md={4}>
          <StatCard
            title="SLA BREACHES"
            value={1}
            badgeText="(VIEW)"
            icon={ShieldAlert}
            accentColor="#f43f5e"
            onClick={() => onNavigate('sla')}
          />
        </Grid>
      </Grid>

      {/* 6 Analytics Charts Grid (2 columns matching screenshots) */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        {/* Row 1, Chart 1: Applications by status */}
        <Grid item xs={12} md={6}>
          <Paper
            variant="outlined"
            sx={{
              p: 2.5,
              borderRadius: '10px',
              backgroundColor: '#ffffff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              height: 340,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.88rem' }}>
              Applications by status
            </Typography>

            <Box sx={{ position: 'relative', height: 260 }}>
              <Doughnut data={appStatusData} options={chartOptions} />
            </Box>
          </Paper>
        </Grid>

        {/* Row 1, Chart 2: Certificate validity mix */}
        <Grid item xs={12} md={6}>
          <Paper
            variant="outlined"
            sx={{
              p: 2.5,
              borderRadius: '10px',
              backgroundColor: '#ffffff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              height: 340,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.88rem' }}>
              Certificate validity mix
            </Typography>

            <Box sx={{ position: 'relative', height: 260 }}>
              <Doughnut data={certValidityData} options={chartOptions} />
            </Box>
          </Paper>
        </Grid>

        {/* Row 2, Chart 3: Instruments by district */}
        <Grid item xs={12} md={6}>
          <Paper
            variant="outlined"
            sx={{
              p: 2.5,
              borderRadius: '10px',
              backgroundColor: '#ffffff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              height: 340,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.88rem' }}>
              Instruments by district
            </Typography>

            <Box sx={{ height: 260 }}>
              <Bar data={districtChartData} options={districtChartOptions} />
            </Box>
          </Paper>
        </Grid>

        {/* Row 2, Chart 4: Certificates issued — last 6 months */}
        <Grid item xs={12} md={6}>
          <Paper
            variant="outlined"
            sx={{
              p: 2.5,
              borderRadius: '10px',
              backgroundColor: '#ffffff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              height: 340,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.88rem' }}>
              Certificates issued — last 6 months
            </Typography>

            <Box sx={{ height: 260 }}>
              <Line data={certHistoryData} options={certHistoryOptions} />
            </Box>
          </Paper>
        </Grid>

        {/* Row 3, Chart 5: LMO workload — open vs completed */}
        <Grid item xs={12} md={6}>
          <Paper
            variant="outlined"
            sx={{
              p: 2.5,
              borderRadius: '10px',
              backgroundColor: '#ffffff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              height: 340,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.88rem' }}>
              LMO workload — open vs completed
            </Typography>

            <Box sx={{ height: 260 }}>
              <Bar data={lmoWorkloadData} options={lmoWorkloadOptions} />
            </Box>
          </Paper>
        </Grid>

        {/* Row 3, Chart 6: Predictive drift risk */}
        <Grid item xs={12} md={6}>
          <Paper
            variant="outlined"
            sx={{
              p: 2.5,
              borderRadius: '10px',
              backgroundColor: '#ffffff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              height: 340,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.88rem' }}>
              Predictive drift risk (Instruments with ≥2 verifications)
            </Typography>

            <Box sx={{ position: 'relative', height: 230 }}>
              <Doughnut data={driftRiskData} options={chartOptions} />
            </Box>

            <Box sx={{ pt: 1, textAlign: 'left' }}>
              <Typography
                variant="caption"
                onClick={() => onNavigate('reports')}
                sx={{
                  color: '#1e40af',
                  fontWeight: 700,
                  cursor: 'pointer',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                See at-risk instruments »
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Analytics Tables Grid (Officer Workload & District-wise Instruments) */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {/* Officer Workload Table */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ borderRadius: '10px', backgroundColor: '#ffffff', overflow: 'hidden' }}>
            <Box sx={{ p: 2, px: 2.5, backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                {t('officer', 'Officer')} {t('workload', 'workload')}
              </Typography>
            </Box>
            <Table size="small">
              <TableHead sx={{ backgroundColor: '#f1f5f9' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#475569' }}>{t('lmo_officer', 'LMO')}</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#475569' }}>{t('jurisdiction', 'Jurisdiction')}</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#475569' }}>{t('open', 'Open')}</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#475569' }}>{t('done', 'Done')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow hover>
                  <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a' }}>K. Murugan (LMO)</TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', color: '#475569' }}>Chennai (Central &amp; Harbor)</TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#d97706' }}>1</TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#15803d' }}>12</TableCell>
                </TableRow>
                <TableRow hover>
                  <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a' }}>N. Selvakumar (LMO)</TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', color: '#475569' }}>Coimbatore (Peelamedu &amp; North)</TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#d97706' }}>2</TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#15803d' }}>8</TableCell>
                </TableRow>
                <TableRow hover>
                  <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a' }}>R. Jayachandran (LMO)</TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', color: '#475569' }}>Madurai (South Avani Moola St)</TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#d97706' }}>1</TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#15803d' }}>6</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Paper>
        </Grid>

        {/* District-wise instruments Table */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ borderRadius: '10px', backgroundColor: '#ffffff', overflow: 'hidden' }}>
            <Box sx={{ p: 2, px: 2.5, backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                {t('district', 'District')}-wise {t('instruments', 'instruments')}
              </Typography>
            </Box>
            <Table size="small">
              <TableHead sx={{ backgroundColor: '#f1f5f9' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#475569' }}>{t('district', 'District')}</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#475569' }}>{t('instruments', 'Instruments')}</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#475569' }}>{t('valid_certificates', 'Valid Certs')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow hover>
                  <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a' }}>Chennai</TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', color: '#475569' }}>10</TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#15803d' }}>8</TableCell>
                </TableRow>
                <TableRow hover>
                  <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a' }}>Coimbatore</TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', color: '#475569' }}>8</TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#15803d' }}>6</TableCell>
                </TableRow>
                <TableRow hover>
                  <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a' }}>Madurai</TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', color: '#475569' }}>5</TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#15803d' }}>4</TableCell>
                </TableRow>
                <TableRow hover>
                  <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a' }}>Tiruchirappalli</TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', color: '#475569' }}>3</TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#15803d' }}>2</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Paper>
        </Grid>
      </Grid>

      {/* Pending Allocation Table */}
      <Paper variant="outlined" sx={{ borderRadius: '10px', backgroundColor: '#ffffff', overflow: 'hidden', mb: 3 }}>
        <Box sx={{ p: 2, px: 2.5, backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
            {t('awaiting_allocation', 'Pending allocation')}
          </Typography>
        </Box>
        {pendingAllocations.length === 0 ? (
          <Box sx={{ p: 2.5, color: '#64748b', fontSize: '0.85rem' }}>
            {t('no_records', 'Nothing awaiting allocation.')}
          </Box>
        ) : (
          <Table size="small">
            <TableHead sx={{ backgroundColor: '#f1f5f9' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#475569' }}>{t('app_no', 'App No.')}</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#475569' }}>{t('instrument', 'Instrument')}</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#475569' }}>{t('type', 'Type')}</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#475569' }}>{t('district', 'District')}</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#475569' }}>{t('filed_on', 'Filed')}</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#475569' }}>{t('action', 'Action')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingAllocations.map(app => (
                <TableRow key={app.id} hover>
                  <TableCell sx={{ fontWeight: 800, fontSize: '0.8rem', color: '#1e40af' }}>
                    {app.id}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>
                    {app.instrument?.businessName || app.instrumentId}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', color: '#475569' }}>
                    {t(app.applicationType, app.applicationType.replace(/_/g, ' '))}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', color: '#475569' }}>
                    {app.instrument?.installationAddress?.includes('Coimbatore')
                      ? 'Coimbatore'
                      : app.instrument?.installationAddress?.includes('Madurai')
                      ? 'Madurai'
                      : app.instrument?.installationAddress?.includes('Thanjavur')
                      ? 'Thanjavur'
                      : 'Chennai'}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {app.filedOn}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      onClick={() => handleOpenApp(app)}
                      sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.75rem', color: '#1e40af', p: 0 }}
                    >
                      {t('allocate', 'Allocate')}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

    </Box>
  );
};
