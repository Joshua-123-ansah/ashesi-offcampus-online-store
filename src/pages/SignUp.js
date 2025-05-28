// src/pages/SignUp.js
import React, { useState } from 'react';
import {Container, TextField, Button, Typography, Box, Link, Alert} from '@mui/material';
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
            <div>
                <Navbar/>
                <Container sx={{ mt: 4, textAlign: 'center' }}>
                    <Alert severity="success" sx={{ mb: 2 }}>
                        Thanks for signing up!<br />
                        We’ve sent a verification link to <strong>{formData.email}</strong>.<br />
                        Please check your inbox and click that link to activate your account.
                    </Alert>
                    <Typography>
                        Once you’ve verified your email, you can{' '}
                        <Link component={RouterLink} to="/login">
                            log in here
                        </Link>.
                    </Typography>
                </Container>
            </div>
        );
    }

    return (
        <div>
            <Navbar title="Sign Up" />
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
                        label="First Name"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                    />
                    <TextField
                        required
                        label="Last Name"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                    />
                    <TextField
                        required
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
                    />
                    <TextField
                        required
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                    />
                    <TextField
                        required
                        label="Phone Number"
                        name="phone"
                        placeholder="+233 xxx xxx xxx"
                        value={formData.phone}
                        onChange={handleChange}
                    />
                    <TextField
                        required
                        label="Hostel or Office Name"
                        name="hostelOrOfficeName"
                        value={formData.hostelOrOfficeName}
                        onChange={handleChange}
                    />
                    <TextField
                        required
                        label="Room or Office Number"
                        name="roomOrOfficeNumber"
                        value={formData.roomOrOfficeNumber}
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
                    {formData.password && (
                        <Typography variant="body2" sx={{ color: passwordValid ? 'green' : 'red' }}>
                            {passwordValid
                                ? 'Password meets the requirements.'
                                : 'Password must be at least 8 characters and include letters and numbers.'}
                        </Typography>
                    )}
                    <TextField
                        required
                        label="Confirm Password"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        error={!passwordMatch}
                        helperText={!passwordMatch && 'Passwords do not match.'}
                    />
                    <Button variant="contained" type="submit" disabled={isLoading}>
                        {isLoading ? 'Signing up…' : 'Sign Up'}
                    </Button>
                    <Typography variant="body2" align="center">
                        Already have an account?{' '}
                        <Link component={RouterLink} to="/login" underline="hover">
                            Login
                        </Link>
                    </Typography>
                </Box>
            </Container>
        </div>
    );
}

export default SignUp;
