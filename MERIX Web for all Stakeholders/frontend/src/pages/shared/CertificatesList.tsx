import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Chip
} from '@mui/material';
import { BadgeCheck, Download, Eye, QrCode } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DigitalCertificateModal } from '../../components/certificates/DigitalCertificateModal';
import { QrCodeModal } from '../../components/common/QrCodeModal';
import { ApiService } from '../../services/api';
import { Certificate } from '../../types';

interface CertificatesListProps {
  userId?: string; // if set, shows only user's certs
  isAdmin?: boolean;
}

export const CertificatesList: React.FC<CertificatesListProps> = ({ userId, isAdmin }) => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);

  useEffect(() => {
    let certs = ApiService.getCertificates(userId);
    if (!isAdmin && certs.length === 0) {
      certs = ApiService.getCertificates('USR-001');
    }
    setCertificates(certs);
  }, [userId, isAdmin]);

  const handleView = (cert: Certificate) => {
    setSelectedCert(cert);
    setCertModalOpen(true);
  };

  const handleQr = (cert: Certificate) => {
    setSelectedCert(cert);
    setQrOpen(true);
  };

  const filteredCerts = filterStatus === 'ALL'
    ? certificates
    : certificates.filter(c => c.status === filterStatus);

  const stats = [
    { key: 'ALL', label: 'All Certificates', count: certificates.length, color: '#1e40af' },
    { key: 'VALID', label: 'Valid / Active', count: certificates.filter(c => c.status === 'VALID').length, color: '#10b981' },
    { key: 'EXPIRING_SOON', label: 'Expiring Soon', count: certificates.filter(c => c.status === 'EXPIRING_SOON').length, color: '#f59e0b' },
    { key: 'EXPIRED', label: 'Expired / Expired', count: certificates.filter(c => c.status === 'EXPIRED').length, color: '#ef4444' }
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3.5 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
        <BadgeCheck size={26} color="#10b981" />
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', fontFamily: '"Outfit", sans-serif' }}>
          {isAdmin ? 'Issued Legal Metrology Certificates' : 'My Verification Certificates'}
        </Typography>
      </Box>
      <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
        Tamper-evident digital certificates with cryptographic SHA-256 chain block hashes and holographic QR verification. Click any card below to filter.
      </Typography>

      {/* Clickable Interactive Summary Filter Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        {stats.map(stat => {
          const isSelected = filterStatus === stat.key;
          return (
            <Grid item xs={6} sm={3} key={stat.key}>
              <Paper
                elevation={0}
                onClick={() => setFilterStatus(stat.key)}
                sx={{
                  p: 2.2,
                  border: isSelected ? `2.5px solid ${stat.color}` : '1px solid #e2e8f0',
                  borderRadius: '12px',
                  textAlign: 'center',
                  borderTop: `4px solid ${stat.color}`,
                  backgroundColor: isSelected ? '#f8fafc' : '#ffffff',
                  cursor: 'pointer',
                  boxShadow: isSelected ? '0 4px 15px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
                  }
                }}
              >
                <Typography variant="h4" sx={{ fontWeight: 900, color: stat.color, fontFamily: '"Outfit", sans-serif' }}>
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
      <Paper variant="outlined" sx={{ borderRadius: '14px', overflow: 'hidden', backgroundColor: '#ffffff' }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Certificate No.</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Enterprise / User</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Instrument Details</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Issue Date</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Expiry Date</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Stamp Seal ID</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCerts.map(cert => (
              <TableRow key={cert.id} hover sx={{ cursor: 'pointer' }} onClick={() => handleView(cert)}>
                <TableCell sx={{ fontWeight: 800, fontSize: '0.82rem', color: '#1e40af' }}>
                  {cert.certificateNumber}
                </TableCell>
                <TableCell sx={{ fontSize: '0.82rem' }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {cert.instrument?.businessName || 'Sundar Industries Pvt Ltd'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    {cert.instrument?.installationAddress || 'Chennai'}
                  </Typography>
                </TableCell>
                <TableCell sx={{ fontSize: '0.82rem' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {cert.instrument?.instrumentType || 'Platform / Bench Scale'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    SN: {cert.instrument?.serialNumber || cert.instrumentId} • Max {cert.instrument?.maxCapacity || '300 kg'}
                  </Typography>
                </TableCell>
                <TableCell sx={{ fontSize: '0.82rem', color: '#475569' }}>{cert.issueDate}</TableCell>
                <TableCell sx={{ fontSize: '0.82rem', fontWeight: 800, color: cert.status === 'EXPIRING_SOON' ? '#b45309' : '#047857' }}>
                  {cert.expiryDate}
                </TableCell>
                <TableCell>
                  <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#059669', fontWeight: 800 }}>
                    {cert.stampId}
                  </Typography>
                </TableCell>
                <TableCell>
                  <StatusBadge status={cert.status} />
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Box sx={{ display: 'flex', gap: 0.8 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Eye size={13} />}
                      onClick={() => handleView(cert)}
                      sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#1e40af', borderColor: '#bfdbfe', py: 0.3 }}
                    >
                      View
                    </Button>
                    <Button
                      size="small"
                      startIcon={<QrCode size={13} />}
                      onClick={() => handleQr(cert)}
                      sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', py: 0.3 }}
                    >
                      QR
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {filteredCerts.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} sx={{ textAlign: 'center', py: 5, color: '#94a3b8', fontWeight: 600 }}>
                  No certificates found matching the filter "{filterStatus}".
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <DigitalCertificateModal open={certModalOpen} onClose={() => setCertModalOpen(false)} certificate={selectedCert} />
      <QrCodeModal
        open={qrOpen}
        onClose={() => setQrOpen(false)}
        title={selectedCert?.certificateNumber || ''}
        subtitle={`${selectedCert?.instrument?.instrumentType} · ${selectedCert?.instrument?.businessName}`}
        qrValue={selectedCert ? `https://merix-web.vercel.app/verify/${selectedCert.certificateNumber}` : 'https://merix-web.vercel.app/verify'}
        badgeText="Valid Verification Certificate"
      />
    </Box>
  );
};
