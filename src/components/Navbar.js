// src/components/Navbar.js
import React from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    Badge,
    IconButton,
    Container
} from '@mui/material';
import { ShoppingCart, Home, Person } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

function Navbar({ title, showCartButton = false, cartCount = 0, onCartClick }) {
    const navigate = useNavigate();

    const goHome = () => navigate('/');
    const handleCartClick = () => onCartClick ? onCartClick() : navigate('/checkout');

    return (
        <AppBar position="sticky" elevation={0}>
            <Container maxWidth="lg">
                <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
                    {/* Left: Brand */}
                    <Box 
                        sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            cursor: 'pointer',
                            '&:hover': { opacity: 0.8 }
                        }}
                        onClick={goHome}
                    >
                        <Home sx={{ mr: 1, color: '#06C167' }} />
                        <Typography
                            variant="h6"
                            sx={{ 
                                fontWeight: 700,
                                background: 'linear-gradient(45deg, #06C167, #048A47)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                display: { xs: 'none', sm: 'block' }
                            }}
                        >
                            Ashesi Eats
                        </Typography>
                    </Box>

                    {/* Center: Page title */}
                    {title && (
                        <Box sx={{ 
                            position: 'absolute', 
                            left: '50%', 
                            transform: 'translateX(-50%)',
                            display: { xs: 'none', md: 'block' }
                        }}>
                            <Typography variant="h6" sx={{ fontWeight: 500 }}>
                                {title}
                            </Typography>
                        </Box>
                    )}

                    {/* Right: Actions */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton 
                            onClick={() => navigate('/login')}
                            sx={{ 
                                color: '#2d3748',
                                '&:hover': { backgroundColor: 'rgba(6, 193, 103, 0.1)' }
                            }}
                        >
                            <Person />
                        </IconButton>
                        
                        {showCartButton && (
                            <IconButton 
                                onClick={handleCartClick}
                                sx={{ 
                                    color: '#2d3748',
                                    '&:hover': { backgroundColor: 'rgba(6, 193, 103, 0.1)' }
                                }}
                            >
                                <Badge 
                                    badgeContent={cartCount} 
                                    color="secondary"
                                    sx={{
                                        '& .MuiBadge-badge': {
                                            backgroundColor: '#06C167',
                                            color: 'white'
                                        }
                                    }}
                                >
                                    <ShoppingCart />
                                </Badge>
                            </IconButton>
                        )}
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
}

export default Navbar;