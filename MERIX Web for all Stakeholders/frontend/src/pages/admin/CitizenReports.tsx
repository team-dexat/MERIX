import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableHead, TableBody,
  TableRow, TableCell, Button, Chip
} from '@mui/material';
import { AlertTriangle, Eye } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ApiService } from '../../services/api';
import { CitizenReport } from '../../types';

export const CitizenReports: React.FC = () => {
  const [reports, setReports] = useState<CitizenReport[]>([]);

  const loadData = () => setReports(ApiService.getCitizenReports());

  useEffect(() => { loadData(); }, []);

  const handleResolve = (id: string) => {
    ApiService.updateCitizenReportStatus(id, 'ACTION_TAKEN', 'Inspection dispatched. Non-compliance notice issued to business owner.');
    loadData();
  };

  const issueCategoryColors: Record<string, string> = {
    SHORT_WEIGHT: '#ef4444',
    BROKEN_SEAL: '#f97316',
    UNVERIFIED_DEVICE: '#8b5cf6',
    EXPIRED_STAMP: '#f59e0b',
    ALTERED_MEASURE: '#dc2626'
  };

  return (
    <Box sx={{ p: 3.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
        <AlertTriangle size={24} color="#ef4444" />
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>Citizen Reports & Fraud Alerts</Typography>
      </Box>
      <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
        Public complaints about faulty instruments, broken seals, and weighing fraud. Each report impacts the instrument's trust score.
      </Typography>

      <Paper variant="outlined" sx={{ borderRadius: '16px', overflow: 'hidden' }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Report ID</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Business</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Issue Type</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Reported By</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Filed</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reports.map(rep => (
              <TableRow key={rep.id} hover>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.82rem', color: '#dc2626' }}>{rep.id}</TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{rep.businessName}</Typography>
                  {rep.instrumentId && (
                    <Typography variant="caption" sx={{ color: '#64748b' }}>{rep.instrumentId}</Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Chip
                    label={rep.issueCategory.replace(/_/g, ' ')}
                    size="small"
                    sx={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      height: 22,
                      backgroundColor: `${issueCategoryColors[rep.issueCategory]}18`,
                      color: issueCategoryColors[rep.issueCategory],
                      border: `1px solid ${issueCategoryColors[rep.issueCategory]}40`
                    }}
                  />
                </TableCell>
                <TableCell sx={{ fontSize: '0.82rem' }}>{rep.reportedByName}</TableCell>
                <TableCell sx={{ fontSize: '0.78rem', color: '#475569', maxWidth: 200 }}>
                  <Typography variant="caption" sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {rep.description}
                  </Typography>
                </TableCell>
                <TableCell><StatusBadge status={rep.status} /></TableCell>
                <TableCell sx={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                  {rep.createdAt?.split(' ')[0]}
                </TableCell>
                <TableCell>
                  {rep.status === 'OPEN' && (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleResolve(rep.id)}
                      sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#b45309', borderColor: '#fde68a', py: 0.3 }}
                    >
                      Take Action
                    </Button>
                  )}
                  {rep.status !== 'OPEN' && (
                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>{rep.status.replace(/_/g, ' ')}</Typography>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};
