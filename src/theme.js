// src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: { main: '#0D47A1' },      // Rich navy blue
        secondary: { main: '#FF6F00' },      // Vibrant orange accent
        background: { default: '#f4f6f8' },  // Light grey background
    },
    typography: {
        fontFamily: ['Roboto', 'Helvetica', 'Arial', 'sans-serif'].join(','),
    },
});

export default theme;
