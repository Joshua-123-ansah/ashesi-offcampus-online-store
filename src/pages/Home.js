// src/pages/Home.js
import React from 'react';
import {
    Container,
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Fab,
    Tooltip,
    Chip,
    Button
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { TrackChanges, Restaurant, Computer, Store, AccessTime, Star } from '@mui/icons-material';

const shops = [
    {
        id: 'cassa',
        name: 'Cassa Bella Cuisine',
        description: 'Authentic local dishes & international cuisine',
        image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
        rating: 4.8,
        deliveryTime: '20-30 min',
        category: 'Restaurant',
        icon: <Restaurant />,
        available: true
    },
    {
        id: 'tech',
        name: 'Best Tech Point-Ashesi',
        description: 'Electronics, gadgets & tech accessories',
        image: 'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg',
        rating: 4.6,
        deliveryTime: '30-45 min',
        category: 'Electronics',
        icon: <Computer />,
        available: false
    },
    {
        id: 'giyark',
        name: 'Giyark Mini Mart',
        description: 'Groceries, snacks & daily essentials',
        image: 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg',
        rating: 4.5,
        deliveryTime: '15-25 min',
        category: 'Grocery',
        icon: <Store />,
        available: false
    },
];

function Home() {
    const navigate = useNavigate();

    return (
        <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            <Navbar />

            {/* Hero Section */}
            <Box
                sx={{
                    background: 'linear-gradient(135deg, #06C167 0%, #048A47 100%)',
                    color: 'white',
                    py: 8,
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <Container maxWidth="lg">
                    <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
                        <Typography
                            variant="h1"
                            sx={{
                                mb: 2,
                                fontSize: { xs: '2rem', md: '3rem' },
                                fontWeight: 800
                            }}
                        >
                            Food & More, Delivered
                        </Typography>
                        <Typography
                            variant="h5"
                            sx={{
                                mb: 4,
                                opacity: 0.9,
                                fontWeight: 400,
                                fontSize: { xs: '1.1rem', md: '1.3rem' }
                            }}
                        >
                            Get your favorite meals and essentials delivered right to your dorm
                        </Typography>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => navigate('/shop/cassa')}
                            sx={{
                                backgroundColor: 'white',
                                color: '#06C167',
                                px: 4,
                                py: 1.5,
                                fontSize: '1.1rem',
                                fontWeight: 600,
                                '&:hover': {
                                    backgroundColor: '#f8f9fa',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)'
                                }
                            }}
                        >
                            Order Now
                        </Button>
                    </Box>
                </Container>

                {/* Decorative elements */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: -50,
                        right: -50,
                        width: 200,
                        height: 200,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        zIndex: 1
                    }}
                />
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: -30,
                        left: -30,
                        width: 150,
                        height: 150,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        zIndex: 1
                    }}
                />
            </Box>

            {/* Shops Section */}
            <Container maxWidth="lg" sx={{ py: 6 }}>
                <Typography
                    variant="h2"
                    sx={{
                        mb: 1,
                        textAlign: 'center',
                        color: '#2d3748',
                        fontSize: { xs: '1.8rem', md: '2.2rem' }
                    }}
                >
                    Choose Your Store
                </Typography>
                <Typography
                    variant="body1"
                    sx={{
                        mb: 4,
                        textAlign: 'center',
                        color: '#718096',
                        fontSize: '1.1rem'
                    }}
                >
                    Browse from our partner stores on campus
                </Typography>

                <Grid container spacing={3}>
                    {shops.map((shop) => (
                        <Grid item xs={12} md={4} key={shop.id}>
                            <Card
                                sx={{
                                    height: '100%',
                                    cursor: shop.available ? 'pointer' : 'default',
                                    opacity: shop.available ? 1 : 0.6,
                                    position: 'relative',
                                    overflow: 'hidden',
                                    '&:hover': shop.available ? {
                                        transform: 'translateY(-4px)',
                                        boxShadow: '0 12px 30px rgba(0, 0, 0, 0.15)'
                                    } : {}
                                }}
                                onClick={() => shop.available && navigate(`/shop/${shop.id}`)}
                            >
                                <CardMedia
                                    component="img"
                                    height="200"
                                    image={shop.image}
                                    alt={shop.name}
                                    sx={{ objectFit: 'cover' }}
                                />

                                {!shop.available && (
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            top: 16,
                                            right: 16,
                                            backgroundColor: 'rgba(229, 62, 62, 0.9)',
                                            color: 'white',
                                            px: 2,
                                            py: 0.5,
                                            borderRadius: 20,
                                            fontSize: '0.875rem',
                                            fontWeight: 600
                                        }}
                                    >
                                        Coming Soon
                                    </Box>
                                )}

                                <CardContent sx={{ p: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <Box sx={{ color: '#06C167', mr: 1 }}>
                                            {shop.icon}
                                        </Box>
                                        <Chip
                                            label={shop.category}
                                            size="small"
                                            sx={{
                                                backgroundColor: 'rgba(6, 193, 103, 0.1)',
                                                color: '#06C167',
                                                fontWeight: 600
                                            }}
                                        />
                                    </Box>

                                    <Typography
                                        variant="h5"
                                        sx={{
                                            mb: 1,
                                            fontWeight: 600,
                                            color: '#2d3748'
                                        }}
                                    >
                                        {shop.name}
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        sx={{
                                            mb: 2,
                                            color: '#718096',
                                            lineHeight: 1.5
                                        }}
                                    >
                                        {shop.description}
                                    </Typography>

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Star sx={{ color: '#FFD700', fontSize: 18, mr: 0.5 }} />
                                            <Typography variant="body2" sx={{ fontWeight: 600, mr: 2 }}>
                                                {shop.rating}
                                            </Typography>
                                            <AccessTime sx={{ color: '#718096', fontSize: 16, mr: 0.5 }} />
                                            <Typography variant="body2" sx={{ color: '#718096' }}>
                                                {shop.deliveryTime}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>

            {/* Floating Track Order button */}
            <Tooltip title="Track your order" arrow>
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
                        '&:hover': {
                            backgroundColor: '#048A47',
                            transform: 'scale(1.05)'
                        }
                    }}
                    onClick={() => navigate('/delivery-status')}
                >
                    <TrackChanges sx={{ mr: 1 }} />
                    Track Order
                </Fab>
            </Tooltip>
        </div>
    );
}

export default Home;