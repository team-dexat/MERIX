import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Chip, Button, Badge
} from '@mui/material';
import {
  Bell, AlertTriangle, CheckCircle2, Clock,
  RefreshCw, X, Scale
} from 'lucide-react';
import { ApiService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface NotificationItem {
  id: string;
  type: 'expiry_warning' | 'expiry_critical' | 'application_update' | 'enforcement' | 'system' | 'certificate_ready';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  severity: 'info' | 'warning' | 'error' | 'success';
  actionLabel?: string;
}

const getExpiryDays = (expiryDate: string): number => {
  const today = new Date();
  const exp = new Date(expiryDate);
  return Math.floor((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

export const AlertsPage: React.FC = () => {
  const { user, role } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD' | 'EXPIRY' | 'APPLICATIONS' | 'ENFORCEMENT'>('ALL');

  const generateNotifications = () => {
    const items: NotificationItem[] = [];

    const certs = role === 'BUSINESS_OWNER'
      ? ApiService.getCertificates(user?.id)
      : ApiService.getCertificates();

    certs.forEach(cert => {
      const daysLeft = getExpiryDays(cert.expiryDate);
      if (daysLeft < 0) {
        items.push({
          id: `EXP-${cert.id}`,
          type: 'expiry_critical',
          title: `Certificate Expired — ${cert.instrumentId}`,
          message: `Certificate ${cert.certificateNumber} expired ${Math.abs(daysLeft)} days ago. The instrument is no longer legally authorized for trade. Apply for re-verification immediately.`,
          timestamp: cert.expiryDate,
          read: false,
          severity: 'error',
          actionLabel: 'Apply for Re-Verification'
        });
      } else if (daysLeft <= 30) {
        items.push({
          id: `WARN-${cert.id}`,
          type: 'expiry_warning',
          title: `Certificate Expiring Soon — ${cert.instrumentId}`,
          message: `Certificate ${cert.certificateNumber} expires in ${daysLeft} days (${cert.expiryDate}). Submit re-verification to avoid non-compliance under LM Act, 2009.`,
          timestamp: new Date(Date.now() - 2 * 24 * 3600000).toISOString().split('T')[0],
          read: daysLeft > 15,
          severity: 'warning',
          actionLabel: 'Schedule Re-Verification'
        });
      }
    });

    const apps = role === 'BUSINESS_OWNER'
      ? ApiService.getApplications(user?.id)
      : ApiService.getApplications();

    apps.slice(0, 5).forEach(app => {
      if (app.status === 'CERTIFICATE_GENERATED') {
        items.push({
          id: `APP-CERT-${app.id}`,
          type: 'certificate_ready',
          title: `Certificate Ready — ${app.id}`,
          message: `Verification application ${app.id} has been completed. A new digital certificate has been issued and is available for download.`,
          timestamp: app.filedOn,
          read: false,
          severity: 'success',
          actionLabel: 'View Certificate'
        });
      } else if (app.status === 'SCHEDULED') {
        items.push({
          id: `APP-SCHED-${app.id}`,
          type: 'application_update',
          title: `Inspection Scheduled — ${app.id}`,
          message: `Field verification for application ${app.id} has been scheduled. Ensure the instrument is accessible on the designated date.`,
          timestamp: app.filedOn,
          read: true,
          severity: 'info',
          actionLabel: 'View Schedule'
        });
      } else if (app.status === 'REJECTED') {
        items.push({
          id: `APP-REJ-${app.id}`,
          type: 'application_update',
          title: `Application Rejected — ${app.id}`,
          message: `Application ${app.id} was rejected. Remarks: ${app.scrutinyRemarks || 'See application for details'}. Please re-submit with corrected documents.`,
          timestamp: app.filedOn,
          read: false,
          severity: 'error',
          actionLabel: 'Re-Submit Application'
        });
      }
    });

    if (role === 'LMO_OFFICER') {
      const reports = ApiService.getCitizenReports().filter(r => r.status === 'OPEN');
      reports.slice(0, 3).forEach(rep => {
        items.push({
          id: `ENF-${rep.id}`,
          type: 'enforcement',
          title: `Citizen Complaint — ${rep.businessName}`,
          message: `New complaint (${rep.id}): ${rep.issueCategory.replace(/_/g, ' ')} at ${rep.businessName}. ${rep.description.substring(0, 100)}...`,
          timestamp: rep.createdAt,
          read: false,
          severity: 'error',
          actionLabel: 'Take Enforcement Action'
        });
      });
      const pendingApps = ApiService.getApplications().filter(a => a.status === 'SUBMITTED' || a.status === 'IN_SCRUTINY');
      if (pendingApps.length > 0) {
        items.push({
          id: 'SLA-WARN-001',
          type: 'system',
          title: `SLA Warning: ${pendingApps.length} Applications Pending`,
          message: `${pendingApps.length} applications pending scrutiny may breach the 48-hour SLA window.`,
          timestamp: new Date().toISOString().split('T')[0],
          read: false,
          severity: 'warning',
          actionLabel: 'Review Applications'
        });
      }
    }

    if (role === 'ADMIN') {
      const breached = ApiService.getApplications().filter(a => a.slaBreached);
      if (breached.length > 0) {
        items.push({
          id: 'ADMIN-SLA-001',
          type: 'enforcement',
          title: `SLA Breach: ${breached.length} Applications Overdue`,
          message: `${breached.length} applications exceeded SLA deadline. Escalate or auto-reassign.`,
          timestamp: new Date().toISOString().split('T')[0],
          read: false,
          severity: 'error',
          actionLabel: 'View SLA Dashboard'
        });
      }
      items.push({
        id: 'SYSTEM-001',
        type: 'system',
        title: 'System: New Instrument Category Available',
        message: 'Central LM Office notified addition of 2 new instrument categories. Update the Rule Engine to include them.',
        timestamp: new Date(Date.now() - 2 * 24 * 3600000).toISOString().split('T')[0],
        read: true,
        severity: 'info',
        actionLabel: 'Open Rule Engine'
      });
    }

    if (role === 'GATC_CENTER') {
      const allocations = ApiService.getAllocations(user?.id);
      const pending = allocations.filter(a => a.status === 'SCHEDULED');
      if (pending.length > 0) {
        items.push({
          id: 'GATC-ALLOC-001',
          type: 'application_update',
          title: `${pending.length} Verification Job(s) Assigned`,
          message: `You have ${pending.length} pending instrument verification jobs assigned to your GATC centre. Review and complete before SLA deadline.`,
          timestamp: new Date().toISOString().split('T')[0],
          read: false,
          severity: 'warning',
          actionLabel: 'View Pending Jobs'
        });
      }
    }

    const sorted = items.sort((a, b) => {
      if (a.read !== b.read) return a.read ? 1 : -1;
      const sev: Record<string, number> = { error: 0, warning: 1, success: 2, info: 3 };
      return sev[a.severity] - sev[b.severity];
    });

    setNotifications(sorted);
  };

  useEffect(() => { generateNotifications(); }, [user, role]);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const typeFilterMap: Record<string, NotificationItem['type'][]> = {
    EXPIRY: ['expiry_warning', 'expiry_critical'],
    APPLICATIONS: ['application_update', 'certificate_ready'],
    ENFORCEMENT: ['enforcement', 'system']
  };

  const filtered = filter === 'ALL'
    ? notifications
    : filter === 'UNREAD'
    ? notifications.filter(n => !n.read)
    : notifications.filter(n => typeFilterMap[filter]?.includes(n.type));

  const unreadCount = notifications.filter(n => !n.read).length;

  const severityIcon = (sev: string) => {
    switch (sev) {
      case 'error': return <AlertTriangle size={20} color="#dc2626" />;
      case 'warning': return <Clock size={20} color="#d97706" />;
      case 'success': return <CheckCircle2 size={20} color="#059669" />;
      default: return <Bell size={20} color="#1e40af" />;
    }
  };

  const severityBg = (sev: string) => ({
    error: '#fef2f2', warning: '#fffbeb', success: '#ecfdf5', info: '#eff6ff'
  }[sev] || '#f8fafc');

  const severityBorder = (sev: string) => ({
    error: '#fecaca', warning: '#fde68a', success: '#a7f3d0', info: '#bfdbfe'
  }[sev] || '#e2e8f0');

  return (
    <Box sx={{ p: { xs: 2, md: 3.5 }, maxWidth: 900, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Badge badgeContent={unreadCount} color="error" max={99}>
            <Bell size={26} color="#1e40af" />
          </Badge>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', fontFamily: '"Outfit", sans-serif' }}>
              Alerts & Notifications
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              {unreadCount} unread · Real-time expiry tracking and compliance alerts
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            startIcon={<RefreshCw size={14} />}
            onClick={generateNotifications}
            sx={{ color: '#64748b', fontSize: '0.8rem' }}
          >
            Refresh
          </Button>
          {unreadCount > 0 && (
            <Button
              size="small"
              variant="outlined"
              onClick={markAllRead}
              sx={{ fontSize: '0.8rem', borderColor: '#bfdbfe', color: '#1e40af' }}
            >
              Mark All Read
            </Button>
          )}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
        {(['ALL', 'UNREAD', 'EXPIRY', 'APPLICATIONS', 'ENFORCEMENT'] as const).map(f => (
          <Chip
            key={f}
            label={`${f.replace(/_/g, ' ')} (${f === 'ALL' ? notifications.length : f === 'UNREAD' ? unreadCount : notifications.filter(n => typeFilterMap[f]?.includes(n.type)).length})`}
            onClick={() => setFilter(f)}
            sx={{
              fontWeight: 700, fontSize: '0.75rem',
              backgroundColor: filter === f ? '#1e40af' : '#ffffff',
              color: filter === f ? '#ffffff' : '#475569',
              border: filter === f ? '1px solid #1e40af' : '1px solid #e2e8f0',
              cursor: 'pointer', borderRadius: '8px'
            }}
          />
        ))}
      </Box>

      {filtered.length === 0 ? (
        <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <CheckCircle2 size={48} color="#10b981" style={{ marginBottom: 12 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>All Caught Up!</Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>No alerts in this category.</Typography>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {filtered.map(notif => (
            <Paper
              key={notif.id}
              elevation={0}
              sx={{
                p: 2.5, borderRadius: '12px',
                border: `1px solid ${severityBorder(notif.severity)}`,
                backgroundColor: notif.read ? '#ffffff' : severityBg(notif.severity),
                position: 'relative',
                transition: 'all 0.15s ease',
                '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }
              }}
            >
              {!notif.read && (
                <Box sx={{
                  position: 'absolute', top: 14, left: -4,
                  width: 8, height: 8, borderRadius: '50%',
                  backgroundColor: notif.severity === 'error' ? '#dc2626' : notif.severity === 'warning' ? '#d97706' : '#1e40af'
                }} />
              )}
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <Box sx={{ mt: 0.5, flexShrink: 0 }}>{severityIcon(notif.severity)}</Box>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: notif.read ? 600 : 800, color: '#0f172a', lineHeight: 1.3 }}>
                      {notif.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                      <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.7rem', whiteSpace: 'nowrap' }}>
                        {notif.timestamp}
                      </Typography>
                      {!notif.read && (
                        <Box onClick={() => markAsRead(notif.id)} sx={{ cursor: 'pointer', color: '#94a3b8', display: 'flex', '&:hover': { color: '#475569' } }}>
                          <X size={14} />
                        </Box>
                      )}
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#475569', mt: 0.5, fontSize: '0.87rem', lineHeight: 1.5 }}>
                    {notif.message}
                  </Typography>
                  {notif.actionLabel && (
                    <Button
                      size="small"
                      variant="text"
                      onClick={() => markAsRead(notif.id)}
                      sx={{
                        mt: 1, fontSize: '0.78rem', fontWeight: 700, p: 0,
                        color: notif.severity === 'error' ? '#dc2626' : notif.severity === 'warning' ? '#d97706' : '#1e40af',
                        '&:hover': { backgroundColor: 'transparent', textDecoration: 'underline' }
                      }}
                    >
                      {notif.actionLabel} →
                    </Button>
                  )}
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>
      )}

      <Paper elevation={0} sx={{ mt: 4, p: 2.5, borderRadius: '16px', border: '1px solid #bfdbfe', backgroundColor: '#eff6ff' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Scale size={18} color="#1e40af" />
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e40af' }}>
            Compliance Notification Policy — LM Act, 2009
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: '#1e40af', fontSize: '0.84rem', lineHeight: 1.6 }}>
          <strong>30-day advance warning:</strong> In-app alerts 30 days before certificate expiry.{' '}
          <strong>7-day urgent warning:</strong> Escalated red-priority alert. Operating an unverified instrument under Section 25 of the LM Act carries penalties up to ₹25,000 for first offence.
          SMS gateway (MSG91/Razorpay) is documented as a future extension.
        </Typography>
      </Paper>
    </Box>
  );
};
