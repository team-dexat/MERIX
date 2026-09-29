import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
  Grid,
  Divider,
  Chip,
  Container,
  IconButton,
  Tooltip,
  Snackbar
} from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  Link as LinkIcon,
  Download,
  Eye,
  Copy,
  ExternalLink,
  Building,
  Scale,
  UserCheck,
  MapPin,
  Calendar,
  Lock,
  Sparkles,
  ArrowRight,
  LogIn,
  AlertTriangle,
  RefreshCw,
  Award,
  FileText
} from 'lucide-react';
import { ApiService } from '../../services/api';
import { Certificate } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DigitalCertificateModal } from '../../components/certificates/DigitalCertificateModal';

interface PublicVerifyProps {
  initialCertNumber?: string;
  isStandalonePublic?: boolean;
  onGoToLogin?: () => void;
}

export const PublicVerify: React.FC<PublicVerifyProps> = ({
  initialCertNumber,
  isStandalonePublic = false,
  onGoToLogin
}) => {
  // Extract certificate ID from prop, URL pathname (/verify/<id>), or URL query parameter (?cert=<id>)
  const getInitialNumber = () => {
    if (initialCertNumber) return initialCertNumber;
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      if (pathname.includes('/verify/')) {
        const extracted = pathname.split('/verify/')[1];
        if (extracted && extracted.trim().length > 0) {
          return decodeURIComponent(extracted.trim());
        }
      }
      const params = new URLSearchParams(window.location.search);
      const queryCert = params.get('cert') || params.get('id') || params.get('number');
      if (queryCert) return queryCert;
    }
    return 'DOCA-LM-2026-00892';
  };

  const [inputNumber, setInputNumber] = useState<string>(getInitialNumber());
  const [currentCert, setCurrentCert] = useState<Certificate | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  // Trigger verification and play green tick animation + celebration effects
  const performVerification = (num: string) => {
    if (!num.trim()) return;
    setIsVerifying(true);
    setNotFound(false);

    setTimeout(() => {
      const cert = ApiService.getCertificateByNumber(num.trim());
      if (cert) {
        setCurrentCert(cert);
        setNotFound(false);
        setAnimationKey(prev => prev + 1);

        // Update URL path without full page reload so shareable URL matches
        if (typeof window !== 'undefined' && window.history && window.history.pushState) {
          const targetUrl = `/verify/${encodeURIComponent(cert.certificateNumber)}`;
          if (window.location.pathname !== targetUrl) {
            window.history.pushState({}, '', targetUrl);
          }
        }

        // Fire celebration confetti if certificate is valid
        if (cert.status === 'VALID' || cert.status === 'EXPIRING_SOON') {
          try {
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.35 },
              colors: ['#10b981', '#059669', '#34d399', '#1e40af', '#3b82f6']
            });
          } catch (e) {
            // gracefully ignore if canvas not supported
          }
        }
      } else {
        setCurrentCert(null);
        setNotFound(true);
      }
      setIsVerifying(false);
    }, 200);
  };

  // Run initial verification on mount or when initialCertNumber changes
  useEffect(() => {
    const numToVerify = getInitialNumber();
    if (numToVerify) {
      setInputNumber(numToVerify);
      performVerification(numToVerify);
    }
  }, [initialCertNumber]);

  const handleCopyLink = () => {
    if (!currentCert) return;
    const url = `https://merix-web.vercel.app/verify/${currentCert.certificateNumber}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
    });
  };

  const sampleCertificates = [
    { label: 'Platform Scale (Active)', num: 'DOCA-LM-2026-00892' },
    { label: 'Weighbridge (Active)', num: 'DOCA-LM-2026-00891' },
    { label: 'Fuel Dispenser (Active)', num: 'DOCA-LM-2026-00890' },
    { label: 'Expiring Soon Sample', num: 'DOCA-LM-2025-00650' }
  ];

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc', py: { xs: 2.5, md: 4 } }}>
      <Container maxWidth="md">
        {/* Top Header & Crest */}
        <Box sx={{ textAlign: 'center', mb: 3.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, mb: 1.5 }}>
            <Box
              component="img"
              src="/logo.png"
              alt="Government of Tamil Nadu Emblem"
              sx={{
                width: 68,
                height: 68,
                objectFit: 'contain',
                borderRadius: '50%',
                boxShadow: '0 4px 18px rgba(30, 64, 175, 0.18)',
                border: '2px solid #e0f2fe',
                p: 0.5,
                backgroundColor: '#ffffff'
              }}
            />
          </Box>
          <Typography
            variant="overline"
            sx={{
              fontWeight: 800,
              letterSpacing: 2.2,
              color: '#475569',
              fontSize: '0.78rem',
              display: 'block'
            }}
          >
            GOVERNMENT OF TAMIL NADU
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              color: '#0f172a',
              fontFamily: '"Outfit", sans-serif',
              fontSize: { xs: '1.45rem', sm: '1.9rem' },
              mt: 0.2
            }}
          >
            Legal Metrology Verification Registry
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: '#64748b',
              maxWidth: 620,
              mx: 'auto',
              mt: 0.8,
              fontSize: { xs: '0.82rem', sm: '0.9rem' }
            }}
          >
            Real-time public authentication for weights and measuring instruments under Section 24 of the Legal Metrology Act, 2009.
          </Typography>

          {isStandalonePublic && onGoToLogin && (
            <Box sx={{ mt: 1.5 }}>
              <Button
                variant="text"
                size="small"
                startIcon={<LogIn size={15} />}
                onClick={onGoToLogin}
                sx={{ color: '#1e40af', fontWeight: 700, fontSize: '0.8rem' }}
              >
                Department / Merchant Login →
              </Button>
            </Box>
          )}
        </Box>

        {/* Search & Verification Input Bar */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 2.5 },
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            mb: 3,
            backgroundColor: '#ffffff',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Search size={16} color="#1e40af" /> Verify Another Certificate or Stamp ID
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5, flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField
              fullWidth
              placeholder="e.g. DOCA-LM-2026-00892 or TN-LM-STAMP-2026-9821"
              value={inputNumber}
              onChange={e => setInputNumber(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') performVerification(inputNumber);
              }}
              size="small"
              sx={{
                '& .MuiInputBase-root': {
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  backgroundColor: '#f8fafc',
                  borderRadius: '10px'
                }
              }}
            />
            <Button
              variant="contained"
              startIcon={isVerifying ? <RefreshCw className="animate-spin" size={16} /> : <ShieldCheck size={18} />}
              onClick={() => performVerification(inputNumber)}
              disabled={isVerifying}
              sx={{
                px: 3.5,
                py: 1,
                backgroundColor: '#1e40af',
                fontWeight: 800,
                borderRadius: '10px',
                whiteSpace: 'nowrap',
                '&:hover': { backgroundColor: '#1e3a8a' }
              }}
            >
              {isVerifying ? 'Verifying...' : 'Verify Authenticity'}
            </Button>
          </Box>

          {/* Quick Click Samples */}
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>
              Quick Samples:
            </Typography>
            {sampleCertificates.map((sample, idx) => (
              <Chip
                key={idx}
                label={sample.num}
                size="small"
                onClick={() => {
                  setInputNumber(sample.num);
                  performVerification(sample.num);
                }}
                sx={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  backgroundColor: inputNumber === sample.num ? '#eff6ff' : '#f1f5f9',
                  color: inputNumber === sample.num ? '#1e40af' : '#475569',
                  border: inputNumber === sample.num ? '1px solid #bfdbfe' : '1px solid transparent',
                  '&:hover': { backgroundColor: '#eff6ff', color: '#1e40af' }
                }}
              />
            ))}
          </Box>
        </Paper>

        {/* Not Found Error Alert */}
        {notFound && (
          <Alert
            severity="error"
            icon={<AlertTriangle size={22} />}
            sx={{
              borderRadius: '14px',
              mb: 3,
              fontWeight: 600,
              boxShadow: '0 4px 15px rgba(239, 68, 68, 0.08)'
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              Certificate Not Found or Tampered
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.85rem', mt: 0.3 }}>
              The certificate or stamp ID <strong>"{inputNumber}"</strong> is not recognized in the Department of Legal Metrology registry. Please check the spelling or scan the official QR code again.
            </Typography>
          </Alert>
        )}

        {/* Verified Certificate Card */}
        {currentCert && (
          <Paper
            key={animationKey}
            elevation={0}
            sx={{
              borderRadius: '20px',
              border: '1.5px solid #cbd5e1',
              overflow: 'hidden',
              backgroundColor: '#ffffff',
              boxShadow: '0 10px 35px rgba(0,0,0,0.06)'
            }}
          >
            {/* Top Green Tick Hero Section */}
            <Box
              sx={{
                p: { xs: 3, sm: 3.5 },
                backgroundColor: currentCert.status === 'VALID' ? '#ecfdf5' : currentCert.status === 'EXPIRING_SOON' ? '#fffbeb' : '#fee2e2',
                borderBottom: '1.5px solid #e2e8f0',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Subtle background glow */}
              <Box
                sx={{
                  position: 'absolute',
                  top: -50,
                  right: -50,
                  width: 180,
                  height: 180,
                  borderRadius: '50%',
                  backgroundColor: currentCert.status === 'VALID' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                  filter: 'blur(30px)',
                  pointerEvents: 'none'
                }}
              />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2, sm: 3 }, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
                {/* Animated Green Tick Icon with Concentric Pulse Rings */}
                <Box
                  sx={{
                    position: 'relative',
                    width: 76,
                    height: 76,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  {currentCert.status === 'VALID' && (
                    <>
                      <Box className="verified-pulse-ring" />
                      <Box className="verified-pulse-ring-2" />
                    </>
                  )}

                  <svg
                    viewBox="0 0 80 80"
                    width="76"
                    height="76"
                    style={{ filter: 'drop-shadow(0 4px 10px rgba(16, 185, 129, 0.35))' }}
                  >
                    <circle
                      className="verified-checkmark-circle"
                      cx="40"
                      cy="40"
                      r="36"
                      fill={currentCert.status === 'VALID' ? '#10b981' : currentCert.status === 'EXPIRING_SOON' ? '#f59e0b' : '#ef4444'}
                    />
                    {currentCert.status === 'VALID' || currentCert.status === 'EXPIRING_SOON' ? (
                      <path
                        className="verified-checkmark-check"
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth="5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M25 41 l11 11 l20 -22"
                      />
                    ) : (
                      <path
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth="5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M26 26 l28 28 M54 26 l-28 28"
                      />
                    )}
                  </svg>
                </Box>

                {/* Status and Certificate Title */}
                <Box sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
                    <Chip
                      icon={<ShieldCheck size={14} color={currentCert.status === 'VALID' ? '#047857' : '#92400e'} />}
                      label={currentCert.status === 'VALID' ? 'OFFICIALLY VERIFIED & ACTIVE' : currentCert.status === 'EXPIRING_SOON' ? 'VERIFIED (RENEWAL REQUIRED SOON)' : 'EXPIRED CERTIFICATE'}
                      sx={{
                        backgroundColor: currentCert.status === 'VALID' ? '#dcfce7' : currentCert.status === 'EXPIRING_SOON' ? '#fef3c7' : '#fecaca',
                        color: currentCert.status === 'VALID' ? '#065f46' : currentCert.status === 'EXPIRING_SOON' ? '#92400e' : '#991b1b',
                        fontWeight: 900,
                        fontSize: '0.74rem',
                        letterSpacing: '0.3px',
                        height: 24
                      }}
                    />
                    <Chip
                      label="SHA-256 LEDGER SECURED"
                      sx={{
                        backgroundColor: '#eff6ff',
                        color: '#1e40af',
                        fontWeight: 800,
                        fontSize: '0.68rem',
                        height: 24,
                        border: '1px solid #bfdbfe'
                      }}
                    />
                  </Box>

                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 900,
                      color: currentCert.status === 'VALID' ? '#065f46' : currentCert.status === 'EXPIRING_SOON' ? '#92400e' : '#991b1b',
                      fontFamily: '"Outfit", sans-serif',
                      fontSize: { xs: '1.25rem', sm: '1.55rem' },
                      lineHeight: 1.2
                    }}
                  >
                    {currentCert.certificateNumber}
                  </Typography>

                  <Typography variant="body2" sx={{ color: '#475569', mt: 0.4, fontSize: '0.85rem' }}>
                    Stamping ID: <strong style={{ color: '#059669', fontFamily: 'monospace' }}>{currentCert.stampId}</strong> · Valid from {currentCert.issueDate} to <strong>{currentCert.expiryDate}</strong>
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Quick Action Button Bar */}
            <Box
              sx={{
                p: { xs: 1.5, sm: 2 },
                px: { xs: 2, sm: 3 },
                backgroundColor: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 1.2
              }}
            >
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>
                Authentic Govt. Verification Record (Sec 24, Legal Metrology Act)
              </Typography>

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Copy size={13} />}
                  onClick={handleCopyLink}
                  sx={{
                    color: '#1e40af',
                    borderColor: '#bfdbfe',
                    backgroundColor: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'none'
                  }}
                >
                  {copied ? 'Link Copied! ✓' : 'Copy Verification URL'}
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<Eye size={14} />}
                  onClick={() => setCertModalOpen(true)}
                  sx={{
                    backgroundColor: '#1e40af',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    '&:hover': { backgroundColor: '#1e3a8a' }
                  }}
                >
                  View / Download Certificate
                </Button>
              </Box>
            </Box>

            {/* Main Detailed Grid */}
            <Box sx={{ p: { xs: 2.5, sm: 3.5 } }}>
              <Grid container spacing={3}>
                {/* 1. Business & Enterprise Information */}
                <Grid item xs={12} sm={6}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.2,
                      height: '100%',
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '14px'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      <Building size={18} color="#1e40af" />
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                        Registered Business &amp; Location
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box>
                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, display: 'block' }}>
                          ENTERPRISE / TRADE NAME
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                          {currentCert.instrument?.businessName || currentCert.user?.businessName || 'Sundar Industries Pvt Ltd'}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, display: 'block' }}>
                          INSTALLATION / OPERATING ADDRESS
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#334155', fontWeight: 500, fontSize: '0.84rem' }}>
                          {currentCert.instrument?.installationAddress || 'Shop No. 45, Koyambedu Wholesale Market Yard, Chennai'}
                        </Typography>
                      </Box>

                      {currentCert.instrument?.latitude && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mt: 0.5 }}>
                          <MapPin size={14} color="#059669" />
                          <Typography variant="caption" sx={{ color: '#059669', fontWeight: 700 }}>
                            GPS: {currentCert.instrument.latitude.toFixed(4)}°N, {currentCert.instrument.longitude.toFixed(4)}°E (Verified on-site)
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Paper>
                </Grid>

                {/* 2. Instrument & Measurement Specifications */}
                <Grid item xs={12} sm={6}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.2,
                      height: '100%',
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '14px'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      <Scale size={18} color="#1e40af" />
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                        Instrument &amp; Weighing Specs
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box>
                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, display: 'block' }}>
                          INSTRUMENT TYPE &amp; CLASS
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                          {currentCert.instrument?.instrumentType || 'Non-Automatic Weighing Instruments'} · {currentCert.instrument?.accuracyClass || 'Class III'}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, display: 'block' }}>
                            SERIAL NUMBER
                          </Typography>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 800, color: '#1e40af' }}>
                            {currentCert.instrument?.serialNumber || currentCert.instrumentId}
                          </Typography>
                        </Box>

                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, display: 'block' }}>
                            MAX CAPACITY
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                            {currentCert.instrument?.maxCapacity || '300 kg'}
                          </Typography>
                        </Box>
                      </Box>

                      <Box>
                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, display: 'block' }}>
                          MANUFACTURER &amp; MODEL
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#334155', fontWeight: 600 }}>
                          {currentCert.instrument?.manufacturer || 'Avery Weigh-Tronix India'} ({currentCert.instrument?.modelNumber || 'AV-500B Heavy Duty'})
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>

                {/* 3. Verifying Authority & Physical Seal */}
                <Grid item xs={12} sm={6}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.2,
                      height: '100%',
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '14px'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      <UserCheck size={18} color="#1e40af" />
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                        Verifying Authority &amp; Stamping Officer
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box>
                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, display: 'block' }}>
                          OFFICER / TESTING CENTER
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#1e40af' }}>
                          {currentCert.officerName || 'K. Murugan, Inspector (LMO)'}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, display: 'block' }}>
                            DATE OF STAMPING
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                            {currentCert.issueDate}
                          </Typography>
                        </Box>

                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, display: 'block' }}>
                            VALID UPTO (EXPIRY)
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 800, color: currentCert.status === 'EXPIRING_SOON' ? '#b45309' : '#059669' }}>
                            {currentCert.expiryDate}
                          </Typography>
                        </Box>
                      </Box>

                      <Box>
                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, display: 'block' }}>
                          GOVERNMENT SEAL &amp; STAMP TAG
                        </Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#059669', fontWeight: 800 }}>
                          {currentCert.stampId} (Tamper-Evident Lead Seal Affixed)
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>

                {/* 4. Cryptographic Proof & QR Code */}
                <Grid item xs={12} sm={6}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.2,
                      height: '100%',
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                        <Lock size={18} color="#1e40af" />
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                          Cryptographic SHA-256 Ledger
                        </Typography>
                      </Box>

                      <Box sx={{ p: 1.2, backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', mb: 1.5 }}>
                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, display: 'block' }}>
                          Digital Signature Hash:
                        </Typography>
                        <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#1e40af', wordBreak: 'break-all', display: 'block' }}>
                          {currentCert.digitalSignatureHash}
                        </Typography>

                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, display: 'block', mt: 0.6 }}>
                          Ledger Chain Block Hash:
                        </Typography>
                        <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#475569', wordBreak: 'break-all', display: 'block' }}>
                          {currentCert.chainHashCurrent}
                        </Typography>
                      </Box>
                    </Box>

                    {/* QR Code Verification Preview */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, pt: 1, borderTop: '1px dashed #e2e8f0' }}>
                      <Box sx={{ p: 0.8, border: '1.5px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#ffffff' }}>
                        <QRCodeSVG value={`https://merix-web.vercel.app/verify/${currentCert.certificateNumber}`} size={56} level="M" />
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: '#0f172a', display: 'block' }}>
                          Scan to verify on any mobile device
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem', display: 'block' }}>
                          https://merix-web.vercel.app/verify/{currentCert.certificateNumber}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Box>

            {/* Bottom Footer Note */}
            <Box
              sx={{
                p: 2,
                px: 3,
                backgroundColor: '#f1f5f9',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 1
              }}
            >
              <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600 }}>
                ⚖️ Legal Metrology Act, 2009 · National Consumer Helpline: 1915 · Government of Tamil Nadu
              </Typography>
              <Button
                size="small"
                variant="outlined"
                color="warning"
                startIcon={<AlertTriangle size={13} />}
                onClick={() => {
                  alert(`To report short weight or seal tampering for Certificate ${currentCert.certificateNumber}, please call the National Consumer Helpline 1915 or use the Citizen Report feature.`);
                }}
                sx={{ fontSize: '0.72rem', fontWeight: 700, py: 0.2 }}
              >
                Report Discrepancy
              </Button>
            </Box>
          </Paper>
        )}
      </Container>

      {/* Digital Certificate Modal with Print / PDF Generation */}
      <DigitalCertificateModal
        open={certModalOpen}
        onClose={() => setCertModalOpen(false)}
        certificate={currentCert}
      />

      <Snackbar
        open={copied}
        autoHideDuration={2500}
        onClose={() => setCopied(false)}
        message="Verification URL copied to clipboard!"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
};
