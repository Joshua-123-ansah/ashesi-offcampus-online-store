// src/pages/NotFoundPage.js
import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                minHeight: '80vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                p: 2,
            }}
        >
            <Typography variant="h1" gutterBottom>
                404
            </Typography>
            <Typography variant="h5" gutterBottom>
                Page Not Found
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
                Oops! The page you're looking for does not exist.
            </Typography>
            <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/')}
            >
                Go to Homepage
            </Button>
        </Box>
    );
}

export default NotFoundPage;
