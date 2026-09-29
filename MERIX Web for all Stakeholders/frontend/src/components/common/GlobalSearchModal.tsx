import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  InputBase,
  Chip,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Search,
  Scale,
  FileText,
  Award,
  AlertTriangle,
  MapPin,
  Settings,
  X,
  ArrowRight,
  ShieldCheck,
  Building,
  UserCheck,
  Sliders,
  Clock,
  ExternalLink,
  QrCode,
  Sparkles,
  Calendar
} from 'lucide-react';
import { ApiService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  Instrument,
  VerificationApplication,
  Certificate,
  CitizenReport,
  RuleEngineConfig,
  UserRole
} from '../../types';

interface GlobalSearchModalProps {
  open: boolean;
  onClose: () => void;
  onNavigate?: (tab: string) => void;
  onOpenInstrument?: (instrument: Instrument) => void;
  onOpenApplication?: (applicationId: string) => void;
  onOpenCertificate?: (certificate: Certificate) => void;
}

type SearchCategory = 'ALL' | 'INSTRUMENTS' | 'APPLICATIONS' | 'CERTIFICATES' | 'REPORTS' | 'ACTIONS';

interface SearchResultItem {
  id: string;
  category: SearchCategory;
  categoryLabel: string;
  title: string;
  subtitle: string;
  badge?: string;
  badgeColor?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  icon: React.ElementType;
  iconColor: string;
  onClick: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  open,
  onClose,
  onNavigate,
  onOpenInstrument,
  onOpenApplication,
  onOpenCertificate
}) => {
  const { user, role } = useAuth();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SearchCategory>('ALL');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedCategory('ALL');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [open]);

  // Fetch dataset based on role
  const rawData = useMemo(() => {
    if (!open) return { instruments: [], applications: [], certificates: [], reports: [], rules: [] };

    const isBusinessOwner = role === 'BUSINESS_OWNER';
    const isLmo = role === 'LMO_OFFICER';

    const instruments = isBusinessOwner ? ApiService.getInstruments(user?.id) : ApiService.getInstruments();
    const applications = isBusinessOwner ? ApiService.getApplications(user?.id) : ApiService.getApplications();
    const certificates = isBusinessOwner ? ApiService.getCertificates(user?.id) : ApiService.getCertificates();
    const reports = ApiService.getCitizenReports();
    const rules = ApiService.getRules();

    return {
      instruments: instruments.length > 0 ? instruments : ApiService.getInstruments('USR-001'),
      applications: applications.length > 0 ? applications : ApiService.getApplications('USR-001'),
      certificates: certificates.length > 0 ? certificates : ApiService.getCertificates('USR-001'),
      reports,
      rules
    };
  }, [open, role, user]);

  // Quick Action Navigation Items
  const quickActions: SearchResultItem[] = useMemo(() => {
    const actions: SearchResultItem[] = [];

    if (role === 'BUSINESS_OWNER') {
      actions.push(
        {
          id: 'action-new-app',
          category: 'ACTIONS',
          categoryLabel: 'Quick Action',
          title: 'Apply for Periodic Re-verification',
          subtitle: 'Submit statutory stamping application under Rule 24',
          badge: 'Apply',
          badgeColor: 'success',
          icon: FileText,
          iconColor: '#10b981',
          onClick: () => {
            onClose();
            onNavigate?.('my_instruments');
          }
        },
        {
          id: 'action-scan-qr',
          category: 'ACTIONS',
          categoryLabel: 'Quick Action',
          title: 'Digital QR Tag & Verification Scanner',
          subtitle: 'Scan physical device tags & verify digital authenticity',
          badge: 'Scan QR',
          badgeColor: 'info',
          icon: QrCode,
          iconColor: '#2563eb',
          onClick: () => {
            onClose();
            onNavigate?.('scan_qr');
          }
        },
        {
          id: 'action-badge',
          category: 'ACTIONS',
          categoryLabel: 'Quick Action',
          title: 'Verified Business Trust Badge',
          subtitle: 'Download public trust seal for customer storefronts',
          badge: 'Trust Badge',
          badgeColor: 'primary',
          icon: ShieldCheck,
          iconColor: '#059669',
          onClick: () => {
            onClose();
            onNavigate?.('verified_badge');
          }
        }
      );
    }

    if (role === 'ADMIN') {
      actions.push(
        {
          id: 'action-sla',
          category: 'ACTIONS',
          categoryLabel: 'Quick Action',
          title: 'SLA Tracking & Governance Analytics',
          subtitle: 'Monitor statutory verification turnaround across Tamil Nadu circles',
          badge: 'SLA Dashboard',
          badgeColor: 'warning',
          icon: Clock,
          iconColor: '#f59e0b',
          onClick: () => {
            onClose();
            onNavigate?.('sla');
          }
        },
        {
          id: 'action-rules',
          category: 'ACTIONS',
          categoryLabel: 'Quick Action',
          title: 'Legal Metrology Statutory Rule Engine',
          subtitle: 'Configure MPE thresholds, fee structures & inspection checklists',
          badge: 'Rule Engine',
          badgeColor: 'primary',
          icon: Sliders,
          iconColor: '#2563eb',
          onClick: () => {
            onClose();
            onNavigate?.('rule_engine');
          }
        },
        {
          id: 'action-map',
          category: 'ACTIONS',
          categoryLabel: 'Quick Action',
          title: 'Field Inspection Route & Geo-Tracking Map',
          subtitle: 'Inspect live geographical pins of commercial measuring sites in TN',
          badge: 'GIS Map',
          badgeColor: 'info',
          icon: MapPin,
          iconColor: '#0284c7',
          onClick: () => {
            onClose();
            onNavigate?.('field_map');
          }
        }
      );
    }

    if (role === 'LMO_OFFICER') {
      actions.push(
        {
          id: 'action-lmo-map',
          category: 'ACTIONS',
          categoryLabel: 'Quick Action',
          title: 'Field Inspection Route & Geo-Tracking Map',
          subtitle: 'View allocated commercial locations & optimized route',
          badge: 'Route Map',
          badgeColor: 'info',
          icon: MapPin,
          iconColor: '#0284c7',
          onClick: () => {
            onClose();
            onNavigate?.('field_map');
          }
        },
        {
          id: 'action-lmo-enforce',
          category: 'ACTIONS',
          categoryLabel: 'Quick Action',
          title: 'Enforcement & Surprise Inspection Unit',
          subtitle: 'Issue compounding penalty notices & Section 48 compounding orders',
          badge: 'Enforcement',
          badgeColor: 'error',
          icon: AlertTriangle,
          iconColor: '#dc2626',
          onClick: () => {
            onClose();
            onNavigate?.('enforcement');
          }
        }
      );
    }

    // Universal actions
    actions.push(
      {
        id: 'action-settings',
        category: 'ACTIONS',
        categoryLabel: 'System',
        title: 'System & Account Settings',
        subtitle: 'Manage notifications, language preferences & security credentials',
        badge: 'Settings',
        badgeColor: 'default',
        icon: Settings,
        iconColor: '#64748b',
        onClick: () => {
          onClose();
          onNavigate?.('settings');
        }
      },
      {
        id: 'action-alerts',
        category: 'ACTIONS',
        categoryLabel: 'System',
        title: 'Statutory Alerts & Inspection Notices',
        subtitle: 'View live compliance alerts, calibration drifts & renewal reminders',
        badge: 'Alerts',
        badgeColor: 'error',
        icon: AlertTriangle,
        iconColor: '#ea580c',
        onClick: () => {
          onClose();
          onNavigate?.('alerts');
        }
      }
    );

    return actions;
  }, [role, onNavigate, onClose]);

  // Filtered Results Generator
  const searchResults: SearchResultItem[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    const results: SearchResultItem[] = [];

    // 1. Instruments
    if (selectedCategory === 'ALL' || selectedCategory === 'INSTRUMENTS') {
      rawData.instruments.forEach((inst) => {
        const match =
          !q ||
          inst.id.toLowerCase().includes(q) ||
          inst.instrumentType.toLowerCase().includes(q) ||
          inst.manufacturer.toLowerCase().includes(q) ||
          inst.modelNumber.toLowerCase().includes(q) ||
          inst.serialNumber.toLowerCase().includes(q) ||
          inst.businessName.toLowerCase().includes(q) ||
          inst.installationAddress.toLowerCase().includes(q);

        if (match) {
          results.push({
            id: `inst-${inst.id}`,
            category: 'INSTRUMENTS',
            categoryLabel: 'Registered Instrument',
            title: `${inst.id} · ${inst.instrumentType}`,
            subtitle: `${inst.manufacturer} ${inst.modelNumber} · ${inst.businessName} (${inst.installationAddress})`,
            badge: inst.status,
            badgeColor: inst.status === 'VERIFIED' ? 'success' : inst.status === 'UNDER_INSPECTION' ? 'warning' : 'info',
            icon: Scale,
            iconColor: '#1e40af',
            onClick: () => {
              onClose();
              if (onOpenInstrument) {
                onOpenInstrument(inst);
              } else {
                onNavigate?.('instruments');
              }
            }
          });
        }
      });
    }

    // 2. Applications
    if (selectedCategory === 'ALL' || selectedCategory === 'APPLICATIONS') {
      rawData.applications.forEach((app) => {
        const match =
          !q ||
          app.id.toLowerCase().includes(q) ||
          app.instrumentId.toLowerCase().includes(q) ||
          app.applicationType.toLowerCase().includes(q) ||
          app.status.toLowerCase().includes(q) ||
          (app.paymentReference && app.paymentReference.toLowerCase().includes(q)) ||
          (app.instrument && app.instrument.instrumentType.toLowerCase().includes(q));

        if (match) {
          results.push({
            id: `app-${app.id}`,
            category: 'APPLICATIONS',
            categoryLabel: 'Verification Application',
            title: `${app.id} · ${app.applicationType.replace(/_/g, ' ')}`,
            subtitle: `Instrument: ${app.instrumentId} · Filed: ${app.filedOn?.split(' ')[0]} · Fee ₹${app.calculatedFee}`,
            badge: app.status,
            badgeColor: app.status === 'APPROVED' ? 'success' : app.status === 'REJECTED' ? 'error' : 'primary',
            icon: FileText,
            iconColor: '#059669',
            onClick: () => {
              onClose();
              if (onOpenApplication) {
                onOpenApplication(app.id);
              } else {
                onNavigate?.('applications');
              }
            }
          });
        }
      });
    }

    // 3. Certificates
    if (selectedCategory === 'ALL' || selectedCategory === 'CERTIFICATES') {
      rawData.certificates.forEach((cert) => {
        const match =
          !q ||
          cert.certificateNumber.toLowerCase().includes(q) ||
          cert.id.toLowerCase().includes(q) ||
          cert.stampId.toLowerCase().includes(q) ||
          cert.instrumentId.toLowerCase().includes(q) ||
          (cert.officerName && cert.officerName.toLowerCase().includes(q)) ||
          cert.applicationId.toLowerCase().includes(q);

        if (match) {
          results.push({
            id: `cert-${cert.id}`,
            category: 'CERTIFICATES',
            categoryLabel: 'Digital Stamping Certificate',
            title: `${cert.certificateNumber} (Stamp: ${cert.stampId})`,
            subtitle: `Device: ${cert.instrumentId} · Issued by ${cert.officerName || 'Inspector'} · Valid until ${cert.expiryDate}`,
            badge: cert.status,
            badgeColor: cert.status === 'VALID' ? 'success' : 'warning',
            icon: Award,
            iconColor: '#7c3aed',
            onClick: () => {
              onClose();
              if (onOpenCertificate) {
                onOpenCertificate(cert);
              } else {
                onNavigate?.('certificates');
              }
            }
          });
        }
      });
    }

    // 4. Citizen Complaints / Reports
    if (selectedCategory === 'ALL' || selectedCategory === 'REPORTS') {
      rawData.reports.forEach((rep) => {
        const match =
          !q ||
          rep.id.toLowerCase().includes(q) ||
          rep.businessName.toLowerCase().includes(q) ||
          rep.issueCategory.toLowerCase().includes(q) ||
          rep.reportedByName.toLowerCase().includes(q) ||
          rep.description.toLowerCase().includes(q);

        if (match) {
          results.push({
            id: `rep-${rep.id}`,
            category: 'REPORTS',
            categoryLabel: 'Citizen Grievance / Report',
            title: `${rep.id} · ${rep.issueCategory.replace(/_/g, ' ')}`,
            subtitle: `${rep.businessName} (Reported by ${rep.reportedByName}) · ${rep.description}`,
            badge: rep.status,
            badgeColor: rep.status === 'ACTION_TAKEN' ? 'success' : rep.status === 'UNDER_INVESTIGATION' ? 'warning' : 'default',
            icon: AlertTriangle,
            iconColor: '#ea580c',
            onClick: () => {
              onClose();
              onNavigate?.('citizen_reports');
            }
          });
        }
      });
    }

    // 5. Quick Actions
    if (selectedCategory === 'ALL' || selectedCategory === 'ACTIONS') {
      quickActions.forEach((act) => {
        const match =
          !q ||
          act.title.toLowerCase().includes(q) ||
          act.subtitle.toLowerCase().includes(q) ||
          (act.badge && act.badge.toLowerCase().includes(q));

        if (match) {
          results.push(act);
        }
      });
    }

    return results;
  }, [query, selectedCategory, rawData, quickActions, onOpenInstrument, onOpenApplication, onOpenCertificate, onNavigate, onClose]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : searchResults.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (searchResults[selectedIndex]) {
        searchResults[selectedIndex].onClick();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const categories: { id: SearchCategory; label: string }[] = [
    { id: 'ALL', label: 'All' },
    { id: 'INSTRUMENTS', label: 'Instruments' },
    { id: 'APPLICATIONS', label: 'Applications' },
    { id: 'CERTIFICATES', label: 'Certificates' },
    { id: 'REPORTS', label: 'Complaints' },
    { id: 'ACTIONS', label: 'Actions' }
  ];

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
          backgroundColor: '#ffffff',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.3)',
          border: '1px solid #cbd5e1',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column'
        }
      }}
    >
      {/* Search Input Bar */}
      <Box
        sx={{
          p: 2,
          px: 2.5,
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          backgroundColor: '#ffffff'
        }}
      >
        <Search size={22} color="#2563eb" />
        <InputBase
          inputRef={inputRef}
          fullWidth
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIndex(0);
          }}
          onKeyDown={handleKeyDown}
          placeholder={
            role === 'ADMIN'
              ? 'Search instruments, applications, certificates, officers, Chennai, Coimbatore...'
              : role === 'LMO_OFFICER'
              ? 'Search field routes, verification tasks, certificates, enforcement cases...'
              : 'Search registered instruments, verification applications, DOCA certificates...'
          }
          sx={{
            fontSize: '1.05rem',
            fontWeight: 600,
            color: '#0f172a',
            '& ::placeholder': { color: '#94a3b8', opacity: 1 }
          }}
        />

        {query && (
          <IconButton size="small" onClick={() => setQuery('')} sx={{ color: '#94a3b8' }}>
            <X size={16} />
          </IconButton>
        )}

        <Chip
          label="ESC to close"
          size="small"
          onClick={onClose}
          sx={{
            height: 22,
            fontSize: '0.68rem',
            fontWeight: 700,
            backgroundColor: '#f1f5f9',
            color: '#64748b',
            cursor: 'pointer'
          }}
        />
      </Box>

      {/* Category Pills Bar */}
      <Box
        sx={{
          px: 2.5,
          py: 1.2,
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          gap: 1,
          flexWrap: 'wrap',
          alignItems: 'center'
        }}
      >
        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, mr: 0.5 }}>
          FILTER:
        </Typography>
        {categories.map((cat) => (
          <Chip
            key={cat.id}
            label={cat.label}
            size="small"
            clickable
            onClick={() => {
              setSelectedCategory(cat.id);
              setSelectedIndex(0);
            }}
            sx={{
              fontWeight: 700,
              fontSize: '0.75rem',
              height: 26,
              backgroundColor: selectedCategory === cat.id ? '#2563eb' : '#ffffff',
              color: selectedCategory === cat.id ? '#ffffff' : '#475569',
              border: `1px solid ${selectedCategory === cat.id ? '#2563eb' : '#e2e8f0'}`,
              '&:hover': {
                backgroundColor: selectedCategory === cat.id ? '#1d4ed8' : '#eff6ff'
              }
            }}
          />
        ))}

        <Box sx={{ ml: 'auto' }}>
          <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
            {searchResults.length} {searchResults.length === 1 ? 'match' : 'matches'}
          </Typography>
        </Box>
      </Box>

      {/* Results List Area */}
      <DialogContent sx={{ p: 0, overflowY: 'auto', flex: 1, maxHeight: 460 }}>
        {searchResults.length === 0 ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <Search size={36} color="#cbd5e1" style={{ margin: '0 auto 12px' }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#475569' }}>
              No matches found for &quot;{query}&quot;
            </Typography>
            <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mt: 0.5 }}>
              Try searching by Device ID (e.g. <code>INS-000101</code>), Certificate (e.g. <code>DOCA-LM-2026-00892</code>), or Tamil Nadu District
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {searchResults.map((item, idx) => {
              const IconComp = item.icon;
              const isSelected = idx === selectedIndex;

              return (
                <ListItem key={item.id} disablePadding divider>
                  <ListItemButton
                    selected={isSelected}
                    onClick={item.onClick}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    sx={{
                      py: 1.5,
                      px: 2.5,
                      transition: 'all 0.1s ease',
                      backgroundColor: isSelected ? '#eff6ff' : 'transparent',
                      '&:hover': { backgroundColor: '#eff6ff' }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 42 }}>
                      <Box
                        sx={{
                          width: 34,
                          height: 34,
                          borderRadius: '8px',
                          backgroundColor: `${item.iconColor}15`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <IconComp size={18} color={item.iconColor} />
                      </Box>
                    </ListItemIcon>

                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.88rem' }}>
                            {item.title}
                          </Typography>
                          {item.badge && (
                            <Chip
                              label={item.badge}
                              size="small"
                              color={item.badgeColor || 'default'}
                              sx={{
                                height: 18,
                                fontSize: '0.65rem',
                                fontWeight: 800
                              }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Typography
                          variant="caption"
                          sx={{
                            color: '#64748b',
                            fontSize: '0.75rem',
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            mt: 0.3
                          }}
                        >
                          <span style={{ fontWeight: 700, color: '#3b82f6', marginRight: 6 }}>
                            [{item.categoryLabel}]
                          </span>
                          {item.subtitle}
                        </Typography>
                      }
                    />

                    <ArrowRight size={16} color={isSelected ? '#2563eb' : '#cbd5e1'} style={{ marginLeft: 8 }} />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        )}
      </DialogContent>

      {/* Keyboard Shortcuts Footer */}
      <Box
        sx={{
          p: 1.5,
          px: 2.5,
          backgroundColor: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="caption" sx={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <kbd style={{ padding: '2px 5px', borderRadius: '4px', backgroundColor: '#e2e8f0', fontSize: '0.68rem', fontWeight: 700 }}>↑</kbd>
            <kbd style={{ padding: '2px 5px', borderRadius: '4px', backgroundColor: '#e2e8f0', fontSize: '0.68rem', fontWeight: 700 }}>↓</kbd>
            <span>Navigate</span>
          </Typography>

          <Typography variant="caption" sx={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <kbd style={{ padding: '2px 5px', borderRadius: '4px', backgroundColor: '#e2e8f0', fontSize: '0.68rem', fontWeight: 700 }}>↵</kbd>
            <span>Open</span>
          </Typography>

          <Typography variant="caption" sx={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <kbd style={{ padding: '2px 5px', borderRadius: '4px', backgroundColor: '#e2e8f0', fontSize: '0.68rem', fontWeight: 700 }}>ESC</kbd>
            <span>Close</span>
          </Typography>
        </Box>

        <Typography variant="caption" sx={{ color: '#0284c7', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Sparkles size={12} /> Legal Metrology Unified Search Engine
        </Typography>
      </Box>
    </Dialog>
  );
};
