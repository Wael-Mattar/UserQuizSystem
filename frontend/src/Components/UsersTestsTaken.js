import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Table, TableHead, TableBody, TableCell, TableRow, Typography, Paper, makeStyles, Button } from '@material-ui/core';
import { saveAs } from 'file-saver';

const useStyles = makeStyles((theme) => ({
    root: {
        padding: theme.spacing(4),
    },
    table: {
        marginTop: theme.spacing(2),
        borderRadius: theme.shape.borderRadius,
        overflow: 'hidden',
        marginBottom: theme.spacing(4), 
    },
    header: {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
    },
    cell: {
        fontWeight: 'bold',
    },
    row: {
        '&:nth-of-type(odd)': {
            backgroundColor: theme.palette.action.hover,
        },
    },
    backButton: {
        marginTop: theme.spacing(2),
    },
    exportButton: {
        marginTop: theme.spacing(2),
        marginLeft: theme.spacing(2),
    },
}));

const UsersTestsTaken = () => {
    const classes = useStyles();
    const { userId } = useParams();
    const [testDetails, setTestDetails] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTestDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/users-tests-taken/${userId}`);
                console.log('Test details:', response.data);
                setTestDetails(response.data);
            } catch (error) {
                console.error('Error fetching test details:', error);
            }
        };
        fetchTestDetails();
    }, [userId]);

    const handleGoBack = () => {
        navigate("/welcome");
    };

    const exportToCSV = () => {
        const csvRows = [
            ['Quiz Name', 'Question', 'Answer', 'Score', 'Question Type'],
            ...testDetails.map(detail => [
                detail.quizName,
                detail.question,
                detail.answer,
                detail.score,
                detail.questionType
            ])
        ];

        const csvContent = csvRows.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, `test_details_${userId}.csv`);
    };

    return (
        <div className={classes.root}>
            <Typography variant="h4" gutterBottom align="center">
                Test Results
            </Typography>
            <Button variant="contained" color="primary" className={classes.backButton} onClick={handleGoBack}>
                Go Back
            </Button>
            <Button variant="contained" color="secondary" className={classes.exportButton} onClick={exportToCSV}>
                Export to CSV
            </Button>
            {testDetails.reduce((acc, currentTest) => {
                if (!acc.includes(currentTest.quizName)) {
                    acc.push(currentTest.quizName);
                }
                return acc;
            }, []).map((quizName, index) => (
                <div key={index}>
                    <Typography variant="h5" gutterBottom>
                        {quizName}
                    </Typography>
                    <Paper className={classes.table}>
                        <Table>
                            <TableHead className={classes.header}>
                                <TableRow>
                                    <TableCell className={classes.cell}>Question</TableCell>
                                    <TableCell className={classes.cell}>Answer</TableCell>
                                    <TableCell className={classes.cell}>Score</TableCell>
                                    <TableCell className={classes.cell}>Question Type</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {testDetails
                                    .filter((detail) => detail.quizName === quizName) 
                                    .map((detail, index) => (
                                        <TableRow key={index} className={classes.row}>
                                            <TableCell>{detail.question}</TableCell>
                                            <TableCell>{detail.answer}</TableCell>
                                            <TableCell>{detail.score}</TableCell>
                                            <TableCell>{detail.questionType}</TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </Paper>
                </div>
            ))}
        </div>
    );
};

export default UsersTestsTaken;
