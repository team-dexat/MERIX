import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  Paper,
  Chip,
  Divider
} from '@mui/material';
import {
  Receipt,
  ArrowRight,
  ShieldCheck,
  Building,
  Calendar,
  Check
} from 'lucide-react';

interface PaymentSuccessModalProps {
  open: boolean;
  onClose: () => void;
  amount: number;
  transactionId: string;
  bankRef: string;
  paymentMode: string;
  timestamp: string;
  applicationId: string;
  instrumentType?: string;
  onViewApplication: () => void;
}

export const PaymentSuccessModal: React.FC<PaymentSuccessModalProps> = ({
  open,
  onClose,
  amount,
  transactionId,
  bankRef,
  paymentMode,
  timestamp,
  applicationId,
  instrumentType = 'Legal Metrology Device',
  onViewApplication
}) => {
  const [countdown, setCountdown] = useState(3);

  // Play pleasant UPI synthesized chime sound on popup mount
  useEffect(() => {
    if (open) {
      try {
        const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const now = audioCtx.currentTime;

        // Note 1 (E5 - 659Hz)
        const osc1 = audioCtx.createOscillator();
        const gain1 = audioCtx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(659.25, now);
        gain1.gain.setValueAtTime(0, now);
        gain1.gain.linearRampToValueAtTime(0.15, now + 0.05);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc1.connect(gain1);
        gain1.connect(audioCtx.destination);
        osc1.start(now);
        osc1.stop(now + 0.35);

        // Note 2 (A5 - 880Hz / uplifting resolve)
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(880.0, now + 0.12);
        gain2.gain.setValueAtTime(0, now + 0.12);
        gain2.gain.linearRampToValueAtTime(0.2, now + 0.17);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.start(now + 0.12);
        osc2.stop(now + 0.65);
      } catch {
        // Ignore audio failure if restricted by browser autoplay policy
      }

      setCountdown(3);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            onViewApplication();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [open, onViewApplication]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '24px',
          overflow: 'hidden',
          backgroundColor: '#ffffff',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #e2e8f0',
          textAlign: 'center'
        }
      }}
    >
      <DialogContent sx={{ p: { xs: 3, sm: 4 }, pt: { xs: 4, sm: 4.5 } }}>
        {/* Animated Checkmark Circle (GPay / BHIM / PhonePe style) */}
        <Box sx={{ position: 'relative', width: 96, height: 96, margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Concentric Pulse Rings */}
          <Box
            sx={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              opacity: 0.2,
              animation: 'pulseRing 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite'
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              width: 80,
              height: 80,
              borderRadius: '50%',
              backgroundColor: '#10b981',
              opacity: 0.3,
              animation: 'pulseRing 2s cubic-bezier(0.215, 0.61, 0.355, 1) 0.3s infinite'
            }}
          />

          {/* Core Green Circle with SVG Animated Draw-In Check */}
          <Box
            sx={{
              position: 'relative',
              width: 72,
              height: 72,
              borderRadius: '50%',
              backgroundColor: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.5)',
              animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
            }}
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ffffff"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                strokeDasharray: 50,
                strokeDashoffset: 50,
                animation: 'drawCheck 0.6s ease-out 0.25s forwards'
              }}
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </Box>
        </Box>

        <style>
          {`
            @keyframes popIn {
              0% { transform: scale(0); opacity: 0; }
              70% { transform: scale(1.12); opacity: 1; }
              100% { transform: scale(1); opacity: 1; }
            }
            @keyframes drawCheck {
              to { stroke-dashoffset: 0; }
            }
            @keyframes pulseRing {
              0% { transform: scale(0.85); opacity: 0.4; }
              50% { transform: scale(1.35); opacity: 0; }
              100% { transform: scale(1.35); opacity: 0; }
            }
          `}
        </style>

        {/* Amount & Status Text */}
        <Typography
          variant="h4"
          sx={{
            fontWeight: 900,
            color: '#0f172a',
            fontFamily: '"Outfit", sans-serif',
            letterSpacing: '-0.5px',
            lineHeight: 1.1
          }}
        >
          ₹{amount.toLocaleString('en-IN')}.00
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.8, mt: 0.8 }}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 800,
              color: '#059669',
              fontSize: '1rem',
              letterSpacing: '-0.2px'
            }}
          >
            Paid Successfully
          </Typography>
          <Chip
            label="TREASURY VERIFIED"
            size="small"
            sx={{
              height: 20,
              fontSize: '0.62rem',
              fontWeight: 800,
              backgroundColor: '#ecfdf5',
              color: '#047857',
              border: '1px solid #a7f3d0'
            }}
          />
        </Box>

        <Typography
          variant="body2"
          sx={{
            color: '#64748b',
            mt: 0.5,
            fontSize: '0.82rem',
            fontWeight: 500
          }}
        >
          To: <strong>Dept of Legal Metrology, Govt of Tamil Nadu</strong>
        </Typography>

        {/* Transaction Summary Box */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mt: 2.5,
            mb: 2.5,
            borderRadius: '14px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            textAlign: 'left'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>
              APPLICATION ID
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 800, color: '#1e40af', fontFamily: 'monospace' }}>
              {applicationId}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>
              BHARATKOSH TXN ID
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>
              {transactionId}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>
              BANK REFERENCE NO
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>
              {bankRef}
            </Typography>
          </Box>

          <Divider sx={{ my: 1, borderColor: '#e2e8f0' }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
              PURPOSE &amp; DATE
            </Typography>
            <Typography variant="caption" sx={{ color: '#334155', fontWeight: 600 }}>
              {instrumentType} · {timestamp.split(',')[0]}
            </Typography>
          </Box>
        </Paper>

        {/* Action Button & Auto-redirect notification */}
        <Button
          fullWidth
          variant="contained"
          onClick={onViewApplication}
          endIcon={<ArrowRight size={18} />}
          sx={{
            py: 1.4,
            backgroundColor: '#1e40af',
            fontWeight: 800,
            fontSize: '0.92rem',
            textTransform: 'none',
            borderRadius: '12px',
            boxShadow: '0 4px 14px rgba(30, 64, 175, 0.3)',
            '&:hover': { backgroundColor: '#1d4ed8' }
          }}
        >
          View Application Details →
        </Button>

        <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mt: 1.5, fontSize: '0.75rem' }}>
          Auto-opening application in <strong>{countdown}s</strong>...
        </Typography>
      </DialogContent>
    </Dialog>
  );
};
