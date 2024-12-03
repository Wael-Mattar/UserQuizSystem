import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import AuthContext from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Grid, Typography, Paper, Link } from '@material-ui/core';
import { AccountCircle, Lock } from '@material-ui/icons';
import { toast } from 'react-toastify';
import {jwtDecode} from 'jwt-decode';

const Login = () => {
    const { setToken } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [decodedToken, setDecodedToken] = useState(null); // State to hold decoded token
    const navigate = useNavigate();

    useEffect(() => {
         const checkUserDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/user-info/${decodedToken.id}`);
                if (response.data) {
                    toast.success('Login successful!', {
                        onClose: () => {
                            setTimeout(() => {
                                navigate(`/welcome`, { state: { userId: decodedToken.id } });
                            }, 100);
                        }
                    });
                }
            } catch (error) {
                console.error('Error checking user details:', error);
            }
        };

        if (decodedToken) {
            checkUserDetails();
        }
    }, [decodedToken, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/login', { email, password });
            const token = response.data.token;
            const decodedToken = jwtDecode(token); // Assigning decoded token to local variable
            console.log(decodedToken);
            setToken(token);
            setDecodedToken(decodedToken); // Setting decoded token to state

            const roleResponse = await axios.get(`http://localhost:5000/api/user-role/${decodedToken.id}`);
            const userRole = roleResponse.data.role;

            const userResponse = await axios.get(`http://localhost:5000/api/user/${decodedToken.id}`);
            const isEnabled = userResponse.data.isEnabled;
            const isVerified = userResponse.data.is_verified;

            if (isEnabled === 0) {
                toast.error('Your account is disabled. You cannot login. Please contact the administrator.');
                return;
            }

            if (isVerified === 0) {
                toast.error('Your email is not verified. Please check your email to verify your account.');
                return;
            }

            if (userRole === 'super admin' || userRole === 'Admin') {
                toast.success('Login successful!', {
                    onClose: () => {
                        setTimeout(() => {
                            navigate(`/users/${decodedToken.id}`);
                        }, 100);
                    }
                });
            } else {
                toast.success('Login successful!', {
                    onClose: () => {
                        // setTimeout(() => {
                        //    //navigate(`/welcome`, { state: { userId: decodedToken.id } });
                        //    navigate(`/user-info-details`, { state: { userId: decodedToken.id } });
                        // }, 100);
                        setTimeout(() => {
                            navigate(`/welcome`, { state: { userId: decodedToken.id } });
                        }, 100);   
                    }
                });
            }
        } catch (error) {
            console.error(error);
            toast.error('Login failed. Please try again.');
        }
    };

    const handleSignupRedirect = () => {
        navigate('/signup');
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
            <Paper elevation={3} style={{ padding: 20, maxWidth: 400, width: '100%' }}>
                <Typography variant="h4" align="center" gutterBottom>Login</Typography>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={2} alignItems="center">
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
                                Login
                            </Button>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="body2" align="center">
                                Don't have an account?{' '}
                                <Link href="/signup" onClick={handleSignupRedirect}>
                                    Create one
                                </Link>
                            </Typography>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </div>
    );
};

export default Login;
