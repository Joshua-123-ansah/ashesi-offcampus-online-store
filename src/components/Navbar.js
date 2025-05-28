// src/components/Navbar.js
import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function Navbar({ title, showCartButton = false, cartCount = 0, onCartClick }) {
    const navigate = useNavigate();

    const goHome = () => navigate('/');
    const handleCartClick = () =>
        onCartClick ? onCartClick() : navigate('/checkout');

    return (
        <AppBar position="static">
            <Toolbar sx={{ justifyContent: 'space-between' }}>
                {/* Left: Brand */}
                <Typography
                    variant="h6"
                    sx={{ cursor: 'pointer' }}
                    onClick={goHome}
                >
                    Ashesi Off‑campus Online Shop
                </Typography>

                {/* Center: Page title */}
                {title && (
                    <Box sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
                        <Typography variant="subtitle1">
                            {title}
                        </Typography>
                    </Box>
                )}

                {/* Right: Cart button */}
                {showCartButton && (
                    <Button color="inherit" onClick={handleCartClick}>
                        Cart ({cartCount})
                    </Button>
                )}
            </Toolbar>
        </AppBar>
    );
}

export default Navbar;
