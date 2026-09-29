import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Paper,
  Chip
} from '@mui/material';
import {
  Camera,
  MapPin,
  CheckCircle2,
  Sparkles,
  UploadCloud,
  X,
  Scale
} from 'lucide-react';
import { ApiService } from '../../services/api';
import { processNameplateOcr } from '../../services/ocrService';
import { useAuth } from '../../contexts/AuthContext';
import { Instrument, AccuracyClass, INSTRUMENT_CATEGORIES_MAP, INSTRUMENT_CATEGORIES } from '../../types';

interface RegisterInstrumentModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (newInstrument: Instrument) => void;
}

export const RegisterInstrumentModal: React.FC<RegisterInstrumentModalProps> = ({
  open,
  onClose,
  onSuccess
}) => {
  const { user } = useAuth();
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrSuccess, setOcrSuccess] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  // Form State
  const [businessName, setBusinessName] = useState(user?.businessName || 'Sundar Industries Pvt Ltd');
  const [category, setCategory] = useState<string>('Weighing Instruments');
  const [instrumentType, setInstrumentType] = useState<string>('Non-Automatic Weighing Instruments');
  const [manufacturer, setManufacturer] = useState('');
  const [modelNumber, setModelNumber] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [accuracyClass, setAccuracyClass] = useState<AccuracyClass>('Class III');
  const [maxCapacity, setMaxCapacity] = useState('300 kg');
  const [minCapacity, setMinCapacity] = useState('2 kg');
  const [scaleIntervalE, setScaleIntervalE] = useState('50 g');
  const [scaleIntervalD, setScaleIntervalD] = useState('10 g');
  const [verificationIntervalMonths, setVerificationIntervalMonths] = useState(24);
  const [latitude, setLatitude] = useState(13.0694);
  const [longitude, setLongitude] = useState(80.1948);
  const [installationAddress, setInstallationAddress] = useState('Shop No. 45, Wholesale Grain Yard, Koyambedu Market, Chennai');
  const [pincode, setPincode] = useState('600107');
  const [submitting, setSubmitting] = useState(false);

  const handleOcrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setOcrLoading(true);
    setOcrSuccess(false);

    try {
      const res = await processNameplateOcr(e.target.files[0]);
      setManufacturer(res.manufacturer);
      setModelNumber(res.modelNumber);
      setSerialNumber(res.serialNumber);
      if (res.category && INSTRUMENT_CATEGORIES.includes(res.category)) {
        setCategory(res.category);
        setInstrumentType(res.instrumentType);
      } else {
        setCategory('Weighing Instruments');
        setInstrumentType(res.instrumentType || 'Non-Automatic Weighing Instruments');
      }
      setAccuracyClass(res.accuracyClass);
      setMaxCapacity(res.maxCapacity);
      setMinCapacity(res.minCapacity);
      setScaleIntervalE(res.verificationScaleIntervalE);
      setScaleIntervalD(res.actualScaleIntervalD);
      setVerificationIntervalMonths(res.verificationIntervalMonths);
      setOcrSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setOcrLoading(false);
    }
  };

  const handleGetGps = () => {
    setGpsLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude);
          setLongitude(pos.coords.longitude);
          setInstallationAddress(`Live GPS Location (${pos.coords.latitude.toFixed(4)}°N, ${pos.coords.longitude.toFixed(4)}°E), APMC Hub`);
          setGpsLoading(false);
        },
        () => {
          // Fallback location
          setLatitude(13.0694);
          setLongitude(80.1948);
          setInstallationAddress('Shop No. 45, Wholesale Grain Yard, Koyambedu Market, Chennai');
          setGpsLoading(false);
        }
      );
    } else {
      setGpsLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!manufacturer || !serialNumber) {
      alert('Please fill in or scan manufacturer and serial number details.');
      return;
    }

    setSubmitting(true);
    const newInst = ApiService.registerInstrument(
      {
        userId: user?.id || 'USR-001',
        businessName,
        instrumentType,
        category,
        manufacturer,
        modelNumber,
        serialNumber,
        accuracyClass,
        maxCapacity,
        minCapacity,
        verificationIntervalMonths,
        verificationScaleIntervalE: scaleIntervalE,
        actualScaleIntervalD: scaleIntervalD,
        latitude,
        longitude,
        installationAddress,
        pincode
      },
      user?.id || 'USR-001'
    );

    setSubmitting(false);
    onSuccess(newInst);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: '16px' }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          py: 1.8,
          px: 3
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
          <Scale size={22} color="#1e40af" />
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
            Register Weighing / Measuring Instrument
          </Typography>
        </Box>
        <Button onClick={onClose} size="small" sx={{ minWidth: 32, p: 0.5, color: '#64748b' }}>
          <X size={18} />
        </Button>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {/* AI / OCR Scanner Banner */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 3,
            backgroundColor: '#eff6ff',
            border: '1.5px dashed #93c5fd',
            borderRadius: '12px',
            textAlign: 'center'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
            <Sparkles size={20} color="#1d4ed8" />
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1e40af' }}>
              AI Nameplate OCR Auto-Extractor
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: '#475569', mb: 2, fontSize: '0.85rem' }}>
            Upload a clear photo of the instrument's nameplate / model tag to automatically extract all Legal Metrology Act specifications.
          </Typography>

          <Button
            variant="contained"
            component="label"
            startIcon={ocrLoading ? <CircularProgress size={16} color="inherit" /> : <Camera size={18} />}
            disabled={ocrLoading}
            sx={{
              backgroundColor: '#1e40af',
              color: '#ffffff',
              '&:hover': { backgroundColor: '#1e3a8a' }
            }}
          >
            {ocrLoading ? 'Scanning Nameplate...' : 'Upload Nameplate Photo (OCR)'}
            <input type="file" hidden accept="image/*" onChange={handleOcrUpload} />
          </Button>

          {ocrSuccess && (
            <Alert severity="success" sx={{ mt: 2, borderRadius: '8px', py: 0.5 }}>
              Nameplate parsed successfully! Technical specifications and verification intervals populated.
            </Alert>
          )}
        </Paper>

        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Business / Owner Name"
              fullWidth
              size="small"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
            />
          </Grid>

          {/* Instrument Category Dropdown */}
          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Instrument Category"
              fullWidth
              size="small"
              value={category}
              onChange={(e) => {
                const newCat = e.target.value;
                setCategory(newCat);
                const types = INSTRUMENT_CATEGORIES_MAP[newCat] || [];
                if (types.length > 0) {
                  setInstrumentType(types[0]);
                }
              }}
            >
              {INSTRUMENT_CATEGORIES.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Instrument Type Dropdown (Filtered by selected Category) */}
          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Instrument Type"
              fullWidth
              size="small"
              value={instrumentType}
              onChange={(e) => setInstrumentType(e.target.value)}
              helperText={`Filtered under: ${category}`}
            >
              {(INSTRUMENT_CATEGORIES_MAP[category] || []).map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Manufacturer Name"
              fullWidth
              size="small"
              placeholder="e.g. Avery India, Essae, Mettler Toledo"
              value={manufacturer}
              onChange={(e) => setManufacturer(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Model Number"
              fullWidth
              size="small"
              placeholder="e.g. AV-500B, ME-204"
              value={modelNumber}
              onChange={(e) => setModelNumber(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Serial Number (Unique)"
              fullWidth
              size="small"
              placeholder="e.g. SN-AV-2024-88910"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Accuracy Class (Legal Metrology)"
              fullWidth
              size="small"
              value={accuracyClass}
              onChange={(e) => setAccuracyClass(e.target.value as AccuracyClass)}
            >
              <MenuItem value="Class I">Class I (Special Precision - Laboratory)</MenuItem>
              <MenuItem value="Class II">Class II (High Precision - Bullion/Jewelry)</MenuItem>
              <MenuItem value="Class III">Class III (Medium - Commercial/Industrial)</MenuItem>
              <MenuItem value="Class IIII">Class IIII (Ordinary - Highway/Bulk Weighing)</MenuItem>
              <MenuItem value="Class 0.5">Class 0.5 (Liquid Fuel Dispenser)</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Max Capacity (Max)"
              fullWidth
              size="small"
              placeholder="e.g. 300 kg, 60,000 kg, 220 g"
              value={maxCapacity}
              onChange={(e) => setMaxCapacity(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Min Capacity (Min)"
              fullWidth
              size="small"
              placeholder="e.g. 2 kg, 100 kg, 1 mg"
              value={minCapacity}
              onChange={(e) => setMinCapacity(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Verification Scale Interval (e)"
              fullWidth
              size="small"
              placeholder="e.g. 50 g, 10 kg, 1 mg"
              value={scaleIntervalE}
              onChange={(e) => setScaleIntervalE(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Actual Scale Interval (d)"
              fullWidth
              size="small"
              placeholder="e.g. 10 g, 5 kg, 0.1 mg"
              value={scaleIntervalD}
              onChange={(e) => setScaleIntervalD(e.target.value)}
            />
          </Grid>

          {/* GPS Geotagging Section */}
          <Grid item xs={12}>
            <Box
              sx={{
                p: 2,
                backgroundColor: '#f8fafc',
                borderRadius: '10px',
                border: '1px solid #e2e8f0'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MapPin size={18} color="#059669" />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                    Installation Geotagging &amp; GPS Coordinates
                  </Typography>
                </Box>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleGetGps}
                  disabled={gpsLoading}
                  startIcon={gpsLoading ? <CircularProgress size={14} /> : <MapPin size={14} />}
                  sx={{ color: '#059669', borderColor: '#a7f3d0' }}
                >
                  {gpsLoading ? 'Fetching GPS...' : 'Get GPS Location'}
                </Button>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Latitude"
                    fullWidth
                    size="small"
                    type="number"
                    value={latitude}
                    onChange={(e) => setLatitude(parseFloat(e.target.value))}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Longitude"
                    fullWidth
                    size="small"
                    type="number"
                    value={longitude}
                    onChange={(e) => setLongitude(parseFloat(e.target.value))}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Pincode"
                    fullWidth
                    size="small"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Full Installation Address"
                    fullWidth
                    size="small"
                    value={installationAddress}
                    onChange={(e) => setInstallationAddress(e.target.value)}
                  />
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
        <Button onClick={onClose} sx={{ color: '#64748b' }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting}
          sx={{ backgroundColor: '#1e40af', px: 3, '&:hover': { backgroundColor: '#1e3a8a' } }}
        >
          {submitting ? 'Registering...' : 'Register Instrument'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
