import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  RadioGroup,
  Radio,
  FormControlLabel,
  TextField,
  Paper,
  Divider,
  Chip,
  CircularProgress,
  IconButton,
  Alert
} from '@mui/material';
import {
  ShieldCheck,
  CreditCard,
  Building2,
  Smartphone,
  Lock,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  ArrowRight,
  Receipt,
  Download,
  Printer,
  X,
  Clock,
  Sparkles
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface DemoPaymentGatewayModalProps {
  open: boolean;
  onClose: () => void;
  amount: number;
  applicationId?: string;
  instrumentType?: string;
  applicantName?: string;
  onPaymentSuccess: (paymentRef: string, details: {
    transactionId: string;
    bankRef: string;
    paymentMode: string;
    timestamp: string;
    amount: number;
  }) => void;
}

type PaymentMethod = 'UPI' | 'NET_BANKING' | 'CARD';
type PaymentState = 'FORM' | 'PROCESSING' | 'OTP_SIMULATION' | 'SUCCESS';

export const DemoPaymentGatewayModal: React.FC<DemoPaymentGatewayModalProps> = ({
  open,
  onClose,
  amount,
  applicationId = 'APP-TN-2026-TMP',
  instrumentType = 'Legal Metrology Instrument',
  applicantName = 'Sundar Industries Pvt Ltd',
  onPaymentSuccess
}) => {
  const [method, setMethod] = useState<PaymentMethod>('UPI');
  const [state, setState] = useState<PaymentState>('FORM');
  const [upiId, setUpiId] = useState('sundar.industries@upi');
  const [selectedBank, setSelectedBank] = useState('SBI');
  const [cardNumber, setCardNumber] = useState('4111 2222 3333 4444');
  const [cardHolder, setCardHolder] = useState(applicantName);
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('892');
  const [otpValue, setOtpValue] = useState('482910');
  const [processingMsg, setProcessingMsg] = useState('Connecting to RBI / BharatKosh Treasury Gateway...');
  const [txDetails, setTxDetails] = useState<{
    txId: string;
    bankRef: string;
    timestamp: string;
  } | null>(null);

  // Reset on open
  useEffect(() => {
    if (open) {
      setState('FORM');
      setTxDetails(null);
    }
  }, [open]);

  const handleStartPayment = () => {
    if (method === 'CARD' || method === 'NET_BANKING') {
      setState('OTP_SIMULATION');
    } else {
      processSimulation();
    }
  };

  const processSimulation = () => {
    setState('PROCESSING');
    setProcessingMsg('Connecting to BharatKosh (NTRP) & Treasury Gateway...');

    setTimeout(() => {
      setProcessingMsg('Debiting verified account & depositing to TN Metrology Treasury Account...');
    }, 1000);

    setTimeout(() => {
      setProcessingMsg('Generating Cryptographic Payment Receipt...');
    }, 1800);

    setTimeout(() => {
      const generatedTxId = `PAY-DOCA-2026-${Math.floor(100000 + Math.random() * 900000)}`;
      const generatedBankRef = `SBIN${Math.floor(1000000000 + Math.random() * 9000000000)}`;
      const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

      const details = {
        txId: generatedTxId,
        bankRef: generatedBankRef,
        timestamp: now
      };

      setTxDetails(details);
      setState('SUCCESS');

      onPaymentSuccess(generatedTxId, {
        transactionId: generatedTxId,
        bankRef: generatedBankRef,
        paymentMode: method,
        timestamp: now,
        amount
      });
    }, 2600);
  };

  const banks = [
    { code: 'SBI', name: 'State Bank of India (SBI)', popular: true },
    { code: 'IND', name: 'Indian Bank (Treasury Partner)', popular: true },
    { code: 'CAN', name: 'Canara Bank', popular: true },
    { code: 'HDFC', name: 'HDFC Bank', popular: true },
    { code: 'ICICI', name: 'ICICI Bank', popular: true },
    { code: 'TMB', name: 'Tamilnad Mercantile Bank', popular: false },
    { code: 'IOB', name: 'Indian Overseas Bank', popular: false }
  ];

  return (
    <Dialog
      open={open}
      onClose={state === 'PROCESSING' ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 24px 48px -12px rgba(15, 23, 42, 0.25)'
        }
      }}
    >
      {/* Gateway Brand Header */}
      <Box
        sx={{
          backgroundColor: '#0f172a',
          color: '#ffffff',
          p: 2.5,
          position: 'relative',
          borderBottom: '1px solid #334155'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              component="img"
              src="/logo.png"
              alt="Govt Logo"
              sx={{ width: 36, height: 36, objectFit: 'contain' }}
            />
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#f8fafc', fontSize: '1rem', letterSpacing: '-0.3px' }}>
                  BharatKosh (NTRP) &amp; e-Treasury
                </Typography>
                <Chip
                  label="SIMULATED DEMO GATEWAY"
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: '0.62rem',
                    fontWeight: 800,
                    backgroundColor: '#10b98120',
                    color: '#34d399',
                    border: '1px solid #10b98140'
                  }}
                />
              </Box>
              <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <span>Govt of India · Non-Tax Receipt Portal</span>
                <span>•</span>
                <span style={{ color: '#38bdf8', display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Lock size={11} /> 256-Bit SSL Bank Grade
                </span>
              </Typography>
            </Box>
          </Box>

          {state !== 'PROCESSING' && (
            <IconButton onClick={onClose} size="small" sx={{ color: '#94a3b8', '&:hover': { color: '#ffffff' } }}>
              <X size={18} />
            </IconButton>
          )}
        </Box>

        {/* Amount Bar */}
        <Box
          sx={{
            mt: 2,
            p: 1.5,
            backgroundColor: '#1e293b',
            borderRadius: '10px',
            border: '1px solid #334155',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Box>
            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, display: 'block' }}>
              PAYMENT PURPOSE &amp; REF
            </Typography>
            <Typography variant="body2" sx={{ color: '#f1f5f9', fontWeight: 700, fontSize: '0.85rem' }}>
              Statutory Stamping Fee · {instrumentType}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, display: 'block' }}>
              TOTAL PAYABLE
            </Typography>
            <Typography variant="h6" sx={{ color: '#38bdf8', fontWeight: 900, fontFamily: '"Outfit", sans-serif' }}>
              ₹{amount.toLocaleString('en-IN')}.00
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Gateway Content Body */}
      <DialogContent sx={{ p: 3, backgroundColor: '#ffffff' }}>
        {state === 'FORM' && (
          <Box>
            {/* Method Tabs */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1.5, mb: 3 }}>
              <Paper
                elevation={0}
                onClick={() => setMethod('UPI')}
                sx={{
                  p: 1.8,
                  borderRadius: '10px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  border: method === 'UPI' ? '2px solid #2563eb' : '1px solid #e2e8f0',
                  backgroundColor: method === 'UPI' ? '#eff6ff' : '#f8fafc',
                  transition: 'all 0.15s ease'
                }}
              >
                <Smartphone size={22} color={method === 'UPI' ? '#2563eb' : '#64748b'} style={{ margin: '0 auto 6px' }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.82rem', color: method === 'UPI' ? '#1e40af' : '#475569' }}>
                  UPI / QR Code
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.68rem', display: 'block' }}>
                  GPay, PhonePe, BHIM
                </Typography>
              </Paper>

              <Paper
                elevation={0}
                onClick={() => setMethod('NET_BANKING')}
                sx={{
                  p: 1.8,
                  borderRadius: '10px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  border: method === 'NET_BANKING' ? '2px solid #2563eb' : '1px solid #e2e8f0',
                  backgroundColor: method === 'NET_BANKING' ? '#eff6ff' : '#f8fafc',
                  transition: 'all 0.15s ease'
                }}
              >
                <Building2 size={22} color={method === 'NET_BANKING' ? '#2563eb' : '#64748b'} style={{ margin: '0 auto 6px' }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.82rem', color: method === 'NET_BANKING' ? '#1e40af' : '#475569' }}>
                  Net Banking
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.68rem', display: 'block' }}>
                  SBI, Treasury Banks
                </Typography>
              </Paper>

              <Paper
                elevation={0}
                onClick={() => setMethod('CARD')}
                sx={{
                  p: 1.8,
                  borderRadius: '10px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  border: method === 'CARD' ? '2px solid #2563eb' : '1px solid #e2e8f0',
                  backgroundColor: method === 'CARD' ? '#eff6ff' : '#f8fafc',
                  transition: 'all 0.15s ease'
                }}
              >
                <CreditCard size={22} color={method === 'CARD' ? '#2563eb' : '#64748b'} style={{ margin: '0 auto 6px' }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.82rem', color: method === 'CARD' ? '#1e40af' : '#475569' }}>
                  Debit / Card
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.68rem', display: 'block' }}>
                  Visa, RuPay, Master
                </Typography>
              </Paper>
            </Box>

            {/* Method Form Details */}
            {method === 'UPI' && (
              <Box>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2.5,
                    borderRadius: '12px',
                    backgroundColor: '#fafafa',
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: 'center',
                    gap: 3,
                    mb: 2.5
                  }}
                >
                  <Box sx={{ p: 1.5, backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'center' }}>
                    <QRCodeSVG
                      value={`upi://pay?pa=bharatkosh.tn.doca@sbi&pn=TN%20Legal%20Metrology&am=${amount}&cu=INR&tn=VerificationFee`}
                      size={130}
                      level="M"
                    />
                  </Box>

                  <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' } }}>
                    <Chip
                      label="Scan with any UPI App"
                      size="small"
                      sx={{ backgroundColor: '#ecfdf5', color: '#047857', fontWeight: 800, fontSize: '0.72rem', mb: 1 }}
                    />
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                      Scan QR code via Google Pay, PhonePe, Paytm or BHIM
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.5 }}>
                      Merchant: Department of Legal Metrology, Govt of Tamil Nadu
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#0284c7', fontWeight: 700, display: 'block', mt: 0.5 }}>
                      UPI ID: bharatkosh.tn.doca@sbi
                    </Typography>
                  </Box>
                </Paper>

                <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', mb: 1, display: 'block' }}>
                  OR ENTER UPI ID:
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. yourname@oksbi"
                  InputProps={{
                    startAdornment: <Smartphone size={16} color="#94a3b8" style={{ marginRight: 8 }} />
                  }}
                  sx={{ mb: 2 }}
                />

                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleStartPayment}
                  sx={{
                    py: 1.4,
                    backgroundColor: '#16a34a',
                    fontWeight: 800,
                    fontSize: '0.92rem',
                    textTransform: 'none',
                    borderRadius: '10px',
                    boxShadow: '0 4px 14px rgba(22, 163, 74, 0.3)',
                    '&:hover': { backgroundColor: '#15803d' }
                  }}
                >
                  Simulate UPI Instant Payment (₹{amount})
                </Button>
              </Box>
            )}

            {method === 'NET_BANKING' && (
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', mb: 1, display: 'block' }}>
                  SELECT AUTHORIZED TREASURY SETTLEMENT BANK:
                </Typography>
                <RadioGroup value={selectedBank} onChange={(e) => setSelectedBank(e.target.value)}>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1, mb: 2 }}>
                    {banks.map((b) => (
                      <Paper
                        key={b.code}
                        variant="outlined"
                        onClick={() => setSelectedBank(b.code)}
                        sx={{
                          p: 1.2,
                          px: 1.5,
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          border: selectedBank === b.code ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                          backgroundColor: selectedBank === b.code ? '#eff6ff' : '#ffffff'
                        }}
                      >
                        <FormControlLabel
                          value={b.code}
                          control={<Radio size="small" />}
                          label={
                            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.82rem', color: '#1e293b' }}>
                              {b.name}
                            </Typography>
                          }
                          sx={{ m: 0, width: '100%' }}
                        />
                      </Paper>
                    ))}
                  </Box>
                </RadioGroup>

                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleStartPayment}
                  sx={{
                    py: 1.4,
                    backgroundColor: '#16a34a',
                    fontWeight: 800,
                    fontSize: '0.92rem',
                    textTransform: 'none',
                    borderRadius: '10px',
                    boxShadow: '0 4px 14px rgba(22, 163, 74, 0.3)',
                    '&:hover': { backgroundColor: '#15803d' }
                  }}
                >
                  Proceed to Net Banking Login &amp; OTP (₹{amount})
                </Button>
              </Box>
            )}

            {method === 'CARD' && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569' }}>
                    ENTER CARD DETAILS:
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => {
                      setCardNumber('4111 2222 3333 4444');
                      setCardHolder(applicantName);
                      setCardExpiry('12/28');
                      setCardCvv('892');
                    }}
                    sx={{ textTransform: 'none', fontSize: '0.72rem', fontWeight: 700 }}
                  >
                    ⚡ Autofill Demo Card
                  </Button>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.8, mb: 2.5 }}>
                  <TextField
                    label="Card Number"
                    size="small"
                    fullWidth
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                  />
                  <TextField
                    label="Cardholder Name"
                    size="small"
                    fullWidth
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                  />
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                      label="Expiry (MM/YY)"
                      size="small"
                      sx={{ flex: 1 }}
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                    />
                    <TextField
                      label="CVV"
                      size="small"
                      type="password"
                      sx={{ width: 100 }}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                    />
                  </Box>
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleStartPayment}
                  sx={{
                    py: 1.4,
                    backgroundColor: '#16a34a',
                    fontWeight: 800,
                    fontSize: '0.92rem',
                    textTransform: 'none',
                    borderRadius: '10px',
                    boxShadow: '0 4px 14px rgba(22, 163, 74, 0.3)',
                    '&:hover': { backgroundColor: '#15803d' }
                  }}
                >
                  Pay ₹{amount} via Secure Card Gateway
                </Button>
              </Box>
            )}
          </Box>
        )}

        {/* OTP Simulation Screen */}
        {state === 'OTP_SIMULATION' && (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}
            >
              <Lock size={30} />
            </Box>

            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5 }}>
              Bank 3D-Secure 2.0 OTP Authentication
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
              A simulated one-time passcode has been generated for your transaction of <strong>₹{amount}.00</strong>.
            </Typography>

            <Paper variant="outlined" sx={{ p: 2.5, maxWidth: 360, margin: '0 auto 24px', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, display: 'block', mb: 1 }}>
                SIMULATED SECURE OTP (PRE-FILLED)
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={otpValue}
                onChange={(e) => setOtpValue(e.target.value)}
                sx={{
                  '& .MuiInputBase-input': {
                    textAlign: 'center',
                    fontSize: '1.4rem',
                    letterSpacing: '8px',
                    fontWeight: 800,
                    fontFamily: 'monospace'
                  }
                }}
              />
              <Typography variant="caption" sx={{ color: '#059669', fontWeight: 700, mt: 1, display: 'block' }}>
                ✓ Authorized demo merchant: Govt of Tamil Nadu Metrology Dept
              </Typography>
            </Paper>

            <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center' }}>
              <Button
                variant="outlined"
                onClick={() => setState('FORM')}
                sx={{ fontWeight: 700, textTransform: 'none', borderRadius: '8px', px: 3 }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={processSimulation}
                sx={{
                  backgroundColor: '#16a34a',
                  fontWeight: 800,
                  textTransform: 'none',
                  borderRadius: '8px',
                  px: 4,
                  '&:hover': { backgroundColor: '#15803d' }
                }}
              >
                Submit OTP &amp; Authorize Payment
              </Button>
            </Box>
          </Box>
        )}

        {/* Live Processing Simulation */}
        {state === 'PROCESSING' && (
          <Box sx={{ textAlign: 'center', py: 5 }}>
            <CircularProgress size={54} thickness={4} sx={{ color: '#2563eb', mb: 3 }} />
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>
              Processing Government Treasury Payment...
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', maxWidth: 420, margin: '0 auto' }}>
              {processingMsg}
            </Typography>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
              <Lock size={14} color="#64748b" />
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                Please do not refresh or close this window
              </Typography>
            </Box>
          </Box>
        )}

        {/* Payment Success State */}
        {state === 'SUCCESS' && txDetails && (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                backgroundColor: '#ecfdf5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                border: '2px solid #a7f3d0'
              }}
            >
              <CheckCircle2 size={36} />
            </Box>

            <Typography variant="h5" sx={{ fontWeight: 800, color: '#065f46', mb: 0.5, fontFamily: '"Outfit", sans-serif' }}>
              Payment Successful &amp; Treasury Confirmed!
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
              Statutory Fee of <strong>₹{amount}.00</strong> has been settled to the Department of Legal Metrology.
            </Typography>

            {/* Official e-Challan Receipt Summary */}
            <Paper
              variant="outlined"
              sx={{
                p: 2.5,
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                textAlign: 'left',
                mb: 3,
                border: '1px solid #cbd5e1'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, pb: 1, borderBottom: '1px solid #e2e8f0' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Receipt size={18} color="#1e40af" />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e40af' }}>
                    Government e-Receipt / Challan Summary
                  </Typography>
                </Box>
                <Chip label="PAID" size="small" sx={{ backgroundColor: '#dcfce7', color: '#166534', fontWeight: 800, fontSize: '0.7rem' }} />
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>TRANSACTION ID</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#0f172a', fontFamily: 'monospace' }}>
                    {txDetails.txId}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>BANK REFERENCE NO</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>
                    {txDetails.bankRef}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>TREASURY HEAD OF ACCOUNT</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                    0435-00-102-01 (TN Metrology)
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>PAYMENT DATE &amp; TIME</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>
                    {txDetails.timestamp}
                  </Typography>
                </Box>
              </Box>
            </Paper>

            <Button
              fullWidth
              variant="contained"
              onClick={onClose}
              sx={{
                py: 1.4,
                backgroundColor: '#2563eb',
                fontWeight: 800,
                fontSize: '0.92rem',
                textTransform: 'none',
                borderRadius: '10px',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
                '&:hover': { backgroundColor: '#1d4ed8' }
              }}
            >
              Continue to Application Details →
            </Button>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};
