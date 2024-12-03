import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Typography, Table, TableBody, TableCell, TableHead, TableRow, Paper, makeStyles, Button, TableContainer, Box } from '@material-ui/core';
import { useParams, useNavigate } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
    container: {
        marginTop: theme.spacing(4),
        marginBottom: theme.spacing(4),
    },
    table: {
        minWidth: 650,
    },
    tablePaper: {
        padding: theme.spacing(3),
        marginTop: theme.spacing(3),
        boxShadow: theme.shadows[5],
    },
    backButton: {
        marginTop: theme.spacing(3),
    },
    tableHeaderCell: {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.common.white,
        fontWeight: 'bold',
    },
    tableBodyCell: {
        padding: theme.spacing(1),
    },
    title: {
        marginBottom: theme.spacing(3),
    },
}));

const QuizUsers = () => {
    const classes = useStyles();
    const { quizId } = useParams();
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/quiz/${quizId}/users`);
                console.log(response.data);
                setUsers(response.data);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };
        fetchUsers();
    }, [quizId]);

    const handleBack = () => {
        navigate(-1); // Go back to the previous page
    };

    return (
        <Container className={classes.container}>
            <Typography variant="h4" className={classes.title}>
                Users Who Took this Test
            </Typography>
            <Paper className={classes.tablePaper}>
                <TableContainer>
                    <Table className={classes.table}>
                        <TableHead>
                            <TableRow>
                                <TableCell className={classes.tableHeaderCell}>Name</TableCell>
                                <TableCell className={classes.tableHeaderCell}>Last Name</TableCell>
                                <TableCell className={classes.tableHeaderCell}>Email</TableCell>
                                <TableCell className={classes.tableHeaderCell}>Date Taken</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.userId}>
                                    <TableCell className={classes.tableBodyCell}>
                                        <Typography variant="body2">{user.first_name}</Typography>
                                    </TableCell>
                                    <TableCell className={classes.tableBodyCell}>
                                        <Typography variant="body2">{user.last_name}</Typography>
                                    </TableCell>
                                    <TableCell className={classes.tableBodyCell}>
                                        <Typography variant="body2">{user.email}</Typography>
                                    </TableCell>
                                    <TableCell className={classes.tableBodyCell}>
                                        <Typography variant="body2">{new Date(user.DateTaken).toLocaleDateString()}</Typography>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
            <Button
                variant="contained"
                color="primary"
                className={classes.backButton}
                onClick={handleBack}
            >
                Back
            </Button>
        </Container>
    );
};

export default QuizUsers;
