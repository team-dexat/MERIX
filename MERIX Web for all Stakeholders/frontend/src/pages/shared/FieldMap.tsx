import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Chip,
  Card,
  CardContent,
  Avatar,
  Divider,
  IconButton
} from '@mui/material';
import {
  Navigation,
  MapPin,
  Clock,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Route,
  User,
  ExternalLink,
  Eye,
  Crosshair,
  Layers,
  Sparkles
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { StatusBadge } from '../../components/common/StatusBadge';
import { FieldVerificationPage } from './FieldVerificationPage';
import { DigitalCertificateModal } from '../../components/certificates/DigitalCertificateModal';
import { ApplicationDetailPage } from './ApplicationDetailPage';
import { createMapPin, MapIcons } from '../../utils/leafletIcons';
import { ApiService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Allocation, Certificate, VerificationApplication } from '../../types';

// Helper component to center map smoothly on selected allocation
const MapRecenter: React.FC<{ lat: number; lng: number }> = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.flyTo([lat, lng], 13.5, { duration: 1.0 });
    }
  }, [lat, lng, map]);
  return null;
};

export const FieldMap: React.FC = () => {
  const { user, role } = useAuth();
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [selectedAlloc, setSelectedAlloc] = useState<Allocation | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [verifyingAppId, setVerifyingAppId] = useState<string | null>(null);
  const [generatedCert, setGeneratedCert] = useState<Certificate | null>(null);
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

  const loadData = () => {
    // Fetch allocations for current officer or all LMO allocations
    const allocs = role === 'ADMIN' ? ApiService.getAllocations() : ApiService.getAllocations(user?.id);
    setAllocations(allocs);
    if (allocs.length > 0 && !selectedAlloc) {
      setSelectedAlloc(allocs[0]);
    }
  };

  useEffect(() => {
    loadData();
  }, [user, role]);

  const handleStartInspection = (alloc: Allocation) => {
    setSelectedAlloc(alloc);
    setVerifyingAppId(alloc.applicationId);
  };

  const handleCertGenerated = (cert: Certificate) => {
    setGeneratedCert(cert);
    setCertModalOpen(true);
    loadData();
  };

  // If verification console is active, render full-page Field Verification & Stamping Console
  if (verifyingAppId) {
    return (
      <FieldVerificationPage
        applicationId={verifyingAppId}
        onBack={() => {
          setVerifyingAppId(null);
          loadData();
        }}
        onCertificateGenerated={(cert) => {
          setVerifyingAppId(null);
          handleCertGenerated(cert);
        }}
      />
    );
  }

  // If an application is selected, render it as full page
  if (selectedAppId) {
    return (
      <ApplicationDetailPage
        applicationId={selectedAppId}
        onBack={() => {
          setSelectedAppId(null);
          loadData();
        }}
        onStartVerification={(appId) => {
          setSelectedAppId(null);
          setVerifyingAppId(appId);
        }}
      />
    );
  }

  // Selected stop coordinates
  const selectedApp = selectedAlloc ? (selectedAlloc.application || ApiService.getApplicationById(selectedAlloc.applicationId)) : null;
  const selectedLat = selectedApp?.instrument?.latitude || 13.0694;
  const selectedLng = selectedApp?.instrument?.longitude || 80.1948;

  // Filtered allocations
  const filteredAllocs = filterStatus === 'ALL' ? allocations : allocations.filter(a => a.status === filterStatus);

  // Ordered polyline route coordinates
  const routePoints: [number, number][] = allocations.map((a, idx) => {
    const app = a.application || ApiService.getApplicationById(a.applicationId);
    return [app?.instrument?.latitude || (13.0694 + idx * 0.015), app?.instrument?.longitude || (80.1948 + idx * 0.015)];
  });

  return (
    <Box sx={{ p: { xs: 2, md: 3.5 }, maxWidth: '1600px', margin: '0 auto' }}>
      {/* Header Banner */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Navigation size={26} color="#1e40af" />
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', fontFamily: '"Outfit", sans-serif' }}>
              Field Inspection Route &amp; Geo-Tracking Map
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.3 }}>
            Real-time GPS dispatch itinerary and automated route map for Legal Metrology Officers.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Chip
            icon={<Route size={14} color="#1e40af" />}
            label={`${allocations.length} Assigned Stop(s)`}
            sx={{ fontWeight: 700, fontSize: '0.78rem', backgroundColor: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe' }}
          />
          <Chip
            icon={<ShieldCheck size={14} color="#059669" />}
            label="GPS Geo-Fence Active"
            sx={{ fontWeight: 700, fontSize: '0.78rem', backgroundColor: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' }}
          />
        </Box>
      </Box>

      {/* TOP SECTION: FULL WIDTH INTERACTIVE MAP WITH ROUTE PINS */}
      <Paper
        variant="outlined"
        sx={{
          borderRadius: '16px',
          overflow: 'hidden',
          height: { xs: 360, md: 440 },
          mb: 3.5,
          boxShadow: '0 4px 20px -4px rgba(0,0,0,0.08)',
          border: '1px solid #cbd5e1',
          position: 'relative'
        }}
      >
        <Box sx={{ height: '100%', width: '100%' }}>
          <MapContainer
            center={[selectedLat, selectedLng]}
            zoom={12}
            style={{ height: '100%', width: '100%' }}
          >
            <MapRecenter lat={selectedLat} lng={selectedLng} />
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />

            {/* Connecting GPS Route Polyline */}
            {routePoints.length > 1 && (
              <Polyline positions={routePoints} color="#1e40af" weight={3.5} dashArray="6, 8" opacity={0.8} />
            )}

            {/* Pinned Assigned Application Stops */}
            {allocations.map((alloc, idx) => {
              const app = alloc.application || ApiService.getApplicationById(alloc.applicationId);
              const lat = app?.instrument?.latitude || (13.0694 + idx * 0.015);
              const lng = app?.instrument?.longitude || (80.1948 + idx * 0.015);
              const isSelected = selectedAlloc?.id === alloc.id;
              const isCompleted = alloc.status === 'COMPLETED';
              const isInTransit = alloc.status === 'IN_TRANSIT';

              // Visual custom SVG pin with stop number badge
              const markerColor = isSelected ? '#1e40af' : isCompleted ? '#059669' : isInTransit ? '#d97706' : '#2563eb';
              const pinIcon = createMapPin(markerColor, String(idx + 1), isSelected || isInTransit);

              return (
                <Marker
                  key={alloc.id}
                  position={[lat, lng]}
                  icon={pinIcon}
                  eventHandlers={{
                    click: () => setSelectedAlloc(alloc)
                  }}
                >
                  <Popup>
                    <Box sx={{ p: 0.5, minWidth: 210 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.8 }}>
                        <Chip
                          label={`Stop #${idx + 1}`}
                          size="small"
                          sx={{
                            backgroundColor: isCompleted ? '#dcfce7' : '#eff6ff',
                            color: isCompleted ? '#166534' : '#1e40af',
                            fontWeight: 800,
                            fontSize: '0.7rem'
                          }}
                        />
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b' }}>
                          {alloc.applicationId}
                        </Typography>
                      </Box>

                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.3, lineHeight: 1.2 }}>
                        {app?.instrument?.businessName || 'Industrial Site'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#475569', display: 'block', mb: 0.5 }}>
                        {app?.instrument?.instrumentType} • Max {app?.instrument?.maxCapacity}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#059669', fontWeight: 700, display: 'block', mb: 1 }}>
                        ⏰ Slot: {alloc.scheduledTimeSlot}
                      </Typography>

                      <Box sx={{ display: 'flex', gap: 0.8 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          fullWidth
                          onClick={() => setSelectedAppId(alloc.applicationId)}
                          sx={{ fontSize: '0.72rem', py: 0.3, textTransform: 'none', fontWeight: 700 }}
                        >
                          Details
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          fullWidth
                          onClick={() => handleStartInspection(alloc)}
                          disabled={isCompleted}
                          sx={{ backgroundColor: '#059669', fontSize: '0.72rem', py: 0.3, textTransform: 'none', fontWeight: 700 }}
                        >
                          {isCompleted ? '✓ Done' : 'Inspect'}
                        </Button>
                      </Box>
                    </Box>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </Box>
      </Paper>

      {/* BOTTOM SECTION: ASSIGNED APPLICATIONS & ROUTE STOPS LIST (BELOW THE MAP) */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Route size={20} color="#1e40af" />
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', fontFamily: '"Outfit", sans-serif' }}>
              Assigned Applications &amp; Route Stops ({allocations.length})
            </Typography>
          </Box>

          {/* Filter Status Chips */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {['ALL', 'SCHEDULED', 'IN_TRANSIT', 'COMPLETED'].map(status => (
              <Chip
                key={status}
                label={`${status.replace(/_/g, ' ')} (${status === 'ALL' ? allocations.length : allocations.filter(a => a.status === status).length})`}
                onClick={() => setFilterStatus(status)}
                sx={{
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  backgroundColor: filterStatus === status ? '#1e40af' : '#ffffff',
                  color: filterStatus === status ? '#ffffff' : '#475569',
                  border: filterStatus === status ? '1px solid #1e40af' : '1px solid #e2e8f0',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  py: 0.5
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Responsive Grid of Stop Cards */}
        <Grid container spacing={2.5}>
          {filteredAllocs.map((alloc, idx) => {
            const app = alloc.application || ApiService.getApplicationById(alloc.applicationId);
            const isSelected = selectedAlloc?.id === alloc.id;
            const isCompleted = alloc.status === 'COMPLETED';
            const originalIndex = allocations.findIndex(a => a.id === alloc.id);

            return (
              <Grid item xs={12} sm={6} lg={4} key={alloc.id}>
                <Card
                  onClick={() => setSelectedAlloc(alloc)}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    borderRadius: '14px',
                    border: isSelected ? '2px solid #1e40af' : '1px solid #e2e8f0',
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 6px 16px rgba(30, 64, 175, 0.12)' : '0 1px 3px rgba(0,0,0,0.03)',
                    backgroundColor: isSelected ? '#f8fafc' : '#ffffff',
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.06)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 2.2, '&:last-child': { pb: 2.2 }, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                    <Box>
                      {/* Top Row: Stop Number Avatar, Business Name, Status Badge */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              fontSize: '0.85rem',
                              fontWeight: 800,
                              bgcolor: isSelected ? '#1e40af' : isCompleted ? '#059669' : '#e2e8f0',
                              color: isSelected || isCompleted ? '#ffffff' : '#334155'
                            }}
                          >
                            {originalIndex >= 0 ? originalIndex + 1 : idx + 1}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.92rem', lineHeight: 1.2 }}>
                              {app?.instrument?.businessName || 'Industrial Weighing Facility'}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                              App ID: <strong style={{ color: '#1e40af' }}>{alloc.applicationId}</strong>
                            </Typography>
                          </Box>
                        </Box>
                        <StatusBadge status={alloc.status} />
                      </Box>

                      {/* Instrument & Address Box */}
                      <Box sx={{ p: 1.5, backgroundColor: isSelected ? '#ffffff' : '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', mb: 1.8 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#0f172a', display: 'block', mb: 0.4 }}>
                          {app?.instrument?.instrumentType || 'Platform Scale / Bench Scale'} • Max {app?.instrument?.maxCapacity || '300 kg'}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.6 }}>
                          <MapPin size={14} color="#dc2626" style={{ marginTop: 2, flexShrink: 0 }} />
                          <Typography variant="caption" sx={{ color: '#475569', fontSize: '0.75rem', lineHeight: 1.3 }}>
                            {app?.instrument?.installationAddress || 'Guindy Industrial Estate, Chennai'}
                          </Typography>
                        </Box>
                        {alloc.instructions && (
                          <Typography variant="caption" sx={{ color: '#0d9488', display: 'block', mt: 0.8, fontStyle: 'italic', fontSize: '0.72rem' }}>
                            📌 {alloc.instructions}
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    {/* Bottom Row: Time slot & Action Buttons */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1, borderTop: '1px solid #f1f5f9' }}>
                      <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Clock size={13} color="#1e40af" /> {alloc.scheduledTimeSlot}
                      </Typography>

                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAppId(alloc.applicationId);
                          }}
                          startIcon={<Eye size={13} />}
                          sx={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            py: 0.4,
                            px: 1.2,
                            borderRadius: '8px',
                            textTransform: 'none',
                            color: '#1e40af',
                            borderColor: '#bfdbfe',
                            backgroundColor: '#ffffff',
                            '&:hover': { backgroundColor: '#eff6ff' }
                          }}
                        >
                          View App
                        </Button>

                        <Button
                          size="small"
                          variant="contained"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartInspection(alloc);
                          }}
                          disabled={isCompleted}
                          sx={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            py: 0.4,
                            px: 1.5,
                            borderRadius: '8px',
                            textTransform: 'none',
                            backgroundColor: '#059669',
                            '&:hover': { backgroundColor: '#047857' }
                          }}
                        >
                          {isCompleted ? '✓ Verified' : 'Inspect →'}
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      {/* Generated Certificate Modal */}
      <DigitalCertificateModal
        open={certModalOpen}
        onClose={() => setCertModalOpen(false)}
        certificate={generatedCert}
      />
    </Box>
  );
};
