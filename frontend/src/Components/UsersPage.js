import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography, Card, CardContent, Avatar, AppBar, Toolbar, IconButton, Button, Box, makeStyles } from '@material-ui/core';
import { ExitToApp, AccountCircle } from '@material-ui/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { saveAs } from 'file-saver';

const useStyles = makeStyles((theme) => ({
    container: {
        marginTop: theme.spacing(4),
    },
    appBar: {
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
    detailButton: {
        marginTop: theme.spacing(2),
    },
    createTestButton: {
        marginRight: theme.spacing(2),
    },
    viewQuizzesButton: {
        marginRight: theme.spacing(2),
    },
    exportButton: {
        marginLeft: theme.spacing(2),
    },
}));

const UsersPage = () => {
    const classes = useStyles();
    const [users, setUsers] = useState([]);
    const [role, setRole] = useState('');
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const usersResponse = await axios.get('http://localhost:5000/api/users');
                const roleResponse = await axios.get(`http://localhost:5000/api/user-role/${id}`);
                setUsers(usersResponse.data);
                setRole(roleResponse.data.role);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchUserData();
    }, [id]);

    const handleLogout = () => {
        navigate('/login');
    };

    const handleAdminPage = () => {
        navigate('/admin');
    };

    const handleCreateTest = () => {
        navigate('/create-test');
    };

    const handleViewQuizzes = () => {
        navigate('/tests-created');
    };

    const handleViewDetails = (userId) => {
        navigate(`/user-details/${userId}`);
    };

    const exportToCSV = () => {
        const csvRows = [
            ['ID', 'Email', 'First Name', 'Last Name', 'Created At'],
            ...users.map(user => [
                user.id,
                user.email,
                user.first_name,
                user.last_name,
                new Date(user.created_at).toLocaleString()
            ])
        ];

        const csvContent = csvRows.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, `users_registered_details.csv`);
    };

    return (
        <Container className={classes.container}>
            <AppBar position="static" className={classes.appBar}>
                <Toolbar>
                    <Typography variant="h6" className={classes.title}>
                        Registered Users and Test Results
                    </Typography>
                    <div className={classes.grow} />
                    <Button color="inherit" className={classes.createTestButton} onClick={handleCreateTest}>
                        Create Test
                    </Button>
                    <Button color="inherit" className={classes.viewQuizzesButton} onClick={handleViewQuizzes}>
                        View Quizzes
                    </Button>
                    {role === 'super admin' && (
                        <Button color="inherit" className={classes.adminButton} onClick={handleAdminPage}>
                            View Admins
                        </Button>
                    )}
                    <Button variant="contained" color="secondary" className={classes.exportButton} onClick={exportToCSV}>
                        Export Users Details
                    </Button>
                    <IconButton color="inherit" onClick={handleLogout}>
                        <ExitToApp />
                    </IconButton>
                </Toolbar>
            </AppBar>
            {users.map(user => (
                <Card key={user.id} className={classes.userCard} elevation={3}>
                    <CardContent>
                        <Box className={classes.userHeader}>
                            <Avatar className={classes.avatar}>
                                <AccountCircle />
                            </Avatar>
                            <Typography variant="h6">{user.email}</Typography>
                        </Box>
                        <Button 
                            variant="contained" 
                            color="primary" 
                            className={classes.detailButton} 
                            onClick={() => handleViewDetails(user.id)}
                        >
                            View Details
                        </Button>
                    </CardContent>
                </Card>
            ))}
        </Container>
    );
};

export default UsersPage;
