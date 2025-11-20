import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Container,
    Grid,
    MenuItem,
    Select,
    Stack,
    Typography,
    FormControl,
    InputLabel,
    Divider,
    Button,
} from '@mui/material';
import { Refresh } from '@mui/icons-material';
import Navbar from '../components/Navbar';
import api from '../api';
import { ORDER_STATUS_OPTIONS, ROLE_LABELS } from '../Constants';

const statusColors = {
    RECEIVED: { bg: 'rgba(99, 179, 237, 0.1)', color: '#3182CE' },
    PREPARING: { bg: 'rgba(251, 191, 36, 0.15)', color: '#B7791F' },
    OUT_FOR_DELIVERY: { bg: 'rgba(237, 100, 166, 0.15)', color: '#B83280' },
    DELIVERED: { bg: 'rgba(56, 161, 105, 0.15)', color: '#2F855A' },
};

const formatDateTime = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    return date.toLocaleString();
};

function OrderManagement() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [updating, setUpdating] = useState({});

    const fetchOrders = useCallback(async (statusParam = '') => {
        setLoading(true);
        setError('');
        try {
            const params = {};
            if (statusParam) params.status = statusParam;
            const response = await api.get('/api/orders/manage/', { params });
            setOrders(response.data);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to load orders.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders().catch(() => setError('Failed to load orders.'));
    }, [fetchOrders]);

    const handleStatusChange = async (orderId, newStatus) => {
        setUpdating((prev) => ({ ...prev, [orderId]: true }));
        try {
            await api.patch(`/api/orders/${orderId}/`, { status: newStatus });
            setOrders((prev) =>
                prev.map((order) =>
                    order.id === orderId ? { ...order, status: newStatus } : order
                )
            );
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to update order status.');
        } finally {
            setUpdating((prev) => ({ ...prev, [orderId]: false }));
        }
    };

    const filteredOrders = useMemo(() => orders, [orders]);

    return (
        <Box sx={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            <Navbar title="Order Management" />
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Stack spacing={3}>
                    <Card>
                        <CardContent>
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} md={6}>
                                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                                        Incoming Orders
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#718096' }}>
                                        Track and update order statuses in real time.
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <FormControl fullWidth>
                                        <InputLabel>Status Filter</InputLabel>
                                        <Select
                                            value={statusFilter}
                                            label="Status Filter"
                                            onChange={(event) => {
                                                const nextStatus = event.target.value;
                                                setStatusFilter(nextStatus);
                                                fetchOrders(nextStatus).catch(() => {});
                                            }}
                                        >
                                            <MenuItem value="">All Orders</MenuItem>
                                            {ORDER_STATUS_OPTIONS.map((option) => (
                                                <MenuItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <Button
                                        variant="outlined"
                                        startIcon={<Refresh />}
                                        fullWidth
                                        onClick={() => fetchOrders(statusFilter)}
                                    >
                                        Refresh
                                    </Button>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>

                    {error && (
                        <Alert severity="error">{error}</Alert>
                    )}

                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                            <CircularProgress />
                        </Box>
                    ) : filteredOrders.length === 0 ? (
                        <Card>
                            <CardContent>
                                <Typography variant="body2" sx={{ color: '#718096' }}>
                                    No orders match the selected filter.
                                </Typography>
                            </CardContent>
                        </Card>
                    ) : (
                        filteredOrders.map((order) => {
                            const statusStyle = statusColors[order.status] || statusColors.RECEIVED;
                            return (
                                <Card key={order.id} sx={{ borderRadius: 3 }}>
                                    <CardContent>
                                        <Grid container spacing={3}>
                                            <Grid item xs={12} md={8}>
                                                <Stack spacing={2}>
                                                    <Stack direction="row" spacing={2} alignItems="center">
                                                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                            Order #{order.id}
                                                        </Typography>
                                                        <Chip
                                                            label={ORDER_STATUS_OPTIONS.find((opt) => opt.value === order.status)?.label || order.status}
                                                            sx={{
                                                                backgroundColor: statusStyle.bg,
                                                                color: statusStyle.color,
                                                                fontWeight: 600,
                                                            }}
                                                        />
                                                    </Stack>
                                                    <Typography variant="body2" sx={{ color: '#718096' }}>
                                                        Placed on {formatDateTime(order.created_at)}
                                                    </Typography>
                                                    <Divider />
                                                    <Stack spacing={1}>
                                                        {order.order_items?.map((item) => {
                                                            const itemName = item.food_item_detail?.name || `Item #${item.food_item}`;
                                                            return (
                                                                <Stack
                                                                    key={`${order.id}-${item.food_item}`}
                                                                    direction="row"
                                                                    justifyContent="space-between"
                                                                    sx={{ backgroundColor: '#f7fafc', borderRadius: 2, p: 1.5 }}
                                                                >
                                                                    <Typography sx={{ fontWeight: 500 }}>
                                                                        {itemName}
                                                                    </Typography>
                                                                    <Typography sx={{ color: '#4A5568' }}>
                                                                        Qty: {item.quantity}
                                                                    </Typography>
                                                                </Stack>
                                                            );
                                                        })}
                                                    </Stack>
                                                </Stack>
                                            </Grid>
                                            <Grid item xs={12} md={4}>
                                                <Stack spacing={2}>
                                                    <Box>
                                                        <Typography variant="subtitle2" sx={{ color: '#718096', textTransform: 'uppercase' }}>
                                                            Customer
                                                        </Typography>
                                                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                            {order.customer
                                                                ? `${order.customer.first_name} ${order.customer.last_name}`
                                                                : '—'}
                                                        </Typography>
                                                        {order.customer?.role && (
                                                            <Typography variant="body2" sx={{ color: '#A0AEC0' }}>
                                                                {ROLE_LABELS[order.customer.role] || order.customer.role}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="subtitle2" sx={{ color: '#718096', textTransform: 'uppercase' }}>
                                                            Total
                                                        </Typography>
                                                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#2d3748' }}>
                                                            GHS {Number(order.total_price).toFixed(2)}
                                                        </Typography>
                                                    </Box>
                                                    <FormControl fullWidth>
                                                        <InputLabel id={`status-${order.id}`}>Update Status</InputLabel>
                                                        <Select
                                                            labelId={`status-${order.id}`}
                                                            value={order.status}
                                                            label="Update Status"
                                                            onChange={(event) => handleStatusChange(order.id, event.target.value)}
                                                            disabled={Boolean(updating[order.id])}
                                                        >
                                                            {ORDER_STATUS_OPTIONS.map((option) => (
                                                                <MenuItem key={option.value} value={option.value}>
                                                                    {option.label}
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                </Stack>
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </Stack>
            </Container>
        </Box>
    );
}

export default OrderManagement;

