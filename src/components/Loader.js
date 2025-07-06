// src/components/Loader.js
import React from 'react';
import { CircularProgress, Box, Typography } from '@mui/material';

const Loader = ({ message = "Loading..." }) => (
    <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="300px"
        gap={2}
    >
        <CircularProgress 
            size={50}
            sx={{ color: '#06C167' }}
        />
        <Typography 
            variant="body1" 
            sx={{ 
                color: '#718096',
                fontWeight: 500
            }}
        >
            {message}
        </Typography>
    </Box>
);

export default Loader;