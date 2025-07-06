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
    InputAdornment
} from '@mui/material';
import { 
    Edit, 
    Person, 
    Home as HomeIcon, 
    Phone, 
    ArrowBack,
    CheckCircle,
    LocationOn
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
            
            <Container maxWidth="md" sx={{ py: 4 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                    <IconButton 
                        onClick={() => navigate(-1)}
                        sx={{ 
                            mr: 2, 
                            color: '#2d3748',
                            backgroundColor: 'white',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                            '&:hover': { backgroundColor: '#f8f9fa' }
                        }}
                    >
                        <ArrowBack />
                    </IconButton>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#2d3748' }}>
                        Delivery Information
                    </Typography>
                </Box>

                <Grid container spacing={4}>
                    <Grid item xs={12} md={8}>
                        <Paper 
                            sx={{ 
                                p: 4, 
                                borderRadius: 3, 
                                backgroundColor: 'white',
                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
                            }}
                        >
                            {!editing ? (
                                <Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#2d3748' }}>
                                            Your Saved Information
                                        </Typography>
                                        <Button
                                            variant="outlined"
                                            startIcon={<Edit />}
                                            onClick={startEditing}
                                            sx={{
                                                borderColor: '#06C167',
                                                color: '#06C167',
                                                '&:hover': {
                                                    borderColor: '#048A47',
                                                    backgroundColor: 'rgba(6, 193, 103, 0.1)'
                                                }
                                            }}
                                        >
                                            Edit
                                        </Button>
                                    </Box>

                                    <Stack spacing={3}>
                                        <Card sx={{ backgroundColor: '#f8f9fa', boxShadow: 'none' }}>
                                            <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                                                <Person sx={{ color: '#06C167', mr: 2, fontSize: 24 }} />
                                                <Box>
                                                    <Typography variant="body2" sx={{ color: '#718096', mb: 0.5 }}>
                                                        Full Name
                                                    </Typography>
                                                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#2d3748' }}>
                                                        {initialInfo.name}
                                                    </Typography>
                                                </Box>
                                            </CardContent>
                                        </Card>

                                        <Card sx={{ backgroundColor: '#f8f9fa', boxShadow: 'none' }}>
                                            <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                                                <LocationOn sx={{ color: '#06C167', mr: 2, fontSize: 24 }} />
                                                <Box>
                                                    <Typography variant="body2" sx={{ color: '#718096', mb: 0.5 }}>
                                                        Delivery Address
                                                    </Typography>
                                                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#2d3748' }}>
                                                        {initialInfo.hostelOrOffice}, Room {initialInfo.roomOrOfficeNumber}
                                                    </Typography>
                                                </Box>
                                            </CardContent>
                                        </Card>

                                        <Card sx={{ backgroundColor: '#f8f9fa', boxShadow: 'none' }}>
                                            <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                                                <Phone sx={{ color: '#06C167', mr: 2, fontSize: 24 }} />
                                                <Box>
                                                    <Typography variant="body2" sx={{ color: '#718096', mb: 0.5 }}>
                                                        Phone Number
                                                    </Typography>
                                                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#2d3748' }}>
                                                        {initialInfo.mobile}
                                                    </Typography>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Stack>
                                </Box>
                            ) : (
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#2d3748' }}>
                                        Update Your Information
                                    </Typography>
                                    
                                    <Stack spacing={3}>
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
                                                    borderRadius: 2,
                                                    backgroundColor: '#f8f9fa'
                                                }
                                            }}
                                        />
                                        
                                        <TextField
                                            required
                                            fullWidth
                                            label="Hostel Name/Office Name"
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
                                                    borderRadius: 2,
                                                    backgroundColor: '#f8f9fa'
                                                }
                                            }}
                                        />
                                        
                                        <TextField
                                            required
                                            fullWidth
                                            label="Room Number/Office Number"
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
                                                    borderRadius: 2,
                                                    backgroundColor: '#f8f9fa'
                                                }
                                            }}
                                        />
                                        
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
                                                    borderRadius: 2,
                                                    backgroundColor: '#f8f9fa'
                                                }
                                            }}
                                        />
                                    </Stack>

                                    <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                                        <Button
                                            variant="contained"
                                            onClick={handleSave}
                                            sx={{
                                                backgroundColor: '#06C167',
                                                px: 4,
                                                py: 1.5,
                                                fontWeight: 600,
                                                '&:hover': { backgroundColor: '#048A47' }
                                            }}
                                        >
                                            Save & Continue
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            onClick={cancelEditing}
                                            sx={{
                                                borderColor: '#e2e8f0',
                                                color: '#718096',
                                                px: 4,
                                                py: 1.5,
                                                '&:hover': {
                                                    borderColor: '#cbd5e0',
                                                    backgroundColor: '#f8f9fa'
                                                }
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                    </Box>
                                </Box>
                            )}
                        </Paper>
                    </Grid>

                    {/* Summary Card */}
                    <Grid item xs={12} md={4}>
                        <Paper 
                            sx={{ 
                                p: 3, 
                                borderRadius: 3, 
                                backgroundColor: 'white',
                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                                position: 'sticky',
                                top: 100
                            }}
                        >
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#2d3748' }}>
                                Next Step
                            </Typography>
                            
                            <Box sx={{ textAlign: 'center', py: 3 }}>
                                <CheckCircle sx={{ fontSize: 48, color: '#06C167', mb: 2 }} />
                                <Typography variant="body1" sx={{ color: '#718096', mb: 3 }}>
                                    Confirm your delivery information to proceed with your order
                                </Typography>
                                
                                {!editing && (
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        size="large"
                                        onClick={handleContinue}
                                        sx={{
                                            backgroundColor: '#06C167',
                                            py: 1.5,
                                            fontSize: '1.1rem',
                                            fontWeight: 600,
                                            borderRadius: 2,
                                            '&:hover': { backgroundColor: '#048A47' }
                                        }}
                                    >
                                        Continue to Order
                                    </Button>
                                )}
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </div>
    );
}

export default CustomerInfo;