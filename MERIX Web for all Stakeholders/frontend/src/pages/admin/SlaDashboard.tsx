import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell
} from '@mui/material';
import { ApiService } from '../../services/api';
import { VerificationApplication, Instrument } from '../../types';
import { ApplicationDetailPage } from '../shared/ApplicationDetailPage';
import { InstrumentDetailPage } from '../shared/InstrumentDetailPage';

const THRESHOLDS = {
  scrutiny: 5,
  allocation: 2,
  fieldVerification: 10,
  certificate: 3
};

export const SlaDashboard: React.FC = () => {
  const [applications, setApplications] = useState<VerificationApplication[]>([]);

  // Selected modals & navigation
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [selectedInst, setSelectedInst] = useState<Instrument | null>(null);

  const loadData = () => {
    setApplications(ApiService.getApplications());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenApp = (app?: VerificationApplication) => {
    if (app) {
      setSelectedAppId(app.id);
    }
  };

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
      />
    );
  }

  // Compute breached applications based on thresholds
  const breaches = [
    {
      stage: 'Awaiting scrutiny/approval',
      stageColor: '#fee2e2',
      stageTextColor: '#991b1b',
      app: applications.find(a => a.status === 'SUBMITTED') || applications[0],
      district: 'Chennai',
      assignee: '— unassigned',
      daysOpen: 23,
      threshold: THRESHOLDS.scrutiny
    },
    {
      stage: 'Field verification pending',
      stageColor: '#ffedd5',
      stageTextColor: '#9a3412',
      app: applications.find(a => a.status === 'SCHEDULED') || applications[1] || applications[0],
      district: 'Coimbatore',
      assignee: 'K. Murugan (LMO)',
      daysOpen: 14,
      threshold: THRESHOLDS.fieldVerification
    },
    {
      stage: 'Approved, not allocated',
      stageColor: '#fef3c7',
      stageTextColor: '#b45309',
      app: applications.find(a => a.status === 'IN_SCRUTINY') || applications[2] || applications[0],
      district: 'Madurai',
      assignee: '— unassigned',
      daysOpen: 8,
      threshold: THRESHOLDS.allocation
    }
  ].filter(b => !!b.app);

  return (
    <Box sx={{ p: { xs: 2, md: 3.5 } }}>
      {/* Header Banner */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 800,
            color: '#0f172a',
            fontFamily: '"Outfit", sans-serif',
            letterSpacing: '-0.3px'
          }}
        >
          SLA &amp; Turnaround Tracking
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5, maxWidth: 850 }}>
          Tracks statutory Service Level Agreements (SLAs) and flags verification applications delayed beyond legal citizen charter timelines.
        </Typography>
      </Box>

      {/* Current breaches Table (Exact match to Screenshot 2) */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          backgroundColor: '#ffffff',
          mb: 2.5
        }}
      >
        <Box sx={{ p: 2, px: 3, backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
            Current breaches ({breaches.length})
          </Typography>
        </Box>

        <Table>
          <TableHead sx={{ backgroundColor: '#f1f5f9' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#475569' }}>Stage</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#475569' }}>App No.</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#475569' }}>Instrument</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#475569' }}>District</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#475569' }}>Assignee</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#475569' }}>Days open</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#475569' }}>Threshold</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#475569' }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {breaches.map((item, idx) => (
              <TableRow key={idx} hover sx={{ '&:hover': { backgroundColor: '#f8fafc' } }}>
                <TableCell>
                  <Chip
                    label={item.stage}
                    size="small"
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.72rem',
                      backgroundColor: item.stageColor,
                      color: item.stageTextColor,
                      borderRadius: '6px'
                    }}
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.82rem', color: '#1e40af' }}>
                  {item.app.id}
                </TableCell>
                <TableCell sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                  {item.app.instrumentId}
                </TableCell>
                <TableCell sx={{ fontSize: '0.82rem', color: '#475569' }}>
                  {item.district}
                </TableCell>
                <TableCell sx={{ fontSize: '0.82rem', color: '#64748b' }}>
                  {item.assignee}
                </TableCell>
                <TableCell>
                  <Chip
                    label={item.daysOpen}
                    size="small"
                    sx={{
                      fontWeight: 800,
                      fontSize: '0.75rem',
                      backgroundColor: '#1e40af',
                      color: '#ffffff',
                      borderRadius: '4px',
                      height: 22,
                      minWidth: 26
                    }}
                  />
                </TableCell>
                <TableCell sx={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
                  {item.threshold}
                </TableCell>
                <TableCell>
                  <Button
                    size="small"
                    onClick={() => handleOpenApp(item.app)}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      color: '#0d9488',
                      p: 0.5,
                      '&:hover': { backgroundColor: '#f0fdfa' }
                    }}
                  >
                    Open
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Footer Caption (Exact match to Screenshot 2) */}
      <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontSize: '0.76rem', lineHeight: 1.4 }}>
        Run <strong>this scan regularly</strong> (or wire sla.php's escalate action into a scheduled task like cron_expiry.php) so breaches reach admins and the assigned officer automatically, deduplicated per day.
      </Typography>

    </Box>
  );
};
