import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import { ShieldCheck, CheckCircle2, CloudUpload, X } from 'lucide-react';
import { Certificate } from '../../types';

interface DigiLockerModalProps {
  open: boolean;
  onClose: () => void;
  certificate: Certificate | null;
}

export const DigiLockerModal: React.FC<DigiLockerModalProps> = ({
  open,
  onClose,
  certificate
}) => {
  const [pushing, setPushing] = useState(false);
  const [pushed, setPushed] = useState(false);

  if (!certificate) return null;

  const handlePush = () => {
    setPushing(true);
    setTimeout(() => {
      setPushing(false);
      setPushed(true);
    }, 1200);
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
            DigiLocker Direct Push
          </Typography>
        </Box>
        <Button onClick={onClose} size="small" sx={{ minWidth: 32, p: 0.5 }}>
          <X size={18} />
        </Button>
      </DialogTitle>

      <DialogContent sx={{ p: 3, textAlign: 'center' }}>
        {!pushed ? (
          <Box>
            <Box sx={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: '#eff6ff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
              <CloudUpload size={28} color="#1e40af" />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
              Push to DigiLocker
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5, mb: 2.5 }}>
              Push digital certificate <strong>{certificate.certificateNumber}</strong> to the verified business DigiLocker account (DoCA Issuer ID: <strong>in.gov.doca.lm</strong>).
            </Typography>

            <Paper variant="outlined" sx={{ p: 1.5, backgroundColor: '#f8fafc', borderRadius: '10px', textAlign: 'left', mb: 2 }}>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                DigiLocker Doc URI:
              </Typography>
              <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#1e40af' }}>
                in.gov.doca-LMCERT-{certificate.certificateNumber}
              </Typography>
            </Paper>

            <Button
              variant="contained"
              fullWidth
              onClick={handlePush}
              disabled={pushing}
              startIcon={pushing ? <CircularProgress size={16} color="inherit" /> : <CloudUpload size={18} />}
              sx={{ py: 1.2, backgroundColor: '#1e40af', fontWeight: 700, '&:hover': { backgroundColor: '#1e3a8a' } }}
            >
              {pushing ? 'Syncing with DigiLocker API...' : 'Push Certificate to DigiLocker'}
            </Button>
          </Box>
        ) : (
          <Box>
            <CheckCircle2 size={54} color="#059669" style={{ margin: '0 auto 12px' }} />
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#065f46' }}>
              Successfully Pushed to DigiLocker!
            </Typography>
            <Typography variant="body2" sx={{ color: '#047857', mt: 0.5, mb: 2 }}>
              The certificate is now available in the owner's official DigiLocker app with QR verification.
            </Typography>
            <Button variant="outlined" fullWidth onClick={onClose} sx={{ color: '#059669', borderColor: '#a7f3d0', fontWeight: 700 }}>
              Done
            </Button>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};
