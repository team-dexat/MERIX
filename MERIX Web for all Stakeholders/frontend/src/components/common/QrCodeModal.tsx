import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip
} from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Download, X, CheckCircle2 } from 'lucide-react';

interface QrCodeModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  qrValue: string;
  badgeText?: string;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({
  open,
  onClose,
  title,
  subtitle,
  qrValue,
  badgeText
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: '16px', textAlign: 'center' } }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          py: 1.5,
          px: 3
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
          <Box
            component="img"
            src="/logo.png"
            alt="Merix"
            sx={{ width: 26, height: 26, objectFit: 'contain', borderRadius: '50%' }}
          />
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
            Legal Metrology QR Code
          </Typography>
        </Box>
        <Button onClick={onClose} size="small" sx={{ minWidth: 32, p: 0.5, color: '#64748b' }}>
          <X size={18} />
        </Button>
      </DialogTitle>

      <DialogContent sx={{ p: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5 }}>
          {title}
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b', mb: 3, fontSize: '0.85rem' }}>
          {subtitle}
        </Typography>

        <Box
          sx={{
            p: 3,
            border: '2px solid #e2e8f0',
            borderRadius: '16px',
            display: 'inline-block',
            backgroundColor: '#ffffff',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
          }}
        >
          <QRCodeSVG value={qrValue} size={180} level="H" includeMargin />
        </Box>

        {badgeText && (
          <Box sx={{ mt: 2.5 }}>
            <Chip
              icon={<CheckCircle2 size={14} color="#059669" />}
              label={badgeText}
              sx={{ backgroundColor: '#ecfdf5', color: '#047857', fontWeight: 700 }}
            />
          </Box>
        )}

        <Typography variant="caption" sx={{ display: 'block', mt: 2, color: '#94a3b8' }}>
          Scan with any mobile camera or Merix Public Scanner to verify live stamping status.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 2, backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', justifyContent: 'center' }}>
        <Button onClick={onClose} variant="contained" sx={{ backgroundColor: '#1e40af', px: 4 }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
