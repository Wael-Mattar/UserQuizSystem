import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography, Card, CardContent, makeStyles, Box, Divider, Button, Modal, TextField, IconButton } from '@material-ui/core';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import EditIcon from '@material-ui/icons/Edit';
import { toast } from 'react-toastify';
import { saveAs } from 'file-saver';


const useStyles = makeStyles((theme) => ({
    container: {
        marginTop: theme.spacing(4),
        display: 'flex',
        flexDirection: 'column',
    },
    backButton: {
        alignSelf: 'flex-end',
        marginTop: theme.spacing(2),
    },
    quizCard: {
        marginBottom: theme.spacing(4),
        borderRadius: theme.spacing(1),
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[5],
    },
    quizHeader: {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        padding: theme.spacing(2),
        borderTopLeftRadius: theme.spacing(1),
        borderTopRightRadius: theme.spacing(1),
    },
    quizDescription: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(2),
    },
    creationDate: {
        marginBottom: theme.spacing(2),
        fontStyle: 'italic',
        color: theme.palette.text.secondary,
    },
    questionCard: {
        marginLeft: theme.spacing(2),
        marginBottom: theme.spacing(2),
        padding: theme.spacing(2),
        borderLeft: `4px solid ${theme.palette.primary.main}`,
    },
    answerBox: {
        marginLeft: theme.spacing(4),
        marginBottom: theme.spacing(1),
        padding: theme.spacing(1),
        borderRadius: theme.spacing(1),
        backgroundColor: theme.palette.action.hover,
    },
    navigateButton: {
        marginTop: theme.spacing(2),
    },
    viewUsersButton: {
        marginTop: theme.spacing(2),
        marginLeft: theme.spacing(2),
    },
    addQuestionButton: {
        marginRight: theme.spacing(2),
    },
    modal: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    paper: {
        backgroundColor: theme.palette.background.paper,
        border: '2px solid #000',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
        outline: 'none',
        width: '400px',
        display: 'flex',
        flexDirection: 'column',
    },
    modalTitle: {
        marginBottom: theme.spacing(2),
    },
    modalButtons: {
        marginTop: theme.spacing(2),
        display: 'flex',
        justifyContent: 'flex-end',
    },
    answerRow: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: theme.spacing(1),
    },
    answerField: {
        marginRight: theme.spacing(1),
        flexGrow: 1,
    },
    gradeField: {
        width: '100px',
    },
    exportButton: {
        marginLeft: theme.spacing(2),
    },
}));

const TestsCreated = () => {
    const classes = useStyles();
    const [quizzes, setQuizzes] = useState([]);
    const [open, setOpen] = useState(false);
    const [currentQuizId, setCurrentQuizId] = useState(null);
    const [currentQuestionId, setCurrentQuestionId] = useState(null);
    const [question, setQuestion] = useState('');
    const [persoType, setPersoType] = useState('');
    const [answers, setAnswers] = useState([{ answerText: '', answerGrade: '' }]);
    const [isEditing, setIsEditing] = useState(false);
    const [quizTaken, setQuizTaken] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/quizzes-with-details');
                setQuizzes(response.data);
            } catch (error) {
                console.error('Error fetching quizzes:', error);
            }
        };

        fetchQuizzes();
    }, []);

    const exportQuizToCSV = (quizId, quizName, questions) => {
        const csvRows = [
            ['Quiz Name', 'Question', 'Type', 'Answers with Grades'],
            ...questions.map(question => [
                quizName,
                question.questionText,
                question.questionType,
                question.answers.map(answer => `${answer.answerText}:${answer.answerGrade}`).join('; ')
            ])
        ];
    
        const csvContent = csvRows.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, `quiz_details_${quizId}.csv`);
    };

    const exportUsersToCSV = async (quizId) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/quiz/${quizId}/users`);
            const users = response.data;

            const csvRows = [
                ['Name', 'Last Name', 'Email', 'Date Taken'],
                ...users.map(user => [
                    user.first_name,
                    user.last_name,
                    user.email,
                    new Date(user.DateTaken).toLocaleDateString()
                ])
            ];

            const csvContent = csvRows.map(row => row.join(',')).join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            saveAs(blob, `quiz_${quizId}_users.csv`);
        } catch (error) {
            console.error('Error exporting users:', error);
        }
    };
    

    const checkIfQuizTaken = async (quizId) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/quiz/${quizId}/taken`);
            return response.data.quizTaken;
        } catch (error) {
            console.error('Error checking quiz taken status:', error);
            return false;
        }
    };

    const handleToggleEnable = async (quizId, isEnable) => {
        try {
            await axios.put(`http://localhost:5000/api/quiz/${quizId}`, { isEnable: !isEnable });
            const updatedQuizzes = quizzes.map(quiz => {
                if (quiz.quizId === quizId) {
                    return { ...quiz, isEnable: !isEnable };
                }
                return quiz;
            });
            setQuizzes(updatedQuizzes);
        } catch (error) {
            console.error('Error toggling quiz enable status:', error);
        }
    };

    const handleNavigate = (quizId) => {
        navigate(`/quiz-users/${quizId}`);
    };

    const handleBack = () => {
        navigate(-1);
    };

    const handleOpen = async (quizId) => {
        const taken = await checkIfQuizTaken(quizId);
        if (taken) {
            toast.error("This quiz has already been taken by user and cannot be modified.");
            return;
        }
        setCurrentQuizId(quizId);
        setIsEditing(false);
        setOpen(true);
    };

    const handleEditOpen = async (quizId, question) => {
        const taken = await checkIfQuizTaken(quizId);
        if (taken) {
            toast.error("This quiz has already been taken by user and cannot be modified.");
            return;
        }
        setCurrentQuizId(quizId);
        setCurrentQuestionId(question.questionId);
        setQuestion(question.questionText);
        setPersoType(question.questionType);
        setAnswers(question.answers.map(answer => ({ answerId: answer.answerId, answerText: answer.answerText, answerGrade: answer.answerGrade })));
        setIsEditing(true);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setQuestion('');
        setPersoType('');
        setAnswers([{ answerText: '', answerGrade: '' }]);
    };

    const handleAddAnswer = () => {
        setAnswers([...answers, { answerText: '', answerGrade: '' }]);
    };

    const handleRemoveAnswer = (index) => {
        const newAnswers = answers.filter((_, i) => i !== index);
        setAnswers(newAnswers);
    };

    const handleAnswerChange = (index, field, value) => {
        const newAnswers = answers.map((answer, i) => {
            if (i === index) {
                return { ...answer, [field]: value };
            }
            return answer;
        });
        setAnswers(newAnswers);
    };

    const handleAddQuestion = async () => {
        try {
            const response = await axios.post(`http://localhost:5000/api/quizzes/${currentQuizId}/questions`, { question, persoType });
            const newQuestionId = response.data.questionId;

            await Promise.all(answers.map(answer =>
                axios.post(`http://localhost:5000/api/quizzes/${currentQuizId}/questions/${newQuestionId}/answers`, { answer: answer.answerText, answerGrade: answer.answerGrade })
            ));

            handleClose();
            window.location.reload();
        } catch (error) {
            console.error('Error adding question:', error);
        }
    };

    const handleEditQuestion = async () => {
        try {
            // Validate that none of the answers are empty
            const hasEmptyAnswer = answers.some(answer => !answer.answerText.trim());
            if (hasEmptyAnswer) {
                toast.error("Answer fields cannot be empty.");
                return;
            }
    
            // Update the question details
            await axios.put(`http://localhost:5000/api/quizzes/${currentQuizId}/questions/${currentQuestionId}`, { question, persoType });
    
            // Update each answer
            await Promise.all(answers.map(async (answer) => {
                if (answer.answerText !== null) {
                    if (answer.answerId) {
                        // Existing answer: Update existing answer
                        console.log(`Editing existing answer with ID ${answer.answerId}:`, answer);
                        return axios.put(`http://localhost:5000/api/quizzes/${currentQuizId}/questions/${currentQuestionId}/answers/${answer.answerId}`, { answerText: answer.answerText, answerGrade: answer.answerGrade });
                    } else {
                        // New answer: Add new answer
                        console.log('Adding new answer:', answer.answerText);
                        const response = await axios.post(`http://localhost:5000/api/quizzes-answers/${currentQuizId}/questions/${currentQuestionId}/answers`, { answerText: answer.answerText, answerGrade: answer.answerGrade });
                        answer.answerId = response.data.answerId;
                        return null;
                    }
                } else {
                    console.log('Answer text is null, skipping insertion.');
                    return null;
                }
            }));
    
            handleClose();
            window.location.reload();
        } catch (error) {
            console.error('Error editing question:', error);
        }
    };

    return (
        <Container className={classes.container}>
            <Button variant="contained" color="primary" onClick={handleBack} className={classes.backButton}>
                Back
            </Button>
            <Typography variant="h4" gutterBottom>
                All Quizzes
            </Typography>
            {quizzes.map(quiz => (
                <Card key={quiz.quizId} className={classes.quizCard} elevation={3}>
                    <div className={classes.quizHeader}>
                        <Typography variant="h5">{quiz.quizName}</Typography>
                    </div>
                    <CardContent>
                        <Typography variant="subtitle1" className={classes.quizDescription}>
                            {quiz.quizDescription}
                        </Typography>
                        <Typography variant="body2" className={classes.creationDate}>
                            Created on: {new Date(quiz.creationDate).toLocaleDateString()}
                        </Typography>
                        <Divider />
                        {quiz.questions.map(question => (
                            <Box key={question.questionId} className={classes.questionCard}>
                                <Typography variant="h6">Question: {question.questionText}</Typography>
                                <Typography variant="subtitle2">Type: {question.questionType}</Typography>
                                {question.answers.map(answer => (
                                    <Box key={answer.answerId} className={classes.answerBox}>
                                        <Typography variant="body1">Answer: {answer.answerText}</Typography>
                                        <Typography variant="body2">Grade: {answer.answerGrade}</Typography>
                                    </Box>
                                ))}
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    onClick={() => handleEditOpen(quiz.quizId, question)}
                                    startIcon={<EditIcon />}
                                >
                                    Edit Question
                                </Button>
                            </Box>
                        ))}
                        <Button
                            variant="contained"
                            color="primary"
                            className={`${classes.navigateButton} ${classes.addQuestionButton}`}
                            onClick={() => handleOpen(quiz.quizId)}
                        >
                            Add Question
                        </Button>
                        <Button
                            variant="contained"
                            color={quiz.isEnable ? "primary" : "default"}
                            className={classes.navigateButton}
                            onClick={() => handleToggleEnable(quiz.quizId, quiz.isEnable)}
                        >
                            {quiz.isEnable ? "Disable" : "Enable"} Test
                        </Button>

                        <Button
                            variant="contained"
                            color="primary"
                            className={`${classes.navigateButton} ${classes.viewUsersButton}`}
                            onClick={() => handleNavigate(quiz.quizId)}
                        >
                            View Users Who Took this Test
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            className={`${classes.navigateButton} ${classes.exportButton}`}
                            onClick={() => exportQuizToCSV(quiz.quizId, quiz.quizName, quiz.questions)}
                        >
                            Export Quiz Details
                        </Button>

                        <Button
                            variant="contained"
                            color="primary"
                            className={`${classes.navigateButton} ${classes.exportButton}`}
                            onClick={() => exportUsersToCSV(quiz.quizId)}
                        >
                            Export Users Who Took this Test
                        </Button>
                    </CardContent>
                </Card>
            ))}
            <Modal
                open={open}
                onClose={handleClose}
                className={classes.modal}
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
            >
                <div className={classes.paper}>
                    <Typography variant="h6" className={classes.modalTitle}>
                        {isEditing ? 'Edit Question' : 'Add a Question'}
                    </Typography>
                    <TextField
                        label="Question"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Type"
                        value={persoType}
                        onChange={(e) => setPersoType(e.target.value)}
                        fullWidth
                        margin="normal"
                    />
                    <Typography variant="subtitle1" gutterBottom>
                        Answers:
                    </Typography>
                    {answers.map((answer, index) => (
                        <div key={index} className={classes.answerRow}>
                            <TextField
                                label="Answer"
                                value={answer.answerText}
                                onChange={(e) => handleAnswerChange(index, 'answerText', e.target.value)}
                                className={classes.answerField}
                                margin="normal"
                            />
                            <TextField
                                label="Grade"
                                value={answer.answerGrade}
                                onChange={(e) => handleAnswerChange(index, 'answerGrade', e.target.value)}
                                className={classes.gradeField}
                                margin="normal"
                            />
                            <IconButton onClick={() => handleRemoveAnswer(index)}>
                                <RemoveIcon />
                            </IconButton>
                        </div>
                    ))}
                    <Button variant="contained" color="primary" onClick={handleAddAnswer} startIcon={<AddIcon />}>
                        Add Answer
                    </Button>
                    <div className={classes.modalButtons}>
                        <Button variant="contained" color="primary" onClick={isEditing ? handleEditQuestion : handleAddQuestion}>
                            Submit
                        </Button>
                        <Button variant="contained" onClick={handleClose}>
                            Cancel
                        </Button>
                    </div>
                </div>
            </Modal>
        </Container>
    );
};

export default TestsCreated;