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
    // Initialize cart directly from localStorage
    const [cart, setCart] = useState(() => {
        const storedCart = JSON.parse(localStorage.getItem('cart') || 'null');
        return storedCart || {};
    });
    const [foodItems, setFoodItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFoodItems = async () => {
            try {
                console.log(api);
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

    // Save cart to localStorage whenever cart changes
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    if (loading) {
        return (
            <Box sx={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
                <Navbar title="Cassa Bella Cuisine" />
                <Container sx={{ mt: 4 }}>
                    <Loader />
                </Container>
            </Box>
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

    // Handle cart click - always use current cart from localStorage
    const handleCartClick = () => {
        const currentCart = JSON.parse(localStorage.getItem('cart') || 'null') || {};
        navigate("/checkout", { state: { cart: currentCart } });
    };

    return (
        <Box sx={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            <Navbar
                title="Cassa Bella Cuisine"
                showCartButton
                cartCount={totalItems}
                onCartClick={handleCartClick}
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
                            gap: 2,
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
                                    fontSize: '0.875rem'
                                }}
                            />
                        </Box>
                    </Box>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ py: 4 }}>
                {/* Search Bar */}
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
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
                <Typography variant="h4" sx={{ mb: 3, fontWeight: 600, color: '#2d3748' }}>
                    Menu ({filtered.length} items)
                </Typography>

                <Grid
                    container
                    spacing={3}
                    justifyContent="center"
                    alignItems="stretch" // stretch items height-wise
                    sx={{ maxWidth: 1200, mx: 'auto' }} // max width and center
                >
                    {filtered.map(product => (
                        <Grid
                            item
                            key={product.id}
                            xs={12}
                            sm={6}
                            md={4}
                            lg={3}
                            sx={{
                                display: 'flex',
                            }}
                        >
                            <Card
                                sx={{
                                    width: '350px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    flexGrow: 1, // grow to fill grid item height
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                    boxShadow: 1,
                                    transition: 'transform 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: '0 12px 30px rgba(0, 0, 0, 0.15)',
                                    },
                                }}
                            >
                                <CardMedia
                                    component="img"
                                    image={product.image}
                                    alt={product.name}
                                    onError={e => {
                                        e.target.onerror = null;
                                        e.target.src = DEFAULT_IMAGE;
                                    }}
                                    sx={{ height: 180, objectFit: 'cover' }}
                                />

                                <CardContent
                                    sx={{
                                        flexGrow: 1,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            fontWeight: 600,
                                            mb: 1,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                        }}
                                    >
                                        {product.name}
                                    </Typography>
                                    <Typography variant="h5" sx={{ color: '#06C167', fontWeight: 700 }}>
                                        Ghc{product.price}
                                    </Typography>
                                </CardContent>

                                <CardActions sx={{ p: 2, pt: 0 }}>
                                    {!cart[product.id] ? (
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            startIcon={<Add />}
                                            onClick={() => handleAdd(product.id)}
                                            sx={{
                                                backgroundColor: '#06C167',
                                                borderRadius: 2,
                                                fontWeight: 600,
                                                '&:hover': { backgroundColor: '#048A47' },
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
                                                p: 1,
                                            }}
                                        >
                                            <IconButton onClick={() => handleQty(product.id, -1)}>
                                                <Remove />
                                            </IconButton>
                                            <Typography>{cart[product.id]}</Typography>
                                            <IconButton onClick={() => handleQty(product.id, +1)}>
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
                        bottom: 16,
                        right: 16,
                        zIndex: 1000,
                        backgroundColor: '#06C167',
                        color: 'white',
                        px: 3,
                        minWidth: 160,
                        '&:hover': {
                            backgroundColor: '#048A47',
                            transform: 'scale(1.05)'
                        }
                    }}
                    onClick={handleCartClick}
                >
                    <ShoppingCart sx={{ mr: 1 }} />
                    View Cart • Ghc{totalPrice.toFixed(2)}
                </Fab>
            )}
        </Box>
    );
}

export default Shop;
