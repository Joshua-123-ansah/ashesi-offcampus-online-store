// src/pages/Shop.js
import React, { useEffect, useState } from 'react';
import {useNavigate } from 'react-router-dom';
import {
    Container, Grid, TextField, Card,
    CardMedia, CardContent, CardActions,
    IconButton, Typography, Box, Button
} from '@mui/material';
import Navbar from '../components/Navbar';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import Loader from '../components/Loader';
import api from "../api";

const DEFAULT_IMAGE = "https://travelandmunchies.com/wp-content/uploads/2022/12/IMG_9678-scaled.jpg";  // put this file in public/ or import it

function Shop() {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [cart, setCart] = useState({});
    const [foodItems, setFoodItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFoodItems = async () => {
            try {
                const res = await api.get("/api/foodItems/");
                setFoodItems(res.data);
            } catch (err) {
                console.error("Error fetching foodItems:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchFoodItems();
    }, []);

    if (loading) {
        return (
            <div>
                <Navbar/>
                <Container sx={{ mt: 4 }}><Loader /></Container>
            </div>
        );
    }

    const filtered = foodItems
        .filter(item => item.status)
        .filter(item =>
            item.name.toLowerCase().includes(search.toLowerCase())
        );
    const totalItems = Object.values(cart).reduce((sum, q) => sum + q, 0);

    const handleAdd = id => setCart(prev => ({ ...prev, [id]: 1 }));
    const handleQty = (id, delta) =>
        setCart(prev => {
            const nextQty = Math.max(0, (prev[id] || 0) + delta);
            if (nextQty === 0) {
                const nxt = { ...prev };
                delete nxt[id];
                return nxt;
            }
            return { ...prev, [id]: nextQty };
        });

    return (
        <div>
            <Navbar
                showCartButton
                cartCount={totalItems}
                onCartClick={() => navigate("/checkout", { state: { cart } })}
            />

            <Container sx={{ mt: 4 }}>
                <TextField
                    fullWidth
                    label="Search Products"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />

                <Grid container spacing={4} sx={{ mt: 2, justifyContent: "center" }}>
                    {filtered.map(product => (
                        <Grid item key={product.id}>
                            <Box display="flex" justifyContent="center">
                                <Card sx={{ width: 300, height: 300 }}>
                                    <CardMedia
                                        component="img"
                                        src={product.image}
                                        alt={product.name}
                                        onError={e => {
                                            e.target.onerror = null;        // prevent infinite loop
                                            e.target.src = DEFAULT_IMAGE;
                                        }}
                                        sx={{ height: 150, objectFit: "cover" }}
                                    />
                                    <CardContent>
                                        <Typography variant="h7">{product.name}</Typography>
                                        <Typography variant="body2">${product.price}</Typography>
                                    </CardContent>
                                    <CardActions>
                                        {!cart[product.id] ? (
                                            <Button variant="contained" onClick={() => handleAdd(product.id)}>
                                                Add to Cart
                                            </Button>
                                        ) : (
                                            <Box display="flex" alignItems="center">
                                                <IconButton onClick={() => handleQty(product.id, -1)}>
                                                    <RemoveIcon />
                                                </IconButton>
                                                <Typography>{cart[product.id]}</Typography>
                                                <IconButton onClick={() => handleQty(product.id, +1)}>
                                                    <AddIcon />
                                                </IconButton>
                                            </Box>
                                        )}
                                    </CardActions>
                                </Card>
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </div>
    );
}

export default Shop;
