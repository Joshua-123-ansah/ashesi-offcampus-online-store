// src/pages/SignUp.js
import React, { useState } from 'react';
import {
    Container,
    TextField,
    Button,
    Typography,
    Box,
    Link,
    Paper,
    Alert,
    Grid,
    InputAdornment,
    IconButton
} from '@mui/material';
import { Visibility, VisibilityOff, Person, Email, Phone, Home as HomeIcon, Lock } from '@mui/icons-material';
import Navbar from '../components/Navbar';
import { Link as RouterLink } from 'react-router-dom';
import api from '../api';

function SignUp() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        phone: '',
        hostelOrOfficeName: '',
        roomOrOfficeNumber: '',
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [usernameValid, setUsernameValid] = useState(null);
    const [passwordValid, setPasswordValid] = useState(null);
    const [passwordMatch, setPasswordMatch] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState('form');

    const usernameRegex = /^[A-Za-z0-9@.+\-_]{1,150}$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (name === 'username') {
            setUsernameValid(usernameRegex.test(value));
        }
        if (name === 'password') {
            setPasswordValid(passwordRegex.test(value));
            if (formData.confirmPassword) {
                setPasswordMatch(value === formData.confirmPassword);
            }
        }
        if (name === 'confirmPassword') {
            setPasswordMatch(formData.password === value);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (!usernameValid) {
            alert('Username must be 1–150 characters and use only letters, digits, and @ . + - _');
            setIsLoading(false);
            return;
        }
        if (!passwordValid) {
            alert('Password must be at least 8 characters and include letters and numbers.');
            setIsLoading(false);
            return;
        }
        if (!passwordMatch) {
            alert('Passwords do not match.');
            setIsLoading(false);
            return;
        }

        try {
            await api.post('/api/user/register/', {
                first_name: formData.firstName,
                last_name: formData.lastName,
                username: formData.username,
                email: formData.email,
                phone_number: formData.phone,
                hostel_or_office_name: formData.hostelOrOfficeName,
                room_or_office_number: formData.roomOrOfficeNumber,
                password: formData.password,
                confirm_password: formData.confirmPassword,
            });
            setStep('sent');
        } catch (err) {
            alert(err.response?.data || err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (step === 'sent') {
        return (
            <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
                <Navbar />
                <Container maxWidth="sm" sx={{ py: 6 }}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 6,
                            borderRadius: 3,
                            backgroundColor: 'white',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                            textAlign: 'center'
                        }}
                    >
                        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                Account Created Successfully!
                            </Typography>
                            <Typography>
                                We've sent a verification link to <strong>{formData.email}</strong>.
                                Please check your inbox and click the link to activate your account.
                            </Typography>
                        </Alert>
                        
                        <Typography variant="body1" sx={{ mb: 3 }}>
                            Once you've verified your email, you can{' '}
                            <Link
                                component={RouterLink}
                                to="/login"
                                sx={{
                                    color: '#06C167',
                                    fontWeight: 600,
                                    textDecoration: 'none',
                                    '&:hover': { textDecoration: 'underline' }
                                }}
                            >
                                sign in here
                            </Link>
                        </Typography>
                    </Paper>
                </Container>
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            <Navbar />
            
            <Container maxWidth="md" sx={{ py: 6 }}>
                <Paper
                    elevation={0}
                    sx={{
                        p: 6,
                        borderRadius: 3,
                        backgroundColor: 'white',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                    }}
                >
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Typography
                            variant="h3"
                            sx={{
                                fontWeight: 700,
                                color: '#2d3748',
                                mb: 1
                            }}
                        >
                            Create Account
                        </Typography>
                        <Typography
                            variant="body1"
                            sx={{ color: '#718096', fontSize: '1.1rem' }}
                        >
                            Join Ashesi Eats and get your favorite meals delivered
                        </Typography>
                    </Box>

                    <Box component="form" onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            {/* Personal Information */}
                            <Grid item xs={12}>
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#2d3748' }}>
                                    Personal Information
                                </Typography>
                            </Grid>
                            
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    label="First Name"
                                    name="firstName"
                                    value={formData.firstName}
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
                            </Grid>
                            
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    label="Last Name"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            backgroundColor: '#f8f9fa'
                                        }
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    label="Username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    error={usernameValid === false}
                                    helperText={
                                        usernameValid === false
                                            ? '1–150 chars: letters, digits, and @ . + - _ only.'
                                            : ''
                                    }
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            backgroundColor: '#f8f9fa'
                                        }
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    label="Email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Email sx={{ color: '#718096' }} />
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
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    label="Phone Number"
                                    name="phone"
                                    placeholder="+233 xxx xxx xxx"
                                    value={formData.phone}
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
                            </Grid>

                            {/* Address Information */}
                            <Grid item xs={12}>
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#2d3748', mt: 2 }}>
                                    Delivery Address
                                </Typography>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    label="Hostel or Office Name"
                                    name="hostelOrOfficeName"
                                    value={formData.hostelOrOfficeName}
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
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    label="Room or Office Number"
                                    name="roomOrOfficeNumber"
                                    value={formData.roomOrOfficeNumber}
                                    onChange={handleChange}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            backgroundColor: '#f8f9fa'
                                        }
                                    }}
                                />
                            </Grid>

                            {/* Password */}
                            <Grid item xs={12}>
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#2d3748', mt: 2 }}>
                                    Security
                                </Typography>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    label="Password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={handleChange}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Lock sx={{ color: '#718096' }} />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    edge="end"
                                                >
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
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
                                {formData.password && (
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: passwordValid ? '#06C167' : '#e53e3e',
                                            mt: 1,
                                            fontSize: '0.875rem'
                                        }}
                                    >
                                        {passwordValid
                                            ? '✓ Password meets requirements'
                                            : 'Password must be at least 8 characters with letters and numbers'}
                                    </Typography>
                                )}
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    label="Confirm Password"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    error={!passwordMatch}
                                    helperText={!passwordMatch && 'Passwords do not match'}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    edge="end"
                                                >
                                                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
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
                            </Grid>

                            <Grid item xs={12}>
                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    size="large"
                                    disabled={isLoading}
                                    sx={{
                                        backgroundColor: '#06C167',
                                        py: 1.5,
                                        fontSize: '1.1rem',
                                        fontWeight: 600,
                                        borderRadius: 2,
                                        mt: 3,
                                        '&:hover': { backgroundColor: '#048A47' }
                                    }}
                                >
                                    {isLoading ? 'Creating Account…' : 'Create Account'}
                                </Button>
                            </Grid>
                        </Grid>

                        <Box sx={{ textAlign: 'center', mt: 4 }}>
                            <Typography variant="body2" sx={{ color: '#718096' }}>
                                Already have an account?{' '}
                                <Link
                                    component={RouterLink}
                                    to="/login"
                                    sx={{
                                        color: '#06C167',
                                        fontWeight: 600,
                                        textDecoration: 'none',
                                        '&:hover': { textDecoration: 'underline' }
                                    }}
                                >
                                    Sign in
                                </Link>
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
            </Container>
        </div>
    );
}

export default SignUp;