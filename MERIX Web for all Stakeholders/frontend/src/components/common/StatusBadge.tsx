import React from 'react';
import { Chip } from '@mui/material';
import { useLanguage } from '../../contexts/LanguageContext';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const { t } = useLanguage();
  const normalized = status.toUpperCase().replace(/\s+/g, '_');
  const labelText = t(normalized, status.replace(/_/g, ' '));

  switch (normalized) {
    case 'CERTIFICATE_GENERATED':
    case 'VERIFIED':
    case 'PASSED':
    case 'VALID':
      return (
        <Chip
          label={labelText}
          size="small"
          sx={{
            backgroundColor: '#dcfce7',
            color: '#15803d',
            border: '1px solid #bbf7d0',
            fontWeight: 700,
            fontSize: '0.72rem',
            borderRadius: '6px'
          }}
        />
      );

    case 'SUBMITTED':
    case 'REGISTERED':
      return (
        <Chip
          label={labelText}
          size="small"
          sx={{
            backgroundColor: '#dbeafe',
            color: '#1d4ed8',
            border: '1px solid #bfdbfe',
            fontWeight: 700,
            fontSize: '0.72rem',
            borderRadius: '6px'
          }}
        />
      );

    case 'IN_SCRUTINY':
    case 'EXPIRING_SOON':
    case 'EXPIRING_LE_90_DAYS':
      return (
        <Chip
          label={labelText}
          size="small"
          sx={{
            backgroundColor: '#fef3c7',
            color: '#b45309',
            border: '1px solid #fde68a',
            fontWeight: 700,
            fontSize: '0.72rem',
            borderRadius: '6px'
          }}
        />
      );

    case 'SCHEDULED':
    case 'ALLOCATED':
    case 'IN_VERIFICATION':
    case 'UNDER_INVESTIGATION':
      return (
        <Chip
          label={labelText}
          size="small"
          sx={{
            backgroundColor: '#e0e7ff',
            color: '#4338ca',
            border: '1px solid #c7d2fe',
            fontWeight: 700,
            fontSize: '0.72rem',
            borderRadius: '6px'
          }}
        />
      );

    case 'EXPIRED':
    case 'REJECTED':
    case 'FAILED':
    case 'FLAGGED':
      return (
        <Chip
          label={labelText}
          size="small"
          sx={{
            backgroundColor: '#fee2e2',
            color: '#b91c1c',
            border: '1px solid #fecaca',
            fontWeight: 700,
            fontSize: '0.72rem',
            borderRadius: '6px'
          }}
        />
      );

    default:
      return (
        <Chip
          label={labelText}
          size="small"
          sx={{
            backgroundColor: '#f1f5f9',
            color: '#475569',
            fontWeight: 600,
            fontSize: '0.72rem'
          }}
        />
      );
  }
};
