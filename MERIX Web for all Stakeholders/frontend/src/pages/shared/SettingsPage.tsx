import React, { useState } from 'react';
import {
  Box, Typography, Paper, Grid, Switch, Button, Divider,
  TextField, MenuItem, Alert, Chip, FormControlLabel
} from '@mui/material';
import {
  Settings, Bell, Globe, Shield, User, Save, CheckCircle2, Mail, Smartphone
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { SupportedLanguage } from '../../types';

export const SettingsPage: React.FC = () => {
  const { user, role } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [saveAlert, setSaveAlert] = useState(false);

  // Notification preferences
  const [emailExpiry, setEmailExpiry] = useState(true);
  const [emailStatus, setEmailStatus] = useState(true);
  const [inAppExpiry, setInAppExpiry] = useState(true);
  const [inAppStatus, setInAppStatus] = useState(true);
  const [expiryDays, setExpiryDays] = useState('30');

  // Profile
  const [phone, setPhone] = useState(user?.phoneNumber || '');
  const [district, setDistrict] = useState(user?.district || '');

  const handleSave = () => {
    setSaveAlert(true);
    setTimeout(() => setSaveAlert(false), 3500);
  };

  const roleColor: Record<string, string> = {
    BUSINESS_OWNER: '#1e40af',
    ADMIN: '#047857',
    LMO_OFFICER: '#b45309',
    GATC_CENTER: '#6d28d9',
    CITIZEN: '#0f766e'
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3.5 }, maxWidth: 820, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Settings size={26} color="#1e40af" />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', fontFamily: '"Outfit", sans-serif' }}>
            {t('settings_preferences', 'Settings & Preferences')}
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            {t('manage_sub', 'Manage your notification preferences, language, and account settings.')}
          </Typography>
        </Box>
      </Box>

      {saveAlert && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }} icon={<CheckCircle2 size={18} />}>
          {t('settings_saved', 'Settings saved successfully.')}
        </Alert>
      )}

      {/* Profile Info */}
      <Paper elevation={0} sx={{ p: 2.5, mb: 2.5, borderRadius: '14px', border: '1px solid #e2e8f0' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <User size={18} color="#1e40af" />
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>{t('profile', 'Profile')}</Typography>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label={t('full_name', 'Full Name')}
              fullWidth size="small"
              defaultValue={user?.fullName || ''}
              disabled
              sx={{ '& .MuiInputBase-root': { backgroundColor: '#f8fafc' } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label={t('email_address', 'Email Address')}
              fullWidth size="small"
              defaultValue={user?.email || ''}
              disabled
              sx={{ '& .MuiInputBase-root': { backgroundColor: '#f8fafc' } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label={t('mobile_number', 'Mobile Number')}
              fullWidth size="small"
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label={t('district', 'District')}
              fullWidth size="small"
              value={district}
              onChange={e => setDistrict(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>{t('type', 'ACCOUNT ROLE')}:</Typography>
              <Chip
                label={t(role, role)}
                size="small"
                sx={{
                  fontWeight: 800, fontSize: '0.7rem',
                  backgroundColor: `${roleColor[role] || '#1e40af'}15`,
                  color: roleColor[role] || '#1e40af'
                }}
              />
              {user?.licenseNo && (
                <Chip
                  label={`License: ${user.licenseNo}`}
                  size="small"
                  sx={{ fontWeight: 600, fontSize: '0.7rem', backgroundColor: '#f1f5f9', color: '#475569' }}
                />
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Notification Preferences */}
      <Paper elevation={0} sx={{ p: 2.5, mb: 2.5, borderRadius: '14px', border: '1px solid #e2e8f0' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Bell size={18} color="#1e40af" />
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>{t('notification_preferences', 'Notification Preferences')}</Typography>
        </Box>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569', mb: 0.5 }}>
              {t('expiry_notice_desc', 'Certificate Expiry Advance Notice')}
            </Typography>
            <TextField
              select size="small" fullWidth
              value={expiryDays}
              onChange={e => setExpiryDays(e.target.value)}
              label={t('alerts', 'Notify before expiry')}
            >
              {['7', '14', '30', '60', '90'].map(d => (
                <MenuItem key={d} value={d}>{d} days before expiry</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <Divider sx={{ mb: 1 }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Mail size={14} color="#64748b" />
              <Typography variant="body2" sx={{ fontWeight: 700 }}>{t('email_notifications', 'Email Notifications')}</Typography>
            </Box>
            <FormControlLabel
              control={<Switch checked={emailExpiry} onChange={e => setEmailExpiry(e.target.checked)} size="small" />}
              label={<Typography variant="caption">{t('expiring_soon', 'Certificate expiry warnings')}</Typography>}
            />
            <br />
            <FormControlLabel
              control={<Switch checked={emailStatus} onChange={e => setEmailStatus(e.target.checked)} size="small" />}
              label={<Typography variant="caption">{t('applications', 'Application status updates')}</Typography>}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Smartphone size={14} color="#64748b" />
              <Typography variant="body2" sx={{ fontWeight: 700 }}>{t('in_app_notifications', 'In-App Notifications')}</Typography>
            </Box>
            <FormControlLabel
              control={<Switch checked={inAppExpiry} onChange={e => setInAppExpiry(e.target.checked)} size="small" />}
              label={<Typography variant="caption">{t('alerts', 'Expiry alerts in dashboard')}</Typography>}
            />
            <br />
            <FormControlLabel
              control={<Switch checked={inAppStatus} onChange={e => setInAppStatus(e.target.checked)} size="small" />}
              label={<Typography variant="caption">{t('status', 'Real-time status badges')}</Typography>}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Language */}
      <Paper elevation={0} sx={{ p: 2.5, mb: 2.5, borderRadius: '14px', border: '1px solid #e2e8f0' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Globe size={18} color="#1e40af" />
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>{t('language_region', 'Language & Region')}</Typography>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              select label={t('interface_language', 'Interface Language')} fullWidth size="small"
              value={language}
              onChange={e => setLanguage(e.target.value as SupportedLanguage)}
            >
              <MenuItem value="en">English (Default)</MenuItem>
              <MenuItem value="hi">हिन्दी (Hindi)</MenuItem>
              <MenuItem value="ta">தமிழ் (Tamil)</MenuItem>
              <MenuItem value="mr">मराठी (Marathi)</MenuItem>
              <MenuItem value="gu">ગુજરાતી (Gujarati)</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label={t('date_format', 'Date Format')} fullWidth size="small"
              select defaultValue="DD/MM/YYYY"
            >
              <MenuItem value="DD/MM/YYYY">DD/MM/YYYY (Indian Standard)</MenuItem>
              <MenuItem value="MM/DD/YYYY">MM/DD/YYYY (US)</MenuItem>
              <MenuItem value="YYYY-MM-DD">YYYY-MM-DD (ISO 8601)</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Security */}
      <Paper elevation={0} sx={{ p: 2.5, mb: 3, borderRadius: '14px', border: '1px solid #e2e8f0' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Shield size={18} color="#1e40af" />
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>{t('security', 'Security')}</Typography>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Button variant="outlined" fullWidth
              sx={{ borderColor: '#e2e8f0', color: '#475569', fontWeight: 700, textTransform: 'none' }}
            >
              {t('change_password', 'Change Password')}
            </Button>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button variant="outlined" fullWidth
              sx={{ borderColor: '#e2e8f0', color: '#475569', fontWeight: 700, textTransform: 'none' }}
            >
              {t('enable_2fa', 'Enable 2-Factor Authentication')}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
        <Button sx={{ color: '#64748b', fontWeight: 600 }}>{t('discard_changes', 'Discard Changes')}</Button>
        <Button
          variant="contained"
          startIcon={<Save size={16} />}
          onClick={handleSave}
          sx={{ backgroundColor: '#1e40af', fontWeight: 700, px: 3, '&:hover': { backgroundColor: '#1e3a8a' } }}
        >
          {t('save_settings', 'Save Settings')}
        </Button>
      </Box>
    </Box>
  );
};
