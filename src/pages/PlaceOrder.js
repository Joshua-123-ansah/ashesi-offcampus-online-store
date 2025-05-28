// src/pages/PlaceOrder.js
import React, { useState } from 'react';
import { Container, Box, Typography, Button, CircularProgress } from '@mui/material';
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
    const [error, setError]     = useState(null);

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

            // navigate to static status page
            navigate('/delivery-status');
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
        <div>
            <Navbar />

            <Container sx={{ mt: 4, textAlign: 'center' }}>
                {loading && (
                    <Box my={4}>
                        <CircularProgress />
                        <Typography variant="body1" mt={2}>
                            Placing your order…
                        </Typography>
                    </Box>
                )}

                {!loading && !success && (
                    <Box my={4}>
                        {error && (
                            <Typography color="error" mb={2}>
                                {error}
                            </Typography>
                        )}
                        <Typography variant="h6" gutterBottom>
                            Ready to place your order?
                        </Typography>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={handleMakeOrder}
                        >
                            Make Order
                        </Button>
                    </Box>
                )}

                {!loading && success && (
                    <Box my={4}>
                        <Typography variant="h5" gutterBottom>
                            ✅ Your order has been placed!
                        </Typography>
                        <Typography variant="body1" mb={3}>
                            You will hear from our team shortly. If you have any questions, reach us on{' '}
                            <strong>0240 235 033</strong>.
                        </Typography>
                        <Button
                            variant="outlined"
                            size="large"
                            onClick={() => navigate('/delivery-status')}
                        >
                            Track Your Order
                        </Button>
                    </Box>
                )}
            </Container>
        </div>
    );
}

export default PlaceOrder;
