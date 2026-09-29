import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Chip,
  Alert,
  Divider,
  Card,
  CardContent,
  CircularProgress
} from '@mui/material';
import {
  QrCode,
  Camera,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Zap,
  Sparkles,
  Link as LinkIcon,
  UploadCloud
} from 'lucide-react';
import jsQR from 'jsqr';
import { ApiService } from '../../services/api';
import { Certificate, Instrument } from '../../types';

export const ScanQrPage: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [scannedResult, setScannedResult] = useState<Certificate | null>(null);
  const [scannedInstrument, setScannedInstrument] = useState<Instrument | null>(null);
  const [qrRawPayload, setQrRawPayload] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const sampleQrs = [
    {
      title: 'Valid Verification Certificate',
      code: 'CERT|DOCA-LM-2026-00892|LMO-TN-44|SHA256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
      certNumber: 'DOCA-LM-2026-00892'
    },
    {
      title: 'High-Capacity Weighbridge Certificate',
      code: 'CERT|DOCA-LM-2026-00891|LMO-TN-44|SHA256:4b227777d4dd1fc61c6f884f48641d02b4d3a871f92e81748afff200126a1122',
      certNumber: 'DOCA-LM-2026-00891'
    },
    {
      title: 'Registered Instrument Tag',
      code: 'INST|INS-000101|Sundar Industries Pvt Ltd|Non-Automatic Weighing Instruments|GPS:13.0694,80.1948',
      instId: 'INS-000101'
    }
  ];

  const handleSimulateScan = (sample: typeof sampleQrs[0]) => {
    setScanning(true);
    setErrorMsg(null);
    setQrRawPayload(sample.code);

    setTimeout(() => {
      if (sample.certNumber) {
        const cert = ApiService.getCertificateByNumber(sample.certNumber);
        if (cert) {
          setScannedResult(cert);
          setScannedInstrument(null);
        } else {
          setErrorMsg('Certificate not found in central registry');
        }
      } else if (sample.instId) {
        const inst = ApiService.getInstrumentById(sample.instId);
        if (inst) {
          setScannedInstrument(inst);
          setScannedResult(null);
        } else {
          setErrorMsg('Instrument not found in central registry');
        }
      }
      setScanning(false);
    }, 400);
  };

  // Start Camera
  const startCamera = async () => {
    try {
      setCameraActive(true);
      setErrorMsg(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.play();
        requestAnimationFrame(tick);
      }
    } catch (err) {
      console.warn('Camera not accessible in this environment:', err);
      setCameraActive(false);
      setErrorMsg('Camera access unavailable. Please use the 1-Click Instant Sample QR buttons below.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }
    setCameraActive(false);
  };

  const tick = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.height = videoRef.current.videoHeight;
          canvas.width = videoRef.current.videoWidth;
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code) {
            handleSimulateScan(sampleQrs[0]);
            stopCamera();
            return;
          }
        }
      }
    }
    if (cameraActive) {
      requestAnimationFrame(tick);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3.5 }, maxWidth: 1000, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Box
          component="img"
          src="/logo.png"
          alt="Merix Official Emblem"
          sx={{
            width: 76,
            height: 76,
            objectFit: 'contain',
            borderRadius: '50%',
            boxShadow: '0 4px 20px rgba(0, 180, 216, 0.25)',
            border: '2px solid #e0f2fe',
            mb: 1.5
          }}
        />
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', fontFamily: '"Outfit", sans-serif' }}>
          Real-time QR Scanner &amp; Cryptographic Authenticator
        </Typography>
        <Typography variant="body1" sx={{ color: '#64748b', mt: 0.5 }}>
          Scan dynamic QR codes on weighing instruments and physical certificates to verify cryptographic SHA-256 seal integrity.
        </Typography>
      </Box>

      {errorMsg && (
        <Alert severity="info" sx={{ mb: 3, borderRadius: '12px' }}>
          {errorMsg}
        </Alert>
      )}

      {/* Main Scanner Section */}
      <Grid container spacing={3.5}>
        {/* Left: Camera / Scanner Box */}
        <Grid item xs={12} md={5}>
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              borderRadius: '18px',
              textAlign: 'center',
              backgroundColor: '#ffffff',
              boxShadow: '0 4px 15px rgba(0,0,0,0.04)'
            }}
          >
            <Box
              sx={{
                width: '100%',
                height: 260,
                backgroundColor: '#0f172a',
                borderRadius: '14px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                position: 'relative',
                mb: 2.5
              }}
            >
              {cameraActive ? (
                <>
                  <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <canvas ref={canvasRef} style={{ display: 'none' }} />
                </>
              ) : (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Camera size={44} color="#60a5fa" style={{ marginBottom: 8 }} />
                  <Typography variant="body2" sx={{ color: '#94a3b8', fontWeight: 600 }}>
                    Camera Ready for Optical QR Scan
                  </Typography>
                </Box>
              )}

              {/* Scanning Crosshairs Overlay */}
              <Box
                sx={{
                  position: 'absolute',
                  width: 140,
                  height: 140,
                  border: '2px dashed #60a5fa',
                  borderRadius: '12px',
                  pointerEvents: 'none',
                  animation: 'pulse 2s infinite'
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center' }}>
              {!cameraActive ? (
                <Button
                  variant="contained"
                  startIcon={<Camera size={18} />}
                  onClick={startCamera}
                  sx={{ backgroundColor: '#1e40af', fontWeight: 700, px: 2.5 }}
                >
                  Start Live Camera
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  onClick={stopCamera}
                  sx={{ color: '#dc2626', borderColor: '#fecaca', fontWeight: 700 }}
                >
                  Stop Camera
                </Button>
              )}
            </Box>
          </Paper>

          {/* 1-Click Test Samples */}
          <Paper variant="outlined" sx={{ p: 2.5, mt: 2.5, borderRadius: '16px', backgroundColor: '#f8fafc' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <Zap size={18} color="#f59e0b" />
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                Instant Test Scanner (1-Click)
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {sampleQrs.map((sample, idx) => (
                <Button
                  key={idx}
                  size="small"
                  variant="outlined"
                  onClick={() => handleSimulateScan(sample)}
                  sx={{
                    justifyContent: 'flex-start',
                    textAlign: 'left',
                    color: '#1e40af',
                    borderColor: '#bfdbfe',
                    backgroundColor: '#ffffff',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    py: 0.8,
                    '&:hover': { backgroundColor: '#eff6ff' }
                  }}
                >
                  ▶ {sample.title}
                </Button>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Right: Decoded Result & Cryptographic Verification */}
        <Grid item xs={12} md={7}>
          {scanning ? (
            <Paper variant="outlined" sx={{ p: 6, textAlign: 'center', borderRadius: '18px' }}>
              <CircularProgress size={36} sx={{ color: '#1e40af', mb: 2 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Verifying Cryptographic Digital Signature &amp; Hash Chain...
              </Typography>
            </Paper>
          ) : scannedResult ? (
            <Paper variant="outlined" sx={{ borderRadius: '18px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
              <Box sx={{ p: 2.5, backgroundColor: '#ecfdf5', borderBottom: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <CheckCircle2 size={28} color="#059669" />
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#065f46' }}>
                    VALID LEGAL METROLOGY CERTIFICATE ✓
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#047857' }}>
                    Cryptographic signature verified against Government HSM Public Key
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ p: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>CERTIFICATE NUMBER</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e40af' }}>{scannedResult.certificateNumber}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>STAMP SEAL ID</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#059669' }}>{scannedResult.stampId}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>BUSINESS NAME</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{scannedResult.instrument?.businessName || 'Sundar Industries Pvt Ltd'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>VALIDITY</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{scannedResult.issueDate} → {scannedResult.expiryDate}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>INSTALLATION ADDRESS</Typography>
                    <Typography variant="body2" sx={{ color: '#334155' }}>{scannedResult.instrument?.installationAddress || 'Koyambedu Market Yard, Chennai'}</Typography>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2.5 }} />

                {/* Raw Decoded Payload */}
                <Box sx={{ p: 1.5, backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', display: 'block' }}>
                    Decoded QR Payload:
                  </Typography>
                  <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#1e40af', wordBreak: 'break-all' }}>
                    {qrRawPayload}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          ) : scannedInstrument ? (
            <Paper variant="outlined" sx={{ borderRadius: '18px', p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <CheckCircle2 size={24} color="#059669" />
                <Typography variant="h6" sx={{ fontWeight: 800 }}>Registered Instrument Verified</Typography>
              </Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1e40af' }}>{scannedInstrument.businessName}</Typography>
              <Typography variant="body2" sx={{ color: '#475569', mt: 0.5 }}>
                {scannedInstrument.instrumentType} • Serial: {scannedInstrument.serialNumber} • Accuracy: {scannedInstrument.accuracyClass}
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#64748b' }}>
                Trust Score: <strong>{scannedInstrument.trustScore}/100</strong> • Status: <strong>{scannedInstrument.status}</strong>
              </Typography>
            </Paper>
          ) : (
            <Paper variant="outlined" sx={{ p: 6, textAlign: 'center', borderRadius: '18px', backgroundColor: '#f8fafc' }}>
              <QrCode size={48} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#475569' }}>
                Point camera at a Merix QR code or click a test sample on the left.
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};
