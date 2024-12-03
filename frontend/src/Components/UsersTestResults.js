import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Typography, Table, TableBody, TableCell, TableHead, TableRow, Paper, makeStyles, Button } from '@material-ui/core';
import { useParams, useNavigate } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
    container: {
        marginTop: theme.spacing(4),
    },
    table: {
        marginTop: theme.spacing(2),
    },
    tablePaper: {
        padding: theme.spacing(2),
        marginTop: theme.spacing(2),
    },
    backButton: {
        marginTop: theme.spacing(2),
    },
}));

const UserTestResults = () => {
    const classes = useStyles();
    const { userQuizId } = useParams();
    const [results, setResults] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/user-test-results/${userQuizId}`);
                setResults(response.data);
            } catch (error) {
                console.error('Error fetching test results:', error);
            }
        };
        fetchResults();
    }, [userQuizId]);

    const handleBack = () => {
        navigate(-1); // Go back to the previous page
    };

    return (
        <Container className={classes.container}>
            <Typography variant="h5" gutterBottom>
                Test Results
            </Typography>
            <Paper className={classes.tablePaper}>
                <Table className={classes.table}>
                    <TableHead>
                        <TableRow>
                            <TableCell>Question Type</TableCell>
                            <TableCell>Total Grade</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {results.map((result, index) => (
                            <TableRow key={index}>
                                <TableCell>{result.PersoType}</TableCell>
                                <TableCell>{result.TotalGrade}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
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

export default UserTestResults;
