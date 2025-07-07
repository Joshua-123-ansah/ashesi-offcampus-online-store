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
    Fab,
    useMediaQuery,
    useTheme
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
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'lg'));
    
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
                    py: { xs: 3, sm: 4, md: 6 }
                }}
            >
                <Container maxWidth="lg">
                    <Box sx={{ px: { xs: 2, sm: 0 } }}>
                        <Typography 
                            variant="h2" 
                            sx={{ 
                                mb: 1, 
                                fontWeight: 700,
                                fontSize: { 
                                    xs: '1.75rem', 
                                    sm: '2.5rem', 
                                    md: '3rem' 
                                }
                            }}
                        >
                            Cassa Bella Cuisine
                        </Typography>
                        <Typography 
                            variant="h6" 
                            sx={{ 
                                mb: 2, 
                                opacity: 0.9,
                                fontSize: { 
                                    xs: '1rem', 
                                    sm: '1.1rem', 
                                    md: '1.25rem' 
                                }
                            }}
                        >
                            Authentic local dishes & international cuisine
                        </Typography>
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: { xs: 2, sm: 3 },
                            flexWrap: 'wrap'
                        }}>
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
                                    fontWeight: 600,
                                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                                }}
                            />
                        </Box>
                    </Box>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 4 } }}>
                {/* Search Bar */}
                <Box sx={{ mb: { xs: 3, sm: 4 }, px: { xs: 2, sm: 0 } }}>
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
                            maxWidth: { xs: '100%', sm: 500 },
                            '& .MuiOutlinedInput-root': {
                                backgroundColor: 'white',
                                borderRadius: 2,
                            }
                        }}
                    />
                </Box>

                {/* Menu Items */}
                <Box sx={{ px: { xs: 2, sm: 0 } }}>
                    <Typography 
                        variant="h4" 
                        sx={{ 
                            mb: { xs: 2, sm: 3 }, 
                            color: '#2d3748', 
                            fontWeight: 600,
                            fontSize: { 
                                xs: '1.5rem', 
                                sm: '1.75rem', 
                                md: '2rem' 
                            }
                        }}
                    >
                        Menu ({filtered.length} items)
                    </Typography>

                    <Grid container spacing={{ xs: 2, sm: 3 }}>
                        {filtered.map(product => (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                                <Card
                                    sx={{
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        borderRadius: { xs: 2, sm: 3 },
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
                                        height={isMobile ? "160" : isTablet ? "180" : "200"}
                                        image={product.image}
                                        alt={product.name}
                                        onError={e => {
                                            e.target.onerror = null;
                                            e.target.src = DEFAULT_IMAGE;
                                        }}
                                        sx={{ objectFit: 'cover' }}
                                    />
                                    
                                    <CardContent sx={{ 
                                        flexGrow: 1, 
                                        p: { xs: 2, sm: 3 }
                                    }}>
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                mb: 1,
                                                fontWeight: 600,
                                                color: '#2d3748',
                                                lineHeight: 1.3,
                                                fontSize: { 
                                                    xs: '1rem', 
                                                    sm: '1.1rem', 
                                                    md: '1.25rem' 
                                                }
                                            }}
                                        >
                                            {product.name}
                                        </Typography>
                                        
                                        <Typography
                                            variant="h5"
                                            sx={{
                                                color: '#06C167',
                                                fontWeight: 700,
                                                mb: 2,
                                                fontSize: { 
                                                    xs: '1.1rem', 
                                                    sm: '1.25rem', 
                                                    md: '1.3rem' 
                                                }
                                            }}
                                        >
                                            ${product.price}
                                        </Typography>
                                    </CardContent>

                                    <CardActions sx={{ 
                                        p: { xs: 2, sm: 3 }, 
                                        pt: 0 
                                    }}>
                                        {!cart[product.id] ? (
                                            <Button
                                                fullWidth
                                                variant="contained"
                                                startIcon={<Add />}
                                                onClick={() => handleAdd(product.id)}
                                                sx={{
                                                    backgroundColor: '#06C167',
                                                    py: { xs: 1.2, sm: 1.5 },
                                                    borderRadius: 2,
                                                    fontWeight: 600,
                                                    fontSize: { xs: '0.875rem', sm: '1rem' },
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
                                                        '&:hover': { backgroundColor: '#f0f0f0' },
                                                        width: { xs: 32, sm: 36 },
                                                        height: { xs: 32, sm: 36 }
                                                    }}
                                                >
                                                    <Remove sx={{ fontSize: { xs: 16, sm: 20 } }} />
                                                </IconButton>
                                                
                                                <Typography
                                                    variant="h6"
                                                    sx={{ 
                                                        fontWeight: 600, 
                                                        color: '#2d3748',
                                                        fontSize: { xs: '1rem', sm: '1.25rem' }
                                                    }}
                                                >
                                                    {cart[product.id]}
                                                </Typography>
                                                
                                                <IconButton
                                                    onClick={() => handleQty(product.id, +1)}
                                                    sx={{
                                                        backgroundColor: '#06C167',
                                                        color: 'white',
                                                        '&:hover': { backgroundColor: '#048A47' },
                                                        width: { xs: 32, sm: 36 },
                                                        height: { xs: 32, sm: 36 }
                                                    }}
                                                >
                                                    <Add sx={{ fontSize: { xs: 16, sm: 20 } }} />
                                                </IconButton>
                                            </Box>
                                        )}
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </Container>

            {/* Floating Cart Button */}
            {totalItems > 0 && (
                <Fab
                    variant="extended"
                    sx={{
                        position: 'fixed',
                        bottom: { xs: 16, sm: 24 },
                        right: { xs: 16, sm: 24 },
                        zIndex: 1000,
                        backgroundColor: '#06C167',
                        color: 'white',
                        px: { xs: 2, sm: 3 },
                        minWidth: { xs: 160, sm: 200 },
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        '&:hover': {
                            backgroundColor: '#048A47',
                            transform: 'scale(1.05)'
                        }
                    }}
                    onClick={() => navigate("/checkout", { state: { cart } })}
                >
                    <ShoppingCart sx={{ mr: 1, fontSize: { xs: 18, sm: 20 } }} />
                    View Cart • ${totalPrice.toFixed(2)}
                </Fab>
            )}
        </div>
    );
}

export default Shop;