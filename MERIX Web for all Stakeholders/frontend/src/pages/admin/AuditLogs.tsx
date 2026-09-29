import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableHead, TableBody,
  TableRow, TableCell, Button, Chip, Avatar
} from '@mui/material';
import { History, ShieldCheck, User, FileText } from 'lucide-react';
import { ApiService } from '../../services/api';
import { AuditLog } from '../../types';

const actionColors: Record<string, string> = {
  REGISTER_INSTRUMENT: '#2563eb',
  SUBMIT_APPLICATION: '#10b981',
  SCRUTINY_PASS: '#f59e0b',
  ALLOCATE_APPLICATION: '#8b5cf6',
  GENERATE_CERTIFICATE: '#059669',
  SUBMIT_CITIZEN_REPORT: '#ef4444',
  UPDATE_STATUS_CERTIFICATE_GENERATED: '#059669',
};

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    setLogs(ApiService.getAuditLogs());
  }, []);

  return (
    <Box sx={{ p: 3.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
        <History size={24} color="#1e40af" />
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>Immutable Audit Trail</Typography>
      </Box>
      <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
        Cryptographic SHA-256 hash chain of every governance, verification and certification action performed in the system.
      </Typography>

      <Paper variant="outlined" sx={{ borderRadius: '16px', overflow: 'hidden' }}>
        <Table size="small">
          <TableHead sx={{ backgroundColor: '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Timestamp</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Actor</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Role</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Action</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Resource</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Details</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Hash</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map(log => (
              <TableRow key={log.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                <TableCell sx={{ fontSize: '0.76rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                  {log.timestamp}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 24, height: 24, fontSize: '0.7rem', bgcolor: '#eff6ff', color: '#1e40af' }}>
                      {log.actorName.charAt(0)}
                    </Avatar>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>{log.actorName}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={log.actorRole.replace(/_/g, ' ')}
                    size="small"
                    sx={{ fontSize: '0.65rem', fontWeight: 700, backgroundColor: '#f1f5f9', color: '#475569', height: 20 }}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={log.actionType.replace(/_/g, ' ')}
                    size="small"
                    sx={{
                      fontSize: '0.67rem',
                      fontWeight: 700,
                      height: 22,
                      backgroundColor: `${actionColors[log.actionType] || '#64748b'}18`,
                      color: actionColors[log.actionType] || '#64748b',
                      border: `1px solid ${actionColors[log.actionType] || '#64748b'}40`
                    }}
                  />
                </TableCell>
                <TableCell sx={{ fontSize: '0.76rem' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#0f172a' }}>{log.resourceType}</Typography><br />
                  <Typography variant="caption" sx={{ color: '#64748b' }}>{log.resourceId}</Typography>
                </TableCell>
                <TableCell sx={{ fontSize: '0.75rem', color: '#475569', maxWidth: 220 }}>
                  <Typography variant="caption" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {log.details}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    variant="caption"
                    sx={{ fontFamily: 'monospace', fontSize: '0.65rem', color: '#94a3b8', letterSpacing: '-0.5px' }}
                  >
                    {log.payloadHash}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};
