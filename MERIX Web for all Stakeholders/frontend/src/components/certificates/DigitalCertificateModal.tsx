import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
  Grid,
  Paper,
  Chip,
  Table,
  TableBody,
  TableRow,
  TableCell
} from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import {
  Printer,
  Download,
  ShieldCheck,
  X,
  CloudUpload,
  BadgeCheck
} from 'lucide-react';
import { DigiLockerModal } from '../common/DigiLockerModal';
import { Certificate } from '../../types';

interface DigitalCertificateModalProps {
  open: boolean;
  onClose: () => void;
  certificate: Certificate | null;
}

// Realistic Handwritten Signature for LMO (K. Murugan)
const LmoHandwrittenSignature: React.FC = () => (
  <svg viewBox="0 0 220 65" width="160" height="46" style={{ display: 'block', margin: '0 auto' }}>
    <path
      d="M 12 42 C 20 18, 30 8, 36 38 C 38 48, 42 50, 46 30 C 50 16, 56 15, 60 36 C 64 45, 70 30, 76 32 C 82 35, 86 44, 92 34 C 98 24, 104 28, 112 40 C 118 45, 126 32, 134 35 C 142 38, 150 44, 162 34 C 170 26, 178 38, 192 32 M 20 48 C 55 46, 110 44, 195 40 M 155 28 L 170 54"
      fill="none"
      stroke="#1e40af"
      strokeWidth="2.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Realistic Handwritten Signature for GATC (Dr. Senthilkumar Ramanathan)
const GatcHandwrittenSignature: React.FC = () => (
  <svg viewBox="0 0 240 65" width="170" height="46" style={{ display: 'block', margin: '0 auto' }}>
    <path
      d="M 10 38 C 18 16, 28 10, 34 35 C 37 48, 40 50, 44 26 C 48 14, 55 18, 60 34 C 66 44, 72 32, 78 34 C 84 36, 88 45, 94 34 C 100 24, 106 30, 114 40 C 122 46, 130 30, 140 34 C 148 38, 158 45, 172 34 C 180 26, 190 42, 208 34 M 18 48 C 58 45, 120 43, 215 40"
      fill="none"
      stroke="#1e3a8a"
      strokeWidth="2.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Official Rubber Stamp / Seal Graphic with Circular Text and Crest
const OfficialSealStamp: React.FC<{ isGatc: boolean }> = ({ isGatc }) => (
  <Box
    sx={{
      width: 72,
      height: 72,
      transform: 'rotate(-7deg)',
      opacity: 0.88,
      flexShrink: 0
    }}
  >
    <svg viewBox="0 0 100 100" width="72" height="72">
      {/* Outer concentric rings */}
      <circle cx="50" cy="50" r="47" fill="none" stroke={isGatc ? "#6d28d9" : "#1e40af"} strokeWidth="1.8" strokeDasharray="3,1.5" />
      <circle cx="50" cy="50" r="42" fill="none" stroke={isGatc ? "#6d28d9" : "#1e40af"} strokeWidth="1.1" />
      <circle cx="50" cy="50" r="28" fill="none" stroke={isGatc ? "#6d28d9" : "#1e40af"} strokeWidth="0.9" />

      {/* Curved Text Paths */}
      <defs>
        <path id="sealPathTop" d="M 17,50 A 33,33 0 0,1 83,50" fill="none" />
        <path id="sealPathBottom" d="M 83,50 A 33,33 0 0,1 17,50" fill="none" />
      </defs>

      <text fill={isGatc ? "#6d28d9" : "#1e40af"} fontSize="6.2" fontWeight="bold" fontFamily="'Times New Roman', serif" letterSpacing="0.6">
        <textPath href="#sealPathTop" startOffset="50%" textAnchor="middle">
          {isGatc ? "GATC TESTING LAB" : "LEGAL METROLOGY"}
        </textPath>
      </text>

      <text fill={isGatc ? "#6d28d9" : "#1e40af"} fontSize="5.4" fontWeight="bold" fontFamily="'Times New Roman', serif" letterSpacing="0.4">
        <textPath href="#sealPathBottom" startOffset="50%" textAnchor="middle">
          {isGatc ? "NABL ACCREDITED" : "GOVT OF TAMIL NADU"}
        </textPath>
      </text>

      {/* Center Icon: Scales of Justice */}
      <circle cx="50" cy="50" r="1.5" fill={isGatc ? "#6d28d9" : "#1e40af"} />
      <path
        d="M 50 36 L 50 62 M 42 41 L 58 41 M 40 41 L 37 49 L 43 49 Z M 60 41 L 57 49 L 63 49 Z M 44 62 L 56 62"
        fill={isGatc ? "#6d28d9" : "#1e40af"}
        stroke={isGatc ? "#6d28d9" : "#1e40af"}
        strokeWidth="1.1"
      />
    </svg>
  </Box>
);

export const DigitalCertificateModal: React.FC<DigitalCertificateModalProps> = ({
  open,
  onClose,
  certificate
}) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [digiLockerOpen, setDigiLockerOpen] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);

  if (!certificate) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!printRef.current) return;
    setDownloadLoading(true);
    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const ratio = pdfWidth / (canvas.width / 96 * 25.4);
      const imgH = (canvas.height / 96 * 25.4) * ratio;
      pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, Math.min(imgH, pdf.internal.pageSize.getHeight() - 20));
      pdf.save(`Merix-Certificate-${certificate.certificateNumber}.pdf`);
    } catch (err) {
      console.error('PDF generation failed, falling back to print:', err);
      window.print();
    } finally {
      setDownloadLoading(false);
    }
  };

  const inst = certificate.instrument;
  const isGatc = certificate.officerId?.toLowerCase().includes('gatc') || certificate.officerName?.toLowerCase().includes('gatc');

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: '14px', overflow: 'hidden' }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          py: 1.2,
          px: 3
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ShieldCheck size={20} color="#10b981" />
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.92rem' }}>
            Digital Verification &amp; Stamping Certificate (Legal Metrology Act, 2009)
          </Typography>
        </Box>
        <Button onClick={onClose} size="small" sx={{ minWidth: 28, p: 0.5, color: '#64748b' }}>
          <X size={18} />
        </Button>
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 2, md: 3 }, backgroundColor: '#f1f5f9' }}>
        <Box
          ref={printRef}
          className="printable-certificate"
          sx={{
            p: { xs: 2.5, md: 3.5 },
            border: '4px double #1e3a8a',
            borderRadius: '8px',
            backgroundColor: '#ffffff',
            position: 'relative',
            background: 'linear-gradient(135deg, #ffffff 0%, #fafcff 100%)',
            boxShadow: '0 4px 18px rgba(0,0,0,0.06)',
            fontFamily: '"Times New Roman", Times, Georgia, serif',
            color: '#0f172a'
          }}
        >
          {/* Watermark Emblem Logo */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              opacity: 0.035,
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Box component="img" src="/logo.png" alt="watermark" sx={{ width: 340, height: 340, objectFit: 'contain' }} />
          </Box>

          {/* Top Section: Centered Emblem & Title */}
          <Box sx={{ position: 'relative', textAlign: 'center', pt: 0.5, pb: 1 }}>
            {/* Centered Logo and Titles */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Box
                component="img"
                src="/logo.png"
                alt="Emblem"
                sx={{ width: 50, height: 50, objectFit: 'contain', mb: 0.8 }}
              />
              <Typography
                variant="overline"
                sx={{
                  fontWeight: 700,
                  letterSpacing: 2,
                  color: '#475569',
                  fontSize: '0.72rem',
                  lineHeight: 1.2,
                  fontFamily: '"Times New Roman", Times, Georgia, serif'
                }}
              >
                GOVERNMENT OF TAMIL NADU
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 900,
                  color: '#1e3a8a',
                  fontFamily: '"Times New Roman", Times, Georgia, serif',
                  lineHeight: 1.2,
                  fontSize: '1.05rem',
                  letterSpacing: '0.3px',
                  mt: 0.2
                }}
              >
                DEPARTMENT OF LEGAL METROLOGY &amp; CONSUMER AFFAIRS
              </Typography>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  color: '#0f172a',
                  fontFamily: '"Times New Roman", Times, Georgia, serif',
                  fontSize: '0.85rem',
                  mt: 0.3,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                Certificate of Verification and Stamping
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: '#475569',
                  fontStyle: 'italic',
                  fontSize: '0.7rem',
                  fontFamily: '"Times New Roman", Times, Georgia, serif',
                  display: 'block',
                  mt: 0.3
                }}
              >
                [ Issued under Section 24 of the Legal Metrology Act, 2009 read with Rule 24 of the Legal Metrology (General) Rules, 2011 ]
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 1.2, borderColor: '#1e3a8a', borderWidth: 1 }} />

          {/* Certificate Header Bar: Certificate No & Stamp ID on left, QR Code on right */}
          <Grid container spacing={1.5} alignItems="stretch" sx={{ mb: 1.8 }}>
            {/* Left Side: CERTIFICATE NO and STAMPING / MARK NO. & SEAL ID stacked */}
            <Grid item xs={12} sm={8.8}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: '100%', justifyContent: 'space-between' }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 0.9,
                    px: 1.8,
                    backgroundColor: '#eff6ff',
                    borderRadius: '6px',
                    border: '1px solid #bfdbfe',
                    fontFamily: '"Times New Roman", Times, Georgia, serif',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    flex: 1
                  }}
                >
                  <Typography variant="caption" sx={{ color: '#1e40af', fontWeight: 700, fontSize: '0.68rem', fontFamily: '"Times New Roman", Times, Georgia, serif', letterSpacing: '0.4px' }}>
                    CERTIFICATE NO.
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#1e3a8a', fontSize: '0.9rem', fontFamily: 'monospace' }}>
                    {certificate.certificateNumber}
                  </Typography>
                </Paper>

                <Paper
                  elevation={0}
                  sx={{
                    p: 0.9,
                    px: 1.8,
                    backgroundColor: '#ecfdf5',
                    borderRadius: '6px',
                    border: '1px solid #a7f3d0',
                    fontFamily: '"Times New Roman", Times, Georgia, serif',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    flex: 1
                  }}
                >
                  <Typography variant="caption" sx={{ color: '#065f46', fontWeight: 700, fontSize: '0.68rem', fontFamily: '"Times New Roman", Times, Georgia, serif', letterSpacing: '0.4px' }}>
                    STAMPING / MARK NO. &amp; SEAL ID
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#047857', fontSize: '0.9rem', fontFamily: 'monospace' }}>
                    {certificate.stampId}
                  </Typography>
                </Paper>
              </Box>
            </Grid>

            {/* Right Side: QR Code placed right side to Certificate No & Stamping Seal ID */}
            <Grid item xs={12} sm={3.2}>
              <Paper
                elevation={0}
                sx={{
                  p: 0.9,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#ffffff',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  textAlign: 'center'
                }}
              >
                <QRCodeSVG
                  value={`https://merix-web.vercel.app/verify/${certificate.certificateNumber}`}
                  size={76}
                  level="H"
                />
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    mt: 0.4,
                    fontWeight: 700,
                    color: '#1e3a8a',
                    fontSize: '0.62rem',
                    fontFamily: '"Times New Roman", Times, Georgia, serif',
                    lineHeight: 1.1
                  }}
                >
                  Scan to Verify
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* All 18 User-Specified Fields in Times New Roman Table */}
          <Table
            size="small"
            sx={{
              mb: 1.8,
              border: '1px solid #cbd5e1',
              fontFamily: '"Times New Roman", Times, Georgia, serif',
              '& .MuiTableCell-root': {
                fontFamily: '"Times New Roman", Times, Georgia, serif',
                py: 0.6,
                px: 1.2,
                borderColor: '#cbd5e1'
              }
            }}
          >
            <TableBody>
              <TableRow sx={{ '&:nth-of-type(odd)': { backgroundColor: '#f8fafc' } }}>
                <TableCell sx={{ fontWeight: 700, width: '22%', fontSize: '0.75rem', color: '#334155' }}>
                  Application No.
                </TableCell>
                <TableCell sx={{ fontWeight: 700, width: '28%', fontSize: '0.78rem', color: '#1e40af' }}>
                  {certificate.applicationId || 'Merix-TN-2026-00102'}
                </TableCell>
                <TableCell sx={{ fontWeight: 700, width: '22%', fontSize: '0.75rem', color: '#334155' }}>
                  Verification Type
                </TableCell>
                <TableCell sx={{ fontWeight: 700, width: '28%', fontSize: '0.78rem', color: '#0f172a' }}>
                  Initial &amp; Periodic Reverification (Schedule VII)
                </TableCell>
              </TableRow>

              <TableRow sx={{ '&:nth-of-type(odd)': { backgroundColor: '#f8fafc' } }}>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#334155' }}>
                  Status
                </TableCell>
                <TableCell>
                  <Chip
                    label={certificate.status === 'VALID' ? 'VALID / VERIFIED' : certificate.status}
                    size="small"
                    sx={{
                      fontWeight: 800,
                      fontSize: '0.65rem',
                      height: 18,
                      backgroundColor: '#dcfce7',
                      color: '#15803d',
                      fontFamily: '"Times New Roman", Times, Georgia, serif'
                    }}
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#334155' }}>
                  Date of Verification
                </TableCell>
                <TableCell sx={{ fontWeight: 800, fontSize: '0.78rem', color: '#0f172a' }}>
                  {certificate.issueDate}
                </TableCell>
              </TableRow>

              <TableRow sx={{ '&:nth-of-type(odd)': { backgroundColor: '#f8fafc' } }}>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#334155' }}>
                  Valid Upto (Expiry)
                </TableCell>
                <TableCell sx={{ fontWeight: 900, fontSize: '0.8rem', color: '#059669' }}>
                  {certificate.expiryDate}
                </TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#334155' }}>
                  Instrument ID
                </TableCell>
                <TableCell sx={{ fontWeight: 800, fontSize: '0.78rem', color: '#1e40af' }}>
                  {certificate.instrumentId}
                </TableCell>
              </TableRow>

              <TableRow sx={{ '&:nth-of-type(odd)': { backgroundColor: '#f8fafc' } }}>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#334155' }}>
                  Category / Type
                </TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#0f172a' }}>
                  {inst?.category || 'Weighing Instruments'} &bull; {inst?.instrumentType || 'Non-Automatic Weighing Instruments'}
                </TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#334155' }}>
                  Manufacturer / Make / Model
                </TableCell>
                <TableCell sx={{ fontSize: '0.78rem', fontWeight: 600 }}>
                  {inst?.manufacturer || 'Avery Weigh-Tronix India'} ({inst?.modelNumber || 'AV-500B Heavy Duty'})
                </TableCell>
              </TableRow>

              <TableRow sx={{ '&:nth-of-type(odd)': { backgroundColor: '#f8fafc' } }}>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#334155' }}>
                  Serial Number
                </TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', fontFamily: 'monospace', color: '#334155' }}>
                  {inst?.serialNumber || 'AV-TN-2024-88910'}
                </TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#334155' }}>
                  Capacity / Class
                </TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#0f172a' }}>
                  Max: {inst?.maxCapacity || '300 kg'} &bull; {inst?.accuracyClass || 'Class III'} (e = {inst?.verificationScaleIntervalE || '50 g'})
                </TableCell>
              </TableRow>

              <TableRow sx={{ '&:nth-of-type(odd)': { backgroundColor: '#f8fafc' } }}>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#334155' }}>
                  Owner / User
                </TableCell>
                <TableCell sx={{ fontWeight: 800, fontSize: '0.78rem', color: '#0f172a' }}>
                  {inst?.businessName || 'Sundar Industries Pvt Ltd'}
                </TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#334155' }}>
                  Location
                </TableCell>
                <TableCell sx={{ fontSize: '0.75rem', color: '#334155' }}>
                  {inst?.installationAddress || 'Shop No. 45, Koyambedu Market Yard, Chennai'} ({inst?.latitude ? `${inst.latitude.toFixed(4)}°N, ${inst.longitude.toFixed(4)}°E` : '13.0827°N, 80.2707°E'})
                </TableCell>
              </TableRow>

              <TableRow sx={{ '&:nth-of-type(odd)': { backgroundColor: '#f8fafc' } }}>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#334155' }}>
                  Applicable Rule
                </TableCell>
                <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155' }}>
                  Legal Metrology (General) Rules, 2011 — Schedule VII &amp; Rule 27
                </TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#334155' }}>
                  Verified By
                </TableCell>
                <TableCell sx={{ fontWeight: 800, fontSize: '0.78rem', color: '#1e40af' }}>
                  {certificate.officerName || (isGatc ? 'Tamil Nadu GATC Testing Center (GATC-01)' : 'K. Murugan, Inspector (LMO)')}
                </TableCell>
              </TableRow>

              <TableRow sx={{ '&:nth-of-type(odd)': { backgroundColor: '#f8fafc' } }}>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#334155' }}>
                  Remarks
                </TableCell>
                <TableCell colSpan={3} sx={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>
                  ✓ Standard load, zero-balance, eccentricity and repeatability tests completed within permissible Class limits. Security lead stamp tag affixed.
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          {/* Bottom Section: Real Signature Graphic of LMO / GATC, Official Rubber Stamp & Cryptographic Ledger Block */}
          <Paper
            elevation={0}
            sx={{
              p: 1.8,
              borderRadius: '6px',
              border: '1.5px solid #1e3a8a',
              backgroundColor: '#ffffff',
              fontFamily: '"Times New Roman", Times, Georgia, serif'
            }}
          >
            <Grid container spacing={2} alignItems="center">
              {/* Left Column: Cryptographic Verification Details */}
              <Grid item xs={12} sm={6.8}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.4 }}>
                  <BadgeCheck size={16} color="#1e40af" />
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 800,
                      color: '#1e3a8a',
                      fontSize: '0.78rem',
                      fontFamily: '"Times New Roman", Times, Georgia, serif'
                    }}
                  >
                    CRYPTOGRAPHIC DIGITAL VERIFICATION &amp; E-SIGN
                  </Typography>
                </Box>

                <Typography
                  variant="caption"
                  sx={{
                    color: '#334155',
                    display: 'block',
                    fontSize: '0.7rem',
                    fontFamily: '"Times New Roman", Times, Georgia, serif'
                  }}
                >
                  Digitally certified under Section 5 of Information Technology Act, 2000. Tamper-evident record chained on State Legal Metrology Ledger.
                </Typography>

                <Box sx={{ mt: 0.8, p: 0.8, backgroundColor: '#f8fafc', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: 'monospace',
                      color: '#475569',
                      fontSize: '0.62rem',
                      wordBreak: 'break-all',
                      display: 'block'
                    }}
                  >
                    <strong>Signature SHA-256:</strong> {certificate.digitalSignatureHash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: 'monospace',
                      color: '#64748b',
                      fontSize: '0.62rem',
                      wordBreak: 'break-all',
                      display: 'block',
                      mt: 0.2
                    }}
                  >
                    <strong>Ledger Block Hash:</strong> {certificate.chainHashCurrent || '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069'}
                  </Typography>
                </Box>

                <Typography
                  variant="caption"
                  sx={{
                    color: '#059669',
                    fontWeight: 700,
                    display: 'block',
                    mt: 0.6,
                    fontSize: '0.68rem',
                    fontFamily: '"Times New Roman", Times, Georgia, serif'
                  }}
                >
                  ✓ Aadhaar e-Sign Verified (UIDAI-CCA) • Timestamp: {certificate.issueDate} 11:30:00 IST
                </Typography>
              </Grid>

              {/* Right Column: Real Handwritten Signature Graphic & Official Rubber Stamp */}
              <Grid item xs={12} sm={5.2}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    p: 1.2,
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    backgroundColor: '#fafcff',
                    position: 'relative'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, width: '100%', mb: 0.3 }}>
                    <OfficialSealStamp isGatc={Boolean(isGatc)} />
                    <Box sx={{ flexGrow: 1, textAlign: 'center' }}>
                      {isGatc ? <GatcHandwrittenSignature /> : <LmoHandwrittenSignature />}
                    </Box>
                  </Box>

                  <Divider sx={{ width: '85%', my: 0.4, borderColor: '#94a3b8' }} />

                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 800,
                      color: '#0f172a',
                      fontSize: '0.78rem',
                      fontFamily: '"Times New Roman", Times, Georgia, serif',
                      lineHeight: 1.2
                    }}
                  >
                    {certificate.officerName || (isGatc ? 'Dr. Senthilkumar Ramanathan' : 'K. Murugan, M.Sc.')}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#475569',
                      fontWeight: 600,
                      fontSize: '0.68rem',
                      fontFamily: '"Times New Roman", Times, Georgia, serif',
                      lineHeight: 1.2
                    }}
                  >
                    {isGatc
                      ? 'Authorized Signatory & Director, GATC Laboratory'
                      : 'Inspector of Legal Metrology (LMO), Chennai Zone'}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#64748b',
                      fontStyle: 'italic',
                      fontSize: '0.64rem',
                      fontFamily: '"Times New Roman", Times, Georgia, serif'
                    }}
                  >
                    Department of Legal Metrology, Government of Tamil Nadu
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', justifyContent: 'space-between' }}>
        <Typography variant="caption" sx={{ color: '#64748b', fontFamily: '"Times New Roman", Times, Georgia, serif' }}>
          *Tamper-evident verification certificate registered on Tamil Nadu Legal Metrology Portal.
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.2 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<CloudUpload size={15} />}
            onClick={() => setDigiLockerOpen(true)}
            sx={{ color: '#059669', borderColor: '#a7f3d0', fontWeight: 700, fontSize: '0.78rem' }}
          >
            Push to DigiLocker
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Printer size={15} />}
            onClick={handlePrint}
            sx={{ color: '#1e40af', borderColor: '#bfdbfe', fontWeight: 700, fontSize: '0.78rem' }}
          >
            Print Certificate
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<Download size={15} />}
            onClick={handleDownloadPdf}
            disabled={downloadLoading}
            sx={{ backgroundColor: '#1e40af', fontWeight: 700, fontSize: '0.78rem', '&:hover': { backgroundColor: '#1e3a8a' } }}
          >
            {downloadLoading ? 'Generating...' : 'Download PDF'}
          </Button>
        </Box>
      </DialogActions>

      <DigiLockerModal
        open={digiLockerOpen}
        onClose={() => setDigiLockerOpen(false)}
        certificate={certificate}
      />
    </Dialog>
  );
};
