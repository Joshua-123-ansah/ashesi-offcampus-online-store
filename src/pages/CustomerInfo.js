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
    const handleContinue = async () => {
        // Create order in backend before navigating to payment
        try {
            // Prepare itemsPayload
            const itemsPayload = Object.entries(cart).map(([foodId, qty]) => ({
                food_item: Number(foodId),
                quantity: qty
            }));
            // Fetch food items for price lookup
            const foodRes = await api.get('/api/foodItems/');
            const foodMap = {};
            foodRes.data.forEach(item => { foodMap[item.id] = item; });
            const subtotal = itemsPayload.reduce((sum, item) => {
                const food = foodMap[item.food_item];
                return sum + (food ? food.price * item.quantity : 0);
            }, 0);
            const deliveryFee = subtotal > 150 ? 0 : 5;
            // Create order in backend
            const res = await api.post('/api/orders/', { items: itemsPayload });
            const newOrderId = res.data.id;
            const orderTotal = res.data.total_amount || (subtotal + deliveryFee);
            const orderData = {
                orderId: newOrderId,
                subtotal,
                deliveryFee,
                totalAmount: orderTotal
            };
            localStorage.setItem('currentOrder', JSON.stringify(orderData));
            navigate('/payment', { state: { orderData } });
        } catch (err) {
            alert('Failed to create order. Please try again.');
            console.error(err);
        }
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
            // Now create the order as in handleContinue
            // Prepare itemsPayload
            const itemsPayload = Object.entries(cart).map(([foodId, qty]) => ({
                food_item: Number(foodId),
                quantity: qty
            }));
            // Fetch food items for price lookup
            const foodRes = await api.get('/api/foodItems/');
            const foodMap = {};
            foodRes.data.forEach(item => { foodMap[item.id] = item; });
            const subtotal = itemsPayload.reduce((sum, item) => {
                const food = foodMap[item.food_item];
                return sum + (food ? food.price * item.quantity : 0);
            }, 0);
            const deliveryFee = subtotal > 150 ? 0 : 5;
            // Create order in backend
            const res = await api.post('/api/orders/', { items: itemsPayload });
            const newOrderId = res.data.id;
            const orderTotal = res.data.total_amount || (subtotal + deliveryFee);
            const orderData = {
                orderId: newOrderId,
                subtotal,
                deliveryFee,
                totalAmount: orderTotal
            };
            localStorage.setItem('currentOrder', JSON.stringify(orderData));
            navigate('/payment', { state: { orderData } });
        } catch (err) {
            console.error('Error updating profile or creating order:', err);
            alert('Failed to update profile or create order.');
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

            <Container maxWidth="xl" sx={{ py: 6, mt: -4, position: 'relative', zIndex: 2 }}>
                <Grid container spacing={4}>
                    {/* Main Content */}
                    <Grid item xs={12} lg={8}>
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
                    </Grid>

                    {/* Sidebar */}
                    <Grid item xs={12} lg={4}>
                        <Box sx={{ position: 'sticky', top: 100 }}>
                            <Fade in timeout={800}>
                                <Paper
                                    sx={{
                                        borderRadius: 4,
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
                                            p: 4,
                                            textAlign: 'center'
                                        }}
                                    >
                                        <CheckCircle sx={{ fontSize: 48, mb: 2 }} />
                                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                                            Almost Ready!
                                        </Typography>
                                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                            Confirm your details to proceed
                                        </Typography>
                                    </Box>

                                    <Box sx={{ p: 4 }}>
                                        {/* Progress Steps */}
                                        <Stack spacing={3} sx={{ mb: 4 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Box
                                                    sx={{
                                                        width: 32,
                                                        height: 32,
                                                        borderRadius: '50%',
                                                        backgroundColor: '#06C167',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        mr: 3
                                                    }}
                                                >
                                                    <CheckCircle sx={{ color: 'white', fontSize: 20 }} />
                                                </Box>
                                                <Box>
                                                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#2d3748' }}>
                                                        Cart Ready
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ color: '#718096' }}>
                                                        Items selected
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Box
                                                    sx={{
                                                        width: 32,
                                                        height: 32,
                                                        borderRadius: '50%',
                                                        backgroundColor: '#06C167',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        mr: 3
                                                    }}
                                                >
                                                    <Typography sx={{ color: 'white', fontWeight: 700 }}>2</Typography>
                                                </Box>
                                                <Box>
                                                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#2d3748' }}>
                                                        Delivery Info
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ color: '#718096' }}>
                                                        Current step
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Box
                                                    sx={{
                                                        width: 32,
                                                        height: 32,
                                                        borderRadius: '50%',
                                                        backgroundColor: '#e2e8f0',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        mr: 3
                                                    }}
                                                >
                                                    <Typography sx={{ color: '#718096', fontWeight: 700 }}>3</Typography>
                                                </Box>
                                                <Box>
                                                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#a0aec0' }}>
                                                        Place Order
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ color: '#a0aec0' }}>
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
                                        )}

                                        {/* Help Section */}
                                        <Box sx={{ mt: 4, textAlign: 'center' }}>
                                            <Typography variant="body2" sx={{ color: '#718096', mb: 2 }}>
                                                Need help with your delivery?
                                            </Typography>
                                            <Button
                                                variant="text"
                                                size="small"
                                                href="tel:0240235033"
                                                sx={{
                                                    color: '#06C167',
                                                    fontWeight: 600,
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