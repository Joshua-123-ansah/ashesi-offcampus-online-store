// src/pages/Payment.js
import React, { useState, useEffect, useCallback } from 'react';
import {
    Container,
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    TextField,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormControl,
    Alert,
    CircularProgress,
    Paper,
    Grid,
    IconButton,
    InputAdornment,
} from '@mui/material';
import {
    CreditCard,
    Phone,
    ArrowBack,
    Security,
    CheckCircle,
    Error,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api';

function Payment() {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Get order data from navigation state or localStorage
    const orderData = location.state?.orderData || JSON.parse(localStorage.getItem('currentOrder') || 'null');
    
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [phoneOption, setPhoneOption] = useState('registered'); // 'registered' or 'new'
    const [phoneNumber, setPhoneNumber] = useState('');
    const [registeredPhone, setRegisteredPhone] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [paymentReference, setPaymentReference] = useState('');
    const [verifyingPayment, setVerifyingPayment] = useState(false);

    // Fetch user profile on component mount
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await api.get('/api/profile/');
                setUserEmail(response.data.email);
                setRegisteredPhone(response.data.phone_number || '');
                setPhoneNumber(response.data.phone_number || '');
            } catch (error) {
                console.error('Error fetching user profile:', error);
                setError('Failed to load user profile');
            }
        };

        fetchUserProfile();
    }, []);

    const verifyPayment = useCallback(async (reference) => {
        setVerifyingPayment(true);
        setError('');

        try {
            const response = await api.post('/api/payments/verify/', {
                reference: reference
            });

            if (response.data.status === 'success') {
                setSuccess('Payment successful! Your order has been confirmed.');
                
                // Clear stored data
                localStorage.removeItem('paymentReference');
                localStorage.removeItem('currentOrder');
                localStorage.removeItem('cart');
                
                // Store order ID for tracking
                localStorage.setItem('lastOrderId', orderData.orderId);
                
                // Redirect to delivery status after a short delay
                setTimeout(() => {
                    navigate('/delivery-status');
                }, 2000);
            } else {
                setError(response.data.message || 'Payment verification failed');
            }
        } catch (error) {
            console.error('Payment verification error:', error);
            setError(
                error.response?.data?.message || 
                error.response?.data?.detail || 
                'Failed to verify payment. Please contact support.'
            );
        } finally {
            setVerifyingPayment(false);
        }
    }, [orderData?.orderId, navigate]);

    // Check for payment verification on component mount (in case user returns from Paystack)
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const reference = urlParams.get('reference');
        const status = urlParams.get('status');
        
        if (reference && status) {
            if (status === 'success') {
                verifyPayment(reference);
            } else {
                setError('Payment was cancelled or failed');
            }
        }
    }, [verifyPayment]);

    const validatePhoneNumber = (phone) => {
        // Basic validation for Ghanaian phone numbers
        const phoneRegex = /^(\+233|233|0)?[2-9]\d{8}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    };

    const formatPhoneNumber = (phone) => {
        // Format phone number to international format for Paystack
        let formatted = phone.replace(/\s/g, '');
        if (formatted.startsWith('0')) {
            formatted = '233' + formatted.substring(1);
        } else if (formatted.startsWith('+233')) {
            formatted = formatted.substring(1);
        } else if (!formatted.startsWith('233')) {
            formatted = '233' + formatted;
        }
        return formatted;
    };

    const handlePaymentMethodChange = (event) => {
        setPaymentMethod(event.target.value);
        setError('');
        
        if (event.target.value === 'momo' && !registeredPhone) {
            setPhoneOption('new');
        }
    };

    const handlePhoneOptionChange = (event) => {
        setPhoneOption(event.target.value);
        if (event.target.value === 'registered') {
            setPhoneNumber(registeredPhone);
        } else {
            setPhoneNumber('');
        }
        setError('');
    };

    const initiatePayment = async () => {
        if (!orderData) {
            setError('No order data found. Please try again.');
            return;
        }

        // Validate inputs
        if (paymentMethod === 'momo') {
            if (!phoneNumber) {
                setError('Phone number is required for mobile money payments');
                return;
            }
            if (!validatePhoneNumber(phoneNumber)) {
                setError('Please enter a valid Ghanaian phone number');
                return;
            }
        }

        setLoading(true);
        setError('');

        try {
            const paymentData = {
                order_id: orderData.orderId,
                payment_method: paymentMethod,
                email: userEmail,
                amount: orderData.totalAmount
            };

            // Add phone number for MoMo payments
            if (paymentMethod === 'momo') {
                paymentData.phone = formatPhoneNumber(phoneNumber);
            }
            // api.get('/api/foodItems/')
            const response = await api.post('/api/payments/initiate/', paymentData);
            
            if (response.data.payment_url) {
                // Save reference for later verification
                setPaymentReference(response.data.reference);
                localStorage.setItem('paymentReference', response.data.reference);
                
                // Redirect to Paystack payment page
                window.location.href = response.data.payment_url;
            } else {
                setError('Failed to initiate payment. Please try again.');
            }
        } catch (error) {
            console.error('Payment initiation error:', error);
            setError(
                error.response?.data?.message || 
                error.response?.data?.detail || 
                'Failed to initiate payment. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleRetryPayment = () => {
        setError('');
        setSuccess('');
        const storedReference = localStorage.getItem('paymentReference');
        if (storedReference) {
            verifyPayment(storedReference);
        }
    };

    if (verifyingPayment) {
        return (
            <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
                <Navbar />
                <Container maxWidth="md" sx={{ py: 6 }}>
                    <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
                        <CircularProgress size={60} sx={{ color: '#06C167', mb: 3 }} />
                        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                            Verifying Payment
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#718096' }}>
                            Please wait while we confirm your payment...
                        </Typography>
                    </Paper>
                </Container>
            </div>
        );
    }

    if (success) {
        return (
            <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
                <Navbar />
                <Container maxWidth="md" sx={{ py: 6 }}>
                    <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
                        <CheckCircle sx={{ fontSize: 80, color: '#06C167', mb: 3 }} />
                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: '#2d3748' }}>
                            Payment Successful!
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#718096', mb: 4 }}>
                            {success}
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={() => navigate('/delivery-status')}
                            sx={{
                                backgroundColor: '#06C167',
                                px: 4,
                                py: 1.5,
                                '&:hover': { backgroundColor: '#048A47' }
                            }}
                        >
                            Track Your Order
                        </Button>
                    </Paper>
                </Container>
            </div>
        );
    }

    if (!orderData) {
        return (
            <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
                <Navbar />
                <Container maxWidth="md" sx={{ py: 6 }}>
                    <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
                        <Error sx={{ fontSize: 80, color: '#e53e3e', mb: 3 }} />
                        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                            No Order Found
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#718096', mb: 4 }}>
                            Please place an order first before proceeding to payment.
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={() => navigate('/')}
                            sx={{
                                backgroundColor: '#06C167',
                                px: 4,
                                py: 1.5,
                                '&:hover': { backgroundColor: '#048A47' }
                            }}
                        >
                            Start Shopping
                        </Button>
                    </Paper>
                </Container>
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            <Navbar />

            {/* Header */}
            <Box
                sx={{
                    background: 'linear-gradient(135deg, #06C167 0%, #048A47 100%)',
                    color: 'white',
                    py: 4
                }}
            >
                <Container maxWidth="lg">
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <IconButton
                            onClick={() => navigate(-1)}
                            sx={{
                                mr: 3,
                                color: 'white',
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.3)' }
                            }}
                        >
                            <ArrowBack />
                        </IconButton>
                        <Box>
                            <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                                Complete Payment
                            </Typography>
                            <Typography variant="h6" sx={{ opacity: 0.9 }}>
                                Secure payment powered by Paystack
                            </Typography>
                        </Box>
                    </Box>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ py: 4, mt: -2, position: 'relative', zIndex: 2 }}>
                <Grid container spacing={4}>
                    {/* Payment Form */}
                    <Grid item xs={12} md={8}>
                        <Paper sx={{ p: 4, borderRadius: 3, backgroundColor: 'white' }}>
                            {error && (
                                <Alert 
                                    severity="error" 
                                    sx={{ mb: 3, borderRadius: 2 }}
                                    action={
                                        paymentReference && (
                                            <Button 
                                                color="inherit" 
                                                size="small" 
                                                onClick={handleRetryPayment}
                                            >
                                                Retry
                                            </Button>
                                        )
                                    }
                                >
                                    {error}
                                </Alert>
                            )}

                            {/* Payment Method Selection */}
                            <Box sx={{ mb: 4 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#2d3748' }}>
                                    Choose Payment Method
                                </Typography>

                                <FormControl component="fieldset" fullWidth>
                                    <RadioGroup
                                        value={paymentMethod}
                                        onChange={handlePaymentMethodChange}
                                        sx={{ gap: 2 }}
                                    >
                                        <Card
                                            sx={{
                                                border: paymentMethod === 'card' ? '2px solid #06C167' : '1px solid #e2e8f0',
                                                backgroundColor: paymentMethod === 'card' ? '#f0fff4' : 'white',
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => setPaymentMethod('card')}
                                        >
                                            <CardContent sx={{ py: 2 }}>
                                                <FormControlLabel
                                                    value="card"
                                                    control={<Radio sx={{ color: '#06C167' }} />}
                                                    label={
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            <CreditCard sx={{ mr: 2, color: '#06C167' }} />
                                                            <Box>
                                                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                                    Debit/Credit Card
                                                                </Typography>
                                                                <Typography variant="body2" sx={{ color: '#718096' }}>
                                                                    Pay securely with your Visa, Mastercard, or Verve card
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    }
                                                    sx={{ margin: 0, width: '100%' }}
                                                />
                                            </CardContent>
                                        </Card>

                                        <Card
                                            sx={{
                                                border: paymentMethod === 'momo' ? '2px solid #06C167' : '1px solid #e2e8f0',
                                                backgroundColor: paymentMethod === 'momo' ? '#f0fff4' : 'white',
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => setPaymentMethod('momo')}
                                        >
                                            <CardContent sx={{ py: 2 }}>
                                                <FormControlLabel
                                                    value="momo"
                                                    control={<Radio sx={{ color: '#06C167' }} />}
                                                    label={
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            <Phone sx={{ mr: 2, color: '#06C167' }} />
                                                            <Box>
                                                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                                    Mobile Money
                                                                </Typography>
                                                                <Typography variant="body2" sx={{ color: '#718096' }}>
                                                                    Pay with MTN Mobile Money, Vodafone Cash, or AirtelTigo Money
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    }
                                                    sx={{ margin: 0, width: '100%' }}
                                                />
                                            </CardContent>
                                        </Card>
                                    </RadioGroup>
                                </FormControl>
                            </Box>

                            {/* Mobile Money Phone Number Selection */}
                            {paymentMethod === 'momo' && (
                                <Box sx={{ mb: 4 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#2d3748' }}>
                                        Mobile Money Number
                                    </Typography>

                                    <FormControl component="fieldset" fullWidth sx={{ mb: 3 }}>
                                        <RadioGroup
                                            value={phoneOption}
                                            onChange={handlePhoneOptionChange}
                                            sx={{ gap: 1 }}
                                        >
                                            {registeredPhone && (
                                                <FormControlLabel
                                                    value="registered"
                                                    control={<Radio sx={{ color: '#06C167' }} />}
                                                    label={
                                                        <Box>
                                                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                                Use registered number
                                                            </Typography>
                                                            <Typography variant="body2" sx={{ color: '#718096' }}>
                                                                {registeredPhone}
                                                            </Typography>
                                                        </Box>
                                                    }
                                                />
                                            )}
                                            <FormControlLabel
                                                value="new"
                                                control={<Radio sx={{ color: '#06C167' }} />}
                                                label="Use different number"
                                            />
                                        </RadioGroup>
                                    </FormControl>

                                    {phoneOption === 'new' && (
                                        <TextField
                                            fullWidth
                                            label="Mobile Money Number"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            placeholder="e.g., 0241234567"
                                            slots={{
                                                startAdornment: () => (
                                                    <InputAdornment position="start">
                                                        <Phone sx={{ color: '#718096' }} />
                                                    </InputAdornment>
                                                ),
                                            }}
                                            helperText="Enter the mobile money number you want to pay with"
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 2,
                                                    backgroundColor: '#f8f9fa'
                                                }
                                            }}
                                        />
                                    )}
                                </Box>
                            )}

                            {/* Security Notice */}
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    p: 3,
                                    backgroundColor: '#f8f9fa',
                                    borderRadius: 2,
                                    mb: 4
                                }}
                            >
                                <Security sx={{ color: '#06C167', mr: 2 }} />
                                <Box>
                                    <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                                        Secure Payment
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#718096' }}>
                                        Your payment is secured by Paystack with 256-bit SSL encryption
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Pay Button */}
                            <Button
                                fullWidth
                                variant="contained"
                                size="large"
                                onClick={initiatePayment}
                                disabled={loading || (paymentMethod === 'momo' && !phoneNumber)}
                                sx={{
                                    backgroundColor: '#06C167',
                                    py: 2,
                                    fontSize: '1.1rem',
                                    fontWeight: 600,
                                    borderRadius: 2,
                                    '&:hover': { backgroundColor: '#048A47' }
                                }}
                            >
                                {loading ? (
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <CircularProgress size={20} sx={{ color: 'white', mr: 2 }} />
                                        Processing...
                                    </Box>
                                ) : (
                                    `Pay GH₵${orderData?.totalAmount?.toFixed(2) || '0.00'}`
                                )}
                            </Button>
                        </Paper>
                    </Grid>

                    {/* Order Summary */}
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 3, borderRadius: 3, backgroundColor: 'white', position: 'sticky', top: 100 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#2d3748' }}>
                                Order Summary
                            </Typography>

                            {orderData && (
                                <Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                        <Typography variant="body1">Order #{orderData.orderId}</Typography>
                                    </Box>
                                    
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography>Subtotal</Typography>
                                        <Typography>GH₵{orderData.subtotal?.toFixed(2) ?? '0.00'}</Typography>
                                    </Box>
                                    
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography>Delivery Fee</Typography>
                                        <Typography>GH₵{orderData.deliveryFee?.toFixed(2) ?? '0.00'}</Typography>
                                    </Box>
                                    
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, pt: 2, borderTop: '1px solid #e2e8f0' }}>
                                        <Typography variant="h6" sx={{ fontWeight: 600 }}>Total</Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#06C167' }}>
                                            GH₵{orderData.totalAmount.toFixed(2)}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ p: 2, backgroundColor: '#f0fff4', borderRadius: 2, border: '1px solid #06C167' }}>
                                        <Typography variant="body2" sx={{ color: '#2d3748', fontWeight: 600, mb: 1 }}>
                                            Payment Method
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#718096' }}>
                                            {paymentMethod === 'card' ? 'Debit/Credit Card' : 'Mobile Money'}
                                        </Typography>
                                        {paymentMethod === 'momo' && phoneNumber && (
                                            <Typography variant="body2" sx={{ color: '#718096', mt: 0.5 }}>
                                                {phoneNumber}
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>
                            )}
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </div>
    );
}

export default Payment;