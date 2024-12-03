import React, { useState } from 'react';
import axios from 'axios';
import { Container, TextField, Button, Typography, makeStyles, IconButton, Box, Card, CardContent, AppBar, Toolbar } from '@material-ui/core';
import { AddCircle, RemoveCircle, ArrowBack } from '@material-ui/icons';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';

const useStyles = makeStyles((theme) => ({
    container: {
        marginTop: theme.spacing(4),
    },
    formControl: {
        marginBottom: theme.spacing(2),
    },
    questionCard: {
        marginBottom: theme.spacing(2),
    },
    answerBox: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: theme.spacing(1),
    },
    addButton: {
        marginRight: theme.spacing(1),
    },
    buttonContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: theme.spacing(2),
    },
    grow: {
        flexGrow: 1,
    },
}));

const CreateTest = () => {
    const classes = useStyles();
    const navigate = useNavigate();

    const [testName, setTestName] = useState('');
    const [testDescription, setTestDescription] = useState('');
    const [questions, setQuestions] = useState([
        {
            question: '',
            category: '',
            answers: [{ answer: '', grade: '' }],
        },
    ]);
    const [csvFile, setCsvFile] = useState(null);

    const handleAddQuestion = () => {
        setQuestions([...questions, { question: '', category: '', answers: [{ answer: '', grade: '' }] }]);
    };

    const handleRemoveQuestion = (index) => {
        const updatedQuestions = questions.filter((_, qIndex) => qIndex !== index);
        setQuestions(updatedQuestions);
    };

    const handleAddAnswer = (qIndex) => {
        const updatedQuestions = questions.map((question, index) => {
            if (index === qIndex) {
                return {
                    ...question,
                    answers: [...question.answers, { answer: '', grade: '' }],
                };
            }
            return question;
        });
        setQuestions(updatedQuestions);
    };

    const handleRemoveAnswer = (qIndex, aIndex) => {
        const updatedQuestions = questions.map((question, index) => {
            if (index === qIndex) {
                const updatedAnswers = question.answers.filter((_, ansIndex) => ansIndex !== aIndex);
                return {
                    ...question,
                    answers: updatedAnswers,
                };
            }
            return question;
        });
        setQuestions(updatedQuestions);
    };

    const handleInputChange = (e, qIndex, aIndex, field) => {
        const { value } = e.target;
        const updatedQuestions = questions.map((question, index) => {
            if (index === qIndex) {
                if (aIndex !== undefined) {
                    const updatedAnswers = question.answers.map((answer, ansIndex) => {
                        if (ansIndex === aIndex) {
                            return { ...answer, [field]: value };
                        }
                        return answer;
                    });
                    return { ...question, answers: updatedAnswers };
                }
                return { ...question, [field]: value };
            }
            return question;
        });
        setQuestions(updatedQuestions);
    };

    const handleFileUpload = (e) => {
        setCsvFile(e.target.files[0]);
    };

    const processCsvData = (file) => {
        return new Promise((resolve, reject) => {
            Papa.parse(file, {
                complete: (results) => {
                    const dataRows = results.data.slice(1);
    
                    const newQuestions = dataRows
                        .filter(row => row.length > 1 && row[0] !== '') // Filter out empty rows
                        .map((row) => {
                            return {
                                question: row[0],
                                category: row[1],
                                answers: [
                                    { answer: row[2], grade: row[6] },
                                    { answer: row[3], grade: row[7] },
                                    { answer: row[4], grade: row[8] },
                                    { answer: row[5], grade: row[9] },
                                ].filter(a => a.answer !== '' && a.grade !== ''), // Filter out empty answers and grades
                            };
                        });
    
                    resolve(newQuestions);
                },
                header: false,
                error: (error) => {
                    reject(error);
                }
            });
        });
    };
    
    
    
    const handleSubmit = async (e) => {
        e.preventDefault();
    
        let parsedQuestions = questions;
    
        if (csvFile) {
            try {
                parsedQuestions = await processCsvData(csvFile);
            } catch (error) {
                console.error('Error processing CSV:', error);
                return;
            }
        }
    
        const testData = {
            name: testName,
            description: testDescription,
            questions: parsedQuestions,
        };
    
        try {
            // Create the test
            const testResponse = await axios.post('http://localhost:5000/api/quizzes', {
                name: testData.name,
                description: testData.description,
            });
    
            const quizId = testResponse.data.quizId;
    
            // Create the questions
            for (const question of testData.questions) {
                const questionResponse = await axios.post(`http://localhost:5000/api/quizzes/${quizId}/questions`, {
                    question: question.question,
                    persoType: question.category,
                });
    
                const questionId = questionResponse.data.questionId;
    
                // Create the answers for each question
                for (const answer of question.answers) {
    
                    if (answer.answer !== '' && answer.grade !== '') { // Ensure only non-empty answers and grades are sent
                        await axios.post(`http://localhost:5000/api/quizzes/${quizId}/questions/${questionId}/answers`, {
                            answer: answer.answer,
                            answerGrade: answer.grade,
                        });
                    } else {
                        console.warn('Skipped empty answer or grade');
                    }
                }
            }
    
            navigate('/tests-created');
        } catch (error) {
            console.error('Error creating test:', error);
        }
    };
    
    

    return (
        <Container className={classes.container}>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6">Create Test</Typography>
                    <div className={classes.grow} />
                    <IconButton color="inherit" onClick={() => navigate(-1)}>
                        <ArrowBack />
                    </IconButton>
                </Toolbar>
            </AppBar>
            <form onSubmit={handleSubmit}>
                <TextField
                    fullWidth
                    className={classes.formControl}
                    label="Test Name"
                    value={testName}
                    onChange={(e) => setTestName(e.target.value)}
                />
                <TextField
                    fullWidth
                    className={classes.formControl}
                    label="Test Description"
                    value={testDescription}
                    onChange={(e) => setTestDescription(e.target.value)}
                />
                {/* <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className={classes.formControl}
                /> */}
                {questions.map((question, qIndex) => (
                    <Card key={qIndex} className={classes.questionCard}>
                        <CardContent>
                            <TextField
                                fullWidth
                                className={classes.formControl}
                                label="Question"
                                name="question"
                                value={question.question}
                                onChange={(e) => handleInputChange(e, qIndex)}
                            />
                            <TextField
                                fullWidth
                                className={classes.formControl}
                                label="Category"
                                name="category"
                                value={question.category}
                                onChange={(e) => handleInputChange(e, qIndex)}
                            />
                            {question.answers.map((answer, aIndex) => (
                                <Box key={aIndex} className={classes.answerBox}>
                                    <TextField
                                        fullWidth
                                        label="Answer"
                                        value={answer.answer}
                                        onChange={(e) => handleInputChange(e, qIndex, aIndex, 'answer')}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Grade"
                                        value={answer.grade}
                                        onChange={(e) => handleInputChange(e, qIndex, aIndex, 'grade')}
                                    />
                                    <IconButton
                                        color="secondary"
                                        onClick={() => handleRemoveAnswer(qIndex, aIndex)}
                                    >
                                        <RemoveCircle />
                                    </IconButton>
                                </Box>
                            ))}
                            <Button
                                className={classes.addButton}
                                variant="contained"
                                color="primary"
                                onClick={() => handleAddAnswer(qIndex)}
                                startIcon={<AddCircle />}
                            >
                                Add Answer
                            </Button>
                            {questions.length > 1 && (
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    onClick={() => handleRemoveQuestion(qIndex)}
                                    startIcon={<RemoveCircle />}
                                >
                                    Remove Question
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ))}
                <Box className={classes.buttonContainer}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleAddQuestion}
                        startIcon={<AddCircle />}
                    >
                        Add Question
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                    >
                        Create Test
                    </Button>
                </Box>
            </form>
        </Container>
    );
};

export default CreateTest;
