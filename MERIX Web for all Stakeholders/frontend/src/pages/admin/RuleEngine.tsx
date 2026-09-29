import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Chip,
  TextField,
  Grid,
  MenuItem,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  Cpu,
  Plus,
  Edit2,
  Save,
  X,
  CheckSquare,
  Trash2,
  Sliders,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { ApiService } from '../../services/api';
import { RuleEngineConfig, INSTRUMENT_CATEGORIES } from '../../types';

export const RuleEngine: React.FC = () => {
  const [rules, setRules] = useState<RuleEngineConfig[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<RuleEngineConfig>>({});
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New Rule Dialog State
  const [newRuleModalOpen, setNewRuleModalOpen] = useState(false);
  const [newRule, setNewRule] = useState<Partial<RuleEngineConfig>>({
    instrumentType: '',
    capacityMinVal: 0,
    capacityMaxVal: 500,
    capacityUnit: 'kg',
    verificationFee: 1500,
    reverificationFee: 1000,
    validityMonths: 24,
    slaScrutinyHours: 48,
    slaVerificationDays: 7,
    checklistTemplate: [
      'Visual physical inspection of scale body and leveling',
      'Zero balance verification (within +/- 0.25 e)',
      'Corner load eccentricity test (1/3 capacity)',
      'Standard load repeatability & linearity within MPE'
    ]
  });
  const [newModalChecklistItem, setNewModalChecklistItem] = useState('');

  const loadRules = () => {
    setRules(ApiService.getRules());
  };

  useEffect(() => {
    loadRules();
  }, []);

  const handleEdit = (rule: RuleEngineConfig) => {
    setEditingId(rule.id);
    setEditValues({ ...rule });
  };

  const handleSave = () => {
    if (editingId) {
      const existing = rules.find(r => r.id === editingId);
      if (existing) {
        ApiService.updateRule({ ...existing, ...editValues } as RuleEngineConfig);
        loadRules();
        setEditingId(null);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    }
  };

  const handleAddChecklistItemToEditing = () => {
    if (!newChecklistItem.trim()) return;
    const currentList = editValues.checklistTemplate || [];
    setEditValues({
      ...editValues,
      checklistTemplate: [...currentList, newChecklistItem.trim()]
    });
    setNewChecklistItem('');
  };

  const handleRemoveChecklistItemFromEditing = (index: number) => {
    const currentList = editValues.checklistTemplate || [];
    setEditValues({
      ...editValues,
      checklistTemplate: currentList.filter((_, i) => i !== index)
    });
  };

  const handleAddChecklistToNewRule = () => {
    if (!newModalChecklistItem.trim()) return;
    setNewRule({
      ...newRule,
      checklistTemplate: [...(newRule.checklistTemplate || []), newModalChecklistItem.trim()]
    });
    setNewModalChecklistItem('');
  };

  const handleRemoveChecklistFromNewRule = (index: number) => {
    setNewRule({
      ...newRule,
      checklistTemplate: (newRule.checklistTemplate || []).filter((_, i) => i !== index)
    });
  };

  const handleCreateNewRule = () => {
    if (!newRule.instrumentType) return;
    const newId = `RUL-TN-${String(rules.length + 101).padStart(3, '0')}`;
    const fullRule: RuleEngineConfig = {
      id: newId,
      instrumentType: newRule.instrumentType,
      capacityMinVal: Number(newRule.capacityMinVal) || 0,
      capacityMaxVal: Number(newRule.capacityMaxVal) || 1000,
      capacityUnit: newRule.capacityUnit || 'kg',
      verificationFee: Number(newRule.verificationFee) || 1000,
      reverificationFee: Number(newRule.reverificationFee) || 800,
      validityMonths: Number(newRule.validityMonths) || 24,
      slaScrutinyHours: Number(newRule.slaScrutinyHours) || 48,
      slaVerificationDays: Number(newRule.slaVerificationDays) || 7,
      checklistTemplate: newRule.checklistTemplate && newRule.checklistTemplate.length > 0
        ? newRule.checklistTemplate
        : ['Visual inspection', 'Zero balance check', 'MPE standard weight calibration test']
    };

    ApiService.updateRule(fullRule);
    loadRules();
    setNewRuleModalOpen(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3.5 } }}>
      {/* Header Banner */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Cpu size={26} color="#1e40af" />
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', fontFamily: '"Outfit", sans-serif' }}>
              Zero-Code Statutory Rule Engine &amp; Checklists
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
            Configure statutory fee schedules, mandatory reverification periods, SLA limits, and field inspection checklist templates.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<Plus size={16} />}
          onClick={() => setNewRuleModalOpen(true)}
          sx={{
            backgroundColor: '#1e40af',
            fontWeight: 700,
            fontSize: '0.82rem',
            textTransform: 'none',
            borderRadius: '8px',
            px: 2.5,
            py: 1,
            '&:hover': { backgroundColor: '#1e3a8a' }
          }}
        >
          Add New Statutory Rule
        </Button>
      </Box>

      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 2.5, borderRadius: '10px' }}>
          Rule configuration and inspection checklist updated successfully. New rules apply immediately to fee calculations and field inspections.
        </Alert>
      )}

      {/* Rules List */}
      {rules.map(rule => (
        <Paper
          key={rule.id}
          variant="outlined"
          sx={{ mb: 2.5, borderRadius: '14px', overflow: 'hidden', backgroundColor: '#ffffff' }}
        >
          <Box
            sx={{
              p: 2,
              px: 3,
              backgroundColor: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 1
            }}
          >
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                {rule.instrumentType}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Rule ID: <strong>{rule.id}</strong> • Capacity: {rule.capacityMinVal ?? '0'} - {rule.capacityMaxVal ?? '∞'} {rule.capacityUnit}
              </Typography>
            </Box>

            {editingId === rule.id ? (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<Save size={14} />}
                  onClick={handleSave}
                  sx={{ backgroundColor: '#059669', fontSize: '0.78rem', fontWeight: 700 }}
                >
                  Save Changes
                </Button>
                <Button
                  size="small"
                  onClick={() => setEditingId(null)}
                  sx={{ color: '#64748b' }}
                >
                  Cancel
                </Button>
              </Box>
            ) : (
              <Button
                size="small"
                variant="outlined"
                startIcon={<Edit2 size={14} />}
                onClick={() => handleEdit(rule)}
                sx={{ borderColor: '#bfdbfe', color: '#1e40af', fontSize: '0.78rem', fontWeight: 700 }}
              >
                Configure Rule &amp; Checklist
              </Button>
            )}
          </Box>

          <Box sx={{ p: 3 }}>
            {editingId === rule.id ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      label="Verification Fee (₹)"
                      type="number"
                      size="small"
                      fullWidth
                      value={editValues.verificationFee || ''}
                      onChange={e => setEditValues(prev => ({ ...prev, verificationFee: Number(e.target.value) }))}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      label="Re-Verification Fee (₹)"
                      type="number"
                      size="small"
                      fullWidth
                      value={editValues.reverificationFee || ''}
                      onChange={e => setEditValues(prev => ({ ...prev, reverificationFee: Number(e.target.value) }))}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      label="Validity (Months)"
                      type="number"
                      size="small"
                      fullWidth
                      value={editValues.validityMonths || ''}
                      onChange={e => setEditValues(prev => ({ ...prev, validityMonths: Number(e.target.value) }))}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      label="SLA Scrutiny (Hours)"
                      type="number"
                      size="small"
                      fullWidth
                      value={editValues.slaScrutinyHours || ''}
                      onChange={e => setEditValues(prev => ({ ...prev, slaScrutinyHours: Number(e.target.value) }))}
                    />
                  </Grid>
                </Grid>

                {/* Checklist Editor */}
                <Paper variant="outlined" sx={{ p: 2, borderRadius: '10px', backgroundColor: '#f8fafc' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>
                    📋 Mandatory Inspection Checklist Items
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <TextField
                      size="small"
                      fullWidth
                      placeholder="Add new inspection checklist requirement..."
                      value={newChecklistItem}
                      onChange={(e) => setNewChecklistItem(e.target.value)}
                    />
                    <Button
                      variant="contained"
                      onClick={handleAddChecklistItemToEditing}
                      sx={{ backgroundColor: '#1e40af', fontWeight: 700, whiteSpace: 'nowrap' }}
                    >
                      Add Item
                    </Button>
                  </Box>

                  <List dense sx={{ py: 0 }}>
                    {(editValues.checklistTemplate || []).map((item, idx) => (
                      <ListItem
                        key={idx}
                        sx={{
                          backgroundColor: '#ffffff',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          mb: 0.8
                        }}
                        secondaryAction={
                          <IconButton
                            edge="end"
                            size="small"
                            onClick={() => handleRemoveChecklistItemFromEditing(idx)}
                            sx={{ color: '#dc2626' }}
                          >
                            <Trash2 size={16} />
                          </IconButton>
                        }
                      >
                        <ListItemIcon sx={{ minWidth: 28 }}>
                          <CheckSquare size={16} color="#059669" />
                        </ListItemIcon>
                        <ListItemText
                          primary={item}
                          primaryTypographyProps={{ fontSize: '0.82rem', fontWeight: 600 }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Box>
            ) : (
              <Grid container spacing={2.5}>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>INITIAL VERIFICATION FEE</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#059669' }}>
                    ₹{rule.verificationFee.toLocaleString('en-IN')}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>REVERIFICATION FEE</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#059669' }}>
                    ₹{rule.reverificationFee.toLocaleString('en-IN')}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>STATUTORY VALIDITY</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                    {rule.validityMonths} months
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>SCRUTINY SLA</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#f59e0b' }}>
                    {rule.slaScrutinyHours} hours
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, display: 'block', mb: 1 }}>
                    INSPECTION CHECKLIST TEMPLATE ({rule.checklistTemplate?.length || 0} MANDATORY CHECKS):
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                    {rule.checklistTemplate?.map((item, idx) => (
                      <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircle2 size={15} color="#059669" />
                        <Typography variant="body2" sx={{ fontSize: '0.82rem', color: '#334155', fontWeight: 500 }}>
                          {item}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Grid>
              </Grid>
            )}
          </Box>
        </Paper>
      ))}

      {/* Add New Rule Modal Dialog */}
      <Dialog
        open={newRuleModalOpen}
        onClose={() => setNewRuleModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px' } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            <Cpu size={22} color="#1e40af" />
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
              Add New Legal Metrology Rule &amp; Inspection Checklist
            </Typography>
          </Box>
          <IconButton onClick={() => setNewRuleModalOpen(false)} size="small">
            <X size={18} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  label="Instrument Type / Specification Name *"
                  size="small"
                  placeholder="e.g. Multi-Dimensional Package Measuring System"
                  value={newRule.instrumentType}
                  onChange={(e) => setNewRule({ ...newRule, instrumentType: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  fullWidth
                  label="Statutory Category"
                  size="small"
                  value={newRule.capacityUnit || 'kg'}
                  onChange={(e) => setNewRule({ ...newRule, capacityUnit: e.target.value })}
                >
                  <MenuItem value="kg">Weight / Mass (kg / g / mg)</MenuItem>
                  <MenuItem value="L/min">Liquid / Fuel Flow (L/min)</MenuItem>
                  <MenuItem value="m">Length / Dimensions (m / mm)</MenuItem>
                  <MenuItem value="unit">Medical / Count Unit</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth
                  type="number"
                  label="Initial Fee (₹)"
                  size="small"
                  value={newRule.verificationFee}
                  onChange={(e) => setNewRule({ ...newRule, verificationFee: Number(e.target.value) })}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth
                  type="number"
                  label="Reverification Fee (₹)"
                  size="small"
                  value={newRule.reverificationFee}
                  onChange={(e) => setNewRule({ ...newRule, reverificationFee: Number(e.target.value) })}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth
                  type="number"
                  label="Validity (Months)"
                  size="small"
                  value={newRule.validityMonths}
                  onChange={(e) => setNewRule({ ...newRule, validityMonths: Number(e.target.value) })}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth
                  type="number"
                  label="Scrutiny SLA (Hours)"
                  size="small"
                  value={newRule.slaScrutinyHours}
                  onChange={(e) => setNewRule({ ...newRule, slaScrutinyHours: Number(e.target.value) })}
                />
              </Grid>
            </Grid>

            {/* Checklist Builder */}
            <Paper variant="outlined" sx={{ p: 2, borderRadius: '10px', backgroundColor: '#f8fafc' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>
                📋 Standard Inspection Checklist Template
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Type checklist requirement and press Add..."
                  value={newModalChecklistItem}
                  onChange={(e) => setNewModalChecklistItem(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddChecklistToNewRule())}
                />
                <Button
                  variant="contained"
                  onClick={handleAddChecklistToNewRule}
                  sx={{ backgroundColor: '#1e40af', fontWeight: 700 }}
                >
                  Add
                </Button>
              </Box>

              <List dense sx={{ py: 0 }}>
                {(newRule.checklistTemplate || []).map((item, idx) => (
                  <ListItem
                    key={idx}
                    sx={{ backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0', mb: 0.6 }}
                    secondaryAction={
                      <IconButton size="small" onClick={() => handleRemoveChecklistFromNewRule(idx)} sx={{ color: '#dc2626' }}>
                        <Trash2 size={15} />
                      </IconButton>
                    }
                  >
                    <ListItemIcon sx={{ minWidth: 26 }}>
                      <CheckSquare size={15} color="#059669" />
                    </ListItemIcon>
                    <ListItemText primary={item} primaryTypographyProps={{ fontSize: '0.8rem', fontWeight: 600 }} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
          <Button onClick={() => setNewRuleModalOpen(false)} sx={{ color: '#64748b' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateNewRule}
            disabled={!newRule.instrumentType}
            sx={{ backgroundColor: '#1e40af', px: 3, fontWeight: 700, '&:hover': { backgroundColor: '#1e3a8a' } }}
          >
            Create Statutory Rule
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
