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
    Alert,
    useMediaQuery,
    useTheme,
    Drawer
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
    Email,
    Menu as MenuIcon,
    Close
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { ACCESS_TOKEN } from '../Constants';
import api from '../api';

function Navbar({ title, showCartButton = false, cartCount = 0, onCartClick }) {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));
    
    const [anchorEl, setAnchorEl] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
        if (isMobile) {
            setMobileMenuOpen(true);
        } else {
            setAnchorEl(event.currentTarget);
        }
    };

    const handleClose = () => {
        setAnchorEl(null);
        setMobileMenuOpen(false);
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

    const UserMenuContent = () => (
        <>
            {isAuthenticated && userInfo ? (
                // Authenticated User Menu
                <Box>
                    {/* User Info Header */}
                    <Box sx={{ 
                        p: { xs: 2, sm: 3 }, 
                        backgroundColor: '#f8f9fa',
                        borderRadius: { xs: 0, sm: '12px 12px 0 0' }
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar
                                sx={{
                                    width: { xs: 40, sm: 48 },
                                    height: { xs: 40, sm: 48 },
                                    backgroundColor: '#06C167',
                                    mr: 2,
                                    fontSize: { xs: '1rem', sm: '1.2rem' },
                                    fontWeight: 700
                                }}
                            >
                                {getInitials(userInfo.first_name, userInfo.last_name)}
                            </Avatar>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography 
                                    variant="h6" 
                                    sx={{ 
                                        fontWeight: 600, 
                                        color: '#2d3748',
                                        fontSize: { xs: '1rem', sm: '1.25rem' },
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
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
                                <Typography 
                                    variant="body2" 
                                    sx={{ 
                                        color: '#718096',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        flex: 1
                                    }}
                                >
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
                                <Typography 
                                    variant="body2" 
                                    sx={{ 
                                        color: '#718096',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        flex: 1
                                    }}
                                >
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
                    <MenuItem onClick={handleProfile} sx={{ py: { xs: 1.5, sm: 1.5 }, px: { xs: 2, sm: 3 } }}>
                        <ListItemIcon>
                            <Settings fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                Edit Profile
                            </Typography>
                        </ListItemText>
                    </MenuItem>

                    <MenuItem onClick={() => navigate('/delivery-status')} sx={{ py: { xs: 1.5, sm: 1.5 }, px: { xs: 2, sm: 3 } }}>
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

                    <MenuItem onClick={handleLogout} sx={{ py: { xs: 1.5, sm: 1.5 }, px: { xs: 2, sm: 3 }, color: '#e53e3e' }}>
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
                <Box sx={{ p: { xs: 2, sm: 3 } }}>
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
        </>
    );

    return (
        <AppBar position="sticky" elevation={0}>
            <Container maxWidth="xl">
                <Toolbar sx={{ 
                    justifyContent: 'space-between', 
                    py: { xs: 0.5, sm: 1 },
                    minHeight: { xs: 56, sm: 64 }
                }}>
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
                        <Home sx={{ 
                            mr: { xs: 0.5, sm: 1 }, 
                            color: '#06C167',
                            fontSize: { xs: 20, sm: 24 }
                        }} />
                        <Typography
                            variant="h6"
                            sx={{ 
                                fontWeight: 700,
                                background: 'linear-gradient(45deg, #06C167, #048A47)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                display: { xs: 'none', sm: 'block' },
                                fontSize: { sm: '1.1rem', md: '1.25rem' }
                            }}
                        >
                            Ashesi Eats
                        </Typography>
                    </Box>

                    {/* Center: Page title - Hidden on mobile */}
                    {title && (
                        <Box sx={{ 
                            position: 'absolute', 
                            left: '50%', 
                            transform: 'translateX(-50%)',
                            display: { xs: 'none', lg: 'block' }
                        }}>
                            <Typography variant="h6" sx={{ 
                                fontWeight: 500,
                                fontSize: { lg: '1.1rem', xl: '1.25rem' }
                            }}>
                                {title}
                            </Typography>
                        </Box>
                    )}

                    {/* Right: Actions */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
                        <IconButton 
                            onClick={handlePersonClick}
                            sx={{ 
                                color: '#2d3748',
                                '&:hover': { backgroundColor: 'rgba(6, 193, 103, 0.1)' },
                                p: { xs: 1, sm: 1.5 }
                            }}
                        >
                            {isAuthenticated && userInfo ? (
                                <Avatar
                                    sx={{
                                        width: { xs: 28, sm: 32 },
                                        height: { xs: 28, sm: 32 },
                                        backgroundColor: '#06C167',
                                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                        fontWeight: 600
                                    }}
                                >
                                    {getInitials(userInfo.first_name, userInfo.last_name)}
                                </Avatar>
                            ) : (
                                <Person sx={{ fontSize: { xs: 20, sm: 24 } }} />
                            )}
                        </IconButton>
                        
                        {showCartButton && (
                            <IconButton 
                                onClick={handleCartClick}
                                sx={{ 
                                    color: '#2d3748',
                                    '&:hover': { backgroundColor: 'rgba(6, 193, 103, 0.1)' },
                                    p: { xs: 1, sm: 1.5 }
                                }}
                            >
                                <Badge 
                                    badgeContent={cartCount} 
                                    color="secondary"
                                    sx={{
                                        '& .MuiBadge-badge': {
                                            backgroundColor: '#06C167',
                                            color: 'white',
                                            fontSize: { xs: '0.6rem', sm: '0.75rem' }
                                        }
                                    }}
                                >
                                    <ShoppingCart sx={{ fontSize: { xs: 20, sm: 24 } }} />
                                </Badge>
                            </IconButton>
                        )}
                    </Box>

                    {/* Desktop Menu */}
                    <Menu
                        anchorEl={anchorEl}
                        open={open && !isMobile}
                        onClose={handleClose}
                        onClick={handleClose}
                        PaperProps={{
                            elevation: 8,
                            sx: {
                                overflow: 'visible',
                                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                                mt: 1.5,
                                minWidth: { sm: 320, md: 360 },
                                maxWidth: 400,
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
                        <UserMenuContent />
                    </Menu>

                    {/* Mobile Drawer */}
                    <Drawer
                        anchor="right"
                        open={mobileMenuOpen}
                        onClose={handleClose}
                        PaperProps={{
                            sx: {
                                width: { xs: '100%', sm: 400 },
                                maxWidth: '100vw'
                            }
                        }}
                    >
                        <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            p: 2,
                            borderBottom: '1px solid #e2e8f0'
                        }}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Account
                            </Typography>
                            <IconButton onClick={handleClose}>
                                <Close />
                            </IconButton>
                        </Box>
                        <UserMenuContent />
                    </Drawer>
                </Toolbar>
            </Container>
        </AppBar>
    );
}

export default Navbar;