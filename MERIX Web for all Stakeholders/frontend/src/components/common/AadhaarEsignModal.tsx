import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import { ShieldCheck, CheckCircle2, KeyRound, X } from 'lucide-react';

interface AadhaarEsignModalProps {
  open: boolean;
  onClose: () => void;
  officerName: string;
  onSuccess: () => void;
}

export const AadhaarEsignModal: React.FC<AadhaarEsignModalProps> = ({
  open,
  onClose,
  officerName,
  onSuccess
}) => {
  const [aadhaarNumber, setAadhaarNumber] = useState('XXXX-XXXX-8921');
  const [otp, setOtp] = useState('482910');
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);

  const handleSign = () => {
    setSigning(true);
    setTimeout(() => {
      setSigning(false);
      setSigned(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    }, 1000);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: '16px' } }}
    >
      <DialogTitle sx={{ backgroundColor: '#eff6ff', borderBottom: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.8 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ShieldCheck size={22} color="#1e40af" />
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1e3a8a' }}>
            Aadhaar e-Sign Service (UIDAI / CDAC)
          </Typography>
        </Box>
        <Button onClick={onClose} size="small" sx={{ minWidth: 32, p: 0.5 }}>
          <X size={18} />
        </Button>
      </DialogTitle>

      <DialogContent sx={{ p: 3, textAlign: 'center' }}>
        {!signed ? (
          <Box>
            <Box sx={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: '#eff6ff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
              <KeyRound size={28} color="#1e40af" />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
              Officer Digital Aadhaar e-Sign
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5, mb: 2.5 }}>
              Sign Legal Metrology field verification record with legally binding DSC as <strong>{officerName}</strong>.
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2.5 }}>
              <TextField
                label="Registered Aadhaar Number"
                fullWidth
                size="small"
                disabled
                value={aadhaarNumber}
              />
              <TextField
                label="Aadhaar OTP (Simulation)"
                fullWidth
                size="small"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                helperText="Simulated test OTP pre-filled"
              />
            </Box>

            <Button
              variant="contained"
              fullWidth
              onClick={handleSign}
              disabled={signing}
              startIcon={signing ? <CircularProgress size={16} color="inherit" /> : <ShieldCheck size={18} />}
              sx={{ py: 1.2, backgroundColor: '#059669', fontWeight: 700, '&:hover': { backgroundColor: '#047857' } }}
            >
              {signing ? 'Signing with e-Sign Gateway...' : 'Verify OTP & Apply e-Signature'}
            </Button>
          </Box>
        ) : (
          <Box>
            <CheckCircle2 size={54} color="#059669" style={{ margin: '0 auto 12px' }} />
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#065f46' }}>
              Aadhaar e-Signature Applied!
            </Typography>
            <Typography variant="body2" sx={{ color: '#047857', mt: 0.5 }}>
              Digital certificate signing payload generated with SHA-256 integrity seal.
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};
