// src/pages/PlaceOrder.js
import React, { useState } from 'react';
import { 
    Container, 
    Box, 
    Typography, 
    Button, 
    CircularProgress,
    Paper,
    Card,
    CardContent,
    Grid,
    Divider,
    Alert
} from '@mui/material';
import { 
    ShoppingBag, 
    CheckCircle, 
    Restaurant,
    Phone,
    AccessTime
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api';

function PlaceOrder() {
    // restore cart
    const storedCart = JSON.parse(localStorage.getItem('cart') || 'null');
    const cart = window.history.state?.usr?.location?.state?.cart || storedCart || {};

    const itemsPayload = Object.entries(cart).map(([foodId, qty]) => ({
        food_item: Number(foodId),
        quantity: qty
    }));

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    const handleMakeOrder = async () => {
        if (!itemsPayload.length) {
            setError('Your cart is empty.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await api.post('/api/orders/', { items: itemsPayload });
            const newOrderId = res.data.id;

            // persist the orderId so DeliveryStatus can read it
            localStorage.setItem('lastOrderId', newOrderId);

            // clear the cart
            localStorage.removeItem('cart');
            setSuccess(true);

            // navigate to static status page after a short delay
            setTimeout(() => {
                navigate('/delivery-status');
            }, 2000);
        } catch (err) {
            console.error('Order creation failed:', err);
            setError(
                err.response?.data?.detail ||
                JSON.stringify(err.response?.data) ||
                'Failed to place order.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            <Navbar />

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
                    {loading && (
                        <Box>
                            <CircularProgress 
                                size={60}
                                sx={{ color: '#06C167', mb: 3 }}
                            />
                            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: '#2d3748' }}>
                                Placing Your Order
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#718096' }}>
                                Please wait while we process your order...
                            </Typography>
                        </Box>
                    )}

                    {!loading && !success && (
                        <Box>
                            <ShoppingBag sx={{ fontSize: 80, color: '#06C167', mb: 3 }} />
                            
                            <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, color: '#2d3748' }}>
                                Ready to Order?
                            </Typography>
                            
                            <Typography variant="body1" sx={{ color: '#718096', mb: 4, fontSize: '1.1rem' }}>
                                Review your order details and confirm to place your order
                            </Typography>

                            {error && (
                                <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
                                    {error}
                                </Alert>
                            )}

                            <Grid container spacing={3} sx={{ mb: 4 }}>
                                <Grid item xs={12} md={4}>
                                    <Card sx={{ backgroundColor: '#f8f9fa', boxShadow: 'none', height: '100%' }}>
                                        <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                            <Restaurant sx={{ fontSize: 40, color: '#06C167', mb: 2 }} />
                                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                                Fresh Food
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: '#718096' }}>
                                                Prepared with care
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                
                                <Grid item xs={12} md={4}>
                                    <Card sx={{ backgroundColor: '#f8f9fa', boxShadow: 'none', height: '100%' }}>
                                        <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                            <AccessTime sx={{ fontSize: 40, color: '#06C167', mb: 2 }} />
                                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                                Fast Delivery
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: '#718096' }}>
                                                20-30 minutes
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                
                                <Grid item xs={12} md={4}>
                                    <Card sx={{ backgroundColor: '#f8f9fa', boxShadow: 'none', height: '100%' }}>
                                        <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                            <Phone sx={{ fontSize: 40, color: '#06C167', mb: 2 }} />
                                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                                Support
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: '#718096' }}>
                                                0240 235 033
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>

                            <Button
                                variant="contained"
                                size="large"
                                onClick={handleMakeOrder}
                                sx={{
                                    backgroundColor: '#06C167',
                                    px: 6,
                                    py: 2,
                                    fontSize: '1.2rem',
                                    fontWeight: 600,
                                    borderRadius: 3,
                                    '&:hover': { 
                                        backgroundColor: '#048A47',
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 8px 25px rgba(6, 193, 103, 0.3)'
                                    }
                                }}
                            >
                                Confirm Order
                            </Button>
                        </Box>
                    )}

                    {!loading && success && (
                        <Box>
                            <CheckCircle sx={{ fontSize: 100, color: '#06C167', mb: 3 }} />
                            
                            <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, color: '#2d3748' }}>
                                Order Placed Successfully!
                            </Typography>
                            
                            <Typography variant="body1" sx={{ color: '#718096', mb: 4, fontSize: '1.1rem' }}>
                                Thank you for your order! You will hear from our team shortly.
                            </Typography>

                            <Card sx={{ backgroundColor: '#f0fff4', border: '1px solid #06C167', mb: 4 }}>
                                <CardContent>
                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#2d3748' }}>
                                        What's Next?
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#718096', mb: 2 }}>
                                        • Our team will confirm your order
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#718096', mb: 2 }}>
                                        • Your food will be prepared fresh
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#718096', mb: 2 }}>
                                        • Delivery within 20-30 minutes
                                    </Typography>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="body2" sx={{ color: '#718096' }}>
                                        Questions? Call us at <strong>0240 235 033</strong>
                                    </Typography>
                                </CardContent>
                            </Card>

                            <Button
                                variant="outlined"
                                size="large"
                                onClick={() => navigate('/delivery-status')}
                                sx={{
                                    borderColor: '#06C167',
                                    color: '#06C167',
                                    px: 4,
                                    py: 1.5,
                                    fontSize: '1.1rem',
                                    fontWeight: 600,
                                    borderRadius: 2,
                                    '&:hover': {
                                        borderColor: '#048A47',
                                        backgroundColor: 'rgba(6, 193, 103, 0.1)'
                                    }
                                }}
                            >
                                Track Your Order
                            </Button>
                        </Box>
                    )}
                </Paper>
            </Container>
        </div>
    );
}

export default PlaceOrder;