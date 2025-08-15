// src/pages/DeliveryStatus.js
import React, { useEffect, useState, useCallback } from 'react';
import {
    Container,
    Box,
    Typography,
    Stepper,
    Step,
    StepLabel,
    Button,
    Paper,
    Card,
    CardContent,
    Grid,
    Chip,
    LinearProgress,
    IconButton,
    CircularProgress
} from '@mui/material';
import {
    Receipt,
    Restaurant,
    LocalShipping,
    CheckCircle,
    Phone,
    Home as HomeIcon,
    AccessTime,
    ArrowBack,
    Refresh
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api';
import Loader from '../components/Loader';

// Add CSS animation
const fadeInAnimation = `
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;

// Inject the CSS
const style = document.createElement('style');
style.textContent = fadeInAnimation;
document.head.appendChild(style);

const steps = [
    {
        label: 'Order Received',
        icon: <Receipt />,
        description: 'We have received your order'
    },
    {
        label: 'Preparing',
        icon: <Restaurant />,
        description: 'Your food is being prepared'
    },
    {
        label: 'Out for Delivery',
        icon: <LocalShipping />,
        description: 'Your order is on the way'
    },
    {
        label: 'Delivered',
        icon: <CheckCircle />,
        description: 'Order delivered successfully'
    }
];

const statusMap = {
    RECEIVED: 0,
    PREPARING: 1,
    OUT_FOR_DELIVERY: 2,
    DELIVERED: 3
};

const getStatusColor = (step, activeStep) => {
    if (step < activeStep) return '#06C167';
    if (step === activeStep) return '#06C167';
    return '#e2e8f0';
};

const getStatusMessage = (activeStep) => {
    switch (activeStep) {
        case 0:
            return 'Your order has been received and is being processed.';
        case 1:
            return 'Our chefs are preparing your delicious meal.';
        case 2:
            return 'Your order is on its way to you!';
        case 3:
            return 'Your order has been delivered. Enjoy your meal!';
        default:
            return 'Processing your order...';
    }
};

function DeliveryStatus() {
    const navigate = useNavigate();
    const [orderId, setOrderId] = useState(null);
    const [orderStatus, setOrderStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [estimatedTime, setEstimatedTime] = useState('20-30');

    const activeStepIndex = statusMap[orderStatus?.status] ?? 0;

    const fetchLatestOrder = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            const res = await api.get('/api/orders/');
            
            if (res.data && Array.isArray(res.data) && res.data.length > 0) {
                const sortedOrders = res.data.sort((a, b) => {
                    const dateA = new Date(a.created_at || a.createdAt || 0);
                    const dateB = new Date(b.created_at || b.createdAt || 0);
                    return dateB - dateA;
                });
                
                let activeOrder = null;
                let mostRecentDeliveredOrder = null;
                
                for (const order of sortedOrders) {
                    if (order.status !== 'DELIVERED') {
                        activeOrder = order;
                        break;
                    } else if (!mostRecentDeliveredOrder) {
                        mostRecentDeliveredOrder = order;
                    }
                }
                
                if (activeOrder) {
                    setOrderId(activeOrder.id);
                    setOrderStatus(null);
                } else if (mostRecentDeliveredOrder) {
                    setOrderId(mostRecentDeliveredOrder.id);
                    setOrderStatus(null);
                } else {
                    setOrderId(null);
                    setOrderStatus(null);
                }
                // Clear loading after successful processing
                setLoading(false);
            } else {
                setError('You don\'t have any orders yet. Start shopping to place your first order!');
                setLoading(false);
            }
        } catch (err) {
            if (err.response?.status === 401) {
                setError('Please log in to view your orders.');
            } else if (err.response?.status === 403) {
                setError('You don\'t have permission to view orders.');
            } else {
                setError('Failed to fetch orders. Please try again later.');
            }
            setLoading(false);
        }
    }, []);

    const handleRefresh = async () => {
        setOrderId(null);
        setOrderStatus(null);
        await fetchLatestOrder();
    };

    useEffect(() => {
        fetchLatestOrder();
    }, [fetchLatestOrder]);

    useEffect(() => {
        const interval = setInterval(() => {
            fetchLatestOrder();
        }, 30000);

        return () => clearInterval(interval);
    }, [fetchLatestOrder]);

    useEffect(() => {
        if (orderId && orderStatus?.status && orderStatus.status !== 'DELIVERED') {
            const frequentInterval = setInterval(() => {
                fetchLatestOrder();
            }, 15000);

            return () => clearInterval(frequentInterval);
        }
    }, [orderId, orderStatus?.status, fetchLatestOrder]);

    useEffect(() => {
        if (!orderId) {
            const frequentInterval = setInterval(() => {
                fetchLatestOrder();
            }, 10000);

            return () => clearInterval(frequentInterval);
        }
    }, [orderId, fetchLatestOrder]);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                fetchLatestOrder();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [fetchLatestOrder]);

    useEffect(() => {
        if (!orderId) return;
        
        const fetchOrderStatus = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/api/orders/${orderId}/status/`);
                setOrderStatus(res.data);
                
                const status = res.data.status;
                switch (status) {
                    case 'RECEIVED':
                        setEstimatedTime('25-35');
                        break;
                    case 'PREPARING':
                        setEstimatedTime('15-25');
                        break;
                    case 'OUT_FOR_DELIVERY':
                        setEstimatedTime('5-10');
                        break;
                    case 'DELIVERED':
                        setEstimatedTime('0');
                        break;
                    default:
                        setEstimatedTime('20-30');
                }
            } catch (err) {
                if (err.response?.status === 404) {
                    setError('Order not found. It may have been cancelled or removed.');
                } else if (err.response?.status === 401) {
                    setError('Please log in to view order details.');
                } else {
                    setError('Failed to fetch order status. Please try again later.');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchOrderStatus();
    }, [orderId]);

    // Only show the global loader when we have no order data yet
    if (loading && !orderId && !orderStatus) {
        return (
            <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
                <Navbar/>
                <Container sx={{ mt: 4 }}>
                    <Loader message="Loading order status..." />
                </Container>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
                <Navbar/>
                <Container maxWidth="md" sx={{ py: 6 }}>
                    <Paper
                        sx={{
                            p: 6,
                            borderRadius: 3,
                            backgroundColor: 'white',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                            textAlign: 'center'
                        }}
                    >
                        <HomeIcon sx={{ fontSize: 80, color: '#e2e8f0', mb: 3 }} />
                        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: '#2d3748' }}>
                            {error.includes('don\'t have any orders') ? 'No Orders Found' : 'Unable to Load Orders'}
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#718096', mb: 4 }}>
                            {error}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
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
                                Browse Menu
                            </Button>
                            {error.includes('log in') && (
                                <Button
                                    variant="outlined"
                                    onClick={() => navigate('/login')}
                                    sx={{
                                        borderColor: '#06C167',
                                        color: '#06C167',
                                        px: 4,
                                        py: 1.5,
                                        '&:hover': { 
                                            borderColor: '#048A47',
                                            backgroundColor: '#f0fff4'
                                        }
                                    }}
                                >
                                    Sign In
                                </Button>
                            )}
                        </Box>
                    </Paper>
                </Container>
            </div>
        );
    }

    if (!orderId) {
        return (
            <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
                <Navbar/>
                <Container maxWidth="md" sx={{ py: 6 }}>
                    <Paper
                        sx={{
                            p: 6,
                            borderRadius: 3,
                            backgroundColor: 'white',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                            textAlign: 'center'
                        }}
                    >
                        <CheckCircle sx={{ fontSize: 80, color: '#06C167', mb: 3 }} />
                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: '#2d3748' }}>
                            No Active Orders
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#718096', mb: 4 }}>
                            You don't have any active orders to track. Ready to place a new order?
                        </Typography>
                        
                        <Typography variant="caption" sx={{ color: '#a0aec0', display: 'block', mb: 4 }}>
                            🔄 Automatically checking for new orders every 10 seconds
                        </Typography>
                        
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Button
                                variant="contained"
                                onClick={() => navigate('/shop/cassa')}
                                sx={{
                                    backgroundColor: '#06C167',
                                    px: 4,
                                    py: 1.5,
                                    fontSize: '1.1rem',
                                    fontWeight: 600,
                                    '&:hover': { backgroundColor: '#048A47' }
                                }}
                            >
                                Start New Order
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={handleRefresh}
                                disabled={loading}
                                startIcon={loading ? <CircularProgress size={16} /> : <Refresh />}
                                sx={{
                                    borderColor: '#06C167',
                                    color: '#06C167',
                                    px: 4,
                                    py: 1.5,
                                    fontSize: '1.1rem',
                                    fontWeight: 600,
                                    '&:hover': { 
                                        borderColor: '#048A47',
                                        backgroundColor: 'rgba(6, 193, 103, 0.1)'
                                    }
                                }}
                            >
                                {loading ? 'Checking...' : 'Check for Orders'}
                            </Button>
                        </Box>
                    </Paper>
                </Container>
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            <Navbar/>

            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                    <IconButton
                        onClick={() => navigate('/')}
                        sx={{
                            mr: 2,
                            color: '#2d3748',
                            backgroundColor: 'white',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                            '&:hover': { backgroundColor: '#f8f9fa' }
                        }}
                    >
                        <ArrowBack />
                    </IconButton>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#2d3748' }}>
                            Track Your Order
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#718096' }}>
                            Order #{orderId}
                        </Typography>
                    </Box>
                    <IconButton
                        onClick={handleRefresh}
                        sx={{
                            ml: 2,
                            color: '#2d3748',
                            backgroundColor: 'white',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                            '&:hover': { backgroundColor: '#f8f9fa' }
                        }}
                        disabled={loading}
                        title="Check for new orders"
                    >
                        {loading ? <CircularProgress size={24} color="primary" /> : <Refresh />}
                    </IconButton>
                </Box>

                <Grid container spacing={4}>
                    <Grid item xs={12} lg={8}>
                        <Paper
                            sx={{
                                p: 4,
                                borderRadius: 3,
                                backgroundColor: 'white',
                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                                mb: 3
                            }}
                        >
                            <Box sx={{ mb: 4 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#2d3748' }}>
                                        {steps[activeStepIndex].label}
                                    </Typography>
                                    {orderStatus?.status !== 'DELIVERED' && (
                                        <Chip
                                            label={`${estimatedTime} min`}
                                            sx={{
                                                backgroundColor: '#06C167',
                                                color: 'white',
                                                fontWeight: 600
                                            }}
                                        />
                                    )}
                                </Box>
                                <Typography variant="body1" sx={{ color: '#718096', mb: 3 }}>
                                    {getStatusMessage(activeStepIndex)}
                                </Typography>

                                {orderStatus?.status && orderStatus.status !== 'DELIVERED' && (
                                    <LinearProgress
                                        variant="determinate"
                                        value={(activeStepIndex + 1) * 25}
                                        sx={{
                                            height: 8,
                                            borderRadius: 4,
                                            backgroundColor: '#e2e8f0',
                                            '& .MuiLinearProgress-bar': {
                                                backgroundColor: '#06C167',
                                                borderRadius: 4
                                            }
                                        }}
                                    />
                                )}
                            </Box>

                            <Stepper activeStep={activeStepIndex} orientation="vertical">
                                {steps.map((step, index) => (
                                    <Step key={step.label}>
                                        <StepLabel
                                            StepIconComponent={() => (
                                                <Box
                                                    sx={{
                                                        width: 48,
                                                        height: 48,
                                                        borderRadius: '50%',
                                                        backgroundColor: getStatusColor(index, activeStepIndex),
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: 'white',
                                                        mr: 2
                                                    }}
                                                >
                                                    {step.icon}
                                                </Box>
                                            )}
                                        >
                                            <Box sx={{ ml: 2 }}>
                                                <Typography
                                                    variant="h6"
                                                    sx={{
                                                        fontWeight: 600,
                                                        color: index <= activeStepIndex ? '#2d3748' : '#a0aec0'
                                                    }}
                                                >
                                                    {step.label}
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        color: index <= activeStepIndex ? '#718096' : '#a0aec0'
                                                    }}
                                                >
                                                    {step.description}
                                                </Typography>
                                            </Box>
                                        </StepLabel>
                                    </Step>
                                ))}
                            </Stepper>

                            {orderStatus?.status === 'DELIVERED' && (
                                <Box sx={{ mt: 4, textAlign: 'center' }}>
                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#2d3748' }}>
                                        Order Delivered Successfully! 🎉
                                    </Typography>
                                    <Typography variant="body1" sx={{ color: '#718096', mb: 3 }}>
                                        Hope you enjoyed your meal! Ready for your next delicious order?
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        onClick={() => navigate('/shop/cassa')}
                                        sx={{
                                            backgroundColor: '#06C167',
                                            px: 4,
                                            py: 1.5,
                                            fontSize: '1.1rem',
                                            fontWeight: 600,
                                            '&:hover': { backgroundColor: '#048A47' }
                                        }}
                                    >
                                        Start New Order
                                    </Button>
                                </Box>
                            )}
                        </Paper>
                    </Grid>

                    <Grid item xs={12} lg={4}>
                        <Box sx={{ position: 'sticky', top: 100 }}>
                            <Card sx={{ 
                                mb: 3, 
                                backgroundColor: '#f0fff4', 
                                border: '1px solid #06C167',
                                width: '100%',
                                height: 180,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center'
                            }}>
                                <CardContent sx={{ 
                                    textAlign: 'center', 
                                    py: 3,
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}>
                                    <AccessTime sx={{ fontSize: 48, color: '#06C167', mb: 2 }} />
                                    <Typography variant="h6" sx={{ 
                                        fontWeight: 600, 
                                        mb: 1, 
                                        color: '#2d3748',
                                        width: '100%'
                                    }}>
                                        Estimated Time
                                    </Typography>
                                    <Box sx={{ 
                                        width: '100%',
                                        height: 60,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <Typography variant="h4" sx={{ 
                                            fontWeight: 700, 
                                            color: '#06C167',
                                            textAlign: 'center',
                                            width: '100%'
                                        }}>
                                            {`${estimatedTime} min`}
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>

                            <Paper
                                sx={{
                                    p: 3,
                                    borderRadius: 3,
                                    backgroundColor: 'white',
                                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
                                }}
                            >
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#2d3748' }}>
                                    Need Help?
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#718096', mb: 3 }}>
                                    Have questions about your order? Our team is here to help.
                                </Typography>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={<Phone />}
                                    href="tel:0240235033"
                                    sx={{
                                        borderColor: '#06C167',
                                        color: '#06C167',
                                        py: 1.5,
                                        fontWeight: 600,
                                        '&:hover': {
                                            borderColor: '#048A47',
                                            backgroundColor: 'rgba(6, 193, 103, 0.1)'
                                        }
                                    }}
                                >
                                    Call 0240 235 033
                                </Button>
                            </Paper>
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </div>
    );
}

export default DeliveryStatus;