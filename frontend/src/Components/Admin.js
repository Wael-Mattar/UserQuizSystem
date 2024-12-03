import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography, Paper, List, ListItem, ListItemText, Divider, makeStyles, Box, Card, CardContent, Avatar, Grid, AppBar, Toolbar, IconButton, Button, Switch } from '@material-ui/core';
import { ExitToApp, AccountCircle, Grade } from '@material-ui/icons';
import { useNavigate } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
    container: {
        marginTop: theme.spacing(4),
    },
    appBar: {
        marginBottom: theme.spacing(3),
    },
    paper: {
        padding: theme.spacing(3),
        marginBottom: theme.spacing(3),
    },
    userCard: {
        marginBottom: theme.spacing(2),
    },
    userHeader: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: theme.spacing(2),
    },
    avatar: {
        marginRight: theme.spacing(2),
        backgroundColor: theme.palette.primary.main,
    },
    gradeIcon: {
        verticalAlign: 'bottom',
        marginRight: theme.spacing(1),
    },
    title: {
        marginBottom: theme.spacing(3),
        fontWeight: 'bold',
    },
    grow: {
        flexGrow: 1,
    },
    adminButton: {
        marginRight: theme.spacing(2),
    },
}));

const Admin = () => {
    const classes = useStyles();
    const [admins, setAdmins] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAdmins = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/admins');
                setAdmins(response.data);
            } catch (error) {
                console.error('Error fetching admins:', error);
            }
        };
        fetchAdmins();
    }, []);

    const handleLogout = () => {
        navigate('/login');
    };

    const handleToggleAdmin = async (adminId, isEnabled) => {
        console.log('adminId:', adminId);
        console.log('isEnabled:', isEnabled);
        try {
            // Convert isEnabled to integer (1 or 0)
            const isEnabledInt = isEnabled ? 1 : 0;

            // Update the database using the integer value
            await axios.put(`http://localhost:5000/api/admins/${adminId}`, { isEnabled: isEnabledInt });

            // Update the local state with the new isEnabled value
            setAdmins(admins.map(admin => admin.id === adminId ? { ...admin, isEnabled: isEnabledInt } : admin));
        } catch (error) {
            console.error('Error toggling admin status:', error);
        }
    };

    const handleGoBack = () => {
        navigate('/users/14');
    };

    return (
        <Container className={classes.container}>
            <AppBar position="static" className={classes.appBar}>
                <Toolbar>
                    <Typography variant="h6" className={classes.title}>
                        Admin Management
                    </Typography>
                    <div className={classes.grow} />
                    <IconButton color="inherit" onClick={handleLogout}>
                        <ExitToApp />
                    </IconButton>
                </Toolbar>
            </AppBar>
            <Paper className={classes.paper}>
                <Typography variant="h5" gutterBottom>
                    List of Admins
                </Typography>
                <List>
                    {admins.map(admin => (
                        <ListItem key={admin.id}>
                            <ListItemText
                                primary={`${admin.email} - ${admin.first_name} ${admin.last_name}`}
                                secondary={`Created at: ${new Date(admin.created_at).toLocaleString()}`}
                            />
                            <Switch
                                checked={admin.isEnabled === 1} // Convert number to boolean
                                onChange={() => handleToggleAdmin(admin.id, admin.isEnabled !== 1 ? 1 : 0)} // Convert boolean to number
                                color="primary"
                            />

                        </ListItem>
                    ))}
                </List>
            </Paper>
            <Button variant="contained" color="primary" onClick={handleGoBack}>
                Go back to Users Page
            </Button>
        </Container>
    );
};

export default Admin;
