// src/pages/Login.js
import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Box, Link } from '@mui/material';
import Navbar from '../components/Navbar';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import api from "../api";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../Constants";

function Login() {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });

    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await api.post('/api/token/', {
                username: formData.username,
                password: formData.password,
            });
            localStorage.setItem(ACCESS_TOKEN, res.data.access);
            localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
            navigate('/customer-info');
        } catch (err) {
            alert(err.response?.data?.detail || err.message);
        } finally {
            setLoading(false);
        }

        console.log('Logging in:', formData.username);
    };

    return (
        <div>
            <Navbar/>
            <Container sx={{ marginTop: 4 }}>
                <Box
                    component="form"
                    onSubmit={handleSubmit}
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        maxWidth: 400,
                        margin: '0 auto',
                    }}
                >
                    <TextField
                        required
                        label="Username"
                        name="username"
                        type="text"
                        value={formData.username}
                        onChange={handleChange}
                    />
                    <TextField
                        required
                        label="Password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                    />
                    <Button
                        variant="contained"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? 'Logging in…' : 'Login'}
                    </Button>
                    <Typography variant="body2" align="center">
                        Don&apos;t have an account?{' '}
                        <Link component={RouterLink} to="/signup" underline="hover">
                            Create one
                        </Link>
                    </Typography>
                    <Typography variant="body2" align="center">
                        Forgotten Password?{' '}
                        <Link component={RouterLink} to="/reset-password" underline="hover">
                            Reset Here
                        </Link>
                    </Typography>
                    <Typography variant="body2" align="center">
                        Go to{' '}
                        <Link component={RouterLink} to="/" underline="hover">
                            Home Page
                        </Link>
                    </Typography>
                </Box>
            </Container>
        </div>
    );
}

export default Login;
