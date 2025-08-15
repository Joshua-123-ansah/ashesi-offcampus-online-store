// src/components/PaymentVerification.js
import React, { useEffect, useState } from 'react';
import {
    Container,
    Box,
    Typography,
    CircularProgress,
    Paper,
    Button,
    Alert
} from '@mui/material';
import { CheckCircle, Error } from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from './Navbar';
import api from '../api';

function PaymentVerification() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'failed'
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verifyPayment = async () => {
            const reference = searchParams.get('reference');
            const trxref = searchParams.get('trxref');
            
            if (!reference && !trxref) {
                setStatus('failed');
                setMessage('No payment reference found. Please contact support if you believe this is an error.');
                return;
            }

            try {
                setStatus('verifying');
                const response = await api.post('/api/payments/verify/', {
                    reference: reference || trxref
                });

                if (response.data.status === 'success') {
                    setStatus('success');
                    setMessage('Payment successful! Your order has been confirmed and is being prepared.');
                    
                    // Clear payment data
                    localStorage.removeItem('paymentReference');
                    localStorage.removeItem('currentOrder');
                    localStorage.removeItem('cart');
                    
                    // Store order ID for tracking
                    const orderData = JSON.parse(localStorage.getItem('currentOrder') || '{}');
                    if (orderData.orderId) {
                        localStorage.setItem('lastOrderId', orderData.orderId);
                    }
                    
                    // Redirect to delivery status after delay
                    setTimeout(() => {
                        navigate('/delivery-status');
                    }, 3000);
                } else {
                    setStatus('failed');
                    setMessage(response.data.message || 'Payment verification failed. Please contact support.');
                }
            } catch (error) {
                setStatus('failed');
                setMessage(
                    error.response?.data?.message || 
                    error.response?.data?.detail || 
                    'Failed to verify payment. Please contact support with your payment reference.'
                );
            }
        };

        verifyPayment();
    }, [searchParams, navigate]);

    return (
        <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            <Navbar />
            <Container maxWidth="md" sx={{ py: 6 }}>
                <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
                    {status === 'verifying' && (
                        <>
                            <CircularProgress size={60} sx={{ color: '#06C167', mb: 3 }} />
                            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                                Verifying Payment
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#718096' }}>
                                Please wait while we confirm your payment...
                            </Typography>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <CheckCircle sx={{ fontSize: 80, color: '#06C167', mb: 3 }} />
                            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: '#2d3748' }}>
                                Payment Successful!
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#718096', mb: 4 }}>
                                {message}
                            </Typography>
                            <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                                You will be redirected to track your order shortly...
                            </Alert>
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
                        </>
                    )}

                    {status === 'failed' && (
                        <>
                            <Error sx={{ fontSize: 80, color: '#e53e3e', mb: 3 }} />
                            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: '#2d3748' }}>
                                Payment Failed
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#718096', mb: 4 }}>
                                {message}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                                <Button
                                    variant="contained"
                                    onClick={() => navigate('/payment')}
                                    sx={{
                                        backgroundColor: '#06C167',
                                        px: 4,
                                        py: 1.5,
                                        '&:hover': { backgroundColor: '#048A47' }
                                    }}
                                >
                                    Try Again
                                </Button>
                                <Button
                                    variant="outlined"
                                    onClick={() => navigate('/')}
                                    sx={{
                                        borderColor: '#e2e8f0',
                                        color: '#718096',
                                        px: 4,
                                        py: 1.5,
                                        '&:hover': {
                                            borderColor: '#cbd5e0',
                                            backgroundColor: '#f8f9fa'
                                        }
                                    }}
                                >
                                    Back to Home
                                </Button>
                            </Box>
                        </>
                    )}
                </Paper>
            </Container>
        </div>
    );
}

export default PaymentVerification;