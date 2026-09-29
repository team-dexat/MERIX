import React from 'react';
import { Card, CardContent, Box, Typography } from '@mui/material';
import { ChevronRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  accentColor: string; // e.g. '#2563eb', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'
  onClick?: () => void;
  badgeText?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  accentColor,
  onClick,
  badgeText
}) => {
  const { t } = useLanguage();

  return (
    <Card
      onClick={onClick}
      className="stat-card-hover"
      sx={{
        height: '100%',
        minHeight: '84px',
        cursor: onClick ? 'pointer' : 'default',
        borderRadius: '10px',
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3.5px',
          backgroundColor: accentColor
        }
      }}
    >
      <CardContent sx={{ p: '14px 16px', '&:last-child': { pb: '14px' }, width: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0, flex: 1 }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                minWidth: 38,
                minHeight: 38,
                borderRadius: '8px',
                backgroundColor: `${accentColor}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: accentColor
              }}
            >
              <Icon size={19} strokeWidth={2.2} style={{ width: 19, height: 19 }} />
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  color: '#0f172a',
                  lineHeight: 1.15,
                  fontSize: '1.35rem',
                  fontFamily: '"Outfit", sans-serif'
                }}
              >
                {value}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: '#64748b',
                  fontWeight: 600,
                  fontSize: '0.72rem',
                  mt: 0.2,
                  textTransform: 'uppercase',
                  letterSpacing: '0.3px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {t(title, title)}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', color: '#94a3b8', flexShrink: 0 }}>
            {badgeText && (
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: accentColor,
                  mr: 0.5,
                  fontSize: '0.7rem'
                }}
              >
                {t(badgeText, badgeText)}
              </Typography>
            )}
            <ChevronRight size={16} style={{ width: 16, height: 16 }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

