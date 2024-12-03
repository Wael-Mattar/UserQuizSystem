import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { Typography, Container, CircularProgress } from '@material-ui/core';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const VerifyEmail = () => {
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();
    const token = new URLSearchParams(location.search).get('token');

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                await axios.get(`http://localhost:5000/api/verify-email?token=${token}`);
                toast.success('Email verified successfully! You can login now!');
                navigate('/login');
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        verifyEmail();
    }, [token, navigate]);

    return (
        <Container style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
            {loading ? <CircularProgress /> : <Typography variant="h5">Verifying...</Typography>}
        </Container>
    );
};

export default VerifyEmail;
