import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, Paper, Grid, Button, Chip, Alert, Divider, LinearProgress
} from '@mui/material';
import {
  BadgeCheck, Download, Share2, ShieldCheck, CheckCircle2, XCircle,
  Scale, Calendar, MapPin, QrCode, Sparkles
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { ApiService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Certificate, Instrument } from '../../types';

export const VerifiedBadgePage: React.FC = () => {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [badgeEligible, setBadgeEligible] = useState(false);
  const [complianceScore, setComplianceScore] = useState(0);
  const badgeRef = useRef<HTMLDivElement>(null);

  const getExpiryDays = (expiryDate: string): number => {
    const today = new Date();
    const exp = new Date(expiryDate);
    return Math.floor((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  useEffect(() => {
    let insts = ApiService.getInstruments(user?.id);
    if (insts.length === 0) insts = ApiService.getInstruments('USR-001');

    let certs = ApiService.getCertificates(user?.id);
    if (certs.length === 0) certs = ApiService.getCertificates('USR-001');

    setInstruments(insts);
    setCertificates(certs);

    // Check eligibility: ALL instruments must have a valid, non-expiring certificate
    const validCerts = certs.filter(c => c.status === 'VALID' || c.status === 'EXPIRING_SOON');
    const validInstIds = new Set(validCerts.map(c => c.instrumentId));
    const allCovered = insts.every(inst => validInstIds.has(inst.id));
    const allValid = certs.every(c => {
      const days = getExpiryDays(c.expiryDate);
      return days > 7; // at least 7 days remaining
    });

    setBadgeEligible(allCovered && allValid && insts.length > 0);

    // Calculate compliance score
    if (insts.length === 0) {
      setComplianceScore(0);
      return;
    }
    const coveredCount = insts.filter(inst => validInstIds.has(inst.id)).length;
    const score = Math.round((coveredCount / insts.length) * 100);
    setComplianceScore(score);
  }, [user]);

  const businessName = user?.businessName || 'Sundar Industries Pvt Ltd';
  const badgeUrl = `https://merix.gov.in/badge/${user?.id || 'USR-001'}`;
  const validCerts = certificates.filter(c => c.status === 'VALID');
  const expiringSoon = certificates.filter(c => c.status === 'EXPIRING_SOON');
  const expired = certificates.filter(c => c.status === 'EXPIRED');

  const scoreColor = complianceScore >= 80 ? '#059669' : complianceScore >= 50 ? '#d97706' : '#dc2626';
  const scoreLabel = complianceScore >= 80 ? 'Excellent' : complianceScore >= 50 ? 'Moderate Risk' : 'Non-Compliant';

  return (
    <Box sx={{ p: { xs: 2, md: 3.5 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
        <Sparkles size={26} color="#d97706" />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', fontFamily: '"Outfit", sans-serif' }}>
            Verified Business Badge
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            Shareable digital badge for businesses with all instruments currently verified under Legal Metrology Act.
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mt: 0.5 }}>
        {/* Badge Preview */}
        <Grid item xs={12} md={5}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', border: '2px solid ' + (badgeEligible ? '#a7f3d0' : '#fecaca'), textAlign: 'center' }}>
            <Typography variant="overline" sx={{ color: '#64748b', fontWeight: 700, fontSize: '0.7rem', letterSpacing: 2 }}>
              YOUR COMPLIANCE BADGE
            </Typography>

            {/* Badge Graphic */}
            <Box ref={badgeRef} sx={{ my: 2 }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  p: 3,
                  borderRadius: '20px',
                  background: badgeEligible
                    ? 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)'
                    : 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
                  border: `2px solid ${badgeEligible ? '#10b981' : '#ef4444'}`,
                  boxShadow: badgeEligible
                    ? '0 8px 30px rgba(16,185,129,0.2)'
                    : '0 8px 30px rgba(239,68,68,0.15)',
                  minWidth: 220
                }}
              >
                <Box sx={{ mb: 1.5 }}>
                  {badgeEligible ? (
                    <BadgeCheck size={52} color="#059669" strokeWidth={1.8} />
                  ) : (
                    <XCircle size={52} color="#dc2626" strokeWidth={1.8} />
                  )}
                </Box>
                <Typography variant="h6" sx={{
                  fontWeight: 900, color: badgeEligible ? '#065f46' : '#991b1b',
                  fontFamily: '"Outfit", sans-serif', lineHeight: 1.2, textAlign: 'center'
                }}>
                  {badgeEligible ? 'LEGALLY VERIFIED' : 'COMPLIANCE PENDING'}
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: badgeEligible ? '#047857' : '#b91c1c', textAlign: 'center', mt: 0.3 }}>
                  {badgeEligible ? 'All Instruments Verified' : `${expired.length + expiringSoon.length} Certificate(s) Need Renewal`}
                </Typography>

                <Divider sx={{ width: '100%', my: 1.5, borderColor: badgeEligible ? '#a7f3d0' : '#fecaca' }} />

                <Typography variant="body2" sx={{ fontWeight: 800, color: '#0f172a', textAlign: 'center', fontSize: '0.82rem' }}>
                  {businessName}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.3 }}>
                  <Scale size={12} color="#64748b" />
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    Legal Metrology Act, 2009 · Govt of India
                  </Typography>
                </Box>

                {badgeEligible && (
                  <Box sx={{ mt: 2 }}>
                    <QRCodeSVG value={badgeUrl} size={72} level="M" />
                    <Typography variant="caption" sx={{ display: 'block', color: '#64748b', mt: 0.5, fontSize: '0.65rem' }}>
                      Scan to verify at merix.gov.in
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>

            {/* Badge Actions */}
            {badgeEligible && (
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mt: 1 }}>
                <Button
                  size="small"
                  startIcon={<Download size={14} />}
                  variant="contained"
                  sx={{ backgroundColor: '#059669', fontWeight: 700, fontSize: '0.78rem', '&:hover': { backgroundColor: '#047857' } }}
                >
                  Download Badge
                </Button>
                <Button
                  size="small"
                  startIcon={<Share2 size={14} />}
                  variant="outlined"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: 'Merix Verified Business', url: badgeUrl });
                    } else {
                      navigator.clipboard?.writeText(badgeUrl);
                    }
                  }}
                  sx={{ borderColor: '#a7f3d0', color: '#059669', fontWeight: 700, fontSize: '0.78rem' }}
                >
                  Share Link
                </Button>
              </Box>
            )}

            {!badgeEligible && (
              <Alert severity="warning" sx={{ mt: 1.5, borderRadius: '10px', textAlign: 'left' }} icon={false}>
                <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', color: '#92400e' }}>
                  Badge Eligibility Requires:
                </Typography>
                <Typography variant="caption" sx={{ color: '#92400e' }}>
                  All registered instruments must have valid, non-expired certificates. Renew {expired.length + expiringSoon.length} certificate(s) to qualify.
                </Typography>
              </Alert>
            )}
          </Paper>
        </Grid>

        {/* Compliance Status */}
        <Grid item xs={12} md={7}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid #e2e8f0', mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 2 }}>
              Compliance Score
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Typography variant="h2" sx={{ fontWeight: 900, color: scoreColor, fontFamily: '"Outfit", sans-serif', lineHeight: 1 }}>
                {complianceScore}%
              </Typography>
              <Box>
                <Chip
                  label={scoreLabel}
                  size="small"
                  sx={{
                    fontWeight: 700, fontSize: '0.75rem',
                    backgroundColor: `${scoreColor}15`, color: scoreColor,
                    border: `1px solid ${scoreColor}40`
                  }}
                />
                <Typography variant="caption" sx={{ display: 'block', color: '#64748b', mt: 0.5 }}>
                  {validCerts.length} of {certificates.length} certificates valid
                </Typography>
              </Box>
            </Box>
            <LinearProgress
              variant="determinate"
              value={complianceScore}
              sx={{
                height: 10, borderRadius: 5,
                backgroundColor: '#f1f5f9',
                '& .MuiLinearProgress-bar': { backgroundColor: scoreColor }
              }}
            />

            <Grid container spacing={2} sx={{ mt: 2 }}>
              {[
                { label: 'Valid Certificates', count: validCerts.length, color: '#059669', icon: <CheckCircle2 size={16} color="#059669" /> },
                { label: 'Expiring Soon (≤30d)', count: expiringSoon.length, color: '#d97706', icon: <Calendar size={16} color="#d97706" /> },
                { label: 'Expired', count: expired.length, color: '#dc2626', icon: <XCircle size={16} color="#dc2626" /> },
                { label: 'Total Instruments', count: instruments.length, color: '#1e40af', icon: <Scale size={16} color="#1e40af" /> }
              ].map(stat => (
                <Grid item xs={6} sm={3} key={stat.label}>
                  <Paper elevation={0} sx={{ p: 1.5, borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 0.5 }}>{stat.icon}</Box>
                    <Typography variant="h5" sx={{ fontWeight: 900, color: stat.color, fontFamily: '"Outfit", sans-serif' }}>
                      {stat.count}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem', lineHeight: 1.2 }}>
                      {stat.label}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Per-Instrument Status */}
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', mb: 2 }}>
              Instrument-wise Compliance
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {instruments.slice(0, 6).map(inst => {
                const cert = certificates.find(c => c.instrumentId === inst.id);
                const days = cert ? getExpiryDays(cert.expiryDate) : -999;
                const status = !cert ? 'NO_CERT' : days < 0 ? 'EXPIRED' : days <= 30 ? 'EXPIRING_SOON' : 'VALID';
                const statusColor = status === 'VALID' ? '#059669' : status === 'EXPIRING_SOON' ? '#d97706' : '#dc2626';
                const statusLabel = status === 'VALID' ? 'Valid' : status === 'EXPIRING_SOON' ? `Expires in ${days}d` : status === 'EXPIRED' ? `Expired ${Math.abs(days)}d ago` : 'No Certificate';

                return (
                  <Box key={inst.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, borderRadius: '10px', border: '1px solid #f1f5f9', backgroundColor: '#f8fafc' }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.83rem' }}>
                        {inst.instrumentType}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="caption" sx={{ color: '#64748b', fontFamily: 'monospace', fontSize: '0.72rem' }}>
                          {inst.id}
                        </Typography>
                        {cert && (
                          <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.7rem' }}>
                            · {cert.certificateNumber}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    <Chip
                      label={statusLabel}
                      size="small"
                      icon={status === 'VALID' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                      sx={{
                        fontSize: '0.72rem', fontWeight: 700,
                        backgroundColor: `${statusColor}15`, color: statusColor,
                        border: `1px solid ${statusColor}30`
                      }}
                    />
                  </Box>
                );
              })}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Info Box */}
      <Paper elevation={0} sx={{ mt: 3, p: 2.5, borderRadius: '14px', border: '1px solid #bfdbfe', backgroundColor: '#eff6ff' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <ShieldCheck size={18} color="#1e40af" />
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e40af' }}>
            What is the Verified Business Badge?
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: '#1e40af', fontSize: '0.84rem', lineHeight: 1.7 }}>
          The Merix Verified Business Badge is a shareable digital trust mark for businesses that maintain 100% compliance
          with the Legal Metrology Act, 2009. It can be displayed on your shop, website, invoices, and social media
          to signal to customers that all your weighing/measuring instruments are verified and sealed by a government-approved authority.
          The badge QR code links to a real-time public verification page where consumers can confirm its authenticity.
        </Typography>
      </Paper>
    </Box>
  );
};
