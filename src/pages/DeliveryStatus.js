// src/pages/DeliveryStatus.js
import React, { useEffect, useState } from 'react';
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
    IconButton
} from '@mui/material';
import {
    Receipt,
    Restaurant,
    LocalShipping,
    CheckCircle,
    Phone,
    Home as HomeIcon,
    AccessTime,
    ArrowBack
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api';
import Loader from '../components/Loader';

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

    useEffect(() => {
        // Fetch the user's latest order
        const fetchLatestOrder = async () => {
            try {
                const res = await api.get('/api/orders/');
                if (res.data && res.data.length > 0) {
                    // Assuming the latest order is first in the list
                    setOrderId(res.data[0].id);
                } else {
                    setError('No orders found.');
                    setLoading(false);
                }
            } catch (err) {
                setError('Failed to fetch orders.');
                setLoading(false);
            }
        };
        fetchLatestOrder();
    }, []);

    useEffect(() => {
        if (!orderId) return;
        // Fetch the order status/details
        const fetchOrderStatus = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/api/orders/${orderId}/status/`);
                setOrderStatus(res.data);
                // Update estimated time based on status
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
                setError('Failed to fetch order status.');
            } finally {
                setLoading(false);
            }
        };
        fetchOrderStatus();
    }, [orderId]);

    if (loading) {
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
                            No Active Orders
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#718096', mb: 4 }}>
                            {error}
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
                            Start New Order
                        </Button>
                    </Paper>
                </Container>
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            <Navbar/>

            <Container maxWidth="lg" sx={{ py: 4 }}>
                {/* Header */}
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
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#2d3748' }}>
                            Track Your Order
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#718096' }}>
                            Order #{orderId}
                        </Typography>
                    </Box>
                </Box>

                <Grid container spacing={4}>
                    {/* Main Tracking */}
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
                            {/* Status Header */}
                            <Box sx={{ mb: 4 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#2d3748' }}>
                                        {steps[orderStatus?.status ? statusMap[orderStatus.status] : 0].label}
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
                                    {getStatusMessage(orderStatus?.status ? statusMap[orderStatus.status] : 0)}
                                </Typography>

                                {orderStatus?.status !== 'DELIVERED' && (
                                    <LinearProgress
                                        variant="determinate"
                                        value={(statusMap[orderStatus.status] + 1) * 25}
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

                            {/* Stepper */}
                            <Stepper activeStep={orderStatus?.status ? statusMap[orderStatus.status] : 0} orientation="vertical">
                                {steps.map((step, index) => (
                                    <Step key={step.label}>
                                        <StepLabel
                                            StepIconComponent={() => (
                                                <Box
                                                    sx={{
                                                        width: 48,
                                                        height: 48,
                                                        borderRadius: '50%',
                                                        backgroundColor: getStatusColor(index, orderStatus?.status ? statusMap[orderStatus.status] : 0),
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
                                                        color: index <= (orderStatus?.status ? statusMap[orderStatus.status] : 0) ? '#2d3748' : '#a0aec0'
                                                    }}
                                                >
                                                    {step.label}
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        color: index <= (orderStatus?.status ? statusMap[orderStatus.status] : 0) ? '#718096' : '#a0aec0'
                                                    }}
                                                >
                                                    {step.description}
                                                </Typography>
                                            </Box>
                                        </StepLabel>
                                    </Step>
                                ))}
                            </Stepper>
                        </Paper>
                    </Grid>

                    {/* Sidebar */}
                    <Grid item xs={12} lg={4}>
                        <Box sx={{ position: 'sticky', top: 100 }}>
                            {/* Estimated Time Card */}
                            <Card sx={{ mb: 3, backgroundColor: '#f0fff4', border: '1px solid #06C167' }}>
                                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                    <AccessTime sx={{ fontSize: 48, color: '#06C167', mb: 2 }} />
                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#2d3748' }}>
                                        {orderStatus?.status === 'DELIVERED' ? 'Delivered!' : 'Estimated Time'}
                                    </Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#06C167' }}>
                                        {orderStatus?.status === 'DELIVERED' ? '✓' : `${estimatedTime} min`}
                                    </Typography>
                                </CardContent>
                            </Card>

                            {/* Contact Support */}
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