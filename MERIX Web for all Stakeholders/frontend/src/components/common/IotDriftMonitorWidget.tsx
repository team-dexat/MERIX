import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  LinearProgress,
  IconButton
} from '@mui/material';
import { Activity, Zap, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

export const IotDriftMonitorWidget: React.FC = () => {
  const [reading, setReading] = useState(100.01);
  const [driftError, setDriftError] = useState(0.01);
  const [driftStatus, setDriftStatus] = useState<'NORMAL' | 'WARNING' | 'CRITICAL'>('NORMAL');

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate live fluctuating telemetry
      const delta = (Math.random() - 0.48) * 0.008;
      setReading((prev) => {
        const next = Math.max(99.92, Math.min(100.08, prev + delta));
        const err = Math.abs(next - 100.0);
        setDriftError(Number(err.toFixed(3)));
        if (err > 0.05) setDriftStatus('CRITICAL');
        else if (err > 0.03) setDriftStatus('WARNING');
        else setDriftStatus('NORMAL');
        return Number(next.toFixed(3));
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: '14px',
        backgroundColor: '#0f172a',
        color: '#f8fafc',
        border: '1px solid #1e293b',
        boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
        mb: 2.5
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Activity size={18} color="#38bdf8" />
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#38bdf8', fontSize: '0.85rem' }}>
            IoT Continuous Calibration Drift Telemetry
          </Typography>
        </Box>
        <Chip
          label={driftStatus === 'NORMAL' ? 'LIVE SENSOR: OK' : 'DRIFT DETECTED'}
          size="small"
          sx={{
            height: 20,
            fontSize: '0.65rem',
            fontWeight: 800,
            backgroundColor: driftStatus === 'NORMAL' ? '#065f46' : '#991b1b',
            color: driftStatus === 'NORMAL' ? '#6ee7b7' : '#fecaca'
          }}
        />
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mt: 1 }}>
        <Box>
          <Typography variant="caption" sx={{ color: '#94a3b8' }}>
            Simulated Sensor: Fuel Pump Nozzle #04 (60 L/min Flow Meter)
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#ffffff', fontFamily: 'monospace', mt: 0.3 }}>
            {reading.toFixed(3)} L
          </Typography>
        </Box>

        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="caption" sx={{ color: '#94a3b8' }}>
            Current Deviation (MPE &plusmn;0.050 L):
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 800,
              fontFamily: 'monospace',
              color: driftStatus === 'NORMAL' ? '#34d399' : '#f87171'
            }}
          >
            {driftError > 0 ? `+${driftError.toFixed(3)}` : driftError.toFixed(3)} L
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};
