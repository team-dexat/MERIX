import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Paper, Card, CardContent,
  Button, Chip, TextField, MenuItem, Alert, Rating
} from '@mui/material';
import { MapPin, AlertTriangle, ShieldCheck, Eye } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { ApiService } from '../../services/api';
import { Instrument, CitizenReport } from '../../types';
import { createMapPin } from '../../utils/leafletIcons';

function getTrustColor(score: number) {
  if (score >= 80) return '#10b981';
  if (score >= 50) return '#f59e0b';
  return '#ef4444';
}

function getTrustLabel(score: number) {
  if (score >= 90) return 'Highly Trusted';
  if (score >= 70) return 'Trusted';
  if (score >= 50) return 'Moderate';
  return 'At Risk';
}

export const NearMe: React.FC = () => {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [selected, setSelected] = useState<Instrument | null>(null);
  const [reportForm, setReportForm] = useState<{
    name: string; phone: string; issue: CitizenReport['issueCategory']; desc: string
  }>({ name: '', phone: '', issue: 'SHORT_WEIGHT', desc: '' });
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  useEffect(() => {
    setInstruments(ApiService.getInstruments());
  }, []);

  const handleReport = () => {
    if (!selected || !reportForm.name || !reportForm.desc) return;
    ApiService.submitCitizenReport({
      instrumentId: selected.id,
      businessName: selected.businessName,
      reportedByName: reportForm.name,
      reportedByPhone: reportForm.phone,
      issueCategory: reportForm.issue,
      description: reportForm.desc,
      reportedLatitude: selected.latitude,
      reportedLongitude: selected.longitude
    });
    setInstruments(ApiService.getInstruments());
    setShowReportForm(false);
    setReportSuccess(true);
    setTimeout(() => setReportSuccess(false), 5000);
  };

  return (
    <Box sx={{ p: 3.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
        <MapPin size={24} color="#1e40af" />
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>Near Me — Verified Instruments</Typography>
      </Box>
      <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
        Citizen trust map of all verified weighing and measuring instruments nearby. Real Trust Scores based on Legal Metrology officer audits + citizen reports.
      </Typography>

      {reportSuccess && (
        <Alert severity="success" sx={{ mb: 2, borderRadius: '10px' }}>
          Report submitted. The instrument's trust score has been updated and an alert dispatched to the Department Admin.
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Left Panel: Instrument List */}
        <Grid item xs={12} md={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxHeight: 580, overflowY: 'auto', pr: 0.5 }}>
            {instruments.map(inst => (
              <Card
                key={inst.id}
                onClick={() => { setSelected(inst); setShowReportForm(false); }}
                sx={{
                  borderRadius: '14px',
                  border: selected?.id === inst.id ? '2px solid #1e40af' : '1px solid #e2e8f0',
                  cursor: 'pointer',
                  boxShadow: selected?.id === inst.id ? '0 0 0 3px rgba(30,64,175,0.1)' : 'none',
                  transition: 'all 0.15s'
                }}
              >
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.88rem' }}>
                      {inst.businessName}
                    </Typography>
                    <Box
                      sx={{
                        width: 38,
                        height: 38,
                        borderRadius: '50%',
                        border: `3px solid ${getTrustColor(inst.trustScore)}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 800, color: getTrustColor(inst.trustScore), fontSize: '0.72rem' }}>
                        {inst.trustScore}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>{inst.instrumentType} · {inst.id}</Typography>
                  <Box sx={{ mt: 0.8, display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
                    <Chip
                      label={getTrustLabel(inst.trustScore)}
                      size="small"
                      sx={{
                        fontSize: '0.65rem', height: 18, fontWeight: 700,
                        backgroundColor: `${getTrustColor(inst.trustScore)}18`,
                        color: getTrustColor(inst.trustScore)
                      }}
                    />
                    {inst.isAtDriftRisk && (
                      <Chip label="DRIFT RISK" size="small" sx={{ fontSize: '0.65rem', height: 18, fontWeight: 700, backgroundColor: '#fef3c7', color: '#b45309' }} />
                    )}
                    <Chip label={inst.status} size="small" sx={{ fontSize: '0.65rem', height: 18, fontWeight: 700, backgroundColor: inst.status === 'VERIFIED' ? '#ecfdf5' : '#eff6ff', color: inst.status === 'VERIFIED' ? '#059669' : '#1e40af' }} />
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Grid>

        {/* Right Panel: Map & Detail */}
        <Grid item xs={12} md={8}>
          {/* Leaflet Map */}
          <Paper elevation={0} sx={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0', mb: 2.5, height: 340 }}>
            <MapContainer
              center={[13.0827, 80.2707]}
              zoom={11}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              {instruments.map(inst => {
                const isSelected = selected?.id === inst.id;
                const pinColor = inst.status === 'VERIFIED' ? '#059669' : inst.isAtDriftRisk ? '#dc2626' : '#1e40af';
                const pinIcon = createMapPin(pinColor, inst.status === 'VERIFIED' ? '✓' : '!', isSelected);

                return (
                  <Marker
                    key={inst.id}
                    position={[inst.latitude, inst.longitude]}
                    icon={pinIcon}
                    eventHandlers={{ click: () => setSelected(inst) }}
                  >
                    <Popup>
                      <strong>{inst.businessName}</strong><br />
                      {inst.instrumentType}<br />
                      Trust: {inst.trustScore}/100<br />
                      Status: {inst.status}
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </Paper>

          {/* Selected Instrument Detail & Citizen Report */}
          {selected && (
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>{selected.businessName}</Typography>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    {selected.instrumentType} · {selected.serialNumber} · Max {selected.maxCapacity}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                    <MapPin size={13} color="#64748b" />
                    <Typography variant="caption" sx={{ color: '#64748b' }}>{selected.installationAddress}</Typography>
                  </Box>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: getTrustColor(selected.trustScore) }}>
                    {selected.trustScore}
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: getTrustColor(selected.trustScore) }}>
                    Trust Score
                  </Typography>
                </Box>
              </Box>

              {!showReportForm ? (
                <Button
                  variant="outlined"
                  startIcon={<AlertTriangle size={16} />}
                  onClick={() => setShowReportForm(true)}
                  sx={{ color: '#dc2626', borderColor: '#fecaca', fontWeight: 700 }}
                >
                  Report Issue / Tampering
                </Button>
              ) : (
                <Box sx={{ backgroundColor: '#fff5f5', p: 2.5, borderRadius: '12px', border: '1px solid #fecaca' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#991b1b', mb: 1.5 }}>
                    Submit Citizen Complaint (Anonymous OK)
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField label="Your Name" size="small" fullWidth value={reportForm.name} onChange={e => setReportForm(f => ({ ...f, name: e.target.value }))} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField label="Phone (Optional)" size="small" fullWidth value={reportForm.phone} onChange={e => setReportForm(f => ({ ...f, phone: e.target.value }))} />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        select
                        label="Issue Category"
                        size="small"
                        fullWidth
                        value={reportForm.issue}
                        onChange={e => setReportForm(f => ({ ...f, issue: e.target.value as CitizenReport['issueCategory'] }))}
                      >
                        <MenuItem value="SHORT_WEIGHT">Short Weight / Under-measurement</MenuItem>
                        <MenuItem value="BROKEN_SEAL">Broken Verification Seal / Tampering</MenuItem>
                        <MenuItem value="UNVERIFIED_DEVICE">Unverified / Unstamped Instrument</MenuItem>
                        <MenuItem value="EXPIRED_STAMP">Expired Stamp / Outdated Verification</MenuItem>
                        <MenuItem value="ALTERED_MEASURE">Altered / Calibration Rigging</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField label="Describe the Issue" size="small" fullWidth multiline rows={2} value={reportForm.desc} onChange={e => setReportForm(f => ({ ...f, desc: e.target.value }))} />
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button variant="contained" onClick={handleReport} sx={{ backgroundColor: '#dc2626', fontWeight: 700 }}>Submit Report</Button>
                        <Button onClick={() => setShowReportForm(false)} sx={{ color: '#64748b' }}>Cancel</Button>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};
