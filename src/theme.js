// src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#000000',
            light: '#333333',
            dark: '#000000',
            contrastText: '#ffffff'
        },
        secondary: {
            main: '#06C167',
            light: '#4DD889',
            dark: '#048A47',
            contrastText: '#ffffff'
        },
        background: {
            default: '#f8f9fa',
            paper: '#ffffff'
        },
        text: {
            primary: '#2d3748',
            secondary: '#718096'
        },
        error: {
            main: '#e53e3e'
        },
        warning: {
            main: '#ff8c00'
        },
        success: {
            main: '#06C167'
        }
    },
    typography: {
        fontFamily: ['Inter', 'SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'].join(','),
        h1: {
            fontSize: '2.5rem',
            fontWeight: 700,
            lineHeight: 1.2,
        },
        h2: {
            fontSize: '2rem',
            fontWeight: 600,
            lineHeight: 1.3,
        },
        h3: {
            fontSize: '1.5rem',
            fontWeight: 600,
            lineHeight: 1.4,
        },
        h4: {
            fontSize: '1.25rem',
            fontWeight: 600,
            lineHeight: 1.4,
        },
        h5: {
            fontSize: '1.125rem',
            fontWeight: 600,
            lineHeight: 1.4,
        },
        h6: {
            fontSize: '1rem',
            fontWeight: 600,
            lineHeight: 1.4,
        },
        body1: {
            fontSize: '1rem',
            lineHeight: 1.6,
        },
        body2: {
            fontSize: '0.875rem',
            lineHeight: 1.5,
        },
        button: {
            textTransform: 'none',
            fontWeight: 600,
        }
    },
    shape: {
        borderRadius: 12,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    padding: '12px 24px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    boxShadow: 'none',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        transform: 'translateY(-1px)',
                    }
                },
                contained: {
                    '&:hover': {
                        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2)',
                    }
                }
            }
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                        transform: 'translateY(-2px)',
                    }
                }
            }
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 8,
                        '&:hover fieldset': {
                            borderColor: '#06C167',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: '#06C167',
                        }
                    }
                }
            }
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: '#ffffff',
                    color: '#2d3748',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                }
            }
        }
    }
});

export default theme;