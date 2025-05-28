// src/pages/Payment.js
import React, { useState } from 'react';
import { Container, Button, Box, TextField, Typography } from '@mui/material';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

function Payment() {
    const navigate = useNavigate();
    const [momo, setMomo] = useState({ showInput: false, number: '' });

    const handleMomoClick = () => setMomo({ ...momo, showInput: true });
    const handleMomoSend = () => {
        if (momo.number) {
            navigate('/delivery-status');
        } else {
            alert('Please enter your mobile money number.');
        }
    };

    return (
        <div>
            <Navbar/>
            <Container sx={{ marginTop: 4 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Button variant="contained" color="secondary" onClick={handleMomoClick}>
                        Pay with momo
                    </Button>
                    {momo.showInput && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TextField
                                label="Mobile Money Number"
                                value={momo.number}
                                onChange={(e) => setMomo({ ...momo, number: e.target.value })}
                            />
                            <Button variant="contained" onClick={handleMomoSend}>
                                Send
                            </Button>
                        </Box>
                    )}
                    <Typography align="center" variant="body1">Or</Typography>
                    <Button variant="contained" color="primary" onClick={() => navigate('/delivery-status')}>
                        Pay with cash
                    </Button>
                </Box>
            </Container>
        </div>
    );
}

export default Payment;
