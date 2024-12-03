import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Grid, Typography, Paper, Link } from '@material-ui/core';
import { AccountCircle, Lock } from '@material-ui/icons';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Signup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/signup', { email, password, first_name: firstName, last_name: lastName });
            console.log(response.data);
            toast.success('Signup successful! Please check your email to verify your account.');
        } catch (error) {
            console.error(error);
            toast.error('Signup failed. Please try again.');
        }
    };
    

    const handleLoginRedirect = () => {
        navigate('/login');
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
            <Paper elevation={3} style={{ padding: 20, maxWidth: 400, width: '100%' }}>
                <Typography variant="h4" align="center" gutterBottom>Sign Up</Typography>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                label="First Name"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                                InputProps={{
                                    startAdornment: <AccountCircle />
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                label="Last Name"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                required
                                InputProps={{
                                    startAdornment: <AccountCircle />
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                label="Email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                InputProps={{
                                    startAdornment: <AccountCircle />
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                label="Password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                InputProps={{
                                    startAdornment: <Lock />
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                color="primary"
                                size="small"
                            >
                                Sign Up
                            </Button>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="body2" align="center">
                                Already have an account?{' '}
                                <Link href="/login" onClick={handleLoginRedirect}>
                                    Login
                                </Link>
                            </Typography>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </div>
    );
};

export default Signup;
