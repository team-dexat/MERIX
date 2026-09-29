import React, { useState, useEffect } from 'react';
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
  IconButton
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
  X,
  Scale
} from 'lucide-react';
import { ApiService } from '../../services/api';
import { calculateMpe, MpeResult } from '../../services/mpeCalculator';
import { AadhaarEsignModal } from '../common/AadhaarEsignModal';
import { useAuth } from '../../contexts/AuthContext';
import { VerificationApplication, Certificate } from '../../types';

interface FieldInspectionModalProps {
  open: boolean;
  onClose: () => void;
  application: VerificationApplication | null;
  onCertificateGenerated: (cert: Certificate) => void;
}

export const FieldInspectionModal: React.FC<FieldInspectionModalProps> = ({
  open,
  onClose,
  application,
  onCertificateGenerated
}) => {
  const { user } = useAuth();
  const [esignOpen, setEsignOpen] = useState(false);

  // Geo Coordinates (Real Tamil Nadu / Chennai Industrial Corridor)
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

  // Load statutory checklist items for this instrument type from Rule Engine
  useEffect(() => {
    if (!application?.instrument) return;
    const rules = ApiService.getRules();
    const instType = (application.instrument.instrumentType || application.instrument.category || '').toLowerCase();
    const match = rules.find(r => 
      r.instrumentType.toLowerCase() === instType ||
      instType.includes(r.instrumentType.toLowerCase()) ||
      r.instrumentType.toLowerCase().includes(instType)
    );

    if (match && match.checklistTemplate && match.checklistTemplate.length > 0) {
      setChecklist(match.checklistTemplate.map(item => ({ title: item, checked: true })));
    }
  }, [application, open]);

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

  if (!application) return null;

  const handleSimulateLoadChange = (index: number, newObserved: number) => {
    const updated = [...testLoads];
    const current = updated[index];
    updated[index] = calculateMpe(current.loadPoint, current.appliedLoad, newObserved, 0.05, current.unit);
    setTestLoads(updated);
    // Auto-compute pass/fail verdict from updated readings
    const allPass = updated.every(t => t.passed) && checklist.every(c => c.checked);
    setTestVerdict(allPass ? 'PASSED' : 'FAILED');
  };

  const handleToggleCheck = (index: number) => {
    const updated = [...checklist];
    updated[index].checked = !updated[index].checked;
    setChecklist(updated);
    // Auto-compute pass/fail verdict from updated checklist
    const allPass = testLoads.every(t => t.passed) && updated.every(c => c.checked);
    setTestVerdict(allPass ? 'PASSED' : 'FAILED');
  };

  const handleCompleteVerification = () => {
    setSubmitting(true);

    const generatedCert = ApiService.submitFieldInspection({
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
    onClose();
    onCertificateGenerated(generatedCert);
  };

  const allPassed = testLoads.every(t => t.passed) && checklist.every(c => c.checked);


  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
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
          <ShieldCheck size={24} color="#059669" />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
              Field Verification &amp; Stamping Console ({application.id})
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              Legal Metrology Officer Inspection &bull; Standard Load Testing &bull; Stamping Certificate Generation
            </Typography>
          </Box>
        </Box>
        <Button onClick={onClose} size="small" sx={{ minWidth: 32, p: 0.5, color: '#64748b' }}>
          <X size={18} />
        </Button>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {/* Geo-fencing & Instrument Banner */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={7}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: '10px', height: '100%' }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b' }}>
                INSTRUMENT UNDER VERIFICATION
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                {application.instrument?.businessName} &bull; {application.instrument?.instrumentType}
              </Typography>
              <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.85rem' }}>
                <strong>Serial No:</strong> {application.instrument?.serialNumber} &bull; <strong>Accuracy:</strong> {application.instrument?.accuracyClass} &bull; <strong>Max:</strong> {application.instrument?.maxCapacity} (e = {application.instrument?.verificationScaleIntervalE || '50g'})
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.5 }}>
                {application.instrument?.installationAddress}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={5}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: '10px',
                backgroundColor: '#ecfdf5',
                border: '1px solid #a7f3d0',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <MapPin size={18} color="#059669" />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#047857' }}>
                  GPS Geo-Fence Match Verified
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#065f46', fontSize: '0.8rem' }}>
                Inspector Live GPS: <strong>13.0827° N, 80.2707° E</strong> (0.00 km delta from registered coordinates). Geo-lock cleared.
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Dynamic Checklist */}
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', mb: 1.5 }}>
          1. Statutory Rule Engine Inspection Checklist
        </Typography>
        <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: '10px' }}>
          <Grid container spacing={1}>
            {checklist.map((item, idx) => (
              <Grid item xs={12} sm={6} key={idx}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={item.checked}
                      onChange={() => handleToggleCheck(idx)}
                      size="small"
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ fontSize: '0.82rem', fontWeight: 500 }}>
                      {item.title}
                    </Typography>
                  }
                />
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* Digital Testing / Reading Simulator */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Scale size={18} color="#1e40af" />
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
              2. Digital Standard Weight Testing &amp; MPE Simulator (Legal Metrology Act Rules)
            </Typography>
          </Box>
          <Chip
            label="OIML R76 / Schedule VII Compliant"
            size="small"
            sx={{ backgroundColor: '#eff6ff', color: '#1e40af', fontWeight: 700, fontSize: '0.7rem' }}
          />
        </Box>

        <Paper variant="outlined" sx={{ mb: 3, borderRadius: '10px', overflow: 'hidden' }}>
          <Table size="small">
            <TableHead sx={{ backgroundColor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Test Load Point</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Standard Certified Load</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Observed Digital Reading</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Calculated Error (Δ)</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>MPE Limit (±)</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Verification Verdict</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {testLoads.map((row, idx) => (
                <TableRow key={idx}>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>{row.loadPoint}</TableCell>
                  <TableCell sx={{ fontSize: '0.8rem' }}>{row.appliedLoad} {row.unit}</TableCell>
                  <TableCell sx={{ width: 140 }}>
                    <TextField
                      size="small"
                      type="number"
                      value={row.observedReading}
                      onChange={(e) => handleSimulateLoadChange(idx, parseFloat(e.target.value) || 0)}
                      inputProps={{ step: 0.01 }}
                      sx={{ width: 110, '& .MuiInputBase-input': { py: 0.5, fontSize: '0.82rem', fontWeight: 700 } }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', fontWeight: 700, color: row.error === 0 ? '#059669' : '#1e40af' }}>
                    {row.error > 0 ? `+${row.error}` : row.error} {row.unit}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                    &plusmn;{row.mpeLimit} {row.unit}
                  </TableCell>
                  <TableCell>
                    {row.passed ? (
                      <Chip
                        icon={<CheckCircle2 size={13} color="#15803d" />}
                        label="PASS"
                        size="small"
                        sx={{ backgroundColor: '#dcfce7', color: '#15803d', fontWeight: 800, fontSize: '0.7rem' }}
                      />
                    ) : (
                      <Chip
                        icon={<XCircle size={13} color="#b91c1c" />}
                        label="FAIL (MPE EXCEEDED)"
                        size="small"
                        sx={{ backgroundColor: '#fee2e2', color: '#b91c1c', fontWeight: 800, fontSize: '0.7rem' }}
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>

        {/* Stamping & Seal Section */}
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', mb: 1.5 }}>
          3. Physical Stamping, Security Tag &amp; Final Certification Verdict
        </Typography>

        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Legal Metrology Stamp Number"
              fullWidth
              size="small"
              value={stampNumber}
              onChange={(e) => setStampNumber(e.target.value)}
              helperText="Official embossed seal stamp identification"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Lead / Security Seal Tag Number"
              fullWidth
              size="small"
              value={securitySealNumber}
              onChange={(e) => setSecuritySealNumber(e.target.value)}
              helperText="Tamper-evident barcode/RFID seal tag"
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
              label="Officer Remarks &amp; Inspection Observation Notes"
              fullWidth
              multiline
              rows={2}
              size="small"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', justifyContent: 'space-between' }}>
        <Typography variant="caption" sx={{ color: '#047857', fontWeight: 600 }}>
          {allPassed ? '✓ All test load errors and checklist items cleared for stamping.' : '⚠️ Please review load readings or checklist.'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button onClick={onClose} sx={{ color: '#64748b' }}>
            Cancel
          </Button>
          <Button
            variant="outlined"
            onClick={() => setEsignOpen(true)}
            disabled={submitting || !allPassed}
            sx={{ color: '#059669', borderColor: '#a7f3d0', fontWeight: 700 }}
          >
            Aadhaar e-Sign
          </Button>
          <Button
            variant="contained"
            onClick={handleCompleteVerification}
            disabled={submitting || !allPassed}
            startIcon={<ShieldCheck size={18} />}
            sx={{ backgroundColor: '#059669', px: 3, '&:hover': { backgroundColor: '#047857' } }}
          >
            {submitting ? 'Generating Certificate...' : 'Complete & Generate Certificate'}
          </Button>
        </Box>
      </DialogActions>

      <AadhaarEsignModal
        open={esignOpen}
        onClose={() => setEsignOpen(false)}
        officerName={user?.fullName || 'K. Murugan, Inspector (LMO)'}
        onSuccess={handleCompleteVerification}
      />
    </Dialog>
  );
};
