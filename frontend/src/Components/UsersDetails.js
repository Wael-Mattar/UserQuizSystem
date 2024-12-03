import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography, Paper, Divider, makeStyles, Box, Card, CardContent, Avatar, Grid, AppBar, Toolbar, IconButton, Button, Table, TableBody, TableCell, TableHead, TableRow, TableContainer, TableFooter, TablePagination } from '@material-ui/core';
import { ExitToApp, AccountCircle } from '@material-ui/icons';
import { useParams, useNavigate } from 'react-router-dom';

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
    title: {
        marginBottom: theme.spacing(3),
        fontWeight: 'bold',
    },
    grow: {
        flexGrow: 1,
    },
    table: {
        marginTop: theme.spacing(3),
    },
    tableHeader: {
        backgroundColor: theme.palette.primary.main,
    },
    tableHeaderCell: {
        color: theme.palette.common.white,
        fontWeight: 'bold',
    },
    tableRow: {
        '&:nth-of-type(odd)': {
            backgroundColor: theme.palette.action.hover,
        },
    },
    testResults: {
        marginTop: theme.spacing(3),
    },
}));

const UserDetails = () => {
    const classes = useStyles();
    const { userId } = useParams();
    const [user, setUser] = useState(null);
    const [testResults, setTestResults] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/user/${userId}`);
                setUser(response.data);
            } catch (error) {
                console.error('Error fetching user details:', error);
            }
        };

        const fetchTestResults = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/user/${userId}/test-results`);
                console.log(response.data);
                setTestResults(response.data);
            } catch (error) {
                console.error('Error fetching test results:', error);
            }
        };

        fetchUserDetails();
        fetchTestResults();
    }, [userId]);

    const handleBack = () => {
        navigate(-1);
    };

    const handleToggleUser = async () => {
        try {
            const isEnabled = !user.isEnabled;
            await axios.put(`http://localhost:5000/api/user/${userId}`, { isEnabled });

            setUser({ ...user, isEnabled });
        } catch (error) {
            console.error('Error toggling user status:', error);
        }
    };

    if (!user) {
        return <Typography>Loading...</Typography>;
    }

    // Group test results by QuizName
    const groupedResults = testResults.reduce((acc, result) => {
        if (!acc[result.QuizName]) {
            acc[result.QuizName] = [];
        }
        acc[result.QuizName].push(result);
        return acc;
    }, {});

    return (
        <Container className={classes.container}>
            <AppBar position="static" className={classes.appBar}>
                <Toolbar>
                    <Typography variant="h6" className={classes.title}>
                        User Details
                    </Typography>
                    <div className={classes.grow} />
                    <IconButton color="inherit" onClick={handleBack}>
                        <ExitToApp />
                    </IconButton>
                </Toolbar>
            </AppBar>
            <Card className={classes.userCard} elevation={3}>
                <CardContent>
                    <Box className={classes.userHeader}>
                        <Avatar className={classes.avatar}>
                            <AccountCircle />
                        </Avatar>
                        <Typography variant="h6">{user.email}</Typography>
                    </Box>
                    <Divider />
                    <Typography variant="body1">First Name: {user.first_name}</Typography>
                    <Typography variant="body1">Last Name: {user.last_name}</Typography>
                    <Typography variant="body1">Is Enabled: {user.isEnabled ? 'Yes' : 'No'}</Typography>
                    <Typography variant="body1">Date of registration: {new Date(user.created_at).toLocaleString()}</Typography>
                    <Button variant="contained" color="primary" onClick={handleToggleUser}>
                        {user.isEnabled ? 'Disable User' : 'Enable User'}
                    </Button>
                </CardContent>
            </Card>
            {Object.entries(groupedResults).map(([quizName, results]) => (
                <div key={quizName} className={classes.testResults}>
                    <Typography variant="h5" gutterBottom>
                        Test Results for {quizName}
                    </Typography>
                    <TableContainer component={Paper}>
                        <Table className={classes.table}>
                            <TableHead className={classes.tableHeader}>
                                <TableRow>
                                    <TableCell className={classes.tableHeaderCell}>Type</TableCell>
                                    <TableCell className={classes.tableHeaderCell}>Total Points</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {results.map((result, index) => (
                                    <TableRow key={index} className={classes.tableRow}>
                                        <TableCell>{result.PersoType}</TableCell>
                                        <TableCell>{result.totalPoints}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>
            ))}
        </Container>
    );
};

export default UserDetails;
