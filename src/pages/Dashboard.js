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
            icon: <Paid sx={{ fontSize: 32, color: '#06C167' }} />,
        },
        {
            label: 'Total Orders',
            value: summary?.total_orders ?? 0,
            icon: <ShoppingBag sx={{ fontSize: 32, color: '#3182CE' }} />,
        },
        {
            label: 'Average Order Value',
            value: toCurrency(summary?.average_order_value),
            icon: <TrendingUp sx={{ fontSize: 32, color: '#D69E2E' }} />,
        },
        {
            label: 'Best Seller',
            value: summary?.top_items?.[0]?.name ?? '—',
            icon: <Restaurant sx={{ fontSize: 32, color: '#ED64A6' }} />,
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
                            <Grid container spacing={3}>
                                {metrics.map((metric) => (
                                    <Grid item xs={12} sm={6} md={3} key={metric.label}>
                                        <Card sx={{ borderRadius: 3 }}>
                                            <CardContent>
                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                    {metric.icon}
                                                    <Typography
                                                        variant="subtitle2"
                                                        sx={{ ml: 2, color: '#718096', textTransform: 'uppercase' }}
                                                    >
                                                        {metric.label}
                                                    </Typography>
                                                </Box>
                                                <Typography variant="h5" sx={{ fontWeight: 700, color: '#2d3748' }}>
                                                    {metric.value}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>

                            <Card sx={{ borderRadius: 3 }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                                        <Box>
                                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                Top Performing Items
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: '#718096' }}>
                                                Based on orders from {summary?.start_date} to {summary?.end_date}
                                            </Typography>
                                        </Box>
                                        <Stack direction="row" spacing={2}>
                                            <Button
                                                variant="outlined"
                                                onClick={() => navigate('/orders/manage')}
                                            >
                                                Manage Orders
                                            </Button>
                                            <Button
                                                variant="contained"
                                                sx={{
                                                    backgroundColor: '#06C167',
                                                    '&:hover': { backgroundColor: '#048A47' },
                                                }}
                                                onClick={() => navigate('/dashboard/food')}
                                            >
                                                Manage Menu
                                            </Button>
                                        </Stack>
                                    </Box>

                                    {summary?.top_items?.length ? (
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Food Item</TableCell>
                                                    <TableCell align="right">Quantity Sold</TableCell>
                                                    <TableCell align="right">Revenue</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {summary.top_items.map((item) => (
                                                    <TableRow key={item.food_item_id}>
                                                        <TableCell>{item.name}</TableCell>
                                                        <TableCell align="right">{item.quantity_sold}</TableCell>
                                                        <TableCell align="right">{toCurrency(item.revenue)}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    ) : (
                                        <Typography variant="body2" sx={{ color: '#718096' }}>
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

