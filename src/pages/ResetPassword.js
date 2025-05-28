import React, { useState } from 'react';
import {
    Container,
    Box,
    TextField,
    Button,
    Alert,
    CircularProgress
} from '@mui/material';
import Navbar from '../components/Navbar';
import api from '../api';

export default function ResetPassword() {
    const [step, setStep]   = useState('email');  // 'email' → 'reset' → 'done'
    const [email, setEmail] = useState('');
    const [newPwd, setNewPwd]   = useState('');
    const [confirmPwd, setConfirmPwd] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState('');
    const [message, setMessage] = useState('');

    // Step 1: check email
    const onEmailSubmit = async (e) => {
        e.preventDefault();
        setError(''); setLoading(true);
        try {
            await api.post('/api/password-reset/', { email });
            setMessage('Email found! Please enter your new password.');
            setStep('reset');
        } catch (err) {
            if (err.response?.status === 400) {

                setError('No account found with that email.');
            } else {
                setError('Error checking email.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Step 2: reset password
    const onResetSubmit = async (e) => {
        e.preventDefault();
        setError(''); setLoading(true);
        try {
            await api.post('/api/password-reset/', {
                email,
                new_password: newPwd,
                confirm_password: confirmPwd
            });
            setMessage('Password reset successful! You may now log in.');
            setStep('done');
        } catch (err) {
            const data = err.response?.data || {};
            let msg = '';
            if (data.detail) msg = data.detail;
            if (data.new_password) msg = data.new_password.join(', ');
            if (data.confirm_password) msg = data.confirm_password.join(', ');
            setError(msg || 'Failed to reset password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Navbar/>
            <Container sx={{ mt: 4, maxWidth: 400, mx: 'auto' }}>
                {/* show errors or info */}
                {error   && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {message && <Alert severity="info" sx={{ mb: 2 }}>{message}</Alert>}

                {/* Step 1: ask for email */}
                {step === 'email' && (
                    <Box component="form" onSubmit={onEmailSubmit} sx={{ display:'flex', flexDirection:'column', gap:2 }}>
                        <TextField
                            required
                            label="Email"
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                        <Button type="submit" variant="contained" disabled={loading}>
                            {loading ? <CircularProgress size={24}/> : 'Verify Email'}
                        </Button>
                    </Box>
                )}

                {/* Step 2: ask for new password */}
                {step === 'reset' && (
                    <Box component="form" onSubmit={onResetSubmit} sx={{ display:'flex', flexDirection:'column', gap:2 }}>
                        <TextField
                            required
                            label="New Password"
                            type="password"
                            value={newPwd}
                            onChange={e => setNewPwd(e.target.value)}
                        />
                        <TextField
                            required
                            label="Confirm Password"
                            type="password"
                            value={confirmPwd}
                            onChange={e => setConfirmPwd(e.target.value)}
                        />
                        <Button type="submit" variant="contained" disabled={loading}>
                            {loading ? <CircularProgress size={24}/> : 'Reset Password'}
                        </Button>
                    </Box>
                )}

                {/* Step 3: done */}
                {step === 'done' && (
                    <Alert severity="success">
                        Your password has been reset!<br/>
                        You can now <a href="/login">log in</a>.
                    </Alert>
                )}
            </Container>
        </div>
    );
}
