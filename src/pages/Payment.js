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
    
    // Get cart data from navigation state or localStorage
    const cart = location.state?.cart || JSON.parse(localStorage.getItem('cart') || 'null');
    
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
    
    // Calculate order details from cart
    const [orderDetails, setOrderDetails] = useState(null);
    const [initializingOrder, setInitializingOrder] = useState(true);

    // Calculate order details on component mount
    useEffect(() => {
        const calculateOrderDetails = async () => {
            setInitializingOrder(true);
            if (!cart || Object.keys(cart).length === 0) {
                setInitializingOrder(false);
                return;
            }
            
            try {
                // Fetch food items for price lookup
                const foodRes = await api.get('/api/foodItems/');
                const foodMap = {};
                foodRes.data.forEach(item => { foodMap[item.id] = item; });
                
                // Prepare itemsPayload
                const itemsPayload = Object.entries(cart).map(([foodId, qty]) => ({
                    food_item: Number(foodId),
                    quantity: qty
                }));
                
                const subtotal = itemsPayload.reduce((sum, item) => {
                    const food = foodMap[item.food_item];
                    return sum + (food ? food.price * item.quantity : 0);
                }, 0);
                
                const deliveryFee = subtotal > 150 ? 0 : 5;
                const totalAmount = subtotal + deliveryFee;
                
                setOrderDetails({
                    itemsPayload,
                    subtotal,
                    deliveryFee,
                    totalAmount
                });
            } catch (err) {
                setError('Failed to calculate order details. Please try again.');
            } finally {
                setInitializingOrder(false);
            }
        };
        
        calculateOrderDetails();
    }, [cart]);

    // Fetch user profile on component mount
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await api.get('/api/profile/');
                setUserEmail(response.data.email);
                setRegisteredPhone(response.data.phone_number || '');
                setPhoneNumber(response.data.phone_number || '');
            } catch (error) {
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
                // Payment successful - update the temporary order status
                const tempOrderId = localStorage.getItem('tempOrderId');
                
                if (tempOrderId) {
                    try {
                        // Update the temporary order to confirmed status
                        await api.patch(`/api/orders/${tempOrderId}/`, {
                            status: 'RECEIVED'
                        });
                        
                        setSuccess('Payment successful! Your order has been confirmed.');
                        
                        // Clear stored data
                        localStorage.removeItem('paymentReference');
                        localStorage.removeItem('tempOrderId');
                        localStorage.removeItem('cart');
                        
                        // Store order ID for tracking
                        localStorage.setItem('lastOrderId', tempOrderId);
                        
                        // Redirect to delivery status after a short delay
                        setTimeout(() => {
                            navigate('/delivery-status');
                        }, 2000);
                    } catch (orderError) {
                        setError('Payment successful but order update failed. Please contact support.');
                    }
                } else {
                    setError('Order ID not found. Please contact support.');
                }
            } else {
                // Payment failed - delete the temporary order
                const tempOrderId = localStorage.getItem('tempOrderId');
                if (tempOrderId) {
                    try {
                        await api.delete(`/api/orders/${tempOrderId}/`);
                    } catch (deleteError) {
                        // ignore
                    }
                    localStorage.removeItem('tempOrderId');
                }
                
                setError(response.data.message || 'Payment verification failed');
            }
        } catch (error) {
            // Payment verification failed - delete the temporary order
            const tempOrderId = localStorage.getItem('tempOrderId');
            if (tempOrderId) {
                try {
                    await api.delete(`/api/orders/${tempOrderId}/`);
                } catch (deleteError) {
                    // ignore
                }
                localStorage.removeItem('tempOrderId');
            }
            
            setError(
                error.response?.data?.message || 
                error.response?.data?.detail || 
                'Failed to verify payment. Please contact support.'
            );
        } finally {
            setVerifyingPayment(false);
        }
    }, [navigate]);

    // Check for payment verification on component mount (in case user returns from Paystack)
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const reference = urlParams.get('reference');
        const status = urlParams.get('status');
        const storedReference = localStorage.getItem('paymentReference');
        
        if (reference && status && storedReference && storedReference === reference) {
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
        if (!orderDetails) {
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
            // Create a temporary order first to get an order_id for payment
            const tempOrderRes = await api.post('/api/orders/', { 
                items: orderDetails.itemsPayload,
                status: 'PENDING_PAYMENT'
            });
            
            const tempOrderId = tempOrderRes.data.id;
            
            const paymentData = {
                order_id: tempOrderId,
                payment_method: paymentMethod,
                email: userEmail,
                amount: orderDetails.totalAmount
            };

            // Add phone number for MoMo payments
            if (paymentMethod === 'momo') {
                paymentData.phone = formatPhoneNumber(phoneNumber);
            }

            const response = await api.post('/api/payments/initiate/', paymentData);
            
            if (response.data.payment_url) {
                // Save reference and temp order ID for later verification
                setPaymentReference(response.data.reference);
                localStorage.setItem('paymentReference', response.data.reference);
                localStorage.setItem('tempOrderId', tempOrderId);
                
                // Redirect to Paystack payment page
                window.location.href = response.data.payment_url;
            } else {
                setError('Failed to initiate payment. Please try again.');
            }
        } catch (error) {
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

    if (!orderDetails) {
        if (initializingOrder) {
            return (
                <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
                    <Navbar />
                    <Container maxWidth="md" sx={{ py: 6, textAlign: 'center' }}>
                        <CircularProgress />
                    </Container>
                </div>
            );
        }
        return (
            <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
                <Navbar />
                <Container maxWidth="md" sx={{ py: 6 }}>
                    <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
                        <Error sx={{ fontSize: 80, color: '#e53e3e', mb: 3 }} />
                        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                            No Cart Items Found
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#718096', mb: 4 }}>
                            Please add items to your cart before proceeding to payment.
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={() => navigate('/shop/cassa')}
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
                        <Paper sx={{ p: 3, borderRadius: 3, backgroundColor: 'white' }}>
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
                                    `Pay GH₵${orderDetails?.totalAmount?.toFixed(2) || '0.00'}`
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

                            {orderDetails && (
                                <Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                        <Typography variant="body2" sx={{ color: '#718096', fontStyle: 'italic' }}>
                                            Order will be created after payment
                                        </Typography>
                                    </Box>
                                    
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography>Subtotal</Typography>
                                        <Typography>GH₵{orderDetails.subtotal?.toFixed(2) ?? '0.00'}</Typography>
                                    </Box>
                                    
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography>Delivery Fee</Typography>
                                        <Typography>GH₵{orderDetails.deliveryFee?.toFixed(2) ?? '0.00'}</Typography>
                                    </Box>
                                    
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, pt: 2, borderTop: '1px solid #e2e8f0' }}>
                                        <Typography variant="h6" sx={{ fontWeight: 600 }}>Total</Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#06C167' }}>
                                            GH₵{orderDetails.totalAmount.toFixed(2)}
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