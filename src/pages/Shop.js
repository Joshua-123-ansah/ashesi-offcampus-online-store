// src/pages/Shop.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Grid,
    TextField,
    Card,
    CardMedia,
    CardContent,
    CardActions,
    IconButton,
    Typography,
    Box,
    Button,
    Chip,
    InputAdornment,
    Fab
} from '@mui/material';
import {
    Add,
    Remove,
    Search,
    ShoppingCart,
    Star,
    AccessTime
} from '@mui/icons-material';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';
import api from "../api";

const DEFAULT_IMAGE = "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg";

function Shop() {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [cart, setCart] = useState({});
    const [foodItems, setFoodItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFoodItems = async () => {
            try {
                const res = await api.get("/api/foodItems/");
                setFoodItems(res.data);
            } catch (err) {
                console.error("Error fetching foodItems:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchFoodItems();
    }, []);

    if (loading) {
        return (
            <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
                <Navbar title="Cassa Bella Cuisine" />
                <Container sx={{ mt: 4 }}>
                    <Loader />
                </Container>
            </div>
        );
    }

    const filtered = foodItems
        .filter(item => item.status)
        .filter(item =>
            item.name.toLowerCase().includes(search.toLowerCase())
        );
    
    const totalItems = Object.values(cart).reduce((sum, q) => sum + q, 0);
    const totalPrice = filtered.reduce((sum, item) => {
        return sum + (cart[item.id] ? item.price * cart[item.id] : 0);
    }, 0);

    const handleAdd = id => setCart(prev => ({ ...prev, [id]: 1 }));
    const handleQty = (id, delta) =>
        setCart(prev => {
            const nextQty = Math.max(0, (prev[id] || 0) + delta);
            if (nextQty === 0) {
                const nxt = { ...prev };
                delete nxt[id];
                return nxt;
            }
            return { ...prev, [id]: nextQty };
        });

    return (
        <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            <Navbar
                title="Cassa Bella Cuisine"
                showCartButton
                cartCount={totalItems}
                onCartClick={() => navigate("/checkout", { state: { cart } })}
            />

            {/* Restaurant Header */}
            <Box
                sx={{
                    background: 'linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    color: 'white',
                    py: 6
                }}
            >
                <Container maxWidth="lg">
                    <Typography variant="h2" sx={{ mb: 1, fontWeight: 700 }}>
                        Cassa Bella Cuisine
                    </Typography>
                    <Typography variant="h6" sx={{ mb: 2, opacity: 0.9 }}>
                        Authentic local dishes & international cuisine
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Star sx={{ color: '#FFD700', mr: 0.5 }} />
                            <Typography sx={{ fontWeight: 600 }}>4.8</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <AccessTime sx={{ mr: 0.5 }} />
                            <Typography>20-30 min</Typography>
                        </Box>
                        <Chip
                            label="Free Delivery"
                            sx={{
                                backgroundColor: '#06C167',
                                color: 'white',
                                fontWeight: 600
                            }}
                        />
                    </Box>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ py: 4 }}>
                {/* Search Bar */}
                <Box sx={{ mb: 4 }}>
                    <TextField
                        fullWidth
                        placeholder="Search for dishes..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search sx={{ color: '#718096' }} />
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            maxWidth: 500,
                            '& .MuiOutlinedInput-root': {
                                backgroundColor: 'white',
                                borderRadius: 2,
                            }
                        }}
                    />
                </Box>

                {/* Menu Items */}
                <Typography variant="h4" sx={{ mb: 3, color: '#2d3748', fontWeight: 600 }}>
                    Menu ({filtered.length} items)
                </Typography>

                <Grid container spacing={3}>
                    {filtered.map(product => (
                        <Grid item xs={12} sm={6} md={4} key={product.id}>
                            <Card
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    borderRadius: 3,
                                    overflow: 'hidden',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: '0 12px 30px rgba(0, 0, 0, 0.15)'
                                    }
                                }}
                            >
                                <CardMedia
                                    component="img"
                                    height="200"
                                    image={product.image}
                                    alt={product.name}
                                    onError={e => {
                                        e.target.onerror = null;
                                        e.target.src = DEFAULT_IMAGE;
                                    }}
                                    sx={{ objectFit: 'cover' }}
                                />
                                
                                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            mb: 1,
                                            fontWeight: 600,
                                            color: '#2d3748',
                                            lineHeight: 1.3
                                        }}
                                    >
                                        {product.name}
                                    </Typography>
                                    
                                    <Typography
                                        variant="h5"
                                        sx={{
                                            color: '#06C167',
                                            fontWeight: 700,
                                            mb: 2
                                        }}
                                    >
                                        ${product.price}
                                    </Typography>
                                </CardContent>

                                <CardActions sx={{ p: 3, pt: 0 }}>
                                    {!cart[product.id] ? (
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            startIcon={<Add />}
                                            onClick={() => handleAdd(product.id)}
                                            sx={{
                                                backgroundColor: '#06C167',
                                                py: 1.5,
                                                borderRadius: 2,
                                                fontWeight: 600,
                                                '&:hover': {
                                                    backgroundColor: '#048A47'
                                                }
                                            }}
                                        >
                                            Add to Cart
                                        </Button>
                                    ) : (
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                width: '100%',
                                                backgroundColor: '#f8f9fa',
                                                borderRadius: 2,
                                                p: 1
                                            }}
                                        >
                                            <IconButton
                                                onClick={() => handleQty(product.id, -1)}
                                                sx={{
                                                    backgroundColor: 'white',
                                                    color: '#06C167',
                                                    '&:hover': { backgroundColor: '#f0f0f0' }
                                                }}
                                            >
                                                <Remove />
                                            </IconButton>
                                            
                                            <Typography
                                                variant="h6"
                                                sx={{ fontWeight: 600, color: '#2d3748' }}
                                            >
                                                {cart[product.id]}
                                            </Typography>
                                            
                                            <IconButton
                                                onClick={() => handleQty(product.id, +1)}
                                                sx={{
                                                    backgroundColor: '#06C167',
                                                    color: 'white',
                                                    '&:hover': { backgroundColor: '#048A47' }
                                                }}
                                            >
                                                <Add />
                                            </IconButton>
                                        </Box>
                                    )}
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>

            {/* Floating Cart Button */}
            {totalItems > 0 && (
                <Fab
                    variant="extended"
                    sx={{
                        position: 'fixed',
                        bottom: 24,
                        right: 24,
                        zIndex: 1000,
                        backgroundColor: '#06C167',
                        color: 'white',
                        px: 3,
                        minWidth: 200,
                        '&:hover': {
                            backgroundColor: '#048A47',
                            transform: 'scale(1.05)'
                        }
                    }}
                    onClick={() => navigate("/checkout", { state: { cart } })}
                >
                    <ShoppingCart sx={{ mr: 1 }} />
                    View Cart • ${totalPrice.toFixed(2)}
                </Fab>
            )}
        </div>
    );
}

export default Shop;