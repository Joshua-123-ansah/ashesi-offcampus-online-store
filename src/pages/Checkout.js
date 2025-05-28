// src/pages/Checkout.js
import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Container,
    Box,
    Typography,
    Grid,
    Button,
    Card,
    CardMedia,
    CardContent
} from '@mui/material';
import Navbar from '../components/Navbar';
import api from '../api';

function Checkout() {
    const location = useLocation();
    const navigate = useNavigate();
    const cart = useMemo(() => location.state?.cart || {}, [location.state?.cart]);


    const [items, setItems]     = useState([]);
    const [loading, setLoading] = useState(true);

    // fetch only the items in the cart
    useEffect(() => {
        const fetchCartItems = async () => {
            try {
                const res = await api.get('/api/foodItems/');
                // filter down to only what’s in cart
                const cartItems = res.data.filter(item => cart[item.id]);
                setItems(cartItems);
            } catch (err) {
                console.error('Failed to load cart items:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchCartItems();
    }, [cart]);

    // sum up line totals
    const total = items.reduce(
        (sum, item) => sum + item.price * cart[item.id],
        0
    );

    const handleProceed = () => {
        localStorage.setItem('cart', JSON.stringify(cart));
        navigate('/customer-info', { state: { cart } });
    };

    // loading state
    if (loading) {
        return (
            <div>
                <Navbar/>
                <Container sx={{ mt: 4, textAlign: 'center' }}>
                    <Typography>Loading your cart…</Typography>
                </Container>
            </div>
        );
    }

    return (
        <div>
            <Navbar/>

            <Container sx={{ mt: 4 }}>
                {items.length === 0 ? (
                    <Typography>Your cart is empty.</Typography>
                ) : (
                    <>
                        <Grid container spacing={2} display="flex" justifyContent="center">
                            {items.map(item => (
                                <Grid item xs={12} sm={6} md={4} key={item.id}>
                                    <Card sx={{ width: 300, height: 300 }}>
                                        <CardMedia
                                            component="img"
                                            height="140"
                                            image={item.image}
                                            alt={item.name}
                                        />
                                        <CardContent>
                                            <Typography variant="h7">{item.name}</Typography>
                                            <Typography>Price: ${item.price}</Typography>
                                            <Typography>Qty: {cart[item.id]}</Typography>
                                            <Typography>
                                                Subtotal: ${(item.price * cart[item.id]).toFixed(2)}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>

                        <Box sx={{ textAlign: 'right', mt: 2 }}>
                            <Typography variant="h5">
                                Total: ${total.toFixed(2)}
                            </Typography>
                        </Box>

                        <Box sx={{ textAlign: 'center', mt: 4 }}>
                            <Button
                                variant="contained"
                                size="large"
                                onClick={handleProceed}
                            >
                                Proceed to Customer Info
                            </Button>
                        </Box>
                    </>
                )}
            </Container>
        </div>
    );
}

export default Checkout;
