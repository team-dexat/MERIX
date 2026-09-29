import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Grid,
  Button,
  Chip,
  Paper,
  Divider,
  IconButton
} from '@mui/material';
import {
  Scale,
  MapPin,
  QrCode,
  ShieldCheck,
  AlertTriangle,
  Award,
  X,
  ExternalLink,
  Calendar,
  Layers,
  FileCheck
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Instrument } from '../../types';
import { createMapPin } from '../../utils/leafletIcons';

interface InstrumentDetailModalProps {
  open: boolean;
  onClose: () => void;
  instrument: Instrument | null;
  onApplyVerification?: (inst: Instrument) => void;
  onViewQr?: (inst: Instrument) => void;
}

export const InstrumentDetailModal: React.FC<InstrumentDetailModalProps> = ({
  open,
  onClose,
  instrument,
  onApplyVerification,
  onViewQr
}) => {
  if (!instrument) return null;

  const lat = instrument.latitude || 13.0827;
  const lng = instrument.longitude || 80.2707;

  const getTrustColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          overflow: 'hidden',
          backgroundColor: '#f8fafc'
        }
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          py: 2,
          px: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Scale size={24} color="#1e40af" />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
              {instrument.id} — {instrument.instrumentType}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              {instrument.businessName} • Registered Measuring Device
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: '#64748b' }}>
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {/* Top Summary Banner */}
        <Paper
          elevation={0}
          sx={{
            p: 2.2,
            mb: 2.5,
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2
          }}
        >
          <Box>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>
              EQUIPMENT STATUS
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <Chip
                label={instrument.status}
                size="small"
                sx={{
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  backgroundColor: instrument.status === 'VERIFIED' ? '#ecfdf5' : '#eff6ff',
                  color: instrument.status === 'VERIFIED' ? '#059669' : '#1e40af'
                }}
              />
              {instrument.isAtDriftRisk && (
                <Chip
                  label="DRIFT RISK FLAGGED"
                  size="small"
                  sx={{
                    fontWeight: 800,
                    fontSize: '0.72rem',
                    backgroundColor: '#fef2f2',
                    color: '#b91c1c'
                  }}
                />
              )}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>
                AI TRUST SCORE
              </Typography>
              <Typography
                variant="h5"
                sx={{ fontWeight: 900, color: getTrustColor(instrument.trustScore) }}
              >
                {instrument.trustScore}/100
              </Typography>
            </Box>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                border: `3px solid ${getTrustColor(instrument.trustScore)}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ShieldCheck size={22} color={getTrustColor(instrument.trustScore)} />
            </Box>
          </Box>
        </Paper>

        {/* Technical Specs Grid */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 2.5,
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            backgroundColor: '#ffffff'
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', mb: 2 }}>
            Technical &amp; Metrological Specifications
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={6} sm={4}>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Category</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>{instrument.category || 'Weighing Instruments'}</Typography>
            </Grid>

            <Grid item xs={6} sm={4}>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Manufacturer / Make</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>{instrument.manufacturer}</Typography>
            </Grid>

            <Grid item xs={6} sm={4}>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Model Number</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>{instrument.modelNumber}</Typography>
            </Grid>

            <Grid item xs={6} sm={4}>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Serial Number</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e40af', fontFamily: 'monospace' }}>{instrument.serialNumber}</Typography>
            </Grid>

            <Grid item xs={6} sm={4}>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Accuracy Class</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>{instrument.accuracyClass}</Typography>
            </Grid>

            <Grid item xs={6} sm={4}>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Max Capacity</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>{instrument.maxCapacity}</Typography>
            </Grid>

            <Grid item xs={6} sm={4}>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Min Capacity</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>{instrument.minCapacity || '—'}</Typography>
            </Grid>

            <Grid item xs={6} sm={4}>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Verification Interval (e)</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>{instrument.verificationScaleIntervalE || '—'}</Typography>
            </Grid>

            <Grid item xs={6} sm={4}>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Actual Interval (d)</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>{instrument.actualScaleIntervalD || '—'}</Typography>
            </Grid>

            <Grid item xs={6} sm={4}>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Mandatory Reverification</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#059669' }}>Every {instrument.verificationIntervalMonths} Months</Typography>
            </Grid>

            <Grid item xs={6} sm={8}>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Installation Location</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>
                {instrument.installationAddress} ({instrument.pincode || 'Tamil Nadu'})
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Map Preview */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            height: 180
          }}
        >
          <MapContainer
            center={[lat, lng]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={false}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            <Marker position={[lat, lng]} icon={createMapPin('#1e40af', '📍')}>
              <Popup>
                <strong>{instrument.businessName}</strong><br />
                {instrument.instrumentType} (GPS: {lat.toFixed(4)}, {lng.toFixed(4)})
              </Popup>
            </Marker>
          </MapContainer>
        </Paper>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {onViewQr && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<QrCode size={16} />}
              onClick={() => onViewQr(instrument)}
              sx={{ color: '#059669', borderColor: '#a7f3d0', fontWeight: 700 }}
            >
              Holographic QR
            </Button>
          )}
          {onApplyVerification && (
            <Button
              variant="contained"
              size="small"
              startIcon={<FileCheck size={16} />}
              onClick={() => onApplyVerification(instrument)}
              sx={{ backgroundColor: '#2563eb', fontWeight: 700 }}
            >
              Apply for Verification
            </Button>
          )}
        </Box>

        <Button onClick={onClose} sx={{ color: '#64748b', fontWeight: 600 }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
