import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Badge,
  Divider,
  Chip,
  Drawer,
  IconButton
} from '@mui/material';
import {
  LayoutDashboard,
  FileText,
  BadgeCheck,
  QrCode,
  ShieldCheck,
  Bell,
  BookOpen,
  Settings,
  Users,
  Network,
  Clock,
  Cpu,
  Mail,
  BarChart3,
  History,
  Navigation,
  LogOut,
  AlertTriangle,
  Scale,
  Sparkles,
  FlaskConical,
  Siren,
  Gavel,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

interface MenuItemType {
  id?: string;
  label?: string;
  icon?: any;
  badge?: number;
  divider?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  mobileOpen = false,
  onCloseMobile
}) => {
  const { role, logout } = useAuth();
  const { t } = useLanguage();

  const businessMenuItems: MenuItemType[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'my_instruments', label: 'My Instruments', icon: Scale },
    { id: 'applications', label: 'Applications', icon: FileText },
    { id: 'certificates', label: 'Certificates', icon: BadgeCheck },
    { id: 'verified_badge', label: 'Verified Badge', icon: Sparkles },
    { id: 'scan_qr', label: 'Scan QR', icon: QrCode },
    { id: 'public_verify', label: 'Public Verify', icon: ShieldCheck },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: 12 },
    { divider: true },
    { id: 'user_manual', label: 'User Manual', icon: BookOpen },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const adminMenuItems: MenuItemType[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'applications', label: 'Applications', icon: FileText },
    { id: 'instruments', label: 'Instruments', icon: Scale },
    { id: 'certificates', label: 'Certificates', icon: BadgeCheck },
    { id: 'citizen_reports', label: 'Citizen Reports', icon: AlertTriangle, badge: 3 },
    { id: 'sla', label: 'SLA Dashboard', icon: Clock },
    { id: 'rule_engine', label: 'Rule Engine', icon: Cpu },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { divider: true },
    { id: 'audit', label: 'Audit Trail', icon: History },
    { id: 'field_map', label: 'Field Map', icon: Navigation },
    { divider: true },
    { id: 'scan_qr', label: 'Scan QR', icon: QrCode },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: 8 },
    { id: 'public_verify', label: 'Public Verify', icon: ShieldCheck },
    { divider: true },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const lmoMenuItems: MenuItemType[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'field_map', label: 'Field Route Map', icon: Navigation },
    { id: 'enforcement', label: 'Enforcement & Raids', icon: Siren, badge: 3 },
    { id: 'certificates', label: 'Issued Certificates', icon: BadgeCheck },
    { id: 'scan_qr', label: 'Scan QR & Verify', icon: QrCode },
    { divider: true },
    { id: 'public_verify', label: 'Public Verify', icon: ShieldCheck },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: 4 },
    { divider: true },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  // GATC has its own menu separate from LMO — no enforcement powers
  const gatcMenuItems: MenuItemType[] = [
    { id: 'dashboard', label: 'GATC Dashboard', icon: LayoutDashboard },
    { id: 'certificates', label: 'Issued Certificates', icon: BadgeCheck },
    { id: 'instruments', label: 'Instrument Registry', icon: Scale },
    { id: 'scan_qr', label: 'Scan QR & Verify', icon: QrCode },
    { divider: true },
    { id: 'public_verify', label: 'Public Verify', icon: ShieldCheck },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: 2 },
    { divider: true },
    { id: 'user_manual', label: 'GATC Guidelines', icon: BookOpen },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const citizenMenuItems: MenuItemType[] = [
    { id: 'scan_qr', label: 'Scan Instrument / Cert QR', icon: QrCode },
    { id: 'public_verify', label: 'Public Certificate Check', icon: ShieldCheck },
    { id: 'citizen_report', label: 'Report Issue / Tampering', icon: AlertTriangle },
    { id: 'near_me', label: 'Find Verified Businesses', icon: Navigation },
    { divider: true },
    { id: 'user_manual', label: 'Legal Metrology Rules', icon: BookOpen }
  ];

  const items =
    role === 'ADMIN'
      ? adminMenuItems
      : role === 'LMO_OFFICER'
      ? lmoMenuItems
      : role === 'GATC_CENTER'
      ? gatcMenuItems
      : role === 'CITIZEN'
      ? citizenMenuItems
      : businessMenuItems;

  const renderContent = (isMobileView: boolean) => (
    <Box
      sx={{
        width: isMobileView ? 280 : 240,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        py: 2,
        px: 1.5,
        backgroundColor: '#ffffff'
      }}
    >
      {/* Mobile Drawer Header with Close Button */}
      {isMobileView && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1, pb: 1.5, mb: 1, borderBottom: '1px solid #f1f5f9' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              component="img"
              src="/logo.png"
              alt="Merix"
              sx={{ width: 32, height: 32, objectFit: 'contain', borderRadius: '50%' }}
            />
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', fontFamily: '"Outfit", sans-serif' }}>
              Merix Portal
            </Typography>
          </Box>
          <IconButton size="small" onClick={onCloseMobile} sx={{ color: '#64748b' }}>
            <X size={20} />
          </IconButton>
        </Box>
      )}

      {/* Navigation List */}
      <List sx={{ p: 0, flexGrow: 1, overflowY: 'auto' }}>
        {items.map((item, idx) => {
          if (item.divider) {
            return <Divider key={`div-${idx}`} sx={{ my: 1.5, borderColor: '#f1f5f9' }} />;
          }

          const IconComponent = item.icon!;
          const isActive = activeTab === item.id;

          return (
            <ListItemButton
              key={item.id}
              onClick={() => {
                onTabChange(item.id!);
                if (isMobileView && onCloseMobile) {
                  onCloseMobile();
                }
              }}
              sx={{
                mb: 0.5,
                borderRadius: '10px',
                py: 1,
                px: 1.5,
                backgroundColor: isActive ? '#eff6ff' : 'transparent',
                color: isActive ? '#1e40af' : '#475569',
                borderLeft: isActive ? '3.5px solid #1e40af' : '3.5px solid transparent',
                '&:hover': {
                  backgroundColor: isActive ? '#eff6ff' : '#f8fafc',
                  color: '#1e40af'
                }
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 32,
                  color: isActive ? '#1e40af' : '#64748b'
                }}
              >
                <IconComponent size={18} strokeWidth={isActive ? 2.4 : 1.8} />
              </ListItemIcon>
              <ListItemText
                primary={t(item.id || '', item.label || '')}
                primaryTypographyProps={{
                  fontSize: '0.88rem',
                  fontWeight: isActive ? 700 : 500,
                  letterSpacing: '-0.1px'
                }}
              />
              {item.badge && (
                <Chip
                  label={item.badge}
                  size="small"
                  sx={{
                    height: 18,
                    minWidth: 18,
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    backgroundColor: '#ef4444',
                    color: '#ffffff'
                  }}
                />
              )}
            </ListItemButton>
          );
        })}
      </List>

      {/* Footer Branding & Version */}
      <Box sx={{ px: 1.5, pt: 2, borderTop: '1px solid #f1f5f9' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Box
            component="img"
            src="/logo.png"
            alt="Merix"
            sx={{ width: 26, height: 26, objectFit: 'contain', borderRadius: '50%' }}
          />
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.85rem' }}
          >
            Merix
          </Typography>
          <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.7rem' }}>
            v1.0.0
          </Typography>
        </Box>
        <Typography
          variant="caption"
          sx={{
            color: '#1e40af',
            fontWeight: 600,
            display: 'block',
            mt: 0.5,
            fontSize: '0.72rem',
            lineHeight: 1.2
          }}
        >
          {t('tagline', 'Measure Right · Build Trust')}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <>
      {/* 1. Desktop Persistent Sidebar (Hidden on Mobile) */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          width: 240,
          minWidth: 240,
          height: 'calc(100vh - 70px)',
          position: 'sticky',
          top: 70,
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e2e8f0',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflowY: 'auto'
        }}
      >
        {renderContent(false)}
      </Box>

      {/* 2. Mobile Responsive Slide-in Drawer (Hidden on Desktop) */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onCloseMobile}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 280,
            borderRight: '1px solid #e2e8f0',
            boxShadow: '4px 0 25px rgba(0,0,0,0.15)'
          }
        }}
      >
        {renderContent(true)}
      </Drawer>
    </>
  );
};
