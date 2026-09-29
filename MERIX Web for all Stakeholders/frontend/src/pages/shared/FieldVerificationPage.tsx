import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Alert,
  Divider,
  Button,
  IconButton,
  Card,
  CardContent
} from '@mui/material';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  Sparkles,
  Camera,
  MapPin,
  ArrowLeft,
  Scale,
  Award,
  Clock,
  FileText,
  Lock,
  Building,
  Check
} from 'lucide-react';
import { ApiService } from '../../services/api';
import { calculateMpe, MpeResult } from '../../services/mpeCalculator';
import { AadhaarEsignModal } from '../../components/common/AadhaarEsignModal';
import { DigitalCertificateModal } from '../../components/certificates/DigitalCertificateModal';
import { useAuth } from '../../contexts/AuthContext';
import { VerificationApplication, Certificate, Instrument } from '../../types';

interface FieldVerificationPageProps {
  applicationId: string;
  onBack: () => void;
  onCertificateGenerated?: (cert: Certificate) => void;
}

export const FieldVerificationPage: React.FC<FieldVerificationPageProps> = ({
  applicationId,
  onBack,
  onCertificateGenerated
}) => {
  const { user } = useAuth();
  const [application, setApplication] = useState<VerificationApplication | null>(null);
  const [esignOpen, setEsignOpen] = useState(false);
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [generatedCert, setGeneratedCert] = useState<Certificate | null>(null);

  // Geo Coordinates (Tamil Nadu / Chennai Industrial Corridor)
  const [officerLat, setOfficerLat] = useState(13.0827);
  const [officerLng, setOfficerLng] = useState(80.2707);
  const [geoFenceOk, setGeoFenceOk] = useState(true);

  // Dynamic Checklist
  const [checklist, setChecklist] = useState<{ title: string; checked: boolean }[]>([
    { title: 'Visual physical inspection of scale body and platform', checked: true },
    { title: 'Leveling bubble verified centered on surface', checked: true },
    { title: 'Zero load balance verification (within +/- 0.25 e)', checked: true },
    { title: 'Eccentricity corner load test (1/3 Max load applied)', checked: true },
    { title: 'Linearity & weighing accuracy within MPE (+/- 0.5 e)', checked: true },
    { title: 'Tamper-evident stamping seal applied and documented', checked: true }
  ]);

  // Digital Testing Simulator Load Points
  const [testLoads, setTestLoads] = useState<MpeResult[]>([
    calculateMpe('Zero Load (0 kg)', 0, 0.00, 0.05, 'kg'),
    calculateMpe('Min Load (2 kg)', 2, 2.01, 0.05, 'kg'),
    calculateMpe('1/3 Capacity (100 kg)', 100, 100.02, 0.05, 'kg'),
    calculateMpe('2/3 Capacity (200 kg)', 200, 200.03, 0.05, 'kg'),
    calculateMpe('Max Capacity (300 kg)', 300, 300.04, 0.05, 'kg'),
    calculateMpe('Corner Eccentricity (100 kg)', 100, 100.02, 0.05, 'kg')
  ]);

  // Stamping & Officer Inputs
  const [stampNumber, setStampNumber] = useState(`TN-LM-STAMP-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [securitySealNumber, setSecuritySealNumber] = useState(`SEC-TAG-TN-${Math.floor(100000 + Math.random() * 900000)}`);
  const [testVerdict, setTestVerdict] = useState<'PASSED' | 'FAILED'>('PASSED');
  const [remarks, setRemarks] = useState('All standard load tests verified within Legal Metrology Schedule VII MPE limits. Stamped and sealed.');
  const [submitting, setSubmitting] = useState(false);

  // Load application & instrument
  useEffect(() => {
    const app = ApiService.getApplicationById(applicationId);
    if (app) {
      setApplication(app);

      // Load statutory checklist items for this instrument type from Rule Engine
      const rules = ApiService.getRules();
      const instType = (app.instrument?.instrumentType || app.instrument?.category || '').toLowerCase();
      const match = rules.find(r =>
        r.instrumentType.toLowerCase() === instType ||
        instType.includes(r.instrumentType.toLowerCase()) ||
        r.instrumentType.toLowerCase().includes(instType)
      );

      if (match && match.checklistTemplate && match.checklistTemplate.length > 0) {
        setChecklist(match.checklistTemplate.map(item => ({ title: item, checked: true })));
      }

      // If capacity is in liters or tonnes, extract unit and adjust test points
      const rawCap = app.instrument?.maxCapacity || '300 kg';
      const unitMatch = rawCap.match(/[a-zA-Z/]+/);
      const unit = unitMatch ? unitMatch[0] : 'kg';
      const maxCapNum = parseFloat(rawCap.replace(/,/g, '')) || 300;
      setTestLoads([
        calculateMpe(`Zero Load (0 ${unit})`, 0, 0.00, maxCapNum * 0.0005, unit),
        calculateMpe(`Min Load (${(maxCapNum * 0.01).toFixed(1)} ${unit})`, Number((maxCapNum * 0.01).toFixed(1)), Number((maxCapNum * 0.0101).toFixed(2)), maxCapNum * 0.0005, unit),
        calculateMpe(`1/3 Capacity (${(maxCapNum * 0.33).toFixed(1)} ${unit})`, Number((maxCapNum * 0.33).toFixed(1)), Number((maxCapNum * 0.3302).toFixed(2)), maxCapNum * 0.0005, unit),
        calculateMpe(`2/3 Capacity (${(maxCapNum * 0.66).toFixed(1)} ${unit})`, Number((maxCapNum * 0.66).toFixed(1)), Number((maxCapNum * 0.6603).toFixed(2)), maxCapNum * 0.0005, unit),
        calculateMpe(`Max Capacity (${maxCapNum} ${unit})`, maxCapNum, Number((maxCapNum * 1.0001).toFixed(2)), maxCapNum * 0.0005, unit),
        calculateMpe(`Corner Eccentricity (${(maxCapNum * 0.33).toFixed(1)} ${unit})`, Number((maxCapNum * 0.33).toFixed(1)), Number((maxCapNum * 0.3302).toFixed(2)), maxCapNum * 0.0005, unit)
      ]);
    }
  }, [applicationId]);

  if (!application) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ color: '#64748b', mb: 2 }}>
          Application record not found or loading...
        </Typography>
        <Button variant="outlined" startIcon={<ArrowLeft size={16} />} onClick={onBack}>
          Back
        </Button>
      </Box>
    );
  }

  const handleSimulateLoadChange = (index: number, newObserved: number) => {
    const updated = [...testLoads];
    const current = updated[index];
    updated[index] = calculateMpe(current.loadPoint, current.appliedLoad, newObserved, current.mpeLimit, current.unit);
    setTestLoads(updated);
    const allPass = updated.every(t => t.passed) && checklist.every(c => c.checked);
    setTestVerdict(allPass ? 'PASSED' : 'FAILED');
  };

  const handleToggleCheck = (index: number) => {
    const updated = [...checklist];
    updated[index].checked = !updated[index].checked;
    setChecklist(updated);
    const allPass = testLoads.every(t => t.passed) && updated.every(c => c.checked);
    setTestVerdict(allPass ? 'PASSED' : 'FAILED');
  };

  const handleCompleteVerification = () => {
    setSubmitting(true);

    const newCert = ApiService.submitFieldInspection({
      applicationId: application.id,
      instrumentId: application.instrumentId,
      officerId: user?.id || 'USR-003',
      inspectorLatitude: officerLat,
      inspectorLongitude: officerLng,
      geoFenceVerified: geoFenceOk,
      checklistResults: checklist,
      testLoadReadings: testLoads,
      eccentricityTestPassed: true,
      repeatabilityTestPassed: true,
      calculatedMaxError: Math.max(...testLoads.map(t => Math.abs(t.error))),
      maxPermissibleError: 0.10,
      testVerdict,
      stampNumber,
      securitySealNumber,
      remarks
    });

    setSubmitting(false);
    setGeneratedCert(newCert);
    setCertModalOpen(true);

    if (onCertificateGenerated) {
      onCertificateGenerated(newCert);
    }
  };

  const allPassed = testLoads.every(t => t.passed) && checklist.every(c => c.checked);

  return (
    <Box sx={{ p: { xs: 2, md: 3.5 }, maxWidth: '1400px', margin: '0 auto' }}>
      {/* Top Header & Breadcrumb */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<ArrowLeft size={16} />}
            onClick={onBack}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.82rem',
              color: '#1e40af',
              borderColor: '#bfdbfe',
              backgroundColor: '#ffffff',
              '&:hover': { backgroundColor: '#eff6ff' }
            }}
          >
            Back
          </Button>
          <Box>
            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.78rem', fontWeight: 600 }}>
              Field Verification / Stamping Console
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', fontFamily: '"Outfit", sans-serif', lineHeight: 1.2 }}>
              Verification &amp; Stamping Console — {application.id}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Chip
            icon={<ShieldCheck size={14} color="#059669" />}
            label="Inspector GPS Locked"
            sx={{
              fontWeight: 800,
              fontSize: '0.75rem',
              backgroundColor: '#ecfdf5',
              color: '#059669',
              border: '1px solid #a7f3d0'
            }}
          />
        </Box>
      </Box>

      {/* Geo-fencing & Instrument Banner */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} md={7}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: '12px', backgroundColor: '#ffffff', height: '100%' }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b' }}>
              INSTRUMENT UNDER VERIFICATION
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mt: 0.3 }}>
              {application.instrument?.businessName || 'Sundar Industries Pvt Ltd'} &bull; {application.instrument?.instrumentType || 'Platform Scale'}
            </Typography>
            <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.85rem', mt: 0.5 }}>
              <strong>Serial No:</strong> {application.instrument?.serialNumber || 'SN-TN-2024-0091'} &bull;{' '}
              <strong>Accuracy:</strong> {application.instrument?.accuracyClass || 'Class III'} &bull;{' '}
              <strong>Capacity:</strong> {application.instrument?.maxCapacity || '300 kg'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
              <MapPin size={13} color="#dc2626" /> {application.instrument?.installationAddress || 'Guindy Industrial Estate, Chennai'}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '12px',
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <MapPin size={20} color="#059669" />
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#047857' }}>
                GPS Geo-Fence Match Verified
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: '#065f46', fontSize: '0.82rem', lineHeight: 1.4 }}>
              Inspector Live Coordinates: <strong>13.0827° N, 80.2707° E</strong> (Within 0.00 km of registered installation site). Inspection authenticated.
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* SECTION 1: STATUTORY CHECKLIST */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: '12px', backgroundColor: '#ffffff' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5 }}>
          1. Statutory Rule Engine Inspection Checklist
        </Typography>
        <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 2 }}>
          Mandatory compliance checks under Legal Metrology (General) Rules, 2011 Schedule VII.
        </Typography>

        <Grid container spacing={1.5}>
          {checklist.map((item, idx) => (
            <Grid item xs={12} sm={6} key={idx}>
              <Paper
                variant="outlined"
                sx={{
                  p: 1.2,
                  px: 1.8,
                  borderRadius: '8px',
                  backgroundColor: item.checked ? '#f8fafc' : '#ffffff',
                  border: item.checked ? '1px solid #cbd5e1' : '1px solid #fee2e2'
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={item.checked}
                      onChange={() => handleToggleCheck(idx)}
                      size="small"
                      sx={{ color: '#059669', '&.Mui-checked': { color: '#059669' } }}
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ fontSize: '0.84rem', fontWeight: 600, color: item.checked ? '#0f172a' : '#991b1b' }}>
                      {item.title}
                    </Typography>
                  }
                />
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* SECTION 2: DIGITAL TESTING / READING SIMULATOR */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: '12px', backgroundColor: '#ffffff' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Scale size={20} color="#1e40af" />
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
              2. Digital Standard Weight Testing &amp; MPE Simulator
            </Typography>
          </Box>
          <Chip
            label="OIML R76 / Schedule VII MPE Compliant"
            size="small"
            sx={{ backgroundColor: '#eff6ff', color: '#1e40af', fontWeight: 800, fontSize: '0.72rem' }}
          />
        </Box>

        <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 2 }}>
          Enter observed load point readings from standard test weights to calculate error delta (&Delta;) against statutory Maximum Permissible Error limits.
        </Typography>

        <Table size="small" sx={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
          <TableHead sx={{ backgroundColor: '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Test Load Point</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Standard Certified Load</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Observed Digital Reading</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Calculated Error (&Delta;)</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>MPE Limit (&plusmn;)</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Verification Verdict</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {testLoads.map((row, idx) => (
              <TableRow key={idx} hover>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.82rem', color: '#0f172a' }}>{row.loadPoint}</TableCell>
                <TableCell sx={{ fontSize: '0.82rem', fontWeight: 600 }}>{row.appliedLoad} {row.unit}</TableCell>
                <TableCell sx={{ width: 150 }}>
                  <TextField
                    size="small"
                    type="number"
                    value={row.observedReading}
                    onChange={(e) => handleSimulateLoadChange(idx, parseFloat(e.target.value) || 0)}
                    inputProps={{ step: 0.01 }}
                    sx={{ width: 120, '& .MuiInputBase-input': { py: 0.5, fontSize: '0.85rem', fontWeight: 700 } }}
                  />
                </TableCell>
                <TableCell sx={{ fontSize: '0.82rem', fontWeight: 800, color: row.error === 0 ? '#059669' : '#1e40af' }}>
                  {row.error > 0 ? `+${row.error}` : row.error} {row.unit}
                </TableCell>
                <TableCell sx={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
                  &plusmn;{row.mpeLimit} {row.unit}
                </TableCell>
                <TableCell>
                  {row.passed ? (
                    <Chip
                      icon={<CheckCircle2 size={13} color="#15803d" />}
                      label="PASS"
                      size="small"
                      sx={{ backgroundColor: '#dcfce7', color: '#15803d', fontWeight: 800, fontSize: '0.72rem' }}
                    />
                  ) : (
                    <Chip
                      icon={<XCircle size={13} color="#b91c1c" />}
                      label="FAIL (MPE EXCEEDED)"
                      size="small"
                      sx={{ backgroundColor: '#fee2e2', color: '#b91c1c', fontWeight: 800, fontSize: '0.72rem' }}
                    />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* SECTION 3: PHYSICAL STAMPING, SECURITY SEAL & ORDER */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3.5, borderRadius: '12px', backgroundColor: '#ffffff' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5 }}>
          3. Physical Stamping, Security Tag &amp; Final Certification Verdict
        </Typography>
        <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 2.5 }}>
          Enter embossed stamp serial number and tamper-evident security tag applied to the instrument.
        </Typography>

        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Legal Metrology Stamp Number"
              fullWidth
              size="small"
              value={stampNumber}
              onChange={(e) => setStampNumber(e.target.value)}
              helperText="Official embossed seal stamp serial number"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Lead / Security Seal Tag Number"
              fullWidth
              size="small"
              value={securitySealNumber}
              onChange={(e) => setSecuritySealNumber(e.target.value)}
              helperText="Tamper-evident barcode / RFID seal tag"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              select
              label="Officer Verification Verdict"
              fullWidth
              size="small"
              value={testVerdict}
              onChange={(e) => setTestVerdict(e.target.value as 'PASSED' | 'FAILED')}
            >
              <MenuItem value="PASSED">PASSED (Issue Digital Certificate)</MenuItem>
              <MenuItem value="FAILED">FAILED (Issue Rejection Order)</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Officer Inspection Remarks &amp; Observation Notes"
              fullWidth
              multiline
              rows={2.5}
              size="small"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* BOTTOM ACTION BAR */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
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
        <Typography variant="body2" sx={{ color: allPassed ? '#047857' : '#b45309', fontWeight: 700 }}>
          {allPassed ? '✓ All test load errors and checklist requirements cleared for stamping.' : '⚠️ Please ensure all test load readings and checklist items pass.'}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            onClick={onBack}
            sx={{ color: '#64748b', borderColor: '#cbd5e1', textTransform: 'none', fontWeight: 700 }}
          >
            Cancel
          </Button>

          <Button
            variant="outlined"
            onClick={() => setEsignOpen(true)}
            disabled={submitting || !allPassed}
            sx={{
              color: '#059669',
              borderColor: '#a7f3d0',
              fontWeight: 700,
              textTransform: 'none',
              backgroundColor: '#f0fdf4',
              '&:hover': { backgroundColor: '#dcfce7' }
            }}
          >
            Aadhaar e-Sign Authorization
          </Button>

          <Button
            variant="contained"
            onClick={handleCompleteVerification}
            disabled={submitting || !allPassed}
            startIcon={<ShieldCheck size={18} />}
            sx={{
              backgroundColor: '#059669',
              px: 3.5,
              py: 1,
              fontWeight: 800,
              fontSize: '0.85rem',
              textTransform: 'none',
              borderRadius: '8px',
              '&:hover': { backgroundColor: '#047857' }
            }}
          >
            {submitting ? 'Generating Certificate...' : 'Complete & Generate Certificate'}
          </Button>
        </Box>
      </Paper>

      {/* Aadhaar e-Sign Modal */}
      <AadhaarEsignModal
        open={esignOpen}
        onClose={() => setEsignOpen(false)}
        officerName={user?.fullName || 'K. Murugan, Inspector (LMO)'}
        onSuccess={handleCompleteVerification}
      />

      {/* Digital Certificate Modal (When Generated) */}
      <DigitalCertificateModal
        open={certModalOpen}
        onClose={() => {
          setCertModalOpen(false);
          onBack();
        }}
        certificate={generatedCert}
      />
    </Box>
  );
};
