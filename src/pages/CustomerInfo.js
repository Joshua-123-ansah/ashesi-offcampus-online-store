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
    Slide
} from '@mui/material';
import {
    Edit,
    Person,
    Home as HomeIcon,
    Phone,
    ArrowBack,
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

    // Helper function to create order - REMOVED (will be handled after payment)
    // const createOrder = async () => { ... } - REMOVED

    // 2) Continue with saved info
    const handleContinue = async () => {
        // Just navigate to payment with cart data
        navigate('/payment', { state: { cart } });
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

            // Navigate to payment with cart data (order will be created after payment)
            navigate('/payment', { state: { cart } });
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
                    py: 6,
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <Container maxWidth="lg">
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <IconButton
                            onClick={() => navigate(-1)}
                            sx={{
                                mr: 3,
                                color: 'white',
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.3)' }
                            }}
                        >
                            <ArrowBack />
                        </IconButton>
                        <Box>
                            <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                                Delivery Information
                            </Typography>
                            <Typography variant="h6" sx={{ opacity: 0.9 }}>
                                Confirm your details for a smooth delivery experience
                            </Typography>
                        </Box>
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
            </Box>

            <Container maxWidth="lg" sx={{ py: 6, mt: -4, position: 'relative', zIndex: 2 }}>
                <Fade in timeout={600}>
                    <Paper
                        sx={{
                            borderRadius: 4,
                            backgroundColor: 'white',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Header */}
                        <Box
                            sx={{
                                background: 'linear-gradient(90deg, #f8f9fa 0%, #e9ecef 100%)',
                                p: 4,
                                borderBottom: '1px solid #e2e8f0'
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Avatar
                                        sx={{
                                            width: 56,
                                            height: 56,
                                            backgroundColor: '#06C167',
                                            mr: 3
                                        }}
                                    >
                                        <Person sx={{ fontSize: 28 }} />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#2d3748', mb: 0.5 }}>
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
                                            px: 3,
                                            py: 1.5,
                                            fontWeight: 600,
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
                        <Box sx={{ p: 4 }}>
                            {!editing ? (
                                <Slide direction="right" in={!editing} timeout={400}>
                                    <Stack spacing={4}>
                                        {/* Personal Info Section */}
                                        <Box>
                                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#2d3748' }}>
                                                Personal Information
                                            </Typography>
                                            <Grid container spacing={3}>
                                                <Grid item xs={12} md={6}>
                                                    <Card sx={{ backgroundColor: '#f8f9fa', boxShadow: 'none', border: '1px solid #e2e8f0' }}>
                                                        <CardContent sx={{ p: 3 }}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                                <Person sx={{ color: '#06C167', mr: 2 }} />
                                                                <Typography variant="body2" sx={{ color: '#718096', fontWeight: 600 }}>
                                                                    FULL NAME
                                                                </Typography>
                                                            </Box>
                                                            <Typography variant="h6" sx={{ fontWeight: 600, color: '#2d3748' }}>
                                                                {initialInfo.name}
                                                            </Typography>
                                                        </CardContent>
                                                    </Card>
                                                </Grid>
                                                <Grid item xs={12} md={6}>
                                                    <Card sx={{ backgroundColor: '#f8f9fa', boxShadow: 'none', border: '1px solid #e2e8f0' }}>
                                                        <CardContent sx={{ p: 3 }}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                                <Phone sx={{ color: '#06C167', mr: 2 }} />
                                                                <Typography variant="body2" sx={{ color: '#718096', fontWeight: 600 }}>
                                                                    PHONE NUMBER
                                                                </Typography>
                                                            </Box>
                                                            <Typography variant="h6" sx={{ fontWeight: 600, color: '#2d3748' }}>
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
                                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#2d3748' }}>
                                                Delivery Address
                                            </Typography>
                                            <Card
                                                sx={{
                                                    backgroundColor: '#f0fff4',
                                                    border: '2px solid #06C167',
                                                    boxShadow: 'none'
                                                }}
                                            >
                                                <CardContent sx={{ p: 4 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                                        <LocationOn sx={{ color: '#06C167', mr: 3, mt: 0.5, fontSize: 28 }} />
                                                        <Box sx={{ flexGrow: 1 }}>
                                                            <Typography variant="body2" sx={{ color: '#718096', fontWeight: 600, mb: 1 }}>
                                                                DELIVERY LOCATION
                                                            </Typography>
                                                            <Typography variant="h5" sx={{ fontWeight: 700, color: '#2d3748', mb: 1 }}>
                                                                {initialInfo.hostelOrOffice}
                                                            </Typography>
                                                            <Typography variant="h6" sx={{ color: '#718096' }}>
                                                                Room {initialInfo.roomOrOfficeNumber}
                                                            </Typography>
                                                            <Chip
                                                                label="Primary Address"
                                                                size="small"
                                                                sx={{
                                                                    mt: 2,
                                                                    backgroundColor: '#06C167',
                                                                    color: 'white',
                                                                    fontWeight: 600
                                                                }}
                                                            />
                                                        </Box>
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        </Box>

                                        {/* Continue to Order Button */}
                                        <Box sx={{ pt: 2 }}>
                                            <Button
                                                fullWidth
                                                variant="contained"
                                                size="large"
                                                endIcon={<NavigateNext />}
                                                onClick={handleContinue}
                                                sx={{
                                                    backgroundColor: '#06C167',
                                                    py: 2,
                                                    fontSize: '1.1rem',
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
                                        </Box>
                                    </Stack>
                                </Slide>
                            ) : (
                                <Slide direction="left" in={editing} timeout={400}>
                                    <Stack spacing={4}>
                                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#2d3748' }}>
                                            Update Your Information
                                        </Typography>

                                        <Grid container spacing={3}>
                                            <Grid item xs={12}>
                                                <TextField
                                                    required
                                                    fullWidth
                                                    label="Full Name"
                                                    name="name"
                                                    value={info.name}
                                                    onChange={handleChange}
                                                    slots={{
                                                        startAdornment: () => (
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
                                                    slots={{
                                                        startAdornment: () => (
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
                                                    slots={{
                                                        startAdornment: () => (
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
                                                    slots={{
                                                        startAdornment: () => (
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

                                        <Box sx={{ display: 'flex', gap: 2, pt: 2 }}>
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
            </Container>
        </div>
    );
}

export default CustomerInfo;