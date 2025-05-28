// src/pages/Home.js
import React from 'react';
import { Container, Box, Button, Fab, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';

const shops = [
    { id: 'cassa', name: 'Cassa Bella Cuisine' },
    { id: 'tech', name: 'Best Tech Point-Ashesi' },
    { id: 'giyark', name: 'Giyark Mini Mart' },
];

function Home() {
    const navigate = useNavigate();

    return (
        <div>
            <Navbar />

            <Container>
                <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    minHeight="80vh"
                    gap={2}
                >
                    {shops.map((shop) => (
                        <Button
                            key={shop.id}
                            variant="contained"
                            size="large"
                            disabled={shop.id !== 'cassa'}
                            onClick={() => navigate(`/shop/${shop.id}`)}
                        >
                            {shop.name}
                        </Button>
                    ))}
                </Box>
            </Container>

            {/* Floating Track Order button with label and tooltip */}
            <Tooltip title="Click to track your order" arrow>
                <Fab
                    variant="extended"
                    color="primary"
                    aria-label="track-order"
                    sx={{
                        position: 'fixed',
                        bottom: 16,
                        right: 16,
                        zIndex: 1000
                    }}
                    onClick={() => navigate('/delivery-status')}
                >
                    <TrackChangesIcon sx={{ mr: 1 }} />
                    Track Order
                </Fab>
            </Tooltip>
        </div>
    );
}

export default Home;
