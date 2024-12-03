import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Container, Typography, Card, CardContent, makeStyles, Button, Grid } from '@material-ui/core';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../AuthContext';

const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: theme.spacing(4),
  },
  quizCard: {
    borderRadius: theme.spacing(1),
    backgroundColor: theme.palette.background.paper,
    cursor: 'pointer',
    transition: 'transform 0.3s',
    '&:hover': {
      transform: 'scale(1.02)',
    },
    height: '100%', // Set a fixed height for each card
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
  buttonContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: theme.spacing(2),
  },
  button: {
    margin: theme.spacing(1),
  },
}));

const WelcomePage = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const { token, setToken } = useContext(AuthContext);
  const { state } = useLocation();
  const userId = state ? state.userId : null;

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/quizzes-with-details');
        const enabledQuizzes = await Promise.all(
          response.data.map(async (quiz) => {
            const statusResponse = await axios.get(`http://localhost:5000/api/quiz/${quiz.quizId}/isenable`);
            return statusResponse.data.isEnable ? quiz : null;
          })
        );
        setQuizzes(enabledQuizzes.filter(Boolean));
      } catch (error) {
        console.error('Error fetching quizzes:', error);
      }
    };

    fetchQuizzes();
  }, []);

  const handleQuizSelect = (quizId) => {
    navigate(`/test/${quizId}`);
  };

  const handleViewTests = async () => {
    try {
      navigate(`/users-tests-taken/${userId}`); 
    } catch (error) {
      console.error('Error fetching tests taken:', error);
    }
  };

  const handleViewUserDetails = () => {
    navigate(`/user-info/${userId}`);
  };

  const handleLogout = () => {
    setToken(null);
    navigate('/login');
  };

  return (
    <Container className={classes.container}>
      <div className={classes.buttonContainer}>
        <Button
          variant="contained"
          color="primary"
          className={classes.button}
          onClick={handleViewTests}
        >
          View All Tests Taken
        </Button>
        {/* <Button
          variant="contained"
          color="primary"
          className={classes.button}
          onClick={handleViewUserDetails}
        >
          View User Details
        </Button> */}
        <Button
          variant="contained"
          color="secondary"
          className={classes.button}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </div>
      <Typography variant="h4" gutterBottom>
        Welcome! Please select a test to take
      </Typography>
      <Grid container spacing={3}>
        {quizzes.map((quiz) => (
          <Grid item xs={12} sm={6} md={4} key={quiz.quizId}>
            <Card
              className={classes.quizCard}
              elevation={3}
              onClick={() => handleQuizSelect(quiz.quizId)}
            >
              <div className={classes.quizHeader}>
                <Typography variant="h5">{quiz.quizName}</Typography>
              </div>
              <CardContent>
                <Typography variant="subtitle1" className={classes.quizDescription}>
                  {quiz.quizDescription}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default WelcomePage;
