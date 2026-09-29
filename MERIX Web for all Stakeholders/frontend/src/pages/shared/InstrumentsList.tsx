import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab
} from '@mui/material';
import {
  Scale,
  MapPin,
  QrCode,
  Eye,
  ChevronDown,
  Building2,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { QrCodeModal } from '../../components/common/QrCodeModal';
import { NewApplicationModal } from '../../components/forms/NewApplicationModal';
import { InstrumentDetailPage } from './InstrumentDetailPage';
import { ApplicationDetailPage } from './ApplicationDetailPage';
import { ApiService } from '../../services/api';
import { Instrument } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface InstrumentsListProps {
  isAdmin?: boolean;
}

export const InstrumentsList: React.FC<InstrumentsListProps> = ({ isAdmin }) => {
  const { user } = useAuth();
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [selectedInst, setSelectedInst] = useState<Instrument | null>(null);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [qrOpen, setQrOpen] = useState(false);
  const [appOpen, setAppOpen] = useState(false);
  const [activeDistrictTab, setActiveDistrictTab] = useState('ALL');

  const loadData = () => {
    let insts = isAdmin ? ApiService.getInstruments() : ApiService.getInstruments(user?.id);
    if (!isAdmin && insts.length === 0) {
      insts = ApiService.getInstruments('USR-001');
    }
    setInstruments(insts);
  };

  useEffect(() => {
    loadData();
  }, [user, isAdmin]);

  // If an application is selected, render it as full page
  if (selectedAppId) {
    return (
      <ApplicationDetailPage
        applicationId={selectedAppId}
        onBack={() => {
          setSelectedAppId(null);
          loadData();
        }}
        onOpenInstrument={(instId) => {
          setSelectedAppId(null);
          const found = ApiService.getInstrumentById(instId);
          if (found) setSelectedInst(found);
        }}
      />
    );
  }

  // If an instrument is selected, render it as full page
  if (selectedInst) {
    return (
      <InstrumentDetailPage
        instrument={selectedInst}
        onBack={() => {
          setSelectedInst(null);
          loadData();
        }}
        onApplyVerification={(inst) => {
          setSelectedInst(null);
          setAppOpen(true);
        }}
        onOpenApplication={(appId) => {
          setSelectedInst(null);
          setSelectedAppId(appId);
        }}
      />
    );
  }

  const getTrustColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const handleOpenDetail = (inst: Instrument) => {
    setSelectedInst(inst);
  };

  // Group instruments by District for Admin view
  const getDistrictForInst = (inst: Instrument) => {
    const addr = inst.installationAddress.toLowerCase();
    if (addr.includes('coimbatore') || addr.includes('avinashi') || addr.includes('peelamedu')) return 'Coimbatore';
    if (addr.includes('madurai') || addr.includes('moola')) return 'Madurai';
    if (addr.includes('salem')) return 'Salem';
    if (addr.includes('trichy') || addr.includes('tiruchirappalli')) return 'Tiruchirappalli';
    if (addr.includes('thanjavur')) return 'Thanjavur';
    return 'Chennai';
  };

  const districtGroups: Record<string, Instrument[]> = {};
  instruments.forEach(inst => {
    const dist = getDistrictForInst(inst);
    if (!districtGroups[dist]) districtGroups[dist] = [];
    districtGroups[dist].push(inst);
  });

  const allDistricts = Object.keys(districtGroups);

  return (
    <Box sx={{ p: { xs: 2, md: 3.5 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Scale size={24} color="#1e40af" />
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', fontFamily: '"Outfit", sans-serif' }}>
              {isAdmin ? 'District-Wise Registered Measuring Instruments' : 'My Registered Instruments'}
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
            {isAdmin
              ? 'Jurisdictional overview of weighing and measuring instruments grouped by district under Legal Metrology Act, 2009.'
              : 'Manage and track all weighing and measuring devices registered under your business.'}
          </Typography>
        </Box>
      </Box>

      {/* Admin District Tabs / Summary Filter */}
      {isAdmin && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            <Chip
              label={`All Districts (${instruments.length})`}
              onClick={() => setActiveDistrictTab('ALL')}
              sx={{
                fontWeight: 700,
                fontSize: '0.78rem',
                backgroundColor: activeDistrictTab === 'ALL' ? '#1e40af' : '#ffffff',
                color: activeDistrictTab === 'ALL' ? '#ffffff' : '#475569',
                border: activeDistrictTab === 'ALL' ? '1px solid #1e40af' : '1px solid #e2e8f0',
                cursor: 'pointer'
              }}
            />
            {allDistricts.map(dist => (
              <Chip
                key={dist}
                label={`${dist} (${districtGroups[dist].length})`}
                onClick={() => setActiveDistrictTab(dist)}
                sx={{
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  backgroundColor: activeDistrictTab === dist ? '#1e40af' : '#ffffff',
                  color: activeDistrictTab === dist ? '#ffffff' : '#475569',
                  border: activeDistrictTab === dist ? '1px solid #1e40af' : '1px solid #e2e8f0',
                  cursor: 'pointer'
                }}
              />
            ))}
          </Box>

          {/* District Accordion Groups */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {(activeDistrictTab === 'ALL' ? allDistricts : [activeDistrictTab]).map(dist => {
              const list = districtGroups[dist] || [];
              const verifiedCount = list.filter(i => i.status === 'VERIFIED').length;
              const avgTrust = Math.round(list.reduce((acc, i) => acc + i.trustScore, 0) / (list.length || 1));

              return (
                <Accordion
                  key={dist}
                  defaultExpanded={true}
                  sx={{
                    borderRadius: '12px !important',
                    border: '1px solid #e2e8f0',
                    boxShadow: 'none',
                    '&:before': { display: 'none' },
                    overflow: 'hidden'
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ChevronDown size={20} color="#1e40af" />}
                    sx={{
                      backgroundColor: '#f8fafc',
                      borderBottom: '1px solid #e2e8f0',
                      px: 2.5
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', pr: 2, flexWrap: 'wrap', gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Building2 size={20} color="#1e40af" />
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                          District: {dist} Region
                        </Typography>
                        <Chip
                          label={`${list.length} Instruments`}
                          size="small"
                          sx={{ fontWeight: 800, fontSize: '0.7rem', backgroundColor: '#eff6ff', color: '#1e40af' }}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="caption" sx={{ color: '#059669', fontWeight: 700 }}>
                          ✓ {verifiedCount}/{list.length} Verified
                        </Typography>
                        <Chip
                          label={`Avg Trust: ${avgTrust}%`}
                          size="small"
                          sx={{
                            fontWeight: 800,
                            fontSize: '0.7rem',
                            backgroundColor: avgTrust >= 85 ? '#dcfce7' : '#fee2e2',
                            color: avgTrust >= 85 ? '#15803d' : '#991b1b'
                          }}
                        />
                      </Box>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ p: 0 }}>
                    <Table>
                      <TableHead sx={{ backgroundColor: '#ffffff' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Instrument ID</TableCell>
                          <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Type &amp; Make</TableCell>
                          <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Business Enterprise</TableCell>
                          <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Class &amp; Capacity</TableCell>
                          <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Serial No.</TableCell>
                          <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Trust Score</TableCell>
                          <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {list.map(inst => (
                          <TableRow
                            key={inst.id}
                            hover
                            sx={{ cursor: 'pointer' }}
                            onClick={() => handleOpenDetail(inst)}
                          >
                            <TableCell sx={{ fontWeight: 800, fontSize: '0.82rem', color: '#1e40af' }}>
                              {inst.id}
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                {inst.instrumentType}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#64748b' }}>
                                {inst.manufacturer} ({inst.modelNumber})
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ fontSize: '0.82rem' }}>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>{inst.businessName}</Typography>
                              <Typography variant="caption" sx={{ color: '#64748b' }}>{inst.installationAddress}</Typography>
                            </TableCell>
                            <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>
                              {inst.accuracyClass} • Max {inst.maxCapacity}
                            </TableCell>
                            <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#475569' }}>
                              {inst.serialNumber}
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Chip
                                  label={`${inst.trustScore}%`}
                                  size="small"
                                  sx={{
                                    fontWeight: 800,
                                    fontSize: '0.7rem',
                                    backgroundColor: inst.trustScore >= 80 ? '#ecfdf5' : '#fee2e2',
                                    color: inst.trustScore >= 80 ? '#059669' : '#b91c1c'
                                  }}
                                />
                                {inst.isAtDriftRisk && (
                                  <Chip label="DRIFT" size="small" sx={{ fontSize: '0.62rem', backgroundColor: '#fef3c7', color: '#b45309', height: 18, fontWeight: 800 }} />
                                )}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={inst.status} />
                            </TableCell>
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <Box sx={{ display: 'flex', gap: 0.8 }}>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  startIcon={<Eye size={13} />}
                                  onClick={() => handleOpenDetail(inst)}
                                  sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#1e40af', borderColor: '#bfdbfe', py: 0.3 }}
                                >
                                  View
                                </Button>
                                <Button
                                  size="small"
                                  startIcon={<QrCode size={13} />}
                                  onClick={() => { setSelectedInst(inst); setQrOpen(true); }}
                                  sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#059669', py: 0.3, minWidth: 0, px: 1 }}
                                >
                                  QR
                                </Button>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </Box>
        </Box>
      )}

      {/* Business Owner Flat Table */}
      {!isAdmin && (
        <Paper variant="outlined" sx={{ borderRadius: '14px', overflow: 'hidden' }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Instrument ID</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Type &amp; Make</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Serial No.</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Accuracy / Capacity</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Location</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Trust Score</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {instruments.map(inst => (
                <TableRow
                  key={inst.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => handleOpenDetail(inst)}
                >
                  <TableCell sx={{ fontWeight: 800, fontSize: '0.82rem', color: '#1e40af' }}>{inst.id}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{inst.instrumentType}</Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>{inst.manufacturer} {inst.modelNumber}</Typography>
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#475569' }}>{inst.serialNumber}</TableCell>
                  <TableCell sx={{ fontSize: '0.82rem' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{inst.accuracyClass}</Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>Max {inst.maxCapacity}</Typography>
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.78rem' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <MapPin size={13} color="#64748b" />
                      <Typography variant="caption" sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {inst.installationAddress}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          border: `3px solid ${getTrustColor(inst.trustScore)}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.7rem', color: getTrustColor(inst.trustScore) }}>
                          {inst.trustScore}
                        </Typography>
                      </Box>
                      {inst.isAtDriftRisk && (
                        <Chip label="DRIFT RISK" size="small" sx={{ fontSize: '0.62rem', backgroundColor: '#fef3c7', color: '#b45309', height: 18, fontWeight: 800 }} />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={inst.status} />
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Box sx={{ display: 'flex', gap: 0.8 }}>
                      <Button
                        size="small"
                        startIcon={<QrCode size={13} />}
                        onClick={() => { setSelectedInst(inst); setQrOpen(true); }}
                        sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#059669', py: 0.3, minWidth: 0, px: 1 }}
                      >
                        QR
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => { setSelectedInst(inst); setAppOpen(true); }}
                        sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#1e40af', borderColor: '#bfdbfe', py: 0.3 }}
                      >
                        Apply
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      {/* Modals */}
      <QrCodeModal
        open={qrOpen}
        onClose={() => setQrOpen(false)}
        title={selectedInst?.id || ''}
        subtitle={`${selectedInst?.instrumentType} · ${selectedInst?.manufacturer} ${selectedInst?.modelNumber}`}
        qrValue={selectedInst?.qrCodeData || 'https://merix.gov.in/verify/instrument'}
        badgeText="Registered Legal Metrology Instrument"
      />

      <NewApplicationModal
        open={appOpen}
        onClose={() => setAppOpen(false)}
        onSuccess={(newApp) => {
          setAppOpen(false);
          loadData();
          if (newApp && newApp.id) {
            setSelectedAppId(newApp.id);
          }
        }}
        preselectedInstrumentId={selectedInst?.id}
      />
    </Box>
  );
};
