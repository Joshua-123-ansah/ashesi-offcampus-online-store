import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    Grid,
    IconButton,
    Stack,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from '@mui/material';
import { Add, Delete, Edit } from '@mui/icons-material';
import Navbar from '../components/Navbar';
import api from '../api';

const emptyFormState = {
    name: '',
    price: '',
    image: '',
    extras: '',
    status: true,
};

function FoodManagement() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [formValues, setFormValues] = useState(emptyFormState);
    const [saving, setSaving] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const fetchItems = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get('/api/foodItems/manage/');
            setItems(response.data);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to load food items.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchItems().catch(() => setError('Failed to load food items.'));
    }, [fetchItems]);

    const handleOpenDialog = (item = null) => {
        if (item) {
            setSelectedItem(item);
            setFormValues({
                name: item.name,
                price: item.price,
                image: item.image,
                extras: item.extras || '',
                status: item.status,
            });
        } else {
            setSelectedItem(null);
            setFormValues(emptyFormState);
        }
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setFormValues(emptyFormState);
        setSelectedItem(null);
    };

    const handleChange = (field) => (event) => {
        const value = field === 'status' ? event.target.checked : event.target.value;
        setFormValues((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = async () => {
        setSaving(true);
        setError('');
        const payload = {
            name: formValues.name,
            price: parseFloat(formValues.price),
            image: formValues.image,
            extras: formValues.extras,
            status: formValues.status,
        };

        try {
            if (selectedItem) {
                await api.put(`/api/foodItems/manage/${selectedItem.id}/`, payload);
            } else {
                await api.post('/api/foodItems/manage/', payload);
            }
            await fetchItems();
            handleCloseDialog();
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to save food item.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (itemId) => {
        if (!window.confirm('Are you sure you want to delete this item?')) {
            return;
        }
        setError('');
        try {
            await api.delete(`/api/foodItems/manage/${itemId}/`);
            await fetchItems();
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to delete food item.');
        }
    };

    const totalActiveItems = useMemo(
        () => items.filter((item) => item.status).length,
        [items]
    );

    return (
        <Box sx={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            <Navbar title="Menu Management" />
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Stack spacing={3}>
                    <Card>
                        <CardContent>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }}>
                                <Box>
                                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                                        Food Catalogue
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#718096' }}>
                                        Active menu items: {totalActiveItems} / {items.length}
                                    </Typography>
                                </Box>
                                <Button
                                    variant="contained"
                                    startIcon={<Add />}
                                    onClick={() => handleOpenDialog()}
                                    sx={{
                                        backgroundColor: '#06C167',
                                        '&:hover': { backgroundColor: '#048A47' },
                                    }}
                                >
                                    Add Food Item
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
                        <Card>
                            <CardContent>
                                {items.length === 0 ? (
                                    <Typography variant="body2" sx={{ color: '#718096' }}>
                                        No food items found. Add your first menu item to get started.
                                    </Typography>
                                ) : (
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Name</TableCell>
                                                <TableCell>Price (GHS)</TableCell>
                                                <TableCell>Status</TableCell>
                                                <TableCell>Extras</TableCell>
                                                <TableCell align="right">Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {items.map((item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell>{item.name}</TableCell>
                                                    <TableCell>{Number(item.price).toFixed(2)}</TableCell>
                                                    <TableCell>
                                                        <Typography
                                                            sx={{
                                                                display: 'inline-block',
                                                                px: 1.5,
                                                                py: 0.5,
                                                                borderRadius: 2,
                                                                fontSize: '0.75rem',
                                                                backgroundColor: item.status ? 'rgba(6, 193, 103, 0.1)' : 'rgba(229, 62, 62, 0.1)',
                                                                color: item.status ? '#048A47' : '#C53030',
                                                            }}
                                                        >
                                                            {item.status ? 'Active' : 'Hidden'}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell sx={{ maxWidth: 280 }}>
                                                        <Typography variant="body2" sx={{ color: '#4A5568' }}>
                                                            {item.extras || '—'}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <IconButton onClick={() => handleOpenDialog(item)}>
                                                            <Edit />
                                                        </IconButton>
                                                        <IconButton color="error" onClick={() => handleDelete(item.id)}>
                                                            <Delete />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </Stack>
            </Container>

            <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="sm">
                <DialogTitle>{selectedItem ? 'Edit Food Item' : 'Add Food Item'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                label="Name"
                                value={formValues.name}
                                onChange={handleChange('name')}
                                fullWidth
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Price (GHS)"
                                type="number"
                                value={formValues.price}
                                onChange={handleChange('price')}
                                fullWidth
                                required
                                inputProps={{ step: '0.01', min: 0 }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formValues.status}
                                        onChange={handleChange('status')}
                                        color="success"
                                    />
                                }
                                label={formValues.status ? 'Active' : 'Hidden'}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Image URL"
                                value={formValues.image}
                                onChange={handleChange('image')}
                                fullWidth
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Extras / Description"
                                value={formValues.extras}
                                onChange={handleChange('extras')}
                                fullWidth
                                multiline
                                rows={3}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={handleCloseDialog} disabled={saving}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={saving}
                        sx={{
                            backgroundColor: '#06C167',
                            '&:hover': { backgroundColor: '#048A47' },
                        }}
                    >
                        {saving ? 'Saving…' : selectedItem ? 'Update Item' : 'Create Item'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default FoodManagement;

