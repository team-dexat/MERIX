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
  Chip,
  TextField,
  MenuItem
} from '@mui/material';
import { FileText, Eye, Filter, Scale } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ApplicationDetailPage } from '../shared/ApplicationDetailPage';
import { InstrumentDetailPage } from '../shared/InstrumentDetailPage';
import { ApiService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { VerificationApplication, Instrument } from '../../types';

interface ApplicationsManagementProps {
  initialApplicationId?: string | null;
  onClearInitialAppId?: () => void;
}

export const ApplicationsManagement: React.FC<ApplicationsManagementProps> = ({
  initialApplicationId,
  onClearInitialAppId
}) => {
  const { user, role } = useAuth();
  const [applications, setApplications] = useState<VerificationApplication[]>([]);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedAppId, setSelectedAppId] = useState<string | null>(initialApplicationId || null);
  const [selectedInst, setSelectedInst] = useState<Instrument | null>(null);

  const isAdmin = role === 'ADMIN';

  const loadData = () => {
    const apps = isAdmin ? ApiService.getApplications() : ApiService.getApplications(user?.id);
    setApplications(apps);
  };

  useEffect(() => {
    loadData();
  }, [user, role]);

  useEffect(() => {
    if (initialApplicationId) {
      setSelectedAppId(initialApplicationId);
    }
  }, [initialApplicationId]);

  const handleOpenAppDetail = (app: VerificationApplication) => {
    setSelectedAppId(app.id);
  };

  const handleOpenInstrumentFromApp = (instrumentId: string) => {
    const found = ApiService.getInstrumentById(instrumentId);
    if (found) {
      setSelectedInst(found);
    }
  };

  const handleBackToList = () => {
    setSelectedAppId(null);
    if (onClearInitialAppId) onClearInitialAppId();
    loadData();
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
        onBack={handleBackToList}
        onOpenInstrument={handleOpenInstrumentFromApp}
      />
    );
  }

  const filtered = filterStatus === 'ALL' ? applications : applications.filter(a => a.status === filterStatus);

  return (
    <Box sx={{ p: { xs: 2, md: 3.5 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', fontFamily: '"Outfit", sans-serif' }}>
            {isAdmin ? 'Applications Scrutiny & Verification Pipeline' : 'My Verification Applications'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.3 }}>
            {isAdmin
              ? 'Review submitted verification requests, take up scrutiny, allocate testing officers, and manage approval lifecycle.'
              : 'Track the status and progress of all your submitted verification applications.'}
          </Typography>
        </Box>
      </Box>

      {/* Filter Chips Bar */}
      <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
        {['ALL', 'SUBMITTED', 'IN_SCRUTINY', 'APPROVED', 'SCHEDULED', 'IN_VERIFICATION', 'CERTIFICATE_GENERATED', 'REJECTED'].map(s => (
          <Chip
            key={s}
            label={`${s.replace(/_/g, ' ')} (${s === 'ALL' ? applications.length : applications.filter(a => a.status === s).length})`}
            onClick={() => setFilterStatus(s)}
            sx={{
              fontWeight: 700,
              fontSize: '0.75rem',
              backgroundColor: filterStatus === s ? '#1e40af' : '#ffffff',
              color: filterStatus === s ? '#ffffff' : '#475569',
              border: filterStatus === s ? '1px solid #1e40af' : '1px solid #e2e8f0',
              cursor: 'pointer',
              borderRadius: '8px',
              py: 0.5
            }}
          />
        ))}
      </Box>

      {/* Applications Table with Clickable Rows */}
      <Paper variant="outlined" sx={{ borderRadius: '14px', overflow: 'hidden', backgroundColor: '#ffffff' }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Application ID</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Instrument ID</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Applicant / Business</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Verification Type</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Statutory Fee</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Current Status</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Filed Date</TableCell>
              {isAdmin && <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Action</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map(app => (
              <TableRow
                key={app.id}
                hover
                sx={{ cursor: 'pointer' }}
                onClick={() => handleOpenAppDetail(app)}
              >
                <TableCell sx={{ fontWeight: 800, fontSize: '0.82rem', color: '#1e40af' }}>
                  {app.id}
                </TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenInstrumentFromApp(app.instrumentId);
                    }}
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      color: '#2563eb',
                      '&:hover': { textDecoration: 'underline' }
                    }}
                  >
                    {app.instrumentId}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem' }}>
                    {app.instrument?.instrumentType || 'Measuring Scale'}
                  </Typography>
                </TableCell>
                <TableCell sx={{ fontSize: '0.82rem' }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {app.instrument?.businessName || 'Sundar Industries Pvt Ltd'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    {app.instrument?.installationAddress || 'Chennai'}
                  </Typography>
                </TableCell>
                <TableCell sx={{ fontSize: '0.78rem', color: '#334155', fontWeight: 600 }}>
                  {app.applicationType?.replace(/_/g, ' ')}
                  {app.attachedDocuments && app.attachedDocuments.length > 0 && (
                    <Box sx={{ mt: 0.3 }}>
                      <Chip
                        size="small"
                        icon={<FileText size={11} />}
                        label={`${app.attachedDocuments.length} Docs Attached`}
                        sx={{
                          height: 18,
                          fontSize: '0.64rem',
                          fontWeight: 700,
                          backgroundColor: '#eff6ff',
                          color: '#1e40af',
                          border: '1px solid #bfdbfe'
                        }}
                      />
                    </Box>
                  )}
                </TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#059669', fontSize: '0.82rem' }}>
                  ₹{app.calculatedFee} <span style={{ fontSize: '0.68rem', color: '#16a34a' }}>(Paid)</span>
                </TableCell>
                <TableCell>
                  <StatusBadge status={app.status} />
                </TableCell>
                <TableCell sx={{ fontSize: '0.78rem', color: '#64748b' }}>
                  {app.filedOn?.split(' ')[0]}
                </TableCell>
                {isAdmin && (
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Eye size={13} />}
                      onClick={() => handleOpenAppDetail(app)}
                      sx={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        borderColor: '#bfdbfe',
                        color: '#1e40af',
                        py: 0.4,
                        borderRadius: '8px',
                        textTransform: 'none',
                        '&:hover': { backgroundColor: '#eff6ff' }
                      }}
                    >
                      Scrutinize / View
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={isAdmin ? 8 : 7} sx={{ textAlign: 'center', py: 6, color: '#94a3b8', fontWeight: 600 }}>
                  No applications found matching the selected filter.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

    </Box>
  );
};
