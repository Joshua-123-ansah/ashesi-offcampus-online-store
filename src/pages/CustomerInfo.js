// src/pages/CustomerInfo.js
import React, { useState, useEffect } from 'react';
import { 
    Container, 
    TextField, 
    Button, 
    Box, 
    Typography, 
    Stack,
    Paper,
    Grid,
    Card,
    CardContent,
    Divider,
    IconButton,
    InputAdornment,
    Chip,
    Avatar,
    Fade,
    Slide,
    useMediaQuery,
    useTheme
} from '@mui/material';
import { 
    Edit, 
    Person, 
    Home as HomeIcon, 
    Phone, 
    ArrowBack,
    CheckCircle,
    LocationOn,
    Save,
    Cancel,
    Verified,
    NavigateNext
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api';
import Loader from '../components/Loader';

function CustomerInfo() {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));

    // Try location.state first, then localStorage
    const storedCart = JSON.parse(localStorage.getItem('cart') || 'null');
    const cart = location.state?.cart || storedCart || {};

    const [initialInfo, setInitialInfo] = useState({
        name: '',
        hostelOrOffice: '',
        roomOrOfficeNumber: '',
        mobile: '',
    });
    const [info, setInfo] = useState(initialInfo);
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(true);

    // 1) Fetch profile on mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/api/profile/');
                const data = res.data;
                const mapped = {
                    name: `${data.first_name} ${data.last_name}`,
                    hostelOrOffice: data.hostel_or_office_name,
                    roomOrOfficeNumber: data.room_or_office_number,
                    mobile: data.phone_number,
                };
                setInitialInfo(mapped);
                setInfo(mapped);
            } catch (err) {
                console.error('Error fetching profile:', err);
                alert('Failed to load profile.');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    // form field handler
    const handleChange = (e) => {
        const { name, value } = e.target;
        setInfo((prev) => ({ ...prev, [name]: value }));
    };

    // 2) Continue with saved info
    const handleContinue = () => {
        navigate('/place-order', { state: { cart, info } });
    };

    // 3) Edit flow
    const startEditing = () => {
        setEditing(true);
    };
    const cancelEditing = () => {
        setInfo(initialInfo);
        setEditing(false);
    };

    // 4) Save updates then continue
    const handleSave = async () => {
        // simple completeness check
        if (Object.values(info).some((val) => !val.trim())) {
            alert('Please fill in all fields.');
            return;
        }

        // split full name
        const [firstName, ...rest] = info.name.trim().split(' ');
        const lastName = rest.join(' ') || '';

        const payload = {
            first_name: firstName,
            last_name: lastName,
            hostel_or_office_name: info.hostelOrOffice,
            room_or_office_number: info.roomOrOfficeNumber,
            phone_number: info.mobile,
        };

        setLoading(true);
        try {
            await api.patch('/api/profile/', payload);
            setInitialInfo(info);
            setEditing(false);

            localStorage.setItem('cart', JSON.stringify(cart));
            navigate('/place-order', { state: { cart, info } });
        } catch (err) {
            console.error('Error updating profile:', err);
            alert('Failed to update profile.');
            setLoading(false);
        }
    };

    // show loader while fetching
    if (loading) {
        return (
            <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
                <Navbar/>
                <Container sx={{ mt: 4 }}>
                    <Loader message="Loading your information..." />
                </Container>
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            <Navbar/>
            
            {/* Hero Section */}
            <Box
                sx={{
                    background: 'linear-gradient(135deg, #06C167 0%, #048A47 100%)',
                    color: 'white',
                    py: { xs: 3, sm: 4, md: 6 },
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <Container maxWidth="lg">
                    <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        mb: 2,
                        px: { xs: 2, sm: 0 }
                    }}>
                        <IconButton 
                            onClick={() => navigate(-1)}
                            sx={{ 
                                mr: { xs: 2, sm: 3 }, 
                                color: 'white',
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.3)' },
                                width: { xs: 40, sm: 48 },
                                height: { xs: 40, sm: 48 }
                            }}
                        >
                            <ArrowBack sx={{ fontSize: { xs: 20, sm: 24 } }} />
                        </IconButton>
                        <Box>
                            <Typography 
                                variant="h3" 
                                sx={{ 
                                    fontWeight: 700, 
                                    mb: 1,
                                    fontSize: { 
                                        xs: '1.5rem', 
                                        sm: '2rem', 
                                        md: '2.5rem' 
                                    }
                                }}
                            >
                                Delivery Information
                            </Typography>
                            <Typography 
                                variant="h6" 
                                sx={{ 
                                    opacity: 0.9,
                                    fontSize: { 
                                        xs: '0.9rem', 
                                        sm: '1rem', 
                                        md: '1.25rem' 
                                    }
                                }}
                            >
                                Confirm your details for a smooth delivery experience
                            </Typography>
                        </Box>
                    </Box>
                </Container>
                
                {/* Decorative elements - Hidden on mobile */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: -50,
                        right: -50,
                        width: 200,
                        height: 200,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        zIndex: 1,
                        display: { xs: 'none', md: 'block' }
                    }}
                />
            </Box>

            <Container 
                maxWidth="xl" 
                sx={{ 
                    py: { xs: 3, sm: 4, md: 6 }, 
                    mt: { xs: -2, sm: -3, md: -4 }, 
                    position: 'relative', 
                    zIndex: 2 
                }}
            >
                <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
                    {/* Main Content */}
                    <Grid item xs={12} lg={isMobile ? 12 : 8}>
                        <Fade in timeout={600}>
                            <Paper 
                                sx={{ 
                                    borderRadius: { xs: 3, sm: 4 }, 
                                    backgroundColor: 'white',
                                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                                    overflow: 'hidden'
                                }}
                            >
                                {/* Header */}
                                <Box
                                    sx={{
                                        background: 'linear-gradient(90deg, #f8f9fa 0%, #e9ecef 100%)',
                                        p: { xs: 3, sm: 4 },
                                        borderBottom: '1px solid #e2e8f0'
                                    }}
                                >
                                    <Box sx={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between', 
                                        alignItems: 'center',
                                        flexDirection: { xs: 'column', sm: 'row' },
                                        gap: { xs: 2, sm: 0 }
                                    }}>
                                        <Box sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center',
                                            textAlign: { xs: 'center', sm: 'left' }
                                        }}>
                                            <Avatar
                                                sx={{
                                                    width: { xs: 48, sm: 56 },
                                                    height: { xs: 48, sm: 56 },
                                                    backgroundColor: '#06C167',
                                                    mr: { xs: 2, sm: 3 }
                                                }}
                                            >
                                                <Person sx={{ fontSize: { xs: 24, sm: 28 } }} />
                                            </Avatar>
                                            <Box>
                                                <Typography 
                                                    variant="h5" 
                                                    sx={{ 
                                                        fontWeight: 700, 
                                                        color: '#2d3748', 
                                                        mb: 0.5,
                                                        fontSize: { 
                                                            xs: '1.25rem', 
                                                            sm: '1.5rem' 
                                                        }
                                                    }}
                                                >
                                                    {editing ? 'Update Information' : 'Your Profile'}
                                                </Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <Verified sx={{ color: '#06C167', fontSize: 18, mr: 1 }} />
                                                    <Typography variant="body2" sx={{ color: '#718096' }}>
                                                        Verified Account
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>
                                        
                                        {!editing && (
                                            <Button
                                                variant="outlined"
                                                startIcon={<Edit />}
                                                onClick={startEditing}
                                                sx={{
                                                    borderColor: '#06C167',
                                                    color: '#06C167',
                                                    borderRadius: 3,
                                                    px: { xs: 2, sm: 3 },
                                                    py: { xs: 1, sm: 1.5 },
                                                    fontWeight: 600,
                                                    fontSize: { xs: '0.875rem', sm: '1rem' },
                                                    '&:hover': {
                                                        borderColor: '#048A47',
                                                        backgroundColor: 'rgba(6, 193, 103, 0.1)'
                                                    }
                                                }}
                                            >
                                                Edit Details
                                            </Button>
                                        )}
                                    </Box>
                                </Box>

                                {/* Content */}
                                <Box sx={{ p: { xs: 3, sm: 4 } }}>
                                    {!editing ? (
                                        <Slide direction="right" in={!editing} timeout={400}>
                                            <Stack spacing={{ xs: 3, sm: 4 }}>
                                                {/* Personal Info Section */}
                                                <Box>
                                                    <Typography 
                                                        variant="h6" 
                                                        sx={{ 
                                                            fontWeight: 600, 
                                                            mb: 3, 
                                                            color: '#2d3748',
                                                            fontSize: { xs: '1.1rem', sm: '1.25rem' }
                                                        }}
                                                    >
                                                        Personal Information
                                                    </Typography>
                                                    <Grid container spacing={{ xs: 2, sm: 3 }}>
                                                        <Grid item xs={12} md={6}>
                                                            <Card sx={{ 
                                                                backgroundColor: '#f8f9fa', 
                                                                boxShadow: 'none', 
                                                                border: '1px solid #e2e8f0',
                                                                height: '100%'
                                                            }}>
                                                                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                                        <Person sx={{ color: '#06C167', mr: 2 }} />
                                                                        <Typography 
                                                                            variant="body2" 
                                                                            sx={{ 
                                                                                color: '#718096', 
                                                                                fontWeight: 600,
                                                                                fontSize: { xs: '0.75rem', sm: '0.875rem' }
                                                                            }}
                                                                        >
                                                                            FULL NAME
                                                                        </Typography>
                                                                    </Box>
                                                                    <Typography 
                                                                        variant="h6" 
                                                                        sx={{ 
                                                                            fontWeight: 600, 
                                                                            color: '#2d3748',
                                                                            fontSize: { xs: '1rem', sm: '1.25rem' }
                                                                        }}
                                                                    >
                                                                        {initialInfo.name}
                                                                    </Typography>
                                                                </CardContent>
                                                            </Card>
                                                        </Grid>
                                                        <Grid item xs={12} md={6}>
                                                            <Card sx={{ 
                                                                backgroundColor: '#f8f9fa', 
                                                                boxShadow: 'none', 
                                                                border: '1px solid #e2e8f0',
                                                                height: '100%'
                                                            }}>
                                                                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                                        <Phone sx={{ color: '#06C167', mr: 2 }} />
                                                                        <Typography 
                                                                            variant="body2" 
                                                                            sx={{ 
                                                                                color: '#718096', 
                                                                                fontWeight: 600,
                                                                                fontSize: { xs: '0.75rem', sm: '0.875rem' }
                                                                            }}
                                                                        >
                                                                            PHONE NUMBER
                                                                        </Typography>
                                                                    </Box>
                                                                    <Typography 
                                                                        variant="h6" 
                                                                        sx={{ 
                                                                            fontWeight: 600, 
                                                                            color: '#2d3748',
                                                                            fontSize: { xs: '1rem', sm: '1.25rem' }
                                                                        }}
                                                                    >
                                                                        {initialInfo.mobile}
                                                                    </Typography>
                                                                </CardContent>
                                                            </Card>
                                                        </Grid>
                                                    </Grid>
                                                </Box>

                                                <Divider />

                                                {/* Delivery Address Section */}
                                                <Box>
                                                    <Typography 
                                                        variant="h6" 
                                                        sx={{ 
                                                            fontWeight: 600, 
                                                            mb: 3, 
                                                            color: '#2d3748',
                                                            fontSize: { xs: '1.1rem', sm: '1.25rem' }
                                                        }}
                                                    >
                                                        Delivery Address
                                                    </Typography>
                                                    <Card 
                                                        sx={{ 
                                                            backgroundColor: '#f0fff4', 
                                                            border: '2px solid #06C167',
                                                            boxShadow: 'none'
                                                        }}
                                                    >
                                                        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                                                            <Box sx={{ 
                                                                display: 'flex', 
                                                                alignItems: 'flex-start',
                                                                flexDirection: { xs: 'column', sm: 'row' },
                                                                gap: { xs: 2, sm: 0 }
                                                            }}>
                                                                <LocationOn sx={{ 
                                                                    color: '#06C167', 
                                                                    mr: { xs: 0, sm: 3 }, 
                                                                    mt: 0.5, 
                                                                    fontSize: { xs: 24, sm: 28 }
                                                                }} />
                                                                <Box sx={{ flexGrow: 1 }}>
                                                                    <Typography 
                                                                        variant="body2" 
                                                                        sx={{ 
                                                                            color: '#718096', 
                                                                            fontWeight: 600, 
                                                                            mb: 1,
                                                                            fontSize: { xs: '0.75rem', sm: '0.875rem' }
                                                                        }}
                                                                    >
                                                                        DELIVERY LOCATION
                                                                    </Typography>
                                                                    <Typography 
                                                                        variant="h5" 
                                                                        sx={{ 
                                                                            fontWeight: 700, 
                                                                            color: '#2d3748', 
                                                                            mb: 1,
                                                                            fontSize: { 
                                                                                xs: '1.1rem', 
                                                                                sm: '1.25rem', 
                                                                                md: '1.5rem' 
                                                                            }
                                                                        }}
                                                                    >
                                                                        {initialInfo.hostelOrOffice}
                                                                    </Typography>
                                                                    <Typography 
                                                                        variant="h6" 
                                                                        sx={{ 
                                                                            color: '#718096',
                                                                            fontSize: { xs: '1rem', sm: '1.1rem' }
                                                                        }}
                                                                    >
                                                                        Room {initialInfo.roomOrOfficeNumber}
                                                                    </Typography>
                                                                    <Chip
                                                                        label="Primary Address"
                                                                        size="small"
                                                                        sx={{
                                                                            mt: 2,
                                                                            backgroundColor: '#06C167',
                                                                            color: 'white',
                                                                            fontWeight: 600,
                                                                            fontSize: { xs: '0.7rem', sm: '0.75rem' }
                                                                        }}
                                                                    />
                                                                </Box>
                                                            </Box>
                                                        </CardContent>
                                                    </Card>
                                                </Box>
                                            </Stack>
                                        </Slide>
                                    ) : (
                                        <Slide direction="left" in={editing} timeout={400}>
                                            <Stack spacing={{ xs: 3, sm: 4 }}>
                                                <Typography 
                                                    variant="h6" 
                                                    sx={{ 
                                                        fontWeight: 600, 
                                                        color: '#2d3748',
                                                        fontSize: { xs: '1.1rem', sm: '1.25rem' }
                                                    }}
                                                >
                                                    Update Your Information
                                                </Typography>
                                                
                                                <Grid container spacing={{ xs: 2, sm: 3 }}>
                                                    <Grid item xs={12}>
                                                        <TextField
                                                            required
                                                            fullWidth
                                                            label="Full Name"
                                                            name="name"
                                                            value={info.name}
                                                            onChange={handleChange}
                                                            InputProps={{
                                                                startAdornment: (
                                                                    <InputAdornment position="start">
                                                                        <Person sx={{ color: '#718096' }} />
                                                                    </InputAdornment>
                                                                ),
                                                            }}
                                                            sx={{
                                                                '& .MuiOutlinedInput-root': {
                                                                    borderRadius: 3,
                                                                    backgroundColor: '#f8f9fa',
                                                                    '&:hover fieldset': {
                                                                        borderColor: '#06C167',
                                                                    },
                                                                    '&.Mui-focused fieldset': {
                                                                        borderColor: '#06C167',
                                                                    }
                                                                }
                                                            }}
                                                        />
                                                    </Grid>
                                                    
                                                    <Grid item xs={12} md={6}>
                                                        <TextField
                                                            required
                                                            fullWidth
                                                            label="Hostel/Office Name"
                                                            name="hostelOrOffice"
                                                            value={info.hostelOrOffice}
                                                            onChange={handleChange}
                                                            InputProps={{
                                                                startAdornment: (
                                                                    <InputAdornment position="start">
                                                                        <HomeIcon sx={{ color: '#718096' }} />
                                                                    </InputAdornment>
                                                                ),
                                                            }}
                                                            sx={{
                                                                '& .MuiOutlinedInput-root': {
                                                                    borderRadius: 3,
                                                                    backgroundColor: '#f8f9fa'
                                                                }
                                                            }}
                                                        />
                                                    </Grid>
                                                    
                                                    <Grid item xs={12} md={6}>
                                                        <TextField
                                                            required
                                                            fullWidth
                                                            label="Room/Office Number"
                                                            name="roomOrOfficeNumber"
                                                            value={info.roomOrOfficeNumber}
                                                            onChange={handleChange}
                                                            InputProps={{
                                                                startAdornment: (
                                                                    <InputAdornment position="start">
                                                                        <LocationOn sx={{ color: '#718096' }} />
                                                                    </InputAdornment>
                                                                ),
                                                            }}
                                                            sx={{
                                                                '& .MuiOutlinedInput-root': {
                                                                    borderRadius: 3,
                                                                    backgroundColor: '#f8f9fa'
                                                                }
                                                            }}
                                                        />
                                                    </Grid>
                                                    
                                                    <Grid item xs={12}>
                                                        <TextField
                                                            required
                                                            fullWidth
                                                            label="Mobile Number"
                                                            name="mobile"
                                                            value={info.mobile}
                                                            onChange={handleChange}
                                                            InputProps={{
                                                                startAdornment: (
                                                                    <InputAdornment position="start">
                                                                        <Phone sx={{ color: '#718096' }} />
                                                                    </InputAdornment>
                                                                ),
                                                            }}
                                                            sx={{
                                                                '& .MuiOutlinedInput-root': {
                                                                    borderRadius: 3,
                                                                    backgroundColor: '#f8f9fa'
                                                                }
                                                            }}
                                                        />
                                                    </Grid>
                                                </Grid>

                                                <Box sx={{ 
                                                    display: 'flex', 
                                                    gap: 2, 
                                                    pt: 2,
                                                    flexDirection: { xs: 'column', sm: 'row' }
                                                }}>
                                                    <Button
                                                        variant="contained"
                                                        startIcon={<Save />}
                                                        onClick={handleSave}
                                                        sx={{
                                                            backgroundColor: '#06C167',
                                                            px: 4,
                                                            py: 1.5,
                                                            fontWeight: 600,
                                                            borderRadius: 3,
                                                            '&:hover': { backgroundColor: '#048A47' }
                                                        }}
                                                    >
                                                        Save & Continue
                                                    </Button>
                                                    <Button
                                                        variant="outlined"
                                                        startIcon={<Cancel />}
                                                        onClick={cancelEditing}
                                                        sx={{
                                                            borderColor: '#e2e8f0',
                                                            color: '#718096',
                                                            px: 4,
                                                            py: 1.5,
                                                            borderRadius: 3,
                                                            '&:hover': {
                                                                borderColor: '#cbd5e0',
                                                                backgroundColor: '#f8f9fa'
                                                            }
                                                        }}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </Box>
                                            </Stack>
                                        </Slide>
                                    )}
                                </Box>
                            </Paper>
                        </Fade>
                    </Grid>

                    {/* Sidebar - Stack below on mobile */}
                    <Grid item xs={12} lg={4}>
                        <Box sx={{ 
                            position: { xs: 'static', lg: 'sticky' }, 
                            top: 100,
                            mt: { xs: 2, lg: 0 }
                        }}>
                            <Fade in timeout={800}>
                                <Paper 
                                    sx={{ 
                                        borderRadius: { xs: 3, sm: 4 }, 
                                        backgroundColor: 'white',
                                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                                        overflow: 'hidden'
                                    }}
                                >
                                    {/* Progress Header */}
                                    <Box
                                        sx={{
                                            background: 'linear-gradient(135deg, #06C167 0%, #048A47 100%)',
                                            color: 'white',
                                            p: { xs: 3, sm: 4 },
                                            textAlign: 'center'
                                        }}
                                    >
                                        <CheckCircle sx={{ fontSize: { xs: 40, sm: 48 }, mb: 2 }} />
                                        <Typography 
                                            variant="h6" 
                                            sx={{ 
                                                fontWeight: 700, 
                                                mb: 1,
                                                fontSize: { xs: '1.1rem', sm: '1.25rem' }
                                            }}
                                        >
                                            Almost Ready!
                                        </Typography>
                                        <Typography 
                                            variant="body2" 
                                            sx={{ 
                                                opacity: 0.9,
                                                fontSize: { xs: '0.875rem', sm: '1rem' }
                                            }}
                                        >
                                            Confirm your details to proceed
                                        </Typography>
                                    </Box>

                                    <Box sx={{ p: { xs: 3, sm: 4 } }}>
                                        {/* Progress Steps */}
                                        <Stack spacing={{ xs: 2, sm: 3 }} sx={{ mb: 4 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Box
                                                    sx={{
                                                        width: { xs: 28, sm: 32 },
                                                        height: { xs: 28, sm: 32 },
                                                        borderRadius: '50%',
                                                        backgroundColor: '#06C167',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        mr: { xs: 2, sm: 3 }
                                                    }}
                                                >
                                                    <CheckCircle sx={{ 
                                                        color: 'white', 
                                                        fontSize: { xs: 16, sm: 20 } 
                                                    }} />
                                                </Box>
                                                <Box>
                                                    <Typography 
                                                        variant="body1" 
                                                        sx={{ 
                                                            fontWeight: 600, 
                                                            color: '#2d3748',
                                                            fontSize: { xs: '0.9rem', sm: '1rem' }
                                                        }}
                                                    >
                                                        Cart Ready
                                                    </Typography>
                                                    <Typography 
                                                        variant="body2" 
                                                        sx={{ 
                                                            color: '#718096',
                                                            fontSize: { xs: '0.8rem', sm: '0.875rem' }
                                                        }}
                                                    >
                                                        Items selected
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Box
                                                    sx={{
                                                        width: { xs: 28, sm: 32 },
                                                        height: { xs: 28, sm: 32 },
                                                        borderRadius: '50%',
                                                        backgroundColor: '#06C167',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        mr: { xs: 2, sm: 3 }
                                                    }}
                                                >
                                                    <Typography sx={{ 
                                                        color: 'white', 
                                                        fontWeight: 700,
                                                        fontSize: { xs: '0.875rem', sm: '1rem' }
                                                    }}>
                                                        2
                                                    </Typography>
                                                </Box>
                                                <Box>
                                                    <Typography 
                                                        variant="body1" 
                                                        sx={{ 
                                                            fontWeight: 600, 
                                                            color: '#2d3748',
                                                            fontSize: { xs: '0.9rem', sm: '1rem' }
                                                        }}
                                                    >
                                                        Delivery Info
                                                    </Typography>
                                                    <Typography 
                                                        variant="body2" 
                                                        sx={{ 
                                                            color: '#718096',
                                                            fontSize: { xs: '0.8rem', sm: '0.875rem' }
                                                        }}
                                                    >
                                                        Current step
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Box
                                                    sx={{
                                                        width: { xs: 28, sm: 32 },
                                                        height: { xs: 28, sm: 32 },
                                                        borderRadius: '50%',
                                                        backgroundColor: '#e2e8f0',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        mr: { xs: 2, sm: 3 }
                                                    }}
                                                >
                                                    <Typography sx={{ 
                                                        color: '#718096', 
                                                        fontWeight: 700,
                                                        fontSize: { xs: '0.875rem', sm: '1rem' }
                                                    }}>
                                                        3
                                                    </Typography>
                                                </Box>
                                                <Box>
                                                    <Typography 
                                                        variant="body1" 
                                                        sx={{ 
                                                            fontWeight: 600, 
                                                            color: '#a0aec0',
                                                            fontSize: { xs: '0.9rem', sm: '1rem' }
                                                        }}
                                                    >
                                                        Place Order
                                                    </Typography>
                                                    <Typography 
                                                        variant="body2" 
                                                        sx={{ 
                                                            color: '#a0aec0',
                                                            fontSize: { xs: '0.8rem', sm: '0.875rem' }
                                                        }}
                                                    >
                                                        Final step
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Stack>

                                        <Divider sx={{ my: 3 }} />

                                        {/* Action Button */}
                                        {!editing && (
                                            <Button
                                                fullWidth
                                                variant="contained"
                                                size="large"
                                                endIcon={<NavigateNext />}
                                                onClick={handleContinue}
                                                sx={{
                                                    backgroundColor: '#06C167',
                                                    py: { xs: 1.5, sm: 2 },
                                                    fontSize: { xs: '1rem', sm: '1.1rem' },
                                                    fontWeight: 700,
                                                    borderRadius: 3,
                                                    boxShadow: '0 4px 20px rgba(6, 193, 103, 0.3)',
                                                    '&:hover': { 
                                                        backgroundColor: '#048A47',
                                                        transform: 'translateY(-2px)',
                                                        boxShadow: '0 8px 25px rgba(6, 193, 103, 0.4)'
                                                    }
                                                }}
                                            >
                                                Continue to Order
                                            </Button>
                                        )}

                                        {/* Help Section */}
                                        <Box sx={{ mt: 4, textAlign: 'center' }}>
                                            <Typography 
                                                variant="body2" 
                                                sx={{ 
                                                    color: '#718096', 
                                                    mb: 2,
                                                    fontSize: { xs: '0.875rem', sm: '1rem' }
                                                }}
                                            >
                                                Need help with your delivery?
                                            </Typography>
                                            <Button
                                                variant="text"
                                                size="small"
                                                href="tel:0240235033"
                                                sx={{
                                                    color: '#06C167',
                                                    fontWeight: 600,
                                                    fontSize: { xs: '0.875rem', sm: '1rem' },
                                                    '&:hover': { backgroundColor: 'rgba(6, 193, 103, 0.1)' }
                                                }}
                                            >
                                                Call Support: 0240 235 033
                                            </Button>
                                        </Box>
                                    </Box>
                                </Paper>
                            </Fade>
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </div>
    );
}

export default CustomerInfo;