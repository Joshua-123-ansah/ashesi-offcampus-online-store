// src/pages/CustomerInfo.js
import React, { useState, useEffect } from 'react';
import { Container, TextField, Button, Box, Typography, Stack } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api';
import Loader from '../components/Loader';

function CustomerInfo() {
    const navigate = useNavigate();
    const location = useLocation();

    // Try location.state first, then localStorage
    const storedCart = JSON.parse(localStorage.getItem('cart') || 'null');
    const cart = location.state?.cart || storedCart || {};

    const [initialInfo, setInitialInfo] = useState({
        name: '',
        hostelOrOffice: '',
        roomOrOfficeNumber: '',
        mobile: '',
    });
    const [info, setInfo] = useState(initialInfo);
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(true);

    // 1) Fetch profile on mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/api/profile/');
                const data = res.data;
                const mapped = {
                    name: `${data.first_name} ${data.last_name}`,
                    hostelOrOffice: data.hostel_or_office_name,
                    roomOrOfficeNumber: data.room_or_office_number,
                    mobile: data.phone_number,
                };
                setInitialInfo(mapped);
                setInfo(mapped);
            } catch (err) {
                console.error('Error fetching profile:', err);
                alert('Failed to load profile.');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    // form field handler
    const handleChange = (e) => {
        const { name, value } = e.target;
        setInfo((prev) => ({ ...prev, [name]: value }));
    };

    // 2) Continue with saved info
    const handleContinue = () => {
        navigate('/place-order', { state: { cart, info } });
    };

    // 3) Edit flow
    const startEditing = () => {
        setEditing(true);
    };
    const cancelEditing = () => {
        setInfo(initialInfo);
        setEditing(false);
    };

    // 4) Save updates then continue
    const handleSave = async () => {
        // simple completeness check
        if (Object.values(info).some((val) => !val.trim())) {
            alert('Please fill in all fields.');
            return;
        }

        // split full name
        const [firstName, ...rest] = info.name.trim().split(' ');
        const lastName = rest.join(' ') || '';

        const payload = {
            first_name: firstName,
            last_name: lastName,
            hostel_or_office_name: info.hostelOrOffice,
            room_or_office_number: info.roomOrOfficeNumber,
            phone_number: info.mobile,
        };

        setLoading(true);
        try {
            await api.patch('/api/profile/', payload);
            setInitialInfo(info);
            setEditing(false);

            localStorage.setItem('cart', JSON.stringify(cart));
            navigate('/place-order', { state: { cart, info } });
        } catch (err) {
            console.error('Error updating profile:', err);
            alert('Failed to update profile.');
            setLoading(false);
        }
    };

    // show loader while fetching
    if (loading) {
        return (
            <div>
                <Navbar/>
                <Container sx={{ mt: 4 }}>
                    <Loader />
                </Container>
            </div>
        );
    }

    return (
        <div>
            <Navbar/>
            <Container sx={{ mt: 4 }}>
                {!editing ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Typography variant="h6">Your Saved Information</Typography>
                        <Stack spacing={1}>
                            <Typography><strong>Name:</strong> {initialInfo.name}</Typography>
                            <Typography><strong>Hostel/Office:</strong> {initialInfo.hostelOrOffice}</Typography>
                            <Typography><strong>Room/Office #:</strong> {initialInfo.roomOrOfficeNumber}</Typography>
                            <Typography><strong>Mobile:</strong> {initialInfo.mobile}</Typography>
                        </Stack>
                        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                            <Button variant="contained" onClick={handleContinue}>
                                Continue with Saved Info
                            </Button>
                            <Button variant="outlined" onClick={startEditing}>
                                Update Information
                            </Button>
                        </Box>
                    </Box>
                ) : (
                    <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            required
                            label="Full Name"
                            name="name"
                            value={info.name}
                            onChange={handleChange}
                        />
                        <TextField
                            required
                            label="Hostel Name/Office Name"
                            name="hostelOrOffice"
                            value={info.hostelOrOffice}
                            onChange={handleChange}
                        />
                        <TextField
                            required
                            label="Room Number/Office Number"
                            name="roomOrOfficeNumber"
                            value={info.roomOrOfficeNumber}
                            onChange={handleChange}
                        />
                        <TextField
                            required
                            label="Mobile Number"
                            name="mobile"
                            value={info.mobile}
                            onChange={handleChange}
                        />
                        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                            <Button variant="contained" onClick={handleSave}>
                                Save & Continue
                            </Button>
                            <Button variant="outlined" onClick={cancelEditing}>
                                Cancel
                            </Button>
                        </Box>
                    </Box>
                )}
            </Container>
        </div>
    );
}

export default CustomerInfo;
