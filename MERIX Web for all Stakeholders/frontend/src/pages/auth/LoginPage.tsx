import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Chip,
  Radio,
  RadioGroup,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  Checkbox,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Key,
  CreditCard,
  Building2,
  Scale,
  FlaskConical,
  ShieldCheck,
  Mail,
  Lock,
  CheckCircle2,
  User,
  ChevronRight,
  Shield
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';
import { ApiService } from '../../services/api';

interface LoginPageProps {
  onLoginSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { loginAsRole, loginWithEmail } = useAuth();
  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('signin');

  // Sign In Tab State
  const [selectedRole, setSelectedRole] = useState<UserRole>('BUSINESS_OWNER');
  const [email, setEmail] = useState('sundar.industries@merix.tn.gov');
  const [password, setPassword] = useState('DemoOwner123!');
  const [rememberStation, setRememberStation] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotAlert, setForgotAlert] = useState(false);

  // Register Tab State
  const [regFullName, setRegFullName] = useState('S. Sundararaman');
  const [regBusinessName, setRegBusinessName] = useState('Sundar Industries Pvt Ltd');
  const [regEmail, setRegEmail] = useState('sundar.industries@merix.tn.gov');
  const [regMobile, setRegMobile] = useState('+91 98401 23456');
  const [kycType, setKycType] = useState<'GSTIN' | 'AADHAAR'>('GSTIN');
  const [kycValue, setKycValue] = useState('33ABCDE1234F1Z5');
  const [kycVerified, setKycVerified] = useState(false);
  const [kycVerifying, setKycVerifying] = useState(false);
  const [district, setDistrict] = useState('Chennai');
  const [accountRole, setAccountRole] = useState('Commercial Trader / Equipment User');
  const [regSuccess, setRegSuccess] = useState(false);

  // Role metadata mapping
  const roleOptions: {
    role: UserRole;
    label: string;
    icon: React.ElementType;
    email: string;
    pass: string;
    buttonLabel: string;
  }[] = [
    {
      role: 'BUSINESS_OWNER',
      label: 'Business Owner',
      icon: Building2,
      email: 'sundar.industries@merix.tn.gov',
      pass: 'DemoOwner123!',
      buttonLabel: 'Enter OWNER Portal'
    },
    {
      role: 'ADMIN',
      label: 'Controller / Admin',
      icon: Shield,
      email: 'admin.doca@merix.gov.in',
      pass: 'DemoAdmin123!',
      buttonLabel: 'Enter ADMIN Portal'
    },
    {
      role: 'LMO_OFFICER',
      label: 'Legal Metrology Officer',
      icon: Scale,
      email: 'officer.murugan@merix.gov.in',
      pass: 'DemoLMO123!',
      buttonLabel: 'Enter LMO Portal'
    },
    {
      role: 'GATC_CENTER',
      label: 'GATC Laboratory',
      icon: FlaskConical,
      email: 'gatc.chennai@merix.gov.in',
      pass: 'DemoGATC123!',
      buttonLabel: 'Enter GATC Portal'
    }
  ];

  const handleRoleSelect = (opt: typeof roleOptions[0]) => {
    setSelectedRole(opt.role);
    setEmail(opt.email);
    setPassword(opt.pass);
    setError(null);
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your registered email address');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }
    setError(null);
    setLoading(true);

    setTimeout(() => {
      const match = roleOptions.find(r => r.role === selectedRole);
      if (match && email.toLowerCase() === match.email.toLowerCase()) {
        // Validate demo password
        if (password !== match.pass) {
          setError(`Incorrect password. For this demo role, use: ${match.pass}`);
          setLoading(false);
          return;
        }
        loginAsRole(match.role);
      } else {
        // For custom email, accept any password (demo mode)
        loginWithEmail(email);
      }
      setLoading(false);
      if (onLoginSuccess) onLoginSuccess();
    }, 300);
  };



  const handleVerifyKyc = () => {
    if (!kycValue) return;
    setKycVerifying(true);
    setTimeout(() => {
      setKycVerifying(false);
      setKycVerified(true);
    }, 600);
  };

  const handleCompleteRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regFullName || !regBusinessName || !regEmail) {
      setError('Please fill in all mandatory applicant details');
      return;
    }
    setLoading(true);

    // Register user in system
    const newUser = {
      id: `USR-${Math.floor(100 + Math.random() * 900)}`,
      email: regEmail,
      fullName: regFullName,
      businessName: regBusinessName,
      phoneNumber: regMobile,
      district: district,
      role: 'BUSINESS_OWNER' as UserRole
    };

    ApiService.setCurrentUser(newUser);

    setTimeout(() => {
      setLoading(false);
      setRegSuccess(true);
      loginAsRole('BUSINESS_OWNER');
      if (onLoginSuccess) onLoginSuccess();
    }, 400);
  };

  const handleCitizenAccess = () => {
    loginAsRole('CITIZEN');
    if (onLoginSuccess) onLoginSuccess();
  };

  const currentRoleOpt = roleOptions.find(r => r.role === selectedRole) || roleOptions[0];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#f1f5f9',
        backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(37, 99, 235, 0.08), transparent 70%), radial-gradient(ellipse at 80% 90%, rgba(16, 185, 129, 0.06), transparent 60%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 2, sm: 3, md: 4 }
      }}
    >
      {/* Top Main Branding - Centered */}
      <Box sx={{ textAlign: 'center', mb: 3.5, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box
          component="img"
          src="/logo.png"
          alt="Merix Official Logo"
          sx={{
            width: 80,
            height: 80,
            objectFit: 'contain',
            borderRadius: '50%',
            boxShadow: '0 4px 20px rgba(37, 99, 235, 0.25)',
            border: '2.5px solid #ffffff',
            mb: 1.2
          }}
        />
        <Typography
          variant="h4"
          sx={{
            fontWeight: 900,
            color: '#0f172a',
            fontFamily: '"Outfit", sans-serif',
            letterSpacing: '-0.5px',
            lineHeight: 1.2
          }}
        >
          Merix
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600, mt: 0.4, fontSize: '0.86rem' }}>
          Legal Metrology Online Verification System • Department of Consumer Affairs
        </Typography>
      </Box>

      {/* Center Main Login Card */}
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 820,
          borderRadius: '16px',
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 25px rgba(15, 23, 42, 0.06)',
          overflow: 'hidden'
        }}
      >
        {/* Top Tabs */}
        <Box
          sx={{
            display: 'flex',
            borderBottom: '1px solid #e2e8f0',
            backgroundColor: '#ffffff'
          }}
        >
          {/* Tab 1: Sign In with Credentials */}
          <Box
            onClick={() => setActiveTab('signin')}
            sx={{
              flex: 1,
              py: 2,
              px: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1.2,
              cursor: 'pointer',
              borderBottom: activeTab === 'signin' ? '2.5px solid #2563eb' : '2.5px solid transparent',
              color: activeTab === 'signin' ? '#2563eb' : '#64748b',
              fontWeight: activeTab === 'signin' ? 800 : 600,
              fontSize: '0.92rem',
              backgroundColor: activeTab === 'signin' ? '#ffffff' : '#f8fafc',
              transition: 'all 0.2s ease',
              '&:hover': {
                color: '#2563eb'
              }
            }}
          >
            <Key size={18} />
            <span>Sign In with Credentials</span>
          </Box>

          {/* Tab 2: Register New Business */}
          <Box
            onClick={() => setActiveTab('register')}
            sx={{
              flex: 1,
              py: 2,
              px: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1.2,
              cursor: 'pointer',
              borderBottom: activeTab === 'register' ? '2.5px solid #2563eb' : '2.5px solid transparent',
              color: activeTab === 'register' ? '#2563eb' : '#64748b',
              fontWeight: activeTab === 'register' ? 800 : 600,
              fontSize: '0.92rem',
              backgroundColor: activeTab === 'register' ? '#ffffff' : '#f8fafc',
              transition: 'all 0.2s ease',
              '&:hover': {
                color: '#2563eb'
              }
            }}
          >
            <CreditCard size={18} />
            <span>Register New Business (Aadhaar/GSTIN KYC)</span>
          </Box>
        </Box>

        {/* Tab 1 Content: Sign In with Credentials */}
        {activeTab === 'signin' && (
          <Box component="form" onSubmit={handleSignIn} sx={{ p: { xs: 2.5, sm: 4, md: 5 } }}>
            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }}>
                {error}
              </Alert>
            )}

            {forgotAlert && (
              <Alert severity="info" sx={{ mb: 3, borderRadius: '10px' }} onClose={() => setForgotAlert(false)}>
                Temporary password reset link has been dispatched to your registered email & mobile OTP.
              </Alert>
            )}

            {/* Select Target Portal / Role */}
            <Box sx={{ mb: 3.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155', mb: 1.2, fontSize: '0.85rem' }}>
                Select Target Portal / Role
              </Typography>
              <Grid container spacing={1.5}>
                {roleOptions.map((opt) => {
                  const isSelected = selectedRole === opt.role;
                  const IconComp = opt.icon;
                  return (
                    <Grid item xs={6} sm={3} key={opt.role}>
                      <Box
                        onClick={() => handleRoleSelect(opt)}
                        sx={{
                          py: 1.1,
                          px: 1.5,
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          cursor: 'pointer',
                          backgroundColor: isSelected ? '#2563eb' : '#ffffff',
                          color: isSelected ? '#ffffff' : '#475569',
                          border: isSelected ? '1px solid #2563eb' : '1px solid #e2e8f0',
                          boxShadow: isSelected ? '0 4px 12px rgba(37, 99, 235, 0.25)' : 'none',
                          transition: 'all 0.15s ease',
                          '&:hover': {
                            backgroundColor: isSelected ? '#1d4ed8' : '#f8fafc',
                            borderColor: isSelected ? '#1d4ed8' : '#cbd5e1'
                          }
                        }}
                      >
                        <IconComp size={16} style={{ flexShrink: 0 }} />
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: isSelected ? 800 : 600,
                            fontSize: '0.82rem',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {opt.label}
                        </Typography>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>

            {/* Registered Email / Username */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155', mb: 1, fontSize: '0.85rem' }}>
                Registered Email / Username
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. sundar.industries@merix.tn.gov"
                InputProps={{
                  startAdornment: <Mail size={17} color="#94a3b8" style={{ marginRight: 10, flexShrink: 0 }} />
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                    backgroundColor: '#f8fafc',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    '& fieldset': { borderColor: '#e2e8f0' },
                    '&:hover fieldset': { borderColor: '#cbd5e1' },
                    '&.Mui-focused fieldset': { borderColor: '#2563eb' }
                  }
                }}
              />
            </Box>

            {/* Security Password */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155', fontSize: '0.85rem' }}>
                  Security Password
                </Typography>
                <Typography
                  variant="caption"
                  onClick={() => setForgotAlert(true)}
                  sx={{
                    color: '#2563eb',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    '&:hover': { textDecoration: 'underline' }
                  }}
                >
                  Forgot password?
                </Typography>
              </Box>
              <TextField
                fullWidth
                size="small"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••"
                InputProps={{
                  startAdornment: <Lock size={17} color="#94a3b8" style={{ marginRight: 10, flexShrink: 0 }} />
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                    backgroundColor: '#f8fafc',
                    fontSize: '0.9rem',
                    letterSpacing: '2px',
                    '& fieldset': { borderColor: '#e2e8f0' },
                    '&:hover fieldset': { borderColor: '#cbd5e1' },
                    '&.Mui-focused fieldset': { borderColor: '#2563eb' }
                  }
                }}
              />
            </Box>

            {/* Remember & TLS Row */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberStation}
                    onChange={(e) => setRememberStation(e.target.checked)}
                    size="small"
                    sx={{ color: '#94a3b8', '&.Mui-checked': { color: '#2563eb' } }}
                  />
                }
                label={
                  <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600, fontSize: '0.8rem' }}>
                    Remember this station
                  </Typography>
                }
              />
              <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Lock size={13} /> 256-bit TLS
              </Typography>
            </Box>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <CheckCircle2 size={18} />}
              sx={{
                py: 1.4,
                backgroundColor: '#2563eb',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '0.95rem',
                textTransform: 'none',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
                '&:hover': {
                  backgroundColor: '#1d4ed8'
                }
              }}
            >
              {loading ? 'Authenticating...' : currentRoleOpt.buttonLabel}
            </Button>
          </Box>
        )}

        {/* Tab 2 Content: Register New Business (Aadhaar/GSTIN KYC) */}
        {activeTab === 'register' && (
          <Box component="form" onSubmit={handleCompleteRegistration} sx={{ p: { xs: 2.5, sm: 4, md: 5 } }}>
            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }}>
                {error}
              </Alert>
            )}

            {regSuccess && (
              <Alert severity="success" sx={{ mb: 3, borderRadius: '10px' }}>
                KYC Registration verified and completed successfully! Redirecting to Business Dashboard...
              </Alert>
            )}

            <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
              {/* Row 1 */}
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155', mb: 0.8, fontSize: '0.82rem' }}>
                  Applicant Full Name *
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="e.g. S. Venkatesh"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                      backgroundColor: '#f8fafc',
                      fontSize: '0.88rem'
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155', mb: 0.8, fontSize: '0.82rem' }}>
                  Business / Trade Name *
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={regBusinessName}
                  onChange={(e) => setRegBusinessName(e.target.value)}
                  placeholder="e.g. Sundar Industries Pvt Ltd"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                      backgroundColor: '#f8fafc',
                      fontSize: '0.88rem'
                    }
                  }}
                />
              </Grid>

              {/* Row 2 */}
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155', mb: 0.8, fontSize: '0.82rem' }}>
                  Email Address *
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="sundar.industries@merix.tn.gov"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                      backgroundColor: '#f8fafc',
                      fontSize: '0.88rem'
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155', mb: 0.8, fontSize: '0.82rem' }}>
                  Mobile Number (for SMS Alerts) *
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={regMobile}
                  onChange={(e) => setRegMobile(e.target.value)}
                  placeholder="+91 98401 23456"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                      backgroundColor: '#f8fafc',
                      fontSize: '0.88rem'
                    }
                  }}
                />
              </Grid>
            </Grid>

            {/* Row 3: Statutory KYC Verification (Aadhaar / GSTIN) */}
            <Paper
              elevation={0}
              sx={{
                p: 2.2,
                borderRadius: '12px',
                border: '1px solid #e0f2fe',
                backgroundColor: '#f8fafc',
                mb: 2.5
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ShieldCheck size={18} color="#2563eb" />
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.85rem' }}>
                    Statutory KYC Verification (Aadhaar / GSTIN)
                  </Typography>
                </Box>
                <RadioGroup
                  row
                  value={kycType}
                  onChange={(e) => setKycType(e.target.value as 'GSTIN' | 'AADHAAR')}
                >
                  <FormControlLabel
                    value="GSTIN"
                    control={<Radio size="small" sx={{ color: '#2563eb', '&.Mui-checked': { color: '#2563eb' } }} />}
                    label={<Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', fontSize: '0.78rem' }}>GSTIN</Typography>}
                  />
                  <FormControlLabel
                    value="AADHAAR"
                    control={<Radio size="small" sx={{ color: '#2563eb', '&.Mui-checked': { color: '#2563eb' } }} />}
                    label={<Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', fontSize: '0.78rem' }}>Aadhaar UIDAI</Typography>}
                  />
                </RadioGroup>
              </Box>

              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <TextField
                  fullWidth
                  size="small"
                  value={kycValue}
                  onChange={(e) => {
                    setKycValue(e.target.value);
                    setKycVerified(false);
                  }}
                  placeholder={kycType === 'GSTIN' ? '33ABCDE1234F1Z5' : 'XXXX-XXXX-8921'}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                      backgroundColor: '#ffffff',
                      fontSize: '0.88rem',
                      fontFamily: 'monospace',
                      fontWeight: 700
                    }
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleVerifyKyc}
                  disabled={kycVerifying || kycVerified}
                  sx={{
                    px: 3,
                    backgroundColor: kycVerified ? '#047857' : '#059669',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    whiteSpace: 'nowrap',
                    '&:hover': { backgroundColor: '#047857' }
                  }}
                >
                  {kycVerifying ? 'Verifying...' : kycVerified ? '✓ Verified' : 'Verify KYC'}
                </Button>
              </Box>

              <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 1, fontSize: '0.72rem' }}>
                Mandatory under Rule 11 of the Legal Metrology Rules for verified trader registration.
              </Typography>
            </Paper>

            {/* Row 4: District Jurisdiction & Account Role */}
            <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155', mb: 0.8, fontSize: '0.82rem' }}>
                  District Jurisdiction
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    sx={{
                      borderRadius: '10px',
                      backgroundColor: '#f8fafc',
                      fontSize: '0.88rem',
                      fontWeight: 600
                    }}
                  >
                    <MenuItem value="Chennai">Chennai</MenuItem>
                    <MenuItem value="Coimbatore">Coimbatore</MenuItem>
                    <MenuItem value="Madurai">Madurai</MenuItem>
                    <MenuItem value="Tiruchirappalli">Tiruchirappalli</MenuItem>
                    <MenuItem value="Salem">Salem</MenuItem>
                    <MenuItem value="Tiruppur">Tiruppur</MenuItem>
                    <MenuItem value="Erode">Erode</MenuItem>
                    <MenuItem value="Vellore">Vellore</MenuItem>
                    <MenuItem value="Thoothukudi">Thoothukudi</MenuItem>
                    <MenuItem value="Tirunelveli">Tirunelveli</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155', mb: 0.8, fontSize: '0.82rem' }}>
                  Account Role
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={accountRole}
                    onChange={(e) => setAccountRole(e.target.value)}
                    sx={{
                      borderRadius: '10px',
                      backgroundColor: '#f8fafc',
                      fontSize: '0.88rem',
                      fontWeight: 600
                    }}
                  >
                    <MenuItem value="Commercial Trader / Equipment User">Commercial Trader / Equipment User</MenuItem>
                    <MenuItem value="Manufacturer / Importer">Manufacturer / Importer</MenuItem>
                    <MenuItem value="Authorized Repairer / Dealer">Authorized Repairer / Dealer</MenuItem>
                    <MenuItem value="Packer / Warehouse Facility">Packer / Warehouse Facility</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Complete Registration Button */}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <CheckCircle2 size={18} />}
              sx={{
                py: 1.4,
                backgroundColor: '#2563eb',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '0.95rem',
                textTransform: 'none',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
                '&:hover': {
                  backgroundColor: '#1d4ed8'
                }
              }}
            >
              {loading ? 'Creating Account & Authenticating...' : 'Complete KYC Registration & Sign In'}
            </Button>
          </Box>
        )}
      </Paper>

      {/* Bottom Citizen / Consumer Card Banner */}
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 820,
          mt: 2.5,
          p: 2,
          px: 3,
          borderRadius: '14px',
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.8 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: '10px',
              backgroundColor: '#f1f5f9',
              color: '#334155',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <User size={20} />
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.88rem' }}>
              Are you a Citizen / Consumer?
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.76rem', display: 'block' }}>
              Verify stamp validity, check OpenStreetMap verified scales, or file short-weight complaints without logging in.
            </Typography>
          </Box>
        </Box>

        <Button
          variant="outlined"
          onClick={handleCitizenAccess}
          endIcon={<ChevronRight size={16} />}
          sx={{
            py: 1,
            px: 2.5,
            borderRadius: '10px',
            borderColor: '#e2e8f0',
            backgroundColor: '#f8fafc',
            color: '#1e293b',
            fontWeight: 700,
            fontSize: '0.82rem',
            whiteSpace: 'nowrap',
            textTransform: 'none',
            '&:hover': {
              borderColor: '#cbd5e1',
              backgroundColor: '#f1f5f9'
            }
          }}
        >
          Citizen Public Services
        </Button>
      </Paper>

      {/* Official Government Footer */}
      <Box
        component="footer"
        sx={{
          width: '100%',
          maxWidth: 820,
          mt: 4,
          pt: 2.5,
          pb: 2,
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 1.5,
          color: '#64748b'
        }}
      >
        <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
          <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600, display: 'block', fontSize: '0.75rem' }}>
            &copy; 2026 Department of Consumer Affairs, Government of India. All rights reserved.
          </Typography>
          <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.7rem' }}>
            Legal Metrology (Enforcement) Rules &amp; Act, 2009 Statutory Portal
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography
            variant="caption"
            sx={{
              color: '#64748b',
              fontWeight: 600,
              fontSize: '0.75rem',
              cursor: 'pointer',
              '&:hover': { color: '#2563eb' }
            }}
            onClick={() => alert('Privacy Policy: All verification, trader registration and certificate records are encrypted and protected under the Digital Personal Data Protection Act.')}
          >
            Privacy Policy
          </Typography>
          <Typography variant="caption" sx={{ color: '#cbd5e1' }}>&bull;</Typography>
          <Typography
            variant="caption"
            sx={{
              color: '#64748b',
              fontWeight: 600,
              fontSize: '0.75rem',
              cursor: 'pointer',
              '&:hover': { color: '#2563eb' }
            }}
            onClick={() => alert('Terms of Service: Authorized for use by registered weighing and measuring instrument users, accredited laboratories, and Legal Metrology Officers.')}
          >
            Terms of Use
          </Typography>
          <Typography variant="caption" sx={{ color: '#cbd5e1' }}>&bull;</Typography>
          <Typography
            variant="caption"
            sx={{
              color: '#64748b',
              fontWeight: 600,
              fontSize: '0.75rem',
              cursor: 'pointer',
              '&:hover': { color: '#2563eb' }
            }}
            onClick={() => alert('National Consumer Helpline: 1915 | Support Email: helpdesk@merix.gov.in')}
          >
            National Helpdesk (1915)
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};
