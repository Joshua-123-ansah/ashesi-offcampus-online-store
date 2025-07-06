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
    CardContent,
    Divider,
    Paper,
    IconButton
} from '@mui/material';
import { Add, Remove, Delete, ArrowBack } from '@mui/icons-material';
import Navbar from '../components/Navbar';
import api from '../api';

function Checkout() {
    const location = useLocation();
    const navigate = useNavigate();
    const cart = useMemo(() => location.state?.cart || {}, [location.state?.cart]);

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [localCart, setLocalCart] = useState(cart);

    useEffect(() => {
        const fetchCartItems = async () => {
            try {
                const res = await api.get('/api/foodItems/');
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

    const updateQuantity = (id, delta) => {
        setLocalCart(prev => {
            const nextQty = Math.max(0, (prev[id] || 0) + delta);
            if (nextQty === 0) {
                const nxt = { ...prev };
                delete nxt[id];
                return nxt;
            }
            return { ...prev, [id]: nextQty };
        });
    };

    const removeItem = (id) => {
        setLocalCart(prev => {
            const nxt = { ...prev };
            delete nxt[id];
            return nxt;
        });
    };

    const subtotal = items.reduce((sum, item) => sum + item.price * (localCart[item.id] || 0), 0);
    const deliveryFee = subtotal > 20 ? 0 : 2.99;
    const total = subtotal + deliveryFee;

    const handleProceed = () => {
        localStorage.setItem('cart', JSON.stringify(localCart));
        navigate('/customer-info', { state: { cart: localCart } });
    };

    if (loading) {
        return (
            <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
                <Navbar />
                <Container sx={{ mt: 4, textAlign: 'center' }}>
                    <Typography>Loading your cart…</Typography>
                </Container>
            </div>
        );
    }

    const cartItems = items.filter(item => localCart[item.id]);

    return (
        <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            <Navbar />

            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <IconButton 
                        onClick={() => navigate(-1)}
                        sx={{ mr: 2, color: '#2d3748' }}
                    >
                        <ArrowBack />
                    </IconButton>
                    <Typography variant="h4" sx={{ fontWeight: 600, color: '#2d3748' }}>
                        Your Cart
                    </Typography>
                </Box>

                {cartItems.length === 0 ? (
                    <Paper
                        sx={{
                            p: 6,
                            textAlign: 'center',
                            borderRadius: 3,
                            backgroundColor: 'white'
                        }}
                    >
                        <Typography variant="h5" sx={{ mb: 2, color: '#718096' }}>
                            Your cart is empty
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
                ) : (
                    <Grid container spacing={4}>
                        {/* Cart Items */}
                        <Grid item xs={12} md={8}>
                            <Paper sx={{ p: 3, borderRadius: 3, backgroundColor: 'white' }}>
                                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                                    Order Items ({cartItems.length})
                                </Typography>
                                
                                {cartItems.map((item, index) => (
                                    <Box key={item.id}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', py: 2 }}>
                                            <CardMedia
                                                component="img"
                                                sx={{
                                                    width: 80,
                                                    height: 80,
                                                    borderRadius: 2,
                                                    objectFit: 'cover',
                                                    mr: 3
                                                }}
                                                image={item.image}
                                                alt={item.name}
                                            />
                                            
                                            <Box sx={{ flexGrow: 1 }}>
                                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                                                    {item.name}
                                                </Typography>
                                                <Typography variant="h6" sx={{ color: '#06C167', fontWeight: 600 }}>
                                                    ${item.price}
                                                </Typography>
                                            </Box>

                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        backgroundColor: '#f8f9fa',
                                                        borderRadius: 2,
                                                        p: 0.5
                                                    }}
                                                >
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => updateQuantity(item.id, -1)}
                                                        sx={{ color: '#06C167' }}
                                                    >
                                                        <Remove />
                                                    </IconButton>
                                                    <Typography sx={{ mx: 2, fontWeight: 600, minWidth: 20, textAlign: 'center' }}>
                                                        {localCart[item.id]}
                                                    </Typography>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => updateQuantity(item.id, 1)}
                                                        sx={{ color: '#06C167' }}
                                                    >
                                                        <Add />
                                                    </IconButton>
                                                </Box>

                                                <IconButton
                                                    onClick={() => removeItem(item.id)}
                                                    sx={{ color: '#e53e3e' }}
                                                >
                                                    <Delete />
                                                </IconButton>
                                            </Box>
                                        </Box>
                                        {index < cartItems.length - 1 && <Divider />}
                                    </Box>
                                ))}
                            </Paper>
                        </Grid>

                        {/* Order Summary */}
                        <Grid item xs={12} md={4}>
                            <Paper sx={{ p: 3, borderRadius: 3, backgroundColor: 'white', position: 'sticky', top: 100 }}>
                                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                                    Order Summary
                                </Typography>

                                <Box sx={{ mb: 3 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography>Subtotal</Typography>
                                        <Typography>${subtotal.toFixed(2)}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography>Delivery Fee</Typography>
                                        <Typography>
                                            {deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`}
                                        </Typography>
                                    </Box>
                                    {subtotal < 20 && (
                                        <Typography variant="body2" sx={{ color: '#718096', mt: 1 }}>
                                            Add ${(20 - subtotal).toFixed(2)} more for free delivery
                                        </Typography>
                                    )}
                                </Box>

                                <Divider sx={{ my: 2 }} />

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        Total
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#06C167' }}>
                                        ${total.toFixed(2)}
                                    </Typography>
                                </Box>

                                <Button
                                    fullWidth
                                    variant="contained"
                                    size="large"
                                    onClick={handleProceed}
                                    sx={{
                                        backgroundColor: '#06C167',
                                        py: 1.5,
                                        fontSize: '1.1rem',
                                        fontWeight: 600,
                                        borderRadius: 2,
                                        '&:hover': { backgroundColor: '#048A47' }
                                    }}
                                >
                                    Proceed to Checkout
                                </Button>
                            </Paper>
                        </Grid>
                    </Grid>
                )}
            </Container>
        </div>
    );
}

export default Checkout;