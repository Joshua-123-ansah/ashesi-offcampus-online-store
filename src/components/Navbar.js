// src/components/Navbar.js
import React, { useState, useEffect } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    Badge,
    IconButton,
    Container,
    Menu,
    MenuItem,
    Avatar,
    Divider,
    ListItemIcon,
    ListItemText,
    Paper,
    Chip,
    Alert
} from '@mui/material';
import { 
    ShoppingCart, 
    Home, 
    Person, 
    Logout, 
    Settings, 
    AccountCircle,
    Login,
    PersonAdd,
    Phone,
    LocationOn,
    Email
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { ACCESS_TOKEN } from '../Constants';
import api from '../api';

function Navbar({ title, showCartButton = false, cartCount = 0, onCartClick }) {
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(false);

    const open = Boolean(anchorEl);

    // Check authentication status on component mount
    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (!token) {
            setIsAuthenticated(false);
            setUserInfo(null);
            return;
        }

        try {
            const decoded = jwtDecode(token);
            const tokenExpiration = decoded.exp;
            const now = Date.now() / 1000;

            if (tokenExpiration < now) {
                // Token expired
                setIsAuthenticated(false);
                setUserInfo(null);
                localStorage.removeItem(ACCESS_TOKEN);
                return;
            }

            setIsAuthenticated(true);
            // Fetch user profile if authenticated
            await fetchUserProfile();
        } catch (error) {
            console.error('Error checking auth status:', error);
            setIsAuthenticated(false);
            setUserInfo(null);
        }
    };

    const fetchUserProfile = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/profile/');
            setUserInfo(response.data);
        } catch (error) {
            console.error('Error fetching user profile:', error);
            // If profile fetch fails, user might not be properly authenticated
            setIsAuthenticated(false);
            setUserInfo(null);
        } finally {
            setLoading(false);
        }
    };

    const handlePersonClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        localStorage.removeItem(ACCESS_TOKEN);
        localStorage.removeItem('refresh');
        localStorage.removeItem('cart');
        localStorage.removeItem('lastOrderId');
        setIsAuthenticated(false);
        setUserInfo(null);
        handleClose();
        navigate('/');
    };

    const handleLogin = () => {
        handleClose();
        navigate('/login');
    };

    const handleSignUp = () => {
        handleClose();
        navigate('/signup');
    };

    const handleProfile = () => {
        handleClose();
        navigate('/customer-info');
    };

    const goHome = () => navigate('/');
    const handleCartClick = () => onCartClick ? onCartClick() : navigate('/checkout');

    const getInitials = (firstName, lastName) => {
        return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
    };

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
                            onClick={handlePersonClick}
                            sx={{ 
                                color: '#2d3748',
                                '&:hover': { backgroundColor: 'rgba(6, 193, 103, 0.1)' }
                            }}
                        >
                            {isAuthenticated && userInfo ? (
                                <Avatar
                                    sx={{
                                        width: 32,
                                        height: 32,
                                        backgroundColor: '#06C167',
                                        fontSize: '0.875rem',
                                        fontWeight: 600
                                    }}
                                >
                                    {getInitials(userInfo.first_name, userInfo.last_name)}
                                </Avatar>
                            ) : (
                                <Person />
                            )}
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

                    {/* User Menu */}
                    <Menu
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                        onClick={handleClose}
                        PaperProps={{
                            elevation: 8,
                            sx: {
                                overflow: 'visible',
                                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                                mt: 1.5,
                                minWidth: 320,
                                borderRadius: 3,
                                '&:before': {
                                    content: '""',
                                    display: 'block',
                                    position: 'absolute',
                                    top: 0,
                                    right: 14,
                                    width: 10,
                                    height: 10,
                                    bgcolor: 'background.paper',
                                    transform: 'translateY(-50%) rotate(45deg)',
                                    zIndex: 0,
                                },
                            },
                        }}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    >
                        {isAuthenticated && userInfo ? (
                            // Authenticated User Menu
                            <Box>
                                {/* User Info Header */}
                                <Box sx={{ p: 3, backgroundColor: '#f8f9fa' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <Avatar
                                            sx={{
                                                width: 48,
                                                height: 48,
                                                backgroundColor: '#06C167',
                                                mr: 2,
                                                fontSize: '1.2rem',
                                                fontWeight: 700
                                            }}
                                        >
                                            {getInitials(userInfo.first_name, userInfo.last_name)}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="h6" sx={{ fontWeight: 600, color: '#2d3748' }}>
                                                {userInfo.first_name} {userInfo.last_name}
                                            </Typography>
                                            <Chip
                                                label="Verified"
                                                size="small"
                                                sx={{
                                                    backgroundColor: '#06C167',
                                                    color: 'white',
                                                    fontSize: '0.75rem',
                                                    height: 20
                                                }}
                                            />
                                        </Box>
                                    </Box>
                                    
                                    {/* Contact Info */}
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Email sx={{ fontSize: 16, color: '#718096', mr: 1 }} />
                                            <Typography variant="body2" sx={{ color: '#718096' }}>
                                                {userInfo.email || 'No email provided'}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Phone sx={{ fontSize: 16, color: '#718096', mr: 1 }} />
                                            <Typography variant="body2" sx={{ color: '#718096' }}>
                                                {userInfo.phone_number || 'No phone provided'}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <LocationOn sx={{ fontSize: 16, color: '#718096', mr: 1 }} />
                                            <Typography variant="body2" sx={{ color: '#718096' }}>
                                                {userInfo.hostel_or_office_name ? 
                                                    `${userInfo.hostel_or_office_name}, Room ${userInfo.room_or_office_number}` : 
                                                    'No address provided'
                                                }
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>

                                <Divider />

                                {/* Menu Items */}
                                <MenuItem onClick={handleProfile} sx={{ py: 1.5 }}>
                                    <ListItemIcon>
                                        <Settings fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText>
                                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                            Edit Profile
                                        </Typography>
                                    </ListItemText>
                                </MenuItem>

                                <MenuItem onClick={() => navigate('/delivery-status')} sx={{ py: 1.5 }}>
                                    <ListItemIcon>
                                        <ShoppingCart fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText>
                                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                            Track Orders
                                        </Typography>
                                    </ListItemText>
                                </MenuItem>

                                <Divider />

                                <MenuItem onClick={handleLogout} sx={{ py: 1.5, color: '#e53e3e' }}>
                                    <ListItemIcon>
                                        <Logout fontSize="small" sx={{ color: '#e53e3e' }} />
                                    </ListItemIcon>
                                    <ListItemText>
                                        <Typography variant="body1" sx={{ fontWeight: 500, color: '#e53e3e' }}>
                                            Sign Out
                                        </Typography>
                                    </ListItemText>
                                </MenuItem>
                            </Box>
                        ) : (
                            // Not Authenticated Menu
                            <Box sx={{ p: 3 }}>
                                <Alert 
                                    severity="info" 
                                    sx={{ 
                                        mb: 3, 
                                        borderRadius: 2,
                                        backgroundColor: '#f0f9ff',
                                        border: '1px solid #06C167'
                                    }}
                                >
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        You're not signed in
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#718096', mt: 0.5 }}>
                                        Sign in to track orders and save your preferences
                                    </Typography>
                                </Alert>

                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        startIcon={<Login />}
                                        onClick={handleLogin}
                                        sx={{
                                            backgroundColor: '#06C167',
                                            py: 1.5,
                                            fontWeight: 600,
                                            borderRadius: 2,
                                            '&:hover': { backgroundColor: '#048A47' }
                                        }}
                                    >
                                        Sign In
                                    </Button>
                                    
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        startIcon={<PersonAdd />}
                                        onClick={handleSignUp}
                                        sx={{
                                            borderColor: '#06C167',
                                            color: '#06C167',
                                            py: 1.5,
                                            fontWeight: 600,
                                            borderRadius: 2,
                                            '&:hover': {
                                                borderColor: '#048A47',
                                                backgroundColor: 'rgba(6, 193, 103, 0.1)'
                                            }
                                        }}
                                    >
                                        Create Account
                                    </Button>
                                </Box>

                                <Divider sx={{ my: 2 }} />

                                <Typography variant="body2" sx={{ color: '#718096', textAlign: 'center' }}>
                                    Continue as guest to browse and order
                                </Typography>
                            </Box>
                        )}
                    </Menu>
                </Toolbar>
            </Container>
        </AppBar>
    );
}

export default Navbar;