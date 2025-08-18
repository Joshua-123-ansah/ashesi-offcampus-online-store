// src/pages/SignUp.js
import React, { useState, useEffect } from 'react';
import {
    Container,
    TextField,
    Button,
    Typography,
    Box,
    Link,
    Paper,
    Alert,
    InputAdornment,
    IconButton,
    useMediaQuery,
    useTheme,
    Divider,
    Stepper,
    Step,
    StepLabel
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    Person,
    Email,
    Phone,
    Home as HomeIcon,
    Lock,
    AccountCircle,
    LocationOn,
    Security
} from '@mui/icons-material';
import Navbar from '../components/Navbar';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import api from '../api';

const steps = ['Personal Info', 'Contact Details', 'Address', 'Security'];

function SignUp() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [searchParams] = useSearchParams();

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

    // Check if user has been verified via URL parameters
    useEffect(() => {
        const verified = searchParams.get('verified');
        if (verified === 'true') {
            setStep('verified');
        }
    }, [searchParams]);

    const usernameRegex = /^[A-Za-z0-9@.+\-_]{1,150}$/;
    // Require at least 8 chars, one lowercase, one uppercase, one number, and one special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>?`~])[A-Za-z\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>?`~]{8,}$/;

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
            alert('Password must be at least 8 characters and include uppercase, lowercase, number, and symbol.');
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
                <Container
                    maxWidth="sm"
                    sx={{
                        py: { xs: 3, sm: 4, md: 6 },
                        px: { xs: 2, sm: 3 }
                    }}
                >
                    <Paper
                        elevation={0}
                        sx={{
                            p: { xs: 3, sm: 4, md: 6 },
                            borderRadius: { xs: 2, sm: 3 },
                            backgroundColor: 'white',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                            textAlign: 'center'
                        }}
                    >
                        <Box sx={{ mb: 3 }}>
                            <AccountCircle
                                sx={{
                                    fontSize: { xs: 60, sm: 80 },
                                    color: '#06C167',
                                    mb: 2
                                }}
                            />
                        </Box>

                        <Alert
                            severity="success"
                            sx={{
                                mb: 3,
                                borderRadius: 2,
                                backgroundColor: '#f0fff4',
                                border: '1px solid #06C167'
                            }}
                        >
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 600,
                                    mb: 1,
                                    fontSize: { xs: '1.1rem', sm: '1.25rem' }
                                }}
                            >
                                Account Created Successfully!
                            </Typography>
                            <Typography sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                                We've sent a verification link to <strong>{formData.email}</strong>.
                                Please check your inbox and click the link to activate your account.
                            </Typography>
                        </Alert>

                        <Typography
                            variant="body1"
                            sx={{
                                mb: 3,
                                fontSize: { xs: '0.9rem', sm: '1rem' },
                                color: '#718096'
                            }}
                        >
                            Once you've verified your email, you can{' '}
                            <Link
                                component={RouterLink}
                                to="/login"
                                state={{ isNewUser: true }}
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

                        <Button
                            variant="contained"
                            component={RouterLink}
                            to="/login"
                            state={{ isNewUser: true }}
                            sx={{
                                backgroundColor: '#06C167',
                                px: { xs: 3, sm: 4 },
                                py: { xs: 1.2, sm: 1.5 },
                                fontSize: { xs: '1rem', sm: '1.1rem' },
                                fontWeight: 600,
                                borderRadius: 2,
                                '&:hover': { backgroundColor: '#048A47' }
                            }}
                        >
                            Go to Sign In
                        </Button>
                    </Paper>
                </Container>
            </div>
        );
    }

    if (step === 'verified') {
        return (
            <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
                <Navbar />
                <Container
                    maxWidth="sm"
                    sx={{
                        py: { xs: 3, sm: 4, md: 6 },
                        px: { xs: 2, sm: 3 }
                    }}
                >
                    <Paper
                        elevation={0}
                        sx={{
                            p: { xs: 3, sm: 4, md: 6 },
                            borderRadius: { xs: 2, sm: 3 },
                            backgroundColor: 'white',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                            textAlign: 'center'
                        }}
                    >
                        <Box sx={{ mb: 3 }}>
                            <AccountCircle
                                sx={{
                                    fontSize: { xs: 60, sm: 80 },
                                    color: '#06C167',
                                    mb: 2
                                }}
                            />
                        </Box>

                        <Alert
                            severity="success"
                            sx={{
                                mb: 3,
                                borderRadius: 2,
                                backgroundColor: '#f0fff4',
                                border: '1px solid #06C167'
                            }}
                        >
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 600,
                                    mb: 1,
                                    fontSize: { xs: '1.1rem', sm: '1.25rem' }
                                }}
                            >
                                Email Verified Successfully!
                            </Typography>
                            <Typography sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                                Your account has been activated. You can now sign in to start using our services.
                            </Typography>
                        </Alert>

                        <Typography
                            variant="body1"
                            sx={{
                                mb: 3,
                                fontSize: { xs: '0.9rem', sm: '1rem' },
                                color: '#718096'
                            }}
                        >
                            Welcome to Ashesi Online Market Place! You can now{' '}
                            <Link
                                component={RouterLink}
                                to="/login"
                                state={{ isNewUser: true }}
                                sx={{
                                    color: '#06C167',
                                    fontWeight: 600,
                                    textDecoration: 'none',
                                    '&:hover': { textDecoration: 'underline' }
                                }}
                            >
                                sign in to your account
                            </Link>
                            {' '}and start shopping.
                        </Typography>

                        <Button
                            variant="contained"
                            component={RouterLink}
                            to="/login"
                            state={{ isNewUser: true }}
                            sx={{
                                backgroundColor: '#06C167',
                                px: { xs: 3, sm: 4 },
                                py: { xs: 1.2, sm: 1.5 },
                                fontSize: { xs: '1rem', sm: '1.1rem' },
                                fontWeight: 600,
                                borderRadius: 2,
                                '&:hover': { backgroundColor: '#048A47' }
                            }}
                        >
                            Sign In Now
                        </Button>
                    </Paper>
                </Container>
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            <Navbar />

            <Container
                maxWidth="sm"
                sx={{
                    py: { xs: 3, sm: 4, md: 6 },
                    px: { xs: 2, sm: 3 }
                }}
            >
                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 3, sm: 4, md: 6 },
                        borderRadius: { xs: 2, sm: 3 },
                        backgroundColor: 'white',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                    }}
                >
                    {/* Header */}
                    <Box sx={{ textAlign: 'center', mb: { xs: 3, sm: 4 } }}>
                        <AccountCircle
                            sx={{
                                fontSize: { xs: 50, sm: 60 },
                                color: '#06C167',
                                mb: 2
                            }}
                        />
                        <Typography
                            variant="h3"
                            sx={{
                                fontWeight: 700,
                                color: '#2d3748',
                                mb: 1,
                                fontSize: {
                                    xs: '1.75rem',
                                    sm: '2rem',
                                    md: '2.25rem'
                                }
                            }}
                        >
                            Create Account
                        </Typography>
                        <Typography
                            variant="body1"
                            sx={{
                                color: '#718096',
                                fontSize: { xs: '1rem', sm: '1.1rem' },
                                maxWidth: '400px',
                                mx: 'auto'
                            }}
                        >
                            Join Ashesi Online Market Place and get your favorite items delivered to your dorm
                        </Typography>
                    </Box>

                    {/* Progress Stepper - Hidden on mobile */}
                    {!isMobile && (
                        <Box sx={{ mb: 4 }}>
                            <Stepper
                                activeStep={-1}
                                alternativeLabel
                                sx={{
                                    '& .MuiStepLabel-label': {
                                        fontSize: '0.875rem',
                                        color: '#718096'
                                    }
                                }}
                            >
                                {steps.map((label) => (
                                    <Step key={label}>
                                        <StepLabel>{label}</StepLabel>
                                    </Step>
                                ))}
                            </Stepper>
                        </Box>
                    )}

                    <Box component="form" onSubmit={handleSubmit}>
                        {/* Personal Information Section */}
                        <Box sx={{ mb: { xs: 3, sm: 4 } }}>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                mb: { xs: 2, sm: 3 }
                            }}>
                                <Person sx={{ color: '#06C167', mr: 1 }} />
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: 600,
                                        color: '#2d3748',
                                        fontSize: { xs: '1.1rem', sm: '1.25rem' }
                                    }}
                                >
                                    Personal Information
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, sm: 2.5 } }}>
                                <TextField
                                    required
                                    fullWidth
                                    label="First Name"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    placeholder="Enter your first name"
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            backgroundColor: '#f8f9fa',
                                            fontSize: { xs: '1rem', sm: '1.1rem' },
                                            height: { xs: 48, sm: 56 }
                                        }
                                    }}
                                />

                                <TextField
                                    required
                                    fullWidth
                                    label="Last Name"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    placeholder="Enter your last name"
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            backgroundColor: '#f8f9fa',
                                            fontSize: { xs: '1rem', sm: '1.1rem' },
                                            height: { xs: 48, sm: 56 }
                                        }
                                    }}
                                />

                                <TextField
                                    required
                                    fullWidth
                                    label="Username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="Choose a unique username"
                                    error={usernameValid === false}
                                    helperText={
                                        usernameValid === false
                                            ? '1–150 characters: letters, digits, and @ . + - _ only'
                                            : 'This will be used to sign in to your account'
                                    }
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            backgroundColor: '#f8f9fa',
                                            fontSize: { xs: '1rem', sm: '1.1rem' },
                                            height: { xs: 48, sm: 56 }
                                        }
                                    }}
                                />
                            </Box>
                        </Box>

                        <Divider sx={{ my: { xs: 3, sm: 4 } }} />

                        {/* Contact Information Section */}
                        <Box sx={{ mb: { xs: 3, sm: 4 } }}>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                mb: { xs: 2, sm: 3 }
                            }}>
                                <Email sx={{ color: '#06C167', mr: 1 }} />
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: 600,
                                        color: '#2d3748',
                                        fontSize: { xs: '1.1rem', sm: '1.25rem' }
                                    }}
                                >
                                    Contact Details
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, sm: 2.5 } }}>
                                <TextField
                                    required
                                    fullWidth
                                    label="Email Address"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="your.email@ashesi.edu.gh"
                                    slots={{
                                        startAdornment: () => (
                                            <InputAdornment position="start">
                                                <Email sx={{ color: '#718096' }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            backgroundColor: '#f8f9fa',
                                            fontSize: { xs: '1rem', sm: '1.1rem' },
                                            height: { xs: 48, sm: 56 }
                                        }
                                    }}
                                />

                                <TextField
                                    required
                                    fullWidth
                                    label="Phone Number"
                                    name="phone"
                                    placeholder="+233 xxx xxx xxx"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    slots={{
                                        startAdornment: () => (
                                            <InputAdornment position="start">
                                                <Phone sx={{ color: '#718096' }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                    helperText="We'll use this to contact you about your orders"
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            backgroundColor: '#f8f9fa',
                                            fontSize: { xs: '1rem', sm: '1.1rem' },
                                            height: { xs: 48, sm: 56 }
                                        }
                                    }}
                                />
                            </Box>
                        </Box>

                        <Divider sx={{ my: { xs: 3, sm: 4 } }} />

                        {/* Address Information Section */}
                        <Box sx={{ mb: { xs: 3, sm: 4 } }}>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                mb: { xs: 2, sm: 3 }
                            }}>
                                <LocationOn sx={{ color: '#06C167', mr: 1 }} />
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: 600,
                                        color: '#2d3748',
                                        fontSize: { xs: '1.1rem', sm: '1.25rem' }
                                    }}
                                >
                                    Delivery Address
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, sm: 2.5 } }}>
                                <TextField
                                    required
                                    fullWidth
                                    label="Hostel or Office Name"
                                    name="hostelOrOfficeName"
                                    value={formData.hostelOrOfficeName}
                                    onChange={handleChange}
                                    placeholder="e.g., New Dorm, Admin Block"
                                    slots={{
                                        startAdornment: () => (
                                            <InputAdornment position="start">
                                                <HomeIcon sx={{ color: '#718096' }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            backgroundColor: '#f8f9fa',
                                            fontSize: { xs: '1rem', sm: '1.1rem' },
                                            height: { xs: 48, sm: 56 }
                                        }
                                    }}
                                />

                                <TextField
                                    required
                                    fullWidth
                                    label="Room or Office Number"
                                    name="roomOrOfficeNumber"
                                    value={formData.roomOrOfficeNumber}
                                    onChange={handleChange}
                                    placeholder="e.g., Room 205, Office 3B"
                                    helperText="This helps our delivery team find you quickly"
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            backgroundColor: '#f8f9fa',
                                            fontSize: { xs: '1rem', sm: '1.1rem' },
                                            height: { xs: 48, sm: 56 }
                                        }
                                    }}
                                />
                            </Box>
                        </Box>

                        <Divider sx={{ my: { xs: 3, sm: 4 } }} />

                        {/* Security Section */}
                        <Box sx={{ mb: { xs: 3, sm: 4 } }}>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                mb: { xs: 2, sm: 3 }
                            }}>
                                <Security sx={{ color: '#06C167', mr: 1 }} />
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: 600,
                                        color: '#2d3748',
                                        fontSize: { xs: '1.1rem', sm: '1.25rem' }
                                    }}
                                >
                                    Account Security
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, sm: 2.5 } }}>
                                <TextField
                                    required
                                    fullWidth
                                    label="Password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Create a strong password"
                                    slots={{
                                        startAdornment: () => (
                                            <InputAdornment position="start">
                                                <Lock sx={{ color: '#718096' }} />
                                            </InputAdornment>
                                        ),
                                        endAdornment: () => (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    edge="end"
                                                    sx={{ color: '#718096' }}
                                                >
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            backgroundColor: '#f8f9fa',
                                            fontSize: { xs: '1rem', sm: '1.1rem' },
                                            height: { xs: 48, sm: 56 }
                                        }
                                    }}
                                />

                                {formData.password && (
                                    <Alert
                                        severity={passwordValid ? "success" : "warning"}
                                        sx={{
                                            borderRadius: 2,
                                            fontSize: { xs: '0.8rem', sm: '0.875rem' }
                                        }}
                                    >
                                        {passwordValid
                                            ? '✓ Password meets security requirements'
                                            : 'Password must be at least 8 characters and include uppercase, lowercase, number, and symbol'}
                                    </Alert>
                                )}

                                <TextField
                                    required
                                    fullWidth
                                    label="Confirm Password"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Re-enter your password"
                                    error={!passwordMatch && formData.confirmPassword.length > 0}
                                    helperText={
                                        !passwordMatch && formData.confirmPassword.length > 0
                                            ? 'Passwords do not match'
                                            : ''
                                    }
                                    slots={{
                                        endAdornment: () => (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    edge="end"
                                                    sx={{ color: '#718096' }}
                                                >
                                                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            backgroundColor: '#f8f9fa',
                                            fontSize: { xs: '1rem', sm: '1.1rem' },
                                            height: { xs: 48, sm: 56 }
                                        }
                                    }}
                                />
                            </Box>
                        </Box>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={isLoading}
                            sx={{
                                backgroundColor: '#06C167',
                                py: { xs: 1.5, sm: 2 },
                                fontSize: { xs: '1rem', sm: '1.1rem' },
                                fontWeight: 600,
                                borderRadius: 2,
                                mb: { xs: 3, sm: 4 },
                                height: { xs: 48, sm: 56 },
                                '&:hover': {
                                    backgroundColor: '#048A47',
                                    transform: 'translateY(-1px)',
                                    boxShadow: '0 6px 20px rgba(6, 193, 103, 0.3)'
                                },
                                '&:disabled': {
                                    backgroundColor: '#a0aec0'
                                }
                            }}
                        >
                            {isLoading ? 'Creating Account…' : 'Create Account'}
                        </Button>

                        {/* Footer Links */}
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: '#718096',
                                    fontSize: { xs: '0.875rem', sm: '1rem' },
                                    mb: 2
                                }}
                            >
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
                                    Sign in here
                                </Link>
                            </Typography>

                            <Link
                                component={RouterLink}
                                to="/"
                                sx={{
                                    color: '#718096',
                                    textDecoration: 'none',
                                    fontSize: { xs: '0.875rem', sm: '1rem' },
                                    '&:hover': { color: '#06C167' }
                                }}
                            >
                                ← Back to Home
                            </Link>
                        </Box>
                    </Box>
                </Paper>
            </Container>
        </div>
    );
}

export default SignUp;