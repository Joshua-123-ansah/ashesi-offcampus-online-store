// src/pages/Login.js
import React, { useState } from 'react';
import {
    Container,
    TextField,
    Button,
    Typography,
    Box,
    Link,
    Paper,
    InputAdornment,
    IconButton,
    Alert,
    useMediaQuery,
    useTheme
} from '@mui/material';
import { Visibility, VisibilityOff, Person, Lock } from '@mui/icons-material';
import Navbar from '../components/Navbar';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import api from "../api";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../Constants";

function Login() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setError(''); // Clear error when user types
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await api.post('/api/token/', {
                username: formData.username,
                password: formData.password,
            });
            localStorage.setItem(ACCESS_TOKEN, res.data.access);
            localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
            navigate('/customer-info');
        } catch (err) {
            setError(err.response?.data?.detail || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            <Navbar />
            
            <Container 
                maxWidth="sm" 
                sx={{ 
                    py: { xs: 4, sm: 6 },
                    px: { xs: 2, sm: 3 }
                }}
            >
                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 4, sm: 6 },
                        borderRadius: { xs: 2, sm: 3 },
                        backgroundColor: 'white',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                    }}
                >
                    <Box sx={{ textAlign: 'center', mb: { xs: 3, sm: 4 } }}>
                        <Typography
                            variant="h3"
                            sx={{
                                fontWeight: 700,
                                color: '#2d3748',
                                mb: 1,
                                fontSize: { 
                                    xs: '1.75rem', 
                                    sm: '2.25rem', 
                                    md: '2.5rem' 
                                }
                            }}
                        >
                            Welcome Back
                        </Typography>
                        <Typography
                            variant="body1"
                            sx={{ 
                                color: '#718096', 
                                fontSize: { xs: '1rem', sm: '1.1rem' }
                            }}
                        >
                            Sign in to your account to continue
                        </Typography>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Box 
                        component="form" 
                        onSubmit={handleSubmit} 
                        sx={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: { xs: 2.5, sm: 3 }
                        }}
                    >
                        <TextField
                            required
                            fullWidth
                            label="Username"
                            name="username"
                            type="text"
                            value={formData.username}
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
                                    backgroundColor: '#f8f9fa',
                                    fontSize: { xs: '1rem', sm: '1.1rem' }
                                }
                            }}
                        />

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
                                    backgroundColor: '#f8f9fa',
                                    fontSize: { xs: '1rem', sm: '1.1rem' }
                                }
                            }}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={loading}
                            sx={{
                                backgroundColor: '#06C167',
                                py: { xs: 1.2, sm: 1.5 },
                                fontSize: { xs: '1rem', sm: '1.1rem' },
                                fontWeight: 600,
                                borderRadius: 2,
                                mt: { xs: 1, sm: 2 },
                                '&:hover': { backgroundColor: '#048A47' }
                            }}
                        >
                            {loading ? 'Signing in…' : 'Sign In'}
                        </Button>

                        <Box sx={{ textAlign: 'center', mt: { xs: 2, sm: 3 } }}>
                            <Typography 
                                variant="body2" 
                                sx={{ 
                                    color: '#718096', 
                                    mb: 2,
                                    fontSize: { xs: '0.875rem', sm: '1rem' }
                                }}
                            >
                                Don't have an account?{' '}
                                <Link
                                    component={RouterLink}
                                    to="/signup"
                                    sx={{
                                        color: '#06C167',
                                        fontWeight: 600,
                                        textDecoration: 'none',
                                        '&:hover': { textDecoration: 'underline' }
                                    }}
                                >
                                    Create one
                                </Link>
                            </Typography>
                            
                            <Typography 
                                variant="body2" 
                                sx={{ 
                                    color: '#718096', 
                                    mb: 2,
                                    fontSize: { xs: '0.875rem', sm: '1rem' }
                                }}
                            >
                                Forgot your password?{' '}
                                <Link
                                    component={RouterLink}
                                    to="/reset-password"
                                    sx={{
                                        color: '#06C167',
                                        fontWeight: 600,
                                        textDecoration: 'none',
                                        '&:hover': { textDecoration: 'underline' }
                                    }}
                                >
                                    Reset here
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

export default Login;