import React from 'react';
import {
  Box, Typography, Paper, Grid, Divider, Button, Chip
} from '@mui/material';
import {
  BookOpen, Scale, FileText, ExternalLink, ShieldCheck, AlertTriangle, Globe
} from 'lucide-react';

export const UserManualPage: React.FC = () => {
  const sections = [
    {
      title: 'Getting Started',
      icon: <BookOpen size={20} color="#1e40af" />,
      items: [
        { q: 'How do I register a new instrument?', a: 'Go to Dashboard → My Instruments → click "Register New Instrument". Fill in instrument specs, upload a nameplate photo (OCR auto-fills fields), and set GPS location. Submit for registry.' },
        { q: 'What is a verification application?', a: 'It is a formal request to have your measuring/weighing instrument tested by a Legal Metrology Officer (LMO) or Government Approved Test Centre (GATC) under the Legal Metrology Act, 2009.' },
        { q: 'How do I pay verification fees?', a: 'After selecting your instrument in the application form, the fee is auto-calculated from the Rule Engine. Pay via BharatKosh / UPI / Net Banking on the payment step.' }
      ]
    },
    {
      title: 'Instruments & Verification',
      icon: <Scale size={20} color="#1e40af" />,
      items: [
        { q: 'Which instruments need Legal Metrology verification?', a: 'All instruments used in trade/commerce: weighing scales, petrol/diesel dispensers, water meters, gas meters, clinical thermometers (for trade), sphygmomanometers (hospitals), and more under Schedule I of the LM Act.' },
        { q: 'How often must instruments be re-verified?', a: 'Depends on instrument type. Weighing instruments: typically every 12–24 months. Fuel dispensers: annually. Meters: 12–36 months. Exact intervals are configured in the Rule Engine.' },
        { q: 'What is the Maximum Permissible Error (MPE)?', a: 'MPE is the maximum allowed measurement deviation for an instrument class under OIML R76 / LM General Rules 2011. The system auto-calculates pass/fail by comparing observed readings to MPE limits during inspection.' }
      ]
    },
    {
      title: 'Certificates & QR Codes',
      icon: <ShieldCheck size={20} color="#1e40af" />,
      items: [
        { q: 'How do I verify a certificate\'s authenticity?', a: 'Scan the QR code on the physical stamp or enter the certificate number on the Public Verification page. The system recomputes a SHA-256 hash of the certificate data and flags any tampering.' },
        { q: 'Can I download my certificate as a PDF?', a: 'Yes. Go to Certificates → click your certificate → "Download PDF". The PDF includes the digital certificate, QR code, and officer signature.' },
        { q: 'What does "Expiring Soon" mean?', a: 'The certificate will expire within 30 days. Submit a re-verification application immediately to avoid operating an non-compliant instrument.' }
      ]
    },
    {
      title: 'Citizen & Complaint',
      icon: <AlertTriangle size={20} color="#1e40af" />,
      items: [
        { q: 'How do I report a tampered instrument?', a: 'Use the "Report Issue" feature (no login required for public). Select the complaint type (Short Weight, Broken Seal, etc.), describe the issue, and optionally attach a photo. LMO officers receive the complaint immediately.' },
        { q: 'What happens after I file a complaint?', a: 'The LMO reviews the complaint and initiates a surprise inspection or enforcement action (Notice, Seizure, or Compounding under Sections 24–30 of the LM Act). You can track status on the complaints page.' }
      ]
    },
    {
      title: 'Legal Framework',
      icon: <FileText size={20} color="#1e40af" />,
      items: [
        { q: 'What law governs this system?', a: 'Legal Metrology Act, 2009 (Act No. 1 of 2010) and the Legal Metrology (General) Rules, 2011 issued under it. GATC operations are additionally governed by the Legal Metrology (Approval of Models) Rules, 2011.' },
        { q: 'What are the penalties for non-compliance?', a: 'Section 25: Using an unverified instrument — up to ₹25,000 first offence. Section 26: Tampering with stamp — up to ₹50,000. Section 27: Short weight/measure — up to ₹10,000. Repeat offences may attract imprisonment.' }
      ]
    }
  ];

  const quickLinks = [
    { label: 'Legal Metrology Act, 2009', url: 'https://legalmetrology.gov.in' },
    { label: 'General Rules, 2011', url: 'https://legalmetrology.gov.in' },
    { label: 'OIML R 76 — Non-Automatic Weighing', url: 'https://www.oiml.org' },
    { label: 'BharatKosh Payment Portal', url: 'https://bharatkosh.gov.in' },
    { label: 'Central LMPC Portal', url: 'https://lmpcportal.gov.in' }
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3.5 }, maxWidth: 900, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
        <BookOpen size={28} color="#1e40af" />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', fontFamily: '"Outfit", sans-serif' }}>
            User Manual & Help Centre
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            Merix Legal Metrology Online Verification System — User Guide v1.0
          </Typography>
        </Box>
      </Box>

      {/* Quick Links */}
      <Paper elevation={0} sx={{ p: 2.5, mb: 3, borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <Globe size={16} color="#1e40af" />
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>
            Official Government References
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {quickLinks.map(link => (
            <Chip
              key={link.label}
              label={link.label}
              icon={<ExternalLink size={12} />}
              component="a"
              href={link.url}
              target="_blank"
              clickable
              size="small"
              sx={{
                fontSize: '0.75rem', fontWeight: 600,
                backgroundColor: '#eff6ff', color: '#1e40af',
                border: '1px solid #bfdbfe',
                '&:hover': { backgroundColor: '#dbeafe' }
              }}
            />
          ))}
        </Box>
      </Paper>

      {/* FAQ Sections */}
      {sections.map(section => (
        <Paper key={section.title} elevation={0} sx={{ mb: 2.5, borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <Box sx={{ p: 2, backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {section.icon}
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
              {section.title}
            </Typography>
          </Box>
          <Box sx={{ p: 2 }}>
            {section.items.map((item, idx) => (
              <Box key={idx}>
                <Box sx={{ py: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a', mb: 0.5 }}>
                    Q: {item.q}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.7, pl: 1 }}>
                    A: {item.a}
                  </Typography>
                </Box>
                {idx < section.items.length - 1 && <Divider />}
              </Box>
            ))}
          </Box>
        </Paper>
      ))}

      {/* Contact Support */}
      <Paper elevation={0} sx={{ p: 2.5, borderRadius: '14px', border: '1px solid #d1fae5', backgroundColor: '#ecfdf5', mt: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#065f46', mb: 1 }}>
          Still need help?
        </Typography>
        <Typography variant="body2" sx={{ color: '#047857', mb: 1.5 }}>
          Contact the Legal Metrology Department helpdesk (Mon–Sat, 9am–5pm IST):
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Chip label="📞 1800-123-4567 (Toll Free)" sx={{ backgroundColor: '#a7f3d0', color: '#065f46', fontWeight: 700 }} />
          <Chip label="📧 helpdesk@merix.tn.gov.in" sx={{ backgroundColor: '#a7f3d0', color: '#065f46', fontWeight: 700 }} />
          <Chip label="📍 DMS Complex, Teynampet, Chennai 600006" sx={{ backgroundColor: '#a7f3d0', color: '#065f46', fontWeight: 700 }} />
        </Box>
      </Paper>
    </Box>
  );
};
