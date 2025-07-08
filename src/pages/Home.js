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
    Button,
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
        <Box sx={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            <Navbar />

            {/* Hero Section */}
            <Box
                sx={{
                    background: 'linear-gradient(135deg, #06C167 0%, #048A47 100%)',
                    color: 'white',
                    py: { xs: 4, sm: 6, md: 8 },
                    textAlign: 'center'
                }}
            >
                <Container maxWidth="lg">
                    <Typography
                        variant="h1"
                        sx={{
                            mb: 2,
                            fontSize: {
                                xs: '2rem',
                                sm: '2.5rem',
                                md: '3rem',
                                lg: '3.5rem',
                                xl: '4rem'
                            },
                            fontWeight: 800,
                            lineHeight: 1.2
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
                            fontSize: {
                                xs: '1rem',
                                sm: '1.2rem',
                                md: '1.3rem'
                            },
                            maxWidth: { xs: '100%', sm: '80%', md: '70%' },
                            mx: 'auto',
                            lineHeight: 1.4
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
                            px: { xs: 3, sm: 4, md: 5 },
                            py: { xs: 1.2, sm: 1.5, md: 2 },
                            fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                            fontWeight: 600,
                            borderRadius: { xs: 2, sm: 3 },
                            '&:hover': {
                                backgroundColor: '#f8f9fa',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)'
                            }
                        }}
                    >
                        Order Now
                    </Button>
                </Container>
            </Box>

            {/* Shops Section */}
            <Container maxWidth="lg" sx={{ py: { xs: 4, sm: 6 } }}>
                <Box sx={{ textAlign: 'center', mb: { xs: 3, sm: 4, md: 5 } }}>
                    <Typography
                        variant="h2"
                        sx={{
                            mb: 1,
                            color: '#2d3748',
                            fontSize: {
                                xs: '1.5rem',
                                sm: '1.8rem',
                                md: '2.2rem',
                                lg: '2.5rem'
                            },
                            fontWeight: 700
                        }}
                    >
                        Choose Your Store
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            color: '#718096',
                            fontSize: { xs: '1rem', sm: '1.1rem' },
                            maxWidth: { xs: '100%', sm: '80%', md: '60%' },
                            mx: 'auto'
                        }}
                    >
                        Browse from our partner stores on campus
                    </Typography>
                </Box>

                <Grid container spacing={3} justifyContent="center">
                    {shops.map((shop) => (
                        <Grid item xs={12} sm={6} md={4} key={shop.id} sx={{ display: 'flex' }}>
                            <Card
                                sx={{
                                    width: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    height: '100%',
                                    cursor: shop.available ? 'pointer' : 'default',
                                    opacity: shop.available ? 1 : 0.6,
                                    position: 'relative',
                                    overflow: 'hidden',
                                    borderRadius: 2,
                                    '&:hover': shop.available ? {
                                        transform: 'translateY(-4px)',
                                        boxShadow: '0 12px 30px rgba(0, 0, 0, 0.15)'
                                    } : {}
                                }}
                                onClick={() => shop.available && navigate(`/shop/${shop.id}`)}
                            >
                                <CardMedia
                                    component="img"
                                    image={shop.image}
                                    alt={shop.name}
                                    sx={{
                                        height: 200,
                                        objectFit: 'cover'
                                    }}
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

                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                                        <Box sx={{ color: '#06C167' }}>{shop.icon}</Box>
                                        <Chip
                                            label={shop.category}
                                            size="small"
                                            sx={{
                                                backgroundColor: 'rgba(6, 193, 103, 0.1)',
                                                color: '#06C167',
                                                fontWeight: 600,
                                                fontSize: '0.8rem'
                                            }}
                                        />
                                    </Box>
                                    <Typography
                                        variant="h5"
                                        sx={{
                                            mb: 1,
                                            fontWeight: 600,
                                            color: '#2d3748',
                                            fontSize: '1.25rem',
                                            lineHeight: 1.3
                                        }}
                                    >
                                        {shop.name}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            mb: 2,
                                            color: '#718096',
                                            lineHeight: 1.5,
                                            fontSize: '0.875rem'
                                        }}
                                    >
                                        {shop.description}
                                    </Typography>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Star sx={{ color: '#FFD700', fontSize: 18, mr: 0.5 }} />
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{shop.rating}</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <AccessTime sx={{ color: '#718096', fontSize: 16, mr: 0.5 }} />
                                            <Typography variant="body2" sx={{ color: '#718096' }}>{shop.deliveryTime}</Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>

            {/* Floating Button */}
            <Tooltip title="Track your order" arrow>
                <Fab
                    variant="extended"
                    sx={{
                        position: 'fixed',
                        bottom: { xs: 16, sm: 24 },
                        right: { xs: 16, sm: 24 },
                        zIndex: 1000,
                        backgroundColor: '#06C167',
                        color: 'white',
                        px: 3,
                        fontSize: '1rem',
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
        </Box>
    );
}

export default Home;
