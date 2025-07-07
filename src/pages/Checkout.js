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
    IconButton,
    useMediaQuery,
    useTheme
} from '@mui/material';
import { Add, Remove, Delete, ArrowBack } from '@mui/icons-material';
import Navbar from '../components/Navbar';
import api from '../api';

function Checkout() {
    const location = useLocation();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));
    
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

            <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 4 } }}>
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: { xs: 2, sm: 3 },
                    px: { xs: 2, sm: 0 }
                }}>
                    <IconButton 
                        onClick={() => navigate(-1)}
                        sx={{ 
                            mr: 2, 
                            color: '#2d3748',
                            width: { xs: 40, sm: 48 },
                            height: { xs: 40, sm: 48 }
                        }}
                    >
                        <ArrowBack sx={{ fontSize: { xs: 20, sm: 24 } }} />
                    </IconButton>
                    <Typography 
                        variant="h4" 
                        sx={{ 
                            fontWeight: 600, 
                            color: '#2d3748',
                            fontSize: { 
                                xs: '1.5rem', 
                                sm: '2rem', 
                                md: '2.25rem' 
                            }
                        }}
                    >
                        Your Cart
                    </Typography>
                </Box>

                {cartItems.length === 0 ? (
                    <Paper
                        sx={{
                            p: { xs: 4, sm: 6 },
                            textAlign: 'center',
                            borderRadius: { xs: 2, sm: 3 },
                            backgroundColor: 'white',
                            mx: { xs: 2, sm: 0 }
                        }}
                    >
                        <Typography 
                            variant="h5" 
                            sx={{ 
                                mb: 2, 
                                color: '#718096',
                                fontSize: { xs: '1.25rem', sm: '1.5rem' }
                            }}
                        >
                            Your cart is empty
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={() => navigate('/shop/cassa')}
                            sx={{
                                backgroundColor: '#06C167',
                                px: { xs: 3, sm: 4 },
                                py: { xs: 1.2, sm: 1.5 },
                                fontSize: { xs: '1rem', sm: '1.1rem' },
                                '&:hover': { backgroundColor: '#048A47' }
                            }}
                        >
                            Start Shopping
                        </Button>
                    </Paper>
                ) : (
                    <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
                        {/* Cart Items */}
                        <Grid item xs={12} md={8}>
                            <Paper sx={{ 
                                p: { xs: 2, sm: 3 }, 
                                borderRadius: { xs: 2, sm: 3 }, 
                                backgroundColor: 'white' 
                            }}>
                                <Typography 
                                    variant="h6" 
                                    sx={{ 
                                        mb: { xs: 2, sm: 3 }, 
                                        fontWeight: 600,
                                        fontSize: { xs: '1.1rem', sm: '1.25rem' }
                                    }}
                                >
                                    Order Items ({cartItems.length})
                                </Typography>
                                
                                {cartItems.map((item, index) => (
                                    <Box key={item.id}>
                                        <Box sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            py: { xs: 1.5, sm: 2 },
                                            flexDirection: { xs: 'column', sm: 'row' },
                                            gap: { xs: 2, sm: 0 }
                                        }}>
                                            <CardMedia
                                                component="img"
                                                sx={{
                                                    width: { xs: '100%', sm: 80 },
                                                    height: { xs: 120, sm: 80 },
                                                    borderRadius: 2,
                                                    objectFit: 'cover',
                                                    mr: { xs: 0, sm: 3 }
                                                }}
                                                image={item.image}
                                                alt={item.name}
                                            />
                                            
                                            <Box sx={{ 
                                                flexGrow: 1,
                                                textAlign: { xs: 'center', sm: 'left' },
                                                minWidth: 0
                                            }}>
                                                <Typography 
                                                    variant="h6" 
                                                    sx={{ 
                                                        fontWeight: 600, 
                                                        mb: 0.5,
                                                        fontSize: { xs: '1rem', sm: '1.25rem' }
                                                    }}
                                                >
                                                    {item.name}
                                                </Typography>
                                                <Typography 
                                                    variant="h6" 
                                                    sx={{ 
                                                        color: '#06C167', 
                                                        fontWeight: 600,
                                                        fontSize: { xs: '1.1rem', sm: '1.25rem' }
                                                    }}
                                                >
                                                    ${item.price}
                                                </Typography>
                                            </Box>

                                            <Box sx={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: { xs: 1, sm: 2 },
                                                flexDirection: { xs: 'row', sm: 'row' }
                                            }}>
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
                                                        sx={{ 
                                                            color: '#06C167',
                                                            width: { xs: 32, sm: 36 },
                                                            height: { xs: 32, sm: 36 }
                                                        }}
                                                    >
                                                        <Remove sx={{ fontSize: { xs: 16, sm: 20 } }} />
                                                    </IconButton>
                                                    <Typography sx={{ 
                                                        mx: { xs: 1.5, sm: 2 }, 
                                                        fontWeight: 600, 
                                                        minWidth: 20, 
                                                        textAlign: 'center',
                                                        fontSize: { xs: '1rem', sm: '1.1rem' }
                                                    }}>
                                                        {localCart[item.id]}
                                                    </Typography>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => updateQuantity(item.id, 1)}
                                                        sx={{ 
                                                            color: '#06C167',
                                                            width: { xs: 32, sm: 36 },
                                                            height: { xs: 32, sm: 36 }
                                                        }}
                                                    >
                                                        <Add sx={{ fontSize: { xs: 16, sm: 20 } }} />
                                                    </IconButton>
                                                </Box>

                                                <IconButton
                                                    onClick={() => removeItem(item.id)}
                                                    sx={{ 
                                                        color: '#e53e3e',
                                                        width: { xs: 36, sm: 40 },
                                                        height: { xs: 36, sm: 40 }
                                                    }}
                                                >
                                                    <Delete sx={{ fontSize: { xs: 18, sm: 20 } }} />
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
                            <Paper sx={{ 
                                p: { xs: 2, sm: 3 }, 
                                borderRadius: { xs: 2, sm: 3 }, 
                                backgroundColor: 'white', 
                                position: { xs: 'static', md: 'sticky' }, 
                                top: 100 
                            }}>
                                <Typography 
                                    variant="h6" 
                                    sx={{ 
                                        mb: { xs: 2, sm: 3 }, 
                                        fontWeight: 600,
                                        fontSize: { xs: '1.1rem', sm: '1.25rem' }
                                    }}
                                >
                                    Order Summary
                                </Typography>

                                <Box sx={{ mb: { xs: 2, sm: 3 } }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                                            Subtotal
                                        </Typography>
                                        <Typography sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                                            ${subtotal.toFixed(2)}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                                            Delivery Fee
                                        </Typography>
                                        <Typography sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                                            {deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`}
                                        </Typography>
                                    </Box>
                                    {subtotal < 20 && (
                                        <Typography 
                                            variant="body2" 
                                            sx={{ 
                                                color: '#718096', 
                                                mt: 1,
                                                fontSize: { xs: '0.8rem', sm: '0.875rem' }
                                            }}
                                        >
                                            Add ${(20 - subtotal).toFixed(2)} more for free delivery
                                        </Typography>
                                    )}
                                </Box>

                                <Divider sx={{ my: 2 }} />

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: { xs: 2, sm: 3 } }}>
                                    <Typography 
                                        variant="h6" 
                                        sx={{ 
                                            fontWeight: 600,
                                            fontSize: { xs: '1.1rem', sm: '1.25rem' }
                                        }}
                                    >
                                        Total
                                    </Typography>
                                    <Typography 
                                        variant="h6" 
                                        sx={{ 
                                            fontWeight: 600, 
                                            color: '#06C167',
                                            fontSize: { xs: '1.1rem', sm: '1.25rem' }
                                        }}
                                    >
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
                                        py: { xs: 1.2, sm: 1.5 },
                                        fontSize: { xs: '1rem', sm: '1.1rem' },
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