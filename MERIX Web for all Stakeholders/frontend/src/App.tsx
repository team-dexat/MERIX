import React, { useState, useEffect } from 'react';
import { Box, CssBaseline, ThemeProvider } from '@mui/material';
import { theme } from './theme/theme';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { TopHeader } from './components/layout/TopHeader';
import { Sidebar } from './components/layout/Sidebar';
import { LoginPage } from './pages/auth/LoginPage';
import { BusinessDashboard } from './pages/business/BusinessDashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { LmoDashboard } from './pages/lmo/LmoDashboard';
import { EnforcementPage } from './pages/lmo/EnforcementPage';
import { GatcDashboard } from './pages/gatc/GatcDashboard';
import { ApplicationsManagement } from './pages/admin/ApplicationsManagement';
import { InstrumentsList } from './pages/shared/InstrumentsList';
import { CertificatesList } from './pages/shared/CertificatesList';
import { RuleEngine } from './pages/admin/RuleEngine';
import { CitizenReports } from './pages/admin/CitizenReports';
import { AuditLogs } from './pages/admin/AuditLogs';
import { SlaDashboard } from './pages/admin/SlaDashboard';
import { ReportsDashboard } from './pages/admin/ReportsDashboard';
import { FieldMap } from './pages/shared/FieldMap';
import { PublicVerify } from './pages/public/PublicVerify';
import { ScanQrPage } from './pages/public/ScanQrPage';
import { NearMe } from './pages/public/NearMe';
import { AlertsPage } from './pages/shared/AlertsPage';
import { UserManualPage } from './pages/shared/UserManualPage';
import { SettingsPage } from './pages/shared/SettingsPage';
import { VerifiedBadgePage } from './pages/business/VerifiedBadgePage';
import { InstrumentDetailPage } from './pages/shared/InstrumentDetailPage';
import { ApplicationDetailPage } from './pages/shared/ApplicationDetailPage';
import { Instrument } from './types';
import { ApiService } from './services/api';

const MainAppContent: React.FC = () => {
  const { user, role, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedInstrument, setSelectedInstrument] = useState<Instrument | null>(null);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [publicVerifyCertId, setPublicVerifyCertId] = useState<string | null>(null);
  const [isPublicVerifyMode, setIsPublicVerifyMode] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Parse path and handle direct deep links like /verify/:certId or /verify
  const checkUrlRoute = () => {
    if (typeof window === 'undefined') return;
    const pathname = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);
    const queryCert = searchParams.get('cert') || searchParams.get('id') || searchParams.get('number');

    if (pathname.includes('/verify') || queryCert) {
      setIsPublicVerifyMode(true);
      if (pathname.includes('/verify/')) {
        const extracted = pathname.split('/verify/')[1];
        if (extracted && extracted.trim().length > 0) {
          setPublicVerifyCertId(decodeURIComponent(extracted.trim()));
          return;
        }
      }
      if (queryCert) {
        setPublicVerifyCertId(queryCert);
        return;
      }
      setPublicVerifyCertId('DOCA-LM-2026-00892');
    } else {
      setIsPublicVerifyMode(false);
      setPublicVerifyCertId(null);
    }
  };

  useEffect(() => {
    checkUrlRoute();
    window.addEventListener('popstate', checkUrlRoute);
    return () => window.removeEventListener('popstate', checkUrlRoute);
  }, []);

  // 1. If user accessed a /verify link directly without logging in:
  if (isPublicVerifyMode && (!isAuthenticated || !user)) {
    return (
      <PublicVerify
        initialCertNumber={publicVerifyCertId || undefined}
        isStandalonePublic={true}
        onGoToLogin={() => {
          if (typeof window !== 'undefined') {
            window.history.pushState({}, '', '/');
          }
          setIsPublicVerifyMode(false);
        }}
      />
    );
  }

  // 2. Standard Login Screen when not authenticated
  if (!isAuthenticated || !user) {
    return <LoginPage onLoginSuccess={() => setActiveTab('dashboard')} />;
  }

  const handleTabChange = (tab: string) => {
    setSelectedInstrument(null);
    setSelectedApplicationId(null);
    setIsPublicVerifyMode(false);
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  const renderContent = () => {
    // If authenticated user is directly navigating to /verify/:certId
    if (isPublicVerifyMode && publicVerifyCertId) {
      return (
        <PublicVerify
          initialCertNumber={publicVerifyCertId}
          isStandalonePublic={false}
        />
      );
    }

    // Full Page Instrument Detail View from Global Search or Navigation
    if (selectedInstrument) {
      return (
        <InstrumentDetailPage
          instrument={selectedInstrument}
          onBack={() => setSelectedInstrument(null)}
          onOpenApplication={(appId) => {
            setSelectedInstrument(null);
            setSelectedApplicationId(appId);
          }}
        />
      );
    }

    // Full Page Application Detail View from Global Search or Navigation
    if (selectedApplicationId) {
      return (
        <ApplicationDetailPage
          applicationId={selectedApplicationId}
          onBack={() => setSelectedApplicationId(null)}
          onOpenInstrument={(instId) => {
            setSelectedApplicationId(null);
            const found = ApiService.getInstrumentById(instId);
            if (found) setSelectedInstrument(found);
          }}
        />
      );
    }

    switch (activeTab) {
      // ──────────────── DASHBOARD ────────────────
      case 'dashboard':
        if (role === 'ADMIN') return <AdminDashboard onNavigate={handleTabChange} />;
        if (role === 'LMO_OFFICER') return <LmoDashboard />;
        if (role === 'GATC_CENTER') return <GatcDashboard />;
        if (role === 'CITIZEN') return <PublicVerify />;
        return <BusinessDashboard onNavigate={handleTabChange} />;

      // ──────────────── INSTRUMENTS ────────────────
      case 'my_instruments':
        return <InstrumentsList />;

      case 'instruments':
        if (role === 'ADMIN') return <InstrumentsList isAdmin={true} />;
        if (role === 'BUSINESS_OWNER') return <InstrumentsList />;
        if (role === 'GATC_CENTER') return <InstrumentsList isAdmin={true} />;
        return <PublicVerify />;

      // ──────────────── APPLICATIONS ────────────────
      case 'applications':
        if (role === 'ADMIN' || role === 'BUSINESS_OWNER') return <ApplicationsManagement />;
        if (role === 'LMO_OFFICER') return <LmoDashboard />;
        if (role === 'GATC_CENTER') return <GatcDashboard />;
        return <PublicVerify />;

      case 'allocation':
        if (role === 'ADMIN') return <ApplicationsManagement />;
        if (role === 'LMO_OFFICER') return <LmoDashboard />;
        if (role === 'GATC_CENTER') return <GatcDashboard />;
        return <BusinessDashboard onNavigate={handleTabChange} />;

      // ──────────────── INSPECTIONS (LMO / GATC queue tab) ────────────────
      case 'inspections':
        if (role === 'LMO_OFFICER') return <LmoDashboard />;
        if (role === 'ADMIN') return <ApplicationsManagement />;
        return <BusinessDashboard onNavigate={handleTabChange} />;

      case 'gatc_queue':
        return <GatcDashboard />;

      // ──────────────── CERTIFICATES ────────────────
      case 'certificates':
        return (
          <CertificatesList
            userId={role === 'BUSINESS_OWNER' ? user?.id : undefined}
            isAdmin={role === 'ADMIN' || role === 'LMO_OFFICER' || role === 'GATC_CENTER'}
          />
        );

      // ──────────────── VERIFIED BUSINESS BADGE ────────────────
      case 'verified_badge':
        return <VerifiedBadgePage />;

      // ──────────────── ADMIN SPECIFIC ────────────────
      case 'rule_engine':
        if (role === 'ADMIN') return <RuleEngine />;
        return <BusinessDashboard onNavigate={handleTabChange} />;

      case 'citizen_reports':
      case 'citizen_report':
        if (role === 'ADMIN' || role === 'LMO_OFFICER') return <CitizenReports />;
        return <NearMe />;

      case 'audit':
        if (role === 'ADMIN') return <AuditLogs />;
        return <BusinessDashboard onNavigate={handleTabChange} />;

      case 'sla':
        if (role === 'ADMIN') return <SlaDashboard />;
        return <BusinessDashboard onNavigate={handleTabChange} />;

      case 'reports':
        if (role === 'ADMIN') return <ReportsDashboard />;
        return <BusinessDashboard onNavigate={handleTabChange} />;

      // ──────────────── MAP & ENFORCEMENT ────────────────
      case 'field_map':
        if (role === 'ADMIN' || role === 'LMO_OFFICER') return <FieldMap />;
        return <PublicVerify />;

      case 'enforcement':
        if (role === 'LMO_OFFICER' || role === 'ADMIN') return <EnforcementPage />;
        return <BusinessDashboard onNavigate={handleTabChange} />;

      case 'near_me':
        return <NearMe />;

      // ──────────────── PUBLIC ────────────────
      case 'public_verify':
        return <PublicVerify />;

      case 'scan_qr':
        return <ScanQrPage />;

      // ──────────────── SHARED UTILITY PAGES ────────────────
      case 'alerts':
        return <AlertsPage />;

      case 'user_manual':
        return <UserManualPage />;

      case 'support':
        return <UserManualPage />;

      case 'settings':
        return <SettingsPage />;

      // ──────────────── DEFAULT ────────────────
      default:
        if (role === 'ADMIN') return <AdminDashboard onNavigate={handleTabChange} />;
        if (role === 'LMO_OFFICER') return <LmoDashboard />;
        if (role === 'GATC_CENTER') return <GatcDashboard />;
        if (role === 'CITIZEN') return <PublicVerify />;
        return <BusinessDashboard onNavigate={handleTabChange} />;
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <TopHeader
        onNavigate={handleTabChange}
        onOpenInstrument={(inst) => {
          setSelectedApplicationId(null);
          setSelectedInstrument(inst);
        }}
        onOpenApplication={(appId) => {
          setSelectedInstrument(null);
          setSelectedApplicationId(appId);
        }}
        onToggleMobileMenu={() => setMobileMenuOpen(prev => !prev)}
      />
      <Box sx={{ display: 'flex', flex: 1 }}>
        <Sidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 1.5, sm: 2.5, md: 3 },
            backgroundColor: '#f8fafc',
            width: { xs: '100%', md: 'calc(100vw - 240px)' },
            maxWidth: { xs: '100vw', md: 'calc(100vw - 240px)' },
            overflowX: 'hidden'
          }}
        >
          {renderContent()}
        </Box>
      </Box>
    </Box>
  );
};

export function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LanguageProvider>
        <AuthProvider>
          <MainAppContent />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
