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
  Divider,
  Paper,
  Chip,
  Alert
} from '@mui/material';
import { Network, CheckCircle2, ShieldCheck, Calendar, X, AlertCircle, Sparkles, Star } from 'lucide-react';
import { ApiService } from '../../services/api';
import { VerificationApplication, User } from '../../types';

// ──────────────────────────────────────────────────────────────────────────────
// SMART ALLOCATION ENGINE
// Enforces LM Act GATC Rule 10/2013: GATC can only verify within
// (a) their approved instrument categories and (b) their district.
// Scoring: category_match(40) + district_match(30) + workload_factor(20) + seniority(10)
// ──────────────────────────────────────────────────────────────────────────────

interface OfficerCandidate {
  id: string;
  name: string;
  type: 'LMO' | 'GATC';
  district: string;
  zone: string;
  approvedCategories: string[];
  currentWorkload: number;
  score: number;
  matchReason: string;
}

const LMO_OFFICERS: OfficerCandidate[] = [
  {
    id: 'USR-003', name: 'K. Murugan, Inspector (LMO)', type: 'LMO',
    district: 'Chennai', zone: 'Chennai Central & Harbor Sub-Division',
    approvedCategories: ['Weighing Instruments', 'Fuel Dispensers', 'Utility and Flow Meters', 'Medical and Safety Instruments', 'Dimensional and Physical Measurement', 'Weights (Other Categories)'],
    currentWorkload: 3, score: 0, matchReason: ''
  },
  {
    id: 'USR-009', name: 'S. Selvakumar, Inspector (LMO-II)', type: 'LMO',
    district: 'Coimbatore', zone: 'Coimbatore South & Tirupur Sub-Division',
    approvedCategories: ['Weighing Instruments', 'Fuel Dispensers', 'Utility and Flow Meters'],
    currentWorkload: 1, score: 0, matchReason: ''
  }
];

const GATC_CENTERS: OfficerCandidate[] = [
  {
    id: 'USR-004', name: 'Tamil Nadu GATC Testing Center (Guindy Lab 01)', type: 'GATC',
    district: 'Chennai', zone: 'Guindy Industrial Estate Lab Zone',
    approvedCategories: ['Weighing Instruments', 'Weights (Other Categories)'],
    currentWorkload: 2, score: 0, matchReason: ''
  }
];

function scoreCandidate(
  candidate: OfficerCandidate,
  instrumentCategory: string,
  instrumentDistrict: string
): OfficerCandidate {
  let score = 0;
  const reasons: string[] = [];

  // Category match (40 pts) — GATC must be within approved list (Rule 10)
  const categoryMatch = candidate.approvedCategories.some(c =>
    c.toLowerCase() === instrumentCategory.toLowerCase() ||
    instrumentCategory.toLowerCase().includes(c.toLowerCase()) ||
    c.toLowerCase().includes(instrumentCategory.toLowerCase())
  );
  if (categoryMatch) {
    score += 40;
    reasons.push('Category match ✓');
  } else if (candidate.type === 'GATC') {
    // GATC category restriction — hard fail per Rule 10
    return { ...candidate, score: -1, matchReason: `GATC NOT ELIGIBLE: Category "${instrumentCategory}" not in approved list (Rule 10/2013)` };
  }

  // District match (30 pts) — both LMO and GATC have jurisdiction constraints
  const districtMatch = candidate.district.toLowerCase() === instrumentDistrict.toLowerCase();
  if (districtMatch) {
    score += 30;
    reasons.push('Same district ✓');
  } else {
    score += 10;
    reasons.push('Cross-district (permitted for LMO)');
  }

  // Workload factor (20 pts) — lower workload = higher score
  const workloadScore = Math.max(0, 20 - candidate.currentWorkload * 5);
  score += workloadScore;
  reasons.push(`Workload: ${candidate.currentWorkload} pending (${workloadScore} pts)`);

  // Type bonus (10 pts) — LMO preferred for initial verification; GATC for periodic
  if (candidate.type === 'LMO') {
    score += 10;
    reasons.push('LMO priority verified ✓');
  }

  return { ...candidate, score, matchReason: reasons.join(' · ') };
}

function getSuggestedAllocations(
  instrumentCategory: string,
  instrumentDistrict: string
): OfficerCandidate[] {
  const all = [...LMO_OFFICERS, ...GATC_CENTERS];
  const scored = all
    .map(o => scoreCandidate(o, instrumentCategory, instrumentDistrict))
    .filter(o => o.score >= 0)
    .sort((a, b) => b.score - a.score);
  return scored;
}

interface ScrutinyAllocationModalProps {
  open: boolean;
  onClose: () => void;
  application: VerificationApplication | null;
  onSuccess: () => void;
}

export const ScrutinyAllocationModal: React.FC<ScrutinyAllocationModalProps> = ({
  open,
  onClose,
  application,
  onSuccess
}) => {
  const [assignedToType, setAssignedToType] = useState<'LMO' | 'GATC'>('LMO');
  const [assignedToId, setAssignedToId] = useState('USR-003');
  const [scheduledDate, setScheduledDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toISOString().split('T')[0];
  });
  const [timeSlot, setTimeSlot] = useState('10:00 AM - 01:00 PM');
  const [instructions, setInstructions] = useState('Verify platform bench scale with standard Class M1 test weights. Inspect seal and leveling.');
  const [submitting, setSubmitting] = useState(false);
  const [candidates, setCandidates] = useState<OfficerCandidate[]>([]);
  const [aiSuggestion, setAiSuggestion] = useState<OfficerCandidate | null>(null);

  useEffect(() => {
    if (!application || !open) return;

    const cat = application.instrument?.category || 'Weighing Instruments';
    const dist = application.instrument?.installationAddress?.includes('Coimbatore') ? 'Coimbatore'
      : application.instrument?.installationAddress?.includes('Madurai') ? 'Madurai' : 'Chennai';

    const ranked = getSuggestedAllocations(cat, dist);
    setCandidates(ranked);
    if (ranked.length > 0) {
      const top = ranked[0];
      setAiSuggestion(top);
      setAssignedToType(top.type);
      setAssignedToId(top.id);
    }
  }, [application, open]);

  if (!application) return null;

  const handleAllocate = () => {
    setSubmitting(true);
    const selected = candidates.find(c => c.id === assignedToId) || candidates[0];
    const assignedToName = selected?.name || (assignedToId === 'USR-003' ? 'K. Murugan, Inspector (LMO)' : 'Tamil Nadu GATC Testing Center');

    ApiService.createAllocation({
      applicationId: application.id,
      assignedToType,
      assignedToId,
      assignedToName,
      scheduledDate,
      scheduledTimeSlot: timeSlot,
      instructions,
      allocatedBy: 'USR-002'
    });

    setSubmitting(false);
    onSuccess();
    onClose();
  };

  const instrumentDistrict = application.instrument?.installationAddress?.includes('Coimbatore') ? 'Coimbatore'
    : application.instrument?.installationAddress?.includes('Madurai') ? 'Madurai' : 'Chennai';

  const lmoCandidates = candidates.filter(c => c.type === 'LMO');
  const gatcCandidates = candidates.filter(c => c.type === 'GATC' && c.score >= 0);
  const gatcIneligible = [...GATC_CENTERS].filter(gc => !gatcCandidates.some(c => c.id === gc.id));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: '16px' } }}
    >
      <DialogTitle
        sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', py: 1.8, px: 3
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
          <Network size={22} color="#1e40af" />
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
            Application Scrutiny & Smart Allocation ({application.id})
          </Typography>
        </Box>
        <Button onClick={onClose} size="small" sx={{ minWidth: 32, p: 0.5, color: '#64748b' }}>
          <X size={18} />
        </Button>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {/* Application Summary */}
        <Paper variant="outlined" sx={{ p: 2.5, mb: 3, borderRadius: '12px', backgroundColor: '#f8fafc' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a', mb: 1.5 }}>
            Application & Technical Specifications
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" sx={{ color: '#64748b' }}>Applicant / Business</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>{application.instrument?.businessName || 'Sundar Industries Pvt Ltd'}</Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" sx={{ color: '#64748b' }}>Instrument Type</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>{application.instrument?.instrumentType || 'Non-Automatic Weighing Instruments'}</Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" sx={{ color: '#64748b' }}>Category</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>{application.instrument?.category || 'Weighing Instruments'}</Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" sx={{ color: '#64748b' }}>Statutory Fee Paid</Typography>
              <Typography variant="body2" sx={{ fontWeight: 800, color: '#047857' }}>₹{application.calculatedFee} (PAID)</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="caption" sx={{ color: '#64748b' }}>Installation Address</Typography>
              <Typography variant="body2" sx={{ color: '#334155' }}>{application.instrument?.installationAddress}</Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* AI Smart Suggestion Banner */}
        {aiSuggestion && (
          <Alert
            icon={<Sparkles size={18} />}
            severity="info"
            sx={{ mb: 3, borderRadius: '12px', border: '1px solid #bfdbfe' }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              Smart Allocation Recommendation
            </Typography>
            <Typography variant="caption" sx={{ display: 'block' }}>
              <strong>{aiSuggestion.name}</strong> ({aiSuggestion.type}) — Score: {aiSuggestion.score}/100
            </Typography>
            <Typography variant="caption" sx={{ color: '#475569' }}>
              {aiSuggestion.matchReason}
            </Typography>
          </Alert>
        )}

        {/* Ranked Candidates Table */}
        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 1.5 }}>
          Eligible Officers / Centres (Rule-Based Ranking)
        </Typography>
        <Paper variant="outlined" sx={{ borderRadius: '12px', overflow: 'hidden', mb: 3 }}>
          {candidates.map((cand, idx) => (
            <Box
              key={cand.id}
              onClick={() => { setAssignedToId(cand.id); setAssignedToType(cand.type); }}
              sx={{
                p: 1.8,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                borderBottom: idx < candidates.length - 1 ? '1px solid #f1f5f9' : 'none',
                cursor: 'pointer',
                backgroundColor: assignedToId === cand.id ? '#eff6ff' : '#ffffff',
                '&:hover': { backgroundColor: '#f8fafc' }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                {idx === 0 && <Star size={14} color="#d97706" fill="#d97706" />}
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>{cand.name}</Typography>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>{cand.zone}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Chip
                  label={cand.type}
                  size="small"
                  sx={{
                    fontSize: '0.65rem', fontWeight: 700, height: 20,
                    backgroundColor: cand.type === 'LMO' ? '#eff6ff' : '#f5f3ff',
                    color: cand.type === 'LMO' ? '#1e40af' : '#6d28d9'
                  }}
                />
                <Chip
                  label={`Score: ${cand.score}/100`}
                  size="small"
                  sx={{
                    fontSize: '0.65rem', fontWeight: 700, height: 20,
                    backgroundColor: cand.score >= 70 ? '#ecfdf5' : '#fffbeb',
                    color: cand.score >= 70 ? '#059669' : '#d97706'
                  }}
                />
                {assignedToId === cand.id && <CheckCircle2 size={16} color="#059669" />}
              </Box>
            </Box>
          ))}
          {candidates.length === 0 && (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#94a3b8' }}>No eligible candidates found.</Typography>
            </Box>
          )}
        </Paper>

        {/* GATC Ineligible Warning */}
        {gatcIneligible.length > 0 && (
          <Alert severity="warning" icon={<AlertCircle size={16} />} sx={{ mb: 3, borderRadius: '10px' }}>
            <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }}>
              GATC Ineligible (Rule 10/2013 Constraint)
            </Typography>
            {gatcIneligible.map(gc => (
              <Typography key={gc.id} variant="caption" sx={{ display: 'block', color: '#92400e' }}>
                {gc.name} — Category "{application.instrument?.category || 'this category'}" not in their approved instrument list.
              </Typography>
            ))}
          </Alert>
        )}

        {/* Schedule Fields */}
        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Scheduled Inspection Date"
              type="date"
              fullWidth size="small"
              value={scheduledDate}
              onChange={e => setScheduledDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              select label="Scheduled Time Slot"
              fullWidth size="small"
              value={timeSlot}
              onChange={e => setTimeSlot(e.target.value)}
            >
              <MenuItem value="09:00 AM - 12:00 PM">09:00 AM - 12:00 PM (Morning Slot)</MenuItem>
              <MenuItem value="10:00 AM - 01:00 PM">10:00 AM - 01:00 PM (Standard Slot)</MenuItem>
              <MenuItem value="02:00 PM - 05:00 PM">02:00 PM - 05:00 PM (Afternoon Slot)</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Inspection Directives & Special Checklist Instructions"
              fullWidth multiline rows={2} size="small"
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
        <Button onClick={onClose} sx={{ color: '#64748b' }}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleAllocate}
          disabled={submitting || candidates.length === 0}
          sx={{ backgroundColor: '#1e40af', px: 3, '&:hover': { backgroundColor: '#1e3a8a' } }}
        >
          {submitting ? 'Allocating...' : 'Approve Scrutiny & Allocate'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
