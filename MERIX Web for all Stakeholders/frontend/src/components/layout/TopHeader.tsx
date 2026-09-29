import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  InputBase,
  IconButton,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Chip,
  Select,
  FormControl,
  Paper,
  Tooltip
} from '@mui/material';
import {
  Search,
  Bell,
  Scale,
  Settings,
  Sun,
  Moon,
  Globe,
  UserCheck,
  ChevronDown,
  LogOut,
  Menu as MenuIcon
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { SupportedLanguage, UserRole, Instrument, Certificate } from '../../types';
import { GlobalSearchModal } from '../common/GlobalSearchModal';
import { DigitalCertificateModal } from '../certificates/DigitalCertificateModal';

interface TopHeaderProps {
  onNavigate?: (tab: string) => void;
  onOpenInstrument?: (instrument: Instrument) => void;
  onOpenApplication?: (applicationId: string) => void;
  onToggleMobileMenu?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onNavigate,
  onOpenInstrument,
  onOpenApplication,
  onToggleMobileMenu
}) => {
  const { user, role, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [certModalOpen, setCertModalOpen] = useState(false);

  // Global Keyboard Shortcut: Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const notificationCount = role === 'ADMIN' ? 3 : role === 'BUSINESS_OWNER' ? 12 : 5;

  const roleLabels: Record<UserRole, { title: string; subtitle: string; color: string }> = {
    BUSINESS_OWNER: {
      title: user?.fullName || 'S. Sundararaman',
      subtitle: user?.businessName || 'Sundar Industries Pvt Ltd',
      color: '#1e40af'
    },
    ADMIN: {
      title: user?.fullName || 'K. Rangarajan (Controller)',
      subtitle: 'Dept of Legal Metrology, TN',
      color: '#047857'
    },
    LMO_OFFICER: {
      title: user?.fullName || 'K. Murugan, Inspector (LMO)',
      subtitle: 'Legal Metrology Officer',
      color: '#b45309'
    },
    GATC_CENTER: {
      title: user?.fullName || 'Tamil Nadu GATC Testing Center',
      subtitle: 'Govt Approved Test Centre',
      color: '#6d28d9'
    },
    CITIZEN: {
      title: 'Public Citizen',
      subtitle: 'Consumer Verification Mode',
      color: '#0f766e'
    }
  };

  const currentRoleInfo = roleLabels[role] || roleLabels.BUSINESS_OWNER;

  const handleOpenCertificate = (cert: Certificate) => {
    setSelectedCert(cert);
    setCertModalOpen(true);
  };

  return (
    <>
      <Box
        sx={{
          height: 70,
          px: { xs: 1.5, sm: 2.5, md: 3 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          position: 'sticky',
          top: 0,
          zIndex: 1100,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)'
        }}
      >
        {/* Left: Hamburger 3-Line Menu (Mobile) + Brand Logo & Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 }, minWidth: { xs: 'auto', md: 240 } }}>
          {/* Mobile Three Line Icon */}
          <IconButton
            size="small"
            onClick={onToggleMobileMenu}
            sx={{
              display: { xs: 'flex', md: 'none' },
              color: '#1e40af',
              p: 0.8,
              borderRadius: '8px',
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              '&:hover': { backgroundColor: '#dbeafe' }
            }}
            aria-label="Toggle navigation menu"
          >
            <MenuIcon size={22} />
          </IconButton>

          <Box
            component="img"
            src="/logo.png"
            alt="Merix Logo"
            sx={{
              width: { xs: 36, sm: 42 },
              height: { xs: 36, sm: 42 },
              objectFit: 'contain',
              borderRadius: '50%',
              boxShadow: '0 2px 8px rgba(0, 150, 200, 0.25)',
              border: '1.5px solid #e0f2fe',
              cursor: 'pointer'
            }}
            onClick={() => onNavigate?.('dashboard')}
          />
          <Box onClick={() => onNavigate?.('dashboard')} sx={{ cursor: 'pointer' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  color: '#0f172a',
                  fontFamily: '"Outfit", sans-serif',
                  letterSpacing: '-0.5px',
                  fontSize: { xs: '1.15rem', sm: '1.4rem' }
                }}
              >
                Merix
              </Typography>
              <Chip
                label={t('govt_of_india', 'Govt of India')}
                size="small"
                sx={{
                  height: 18,
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  backgroundColor: '#ecfdf5',
                  color: '#059669',
                  border: '1px solid #a7f3d0',
                  display: { xs: 'none', sm: 'inline-flex' }
                }}
              />
            </Box>
            <Typography
              variant="caption"
              sx={{
                color: '#64748b',
                fontWeight: 500,
                fontSize: '0.72rem',
                display: { xs: 'none', sm: 'block' },
                lineHeight: 1
              }}
            >
              {t('system_title', 'Legal Metrology Online Verification System')}
            </Typography>
          </Box>
        </Box>

        {/* Center: Global Search Bar (Click or Ctrl+K opens full modal) */}
        <Box sx={{ flex: 1, maxWidth: 500, mx: { xs: 1, sm: 2, md: 3 }, display: { xs: 'none', sm: 'flex' } }}>
          <Paper
            elevation={0}
            onClick={() => setSearchModalOpen(true)}
            sx={{
              width: '100%',
              p: '6px 14px',
              display: 'flex',
              alignItems: 'center',
              borderRadius: '10px',
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              cursor: 'pointer',
              transition: 'all 0.15s ease-in-out',
              '&:hover': {
                borderColor: '#3b82f6',
                backgroundColor: '#ffffff',
                boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.12)'
              }
            }}
          >
            <Search size={18} color="#2563eb" />
            <Typography
              sx={{
                ml: 1.5,
                flex: 1,
                fontSize: '0.85rem',
                fontWeight: 500,
                color: '#64748b',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {t('search_placeholder', 'Search instruments, applications, certificates (Ctrl + K)...')}
            </Typography>
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
              <kbd
                style={{
                  padding: '2px 6px',
                  borderRadius: '4px',
                  backgroundColor: '#e2e8f0',
                  color: '#475569',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  fontFamily: 'monospace',
                  border: '1px solid #cbd5e1'
                }}
              >
                Ctrl K
              </kbd>
            </Box>
          </Paper>
        </Box>

        {/* Mobile Search Icon Button (xs only) */}
        <Box sx={{ display: { xs: 'flex', sm: 'none' }, ml: 'auto', mr: 0.5 }}>
          <IconButton
            size="small"
            onClick={() => setSearchModalOpen(true)}
            sx={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              p: 0.8
            }}
          >
            <Search size={18} color="#2563eb" />
          </IconButton>
        </Box>

        {/* Right Controls: Notifications + Settings + Language + Profile Menu */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.8, sm: 1.5 } }}>
          {/* Notifications Icon with Badge */}
          <Tooltip title={t('alerts', 'Real-time Alerts & Notifications')}>
            <IconButton
              size="small"
              onClick={() => onNavigate?.('alerts')}
              sx={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                p: { xs: 0.7, sm: 1 },
                transition: 'all 0.15s ease-in-out',
                '&:hover': {
                  backgroundColor: '#eff6ff',
                  borderColor: '#bfdbfe',
                  color: '#2563eb'
                }
              }}
            >
              <Badge badgeContent={notificationCount} color="error" max={99}>
                <Bell size={18} color="#475569" />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Settings Icon (hidden on very small xs) */}
          <Tooltip title={t('settings_preferences', 'System & Account Settings')}>
            <IconButton
              size="small"
              onClick={() => onNavigate?.('settings')}
              sx={{
                display: { xs: 'none', sm: 'inline-flex' },
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                p: 1,
                transition: 'all 0.15s ease-in-out',
                '&:hover': {
                  backgroundColor: '#eff6ff',
                  borderColor: '#bfdbfe',
                  color: '#2563eb'
                }
              }}
            >
              <Settings size={18} color="#475569" />
            </IconButton>
          </Tooltip>

          {/* Language Dropdown */}
          <FormControl size="small">
            <Select
              value={language}
              onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
              sx={{
                height: 36,
                fontSize: '0.78rem',
                fontWeight: 600,
                backgroundColor: '#f8fafc',
                borderRadius: '10px',
                '.MuiOutlinedInput-notchedOutline': {
                  borderColor: '#e2e8f0'
                }
              }}
            >
              <MenuItem value="en">EN</MenuItem>
              <MenuItem value="hi">हिन्दी</MenuItem>
              <MenuItem value="mr">मराठी</MenuItem>
              <MenuItem value="gu">ગુજરાતી</MenuItem>
              <MenuItem value="ta">தமிழ்</MenuItem>
            </Select>
          </FormControl>

          {/* User Avatar & Info */}
          <Box
            onClick={handleProfileMenuOpen}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.2,
              pl: 0.5,
              cursor: 'pointer',
              borderRadius: '10px',
              p: '4px 6px',
              '&:hover': {
                backgroundColor: '#f8fafc'
              }
            }}
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: currentRoleInfo.color,
                fontSize: '0.9rem',
                fontWeight: 700,
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
              }}
            >
              {currentRoleInfo.title.charAt(0)}
            </Avatar>
            <Box sx={{ display: { xs: 'none', md: 'block' }, textAlign: 'left' }}>
              <Typography
                variant="body2"
                sx={{ fontWeight: 700, color: '#0f172a', lineHeight: 1.2, fontSize: '0.875rem' }}
              >
                {currentRoleInfo.title}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: '#64748b', fontSize: '0.72rem', display: 'block', lineHeight: 1 }}
              >
                {currentRoleInfo.subtitle}
              </Typography>
            </Box>
            <ChevronDown size={14} color="#94a3b8" />
          </Box>

          {/* Profile Dropdown Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            sx={{ mt: 1 }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <Box sx={{ px: 2, py: 1.5, minWidth: 200, borderBottom: '1px solid #f1f5f9' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                {user?.fullName || currentRoleInfo.title}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                {user?.email || 'authenticated'}
              </Typography>
              <Chip
                label={role}
                size="small"
                sx={{
                  mt: 0.8,
                  height: 20,
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  backgroundColor: `${currentRoleInfo.color}15`,
                  color: currentRoleInfo.color
                }}
              />
            </Box>
            <MenuItem
              onClick={() => {
                handleProfileMenuClose();
                onNavigate?.('settings');
              }}
              sx={{ fontWeight: 600, fontSize: '0.85rem', gap: 1.2, py: 1.2, color: '#334155' }}
            >
              <Settings size={16} color="#64748b" />
              {t('settings_preferences', 'Settings & Preferences')}
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleProfileMenuClose();
                logout();
              }}
              sx={{ color: '#dc2626', fontWeight: 700, fontSize: '0.85rem', gap: 1, py: 1.2 }}
            >
              <LogOut size={16} color="#dc2626" />
              {t('logout', 'Sign Out / Switch User')}
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* Global Search Dialog Modal */}
      <GlobalSearchModal
        open={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onNavigate={onNavigate}
        onOpenInstrument={onOpenInstrument}
        onOpenApplication={onOpenApplication}
        onOpenCertificate={handleOpenCertificate}
      />

      {/* Digital Certificate Viewer from Search Result */}
      <DigitalCertificateModal
        open={certModalOpen}
        onClose={() => setCertModalOpen(false)}
        certificate={selectedCert}
      />
    </>
  );
};
