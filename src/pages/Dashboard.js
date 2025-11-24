import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Container,
    Grid,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from '@mui/material';
import { TrendingUp, ShoppingBag, Paid, Restaurant } from '@mui/icons-material';
import Navbar from '../components/Navbar';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const toCurrency = (value) => {
    if (value === null || value === undefined) return 'GHS 0.00';
    const numeric = Number(value);
    if (Number.isNaN(numeric)) {
        return `GHS ${value}`;
    }
    return `GHS ${numeric.toFixed(2)}`;
};

const todayString = () => new Date().toISOString().split('T')[0];

function Dashboard() {
    const navigate = useNavigate();
    const [filters, setFilters] = useState(() => ({
        startDate: todayString(),
        endDate: todayString(),
    }));
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleDateChange = (field) => (event) => {
        const value = event.target.value;
        setFilters((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const fetchSummary = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const params = {};
            if (filters.startDate) params.start_date = filters.startDate;
            if (filters.endDate) params.end_date = filters.endDate;

            const response = await api.get('/api/dashboard/summary/', { params });
            setSummary(response.data);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to load dashboard data.');
        } finally {
            setLoading(false);
        }
    }, [filters.startDate, filters.endDate]);

    useEffect(() => {
        fetchSummary().catch(() => setError('Failed to load dashboard data.'));
    }, [fetchSummary]);

    const metrics = useMemo(() => [
        {
            label: 'Total Sales',
            value: toCurrency(summary?.total_sales),
            icon: Paid,
            iconColor: '#06C167',
        },
        {
            label: 'Total Orders',
            value: summary?.total_orders ?? 0,
            icon: ShoppingBag,
            iconColor: '#3182CE',
        },
        {
            label: 'Average Order Value',
            value: toCurrency(summary?.average_order_value),
            icon: TrendingUp,
            iconColor: '#D69E2E',
        },
        {
            label: 'Best Seller',
            value: summary?.top_items?.[0]?.name ?? '—',
            icon: Restaurant,
            iconColor: '#ED64A6',
        },
    ], [summary]);

    return (
        <Box sx={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            <Navbar title="Super Admin Dashboard" />
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Stack spacing={3}>
                    <Card>
                        <CardContent>
                            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                                Sales Overview
                            </Typography>
                            <Stack
                                direction={{ xs: 'column', sm: 'row' }}
                                spacing={2}
                                alignItems={{ xs: 'stretch', sm: 'flex-end' }}
                            >
                                <TextField
                                    label="Start Date"
                                    type="date"
                                    value={filters.startDate}
                                    onChange={handleDateChange('startDate')}
                                    InputLabelProps={{ shrink: true }}
                                    fullWidth
                                />
                                <TextField
                                    label="End Date"
                                    type="date"
                                    value={filters.endDate}
                                    onChange={handleDateChange('endDate')}
                                    InputLabelProps={{ shrink: true }}
                                    fullWidth
                                />
                                <Button
                                    variant="contained"
                                    onClick={() => fetchSummary()}
                                    sx={{
                                        backgroundColor: '#06C167',
                                        '&:hover': { backgroundColor: '#048A47' },
                                    }}
                                >
                                    Apply
                                </Button>
                            </Stack>
                        </CardContent>
                    </Card>

                    {error && (
                        <Alert severity="error">{error}</Alert>
                    )}

                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
                            <Grid container spacing={{ xs: 2, sm: 3 }}>
                                {metrics.map((metric) => (
                                    <Grid item xs={12} sm={6} md={3} key={metric.label}>
                                        <Card sx={{ 
                                            borderRadius: 3,
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                                            }
                                        }}>
                                            {/* Decorative background icon */}
                                            <Box
                                                component={metric.icon}
                                                sx={{
                                                    position: 'absolute',
                                                    top: { xs: 16, sm: 20 },
                                                    right: { xs: 16, sm: 20 },
                                                    fontSize: { xs: 48, sm: 56, md: 64, lg: 72 },
                                                    color: metric.iconColor,
                                                    opacity: 0.1,
                                                    zIndex: 0,
                                                    pointerEvents: 'none'
                                                }}
                                            />
                                            
                                            <CardContent sx={{ 
                                                p: { xs: 2.5, sm: 3, md: 3.5 },
                                                flex: 1,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'space-between',
                                                position: 'relative',
                                                zIndex: 1
                                            }}>
                                                {/* Label and small icon */}
                                                <Box sx={{ 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    justifyContent: 'space-between',
                                                    mb: { xs: 2, sm: 2.5 }
                                                }}>
                                                    <Typography
                                                        variant="subtitle2"
                                                        sx={{ 
                                                            color: '#718096', 
                                                            textTransform: 'uppercase',
                                                            fontSize: { xs: '0.625rem', sm: '0.6875rem', md: '0.75rem' },
                                                            fontWeight: 600,
                                                            letterSpacing: '0.5px'
                                                        }}
                                                    >
                                                        {metric.label}
                                                    </Typography>
                                                    <Box
                                                        component={metric.icon}
                                                        sx={{
                                                            fontSize: { xs: 20, sm: 24, md: 28 },
                                                            color: metric.iconColor,
                                                            flexShrink: 0
                                                        }}
                                                    />
                                                </Box>
                                                
                                                {/* Value - most prominent */}
                                                <Typography 
                                                    variant="h4" 
                                                    sx={{ 
                                                        fontWeight: 700, 
                                                        color: '#2d3748',
                                                        fontSize: { 
                                                            xs: '1.75rem', 
                                                            sm: '2rem', 
                                                            md: '2.25rem',
                                                            lg: '2.5rem'
                                                        },
                                                        lineHeight: 1.1,
                                                        wordBreak: 'break-word',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis'
                                                    }}
                                                >
                                                    {metric.value}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>

                            <Card sx={{ borderRadius: 3 }}>
                                <CardContent>
                                    <Box sx={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between', 
                                        mb: 3,
                                        flexDirection: { xs: 'column', sm: 'row' },
                                        gap: { xs: 2, sm: 0 },
                                        alignItems: { xs: 'flex-start', sm: 'center' }
                                    }}>
                                        <Box>
                                            <Typography variant="h6" sx={{ 
                                                fontWeight: 600,
                                                fontSize: { xs: '1rem', sm: '1.25rem' }
                                            }}>
                                                Top Performing Items
                                            </Typography>
                                            <Typography variant="body2" sx={{ 
                                                color: '#718096',
                                                fontSize: { xs: '0.75rem', sm: '0.875rem' }
                                            }}>
                                                Based on orders from {summary?.start_date} to {summary?.end_date}
                                            </Typography>
                                        </Box>
                                        <Stack 
                                            direction={{ xs: 'column', sm: 'row' }} 
                                            spacing={2}
                                            sx={{ width: { xs: '100%', sm: 'auto' } }}
                                        >
                                            <Button
                                                variant="outlined"
                                                onClick={() => navigate('/orders/manage')}
                                                fullWidth
                                                sx={{ 
                                                    fontSize: { xs: '0.875rem', sm: '1rem' },
                                                    py: { xs: 1, sm: 1.5 }
                                                }}
                                            >
                                                Manage Orders
                                            </Button>
                                            <Button
                                                variant="contained"
                                                sx={{
                                                    backgroundColor: '#06C167',
                                                    '&:hover': { backgroundColor: '#048A47' },
                                                    fontSize: { xs: '0.875rem', sm: '1rem' },
                                                    py: { xs: 1, sm: 1.5 },
                                                    width: { xs: '100%', sm: 'auto' }
                                                }}
                                                onClick={() => navigate('/dashboard/food')}
                                            >
                                                Manage Menu
                                            </Button>
                                        </Stack>
                                    </Box>

                                    {summary?.top_items?.length ? (
                                        <Box sx={{ overflowX: 'auto' }}>
                                            <Table sx={{ minWidth: 300 }}>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell sx={{ 
                                                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                                            fontWeight: 600
                                                        }}>
                                                            Food Item
                                                        </TableCell>
                                                        <TableCell align="right" sx={{ 
                                                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                                            fontWeight: 600
                                                        }}>
                                                            Quantity Sold
                                                        </TableCell>
                                                        <TableCell align="right" sx={{ 
                                                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                                            fontWeight: 600
                                                        }}>
                                                            Revenue
                                                        </TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {summary.top_items.map((item) => (
                                                        <TableRow key={item.food_item_id}>
                                                            <TableCell sx={{ 
                                                                fontSize: { xs: '0.75rem', sm: '0.875rem' }
                                                            }}>
                                                                {item.name}
                                                            </TableCell>
                                                            <TableCell align="right" sx={{ 
                                                                fontSize: { xs: '0.75rem', sm: '0.875rem' }
                                                            }}>
                                                                {item.quantity_sold}
                                                            </TableCell>
                                                            <TableCell align="right" sx={{ 
                                                                fontSize: { xs: '0.75rem', sm: '0.875rem' }
                                                            }}>
                                                                {toCurrency(item.revenue)}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </Box>
                                    ) : (
                                        <Typography variant="body2" sx={{ 
                                            color: '#718096',
                                            fontSize: { xs: '0.75rem', sm: '0.875rem' }
                                        }}>
                                            No orders recorded for the selected period.
                                        </Typography>
                                    )}
                                </CardContent>
                            </Card>
                        </>
                    )}
                </Stack>
            </Container>
        </Box>
    );
}

export default Dashboard;

