// src/pages/DeliveryStatus.js
import React, { useState, useEffect } from 'react';
import {
    Container,
    Box,
    Typography,
    Stepper,
    Step,
    StepLabel,
    Button
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api';
import Loader from '../components/Loader';

const steps = [
    'Order Received',
    'Order is being prepared',
    'Order out for delivery',
    'Delivered'
];

const statusMap = {
    RECEIVED: 0,
    PREPARING: 1,
    OUT_FOR_DELIVERY: 2,
    DELIVERED: 3
};

function DeliveryStatus() {
    const navigate = useNavigate();
    const [orderId]    = useState(
        localStorage.getItem('lastOrderId')
    );
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading]       = useState(true);
    const [error, setError]           = useState(null);

    useEffect(() => {
        let isMounted = true;

        const fetchStatus = async () => {
            if (!orderId) {
                if (isMounted) {
                    setError('Order has been delivered or there is no order to track.');
                    setLoading(false);
                }
                return;
            }
            try {
                const res = await api.get(`/api/orders/${orderId}/status/`);
                const { status } = res.data;
                if (isMounted) {
                    setActiveStep(statusMap[status] ?? 0);

                    // once delivered, clear saved orderId
                    if (status === 'DELIVERED') {
                        localStorage.removeItem('lastOrderId');
                        localStorage.removeItem('cart');
                    }

                    setLoading(false);
                }
            } catch (err) {
                console.error('Failed to fetch order status:', err);
                if (isMounted) {
                    setError('Unable to load order status.');
                    setLoading(false);
                }
            }
        };

        fetchStatus();
        const interval = setInterval(fetchStatus, 30 * 1000);

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [orderId]);

    if (loading) {
        return (
            <div>
                <Navbar/>
                <Container sx={{ mt: 4 }}>
                    <Loader />
                </Container>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <Navbar/>
                <Container sx={{ mt: 4, textAlign: 'center' }}>
                    <Typography color="error" gutterBottom>
                        {error}
                    </Typography>
                    <Button variant="contained" onClick={() => navigate('/')}>
                        Go to Homepage
                    </Button>
                </Container>
            </div>
        );
    }

    return (
        <div>
            <Navbar/>
            <Container sx={{ mt: 4 }}>
                <Typography variant="h5" align="center" gutterBottom>
                    Tracking Order #{orderId}
                </Typography>
                <Box sx={{ width: '100%', mt: 4 }}>
                    <Stepper activeStep={activeStep} alternativeLabel>
                        {steps.map(label => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Button variant="contained" onClick={() => navigate('/')}>
                        Go to Homepage
                    </Button>
                </Box>
            </Container>
        </div>
    );
}

export default DeliveryStatus;
