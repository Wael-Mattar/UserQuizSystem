import React, { useEffect, useState, useContext, useRef } from 'react';
import axios from 'axios';
import { Box, Button, FormControlLabel, Radio, RadioGroup, Typography, withStyles } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AuthContext from '../AuthContext';
import { jwtDecode } from 'jwt-decode';
import { useNavigate, useParams } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    padding: theme.spacing(2),
  },
  mainContent: {
    flex: 3,
    paddingRight: theme.spacing(2),
  },
  sidebar: {
    flex: 1,
    maxHeight: '80vh',
    overflowY: 'auto',
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.spacing(1),
    position: 'sticky',
    top: theme.spacing(8),
    alignSelf: 'flex-start',
  },
  logoutButton: {
    position: 'fixed',
    top: theme.spacing(2),
    right: theme.spacing(2),
    zIndex: 1000,
  },
  question: {
    marginBottom: theme.spacing(2),
    padding: theme.spacing(2),
    border: '1px solid #ccc',
    borderRadius: theme.spacing(1),
  },
  answer: {
    marginTop: theme.spacing(1),
  },
  button: {
    marginTop: theme.spacing(2),
  },
}));

const CustomRadio = withStyles({
  root: {
    '&$checked': {
      color: '#3f51b5',
    },
    '&$checked:before': {
      content: '""',
      display: 'block',
      width: '10px',
      height: '10px',
      backgroundColor: '#4caf50',
      borderRadius: '50%',
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    },
  },
  checked: {},
})(Radio);

const Test = () => {
  const classes = useStyles();
  const { token, setToken } = useContext(AuthContext);
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState({});
  const [userInfo, setUserInfo] = useState(null);
  const questionRefs = useRef([]);
  const navigate = useNavigate();
  const { quizId } = useParams();
  const [threadId, setThreadId] = useState(null); // Define state variable for threadId
  const [resultData, setResultData] = useState(null); // Define state variable for resultData
  const [loading, setLoading] = useState(false); // Define state variable for loading state

  useEffect(() => {
    const fetchQuestionsAndAnswers = async () => {
      const quizRes = await axios.get(`http://localhost:5000/api/quizzes-with-details/${quizId}`);
      const quiz = quizRes.data;
      setQuestions(quiz.questions);
    };
    fetchQuestionsAndAnswers();
  }, [quizId]);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (token) {
        const userId = jwtDecode(token).id;
        try {
          const res = await axios.get(`http://localhost:5000/api/user-info/${userId}`);
          console.log('User info fetched:', res.data);
          setUserInfo(res.data);
        } catch (error) {
          console.error('Error fetching user information:', error);
        }
      }
    };
    fetchUserInfo();
  }, [token]);

  const handleChange = (questionId, answerId) => {
    setResponses({ ...responses, [questionId]: answerId });
  };

  const executeMindStudioWorkflow = async () => {
    const APP_ID = "ec92e672-5fbc-425b-b5b6-19a11a0c373f";
    const API_KEY = "sk52be3bd924f5fe4ab106892bfa849040e333f92e4d4911811f1c1b8aa39dad2a8994df146f5b936d7e5f1b5161a2c310c33dbfb9fc00e28bb8db18a183963465";
  
    setLoading(true);
  
    try {
      // Initial API call to start the workflow and get thread id
      const response = await fetch("https://api.mindstudio.ai/developer/v1/apps/run", {
        method: 'POST',
        body: JSON.stringify({
          appId: APP_ID,
          variables: {
            studentInput:userInfo.bio,
            testResult: userInfo.testResult.join(','),
            grade1: `http://localhost:5000${userInfo.grade1}`,
            grade2: `http://localhost:5000${userInfo.grade2}`,
            grade3: `http://localhost:5000${userInfo.grade3}`,
          },
          workflow: 'Main2.flow'
        }),
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${API_KEY}`,
        }
      });
  
      if (!response.ok) {
        throw new Error(`Initial API call failed: ${response.status} - ${response.statusText}`);
      }
  
      const data = await response.json();
      console.log('Initial API response data:', data);
  
      // Using thread id to get results
      const threadResponse = await fetch("https://api.mindstudio.ai/developer/v1/apps/load-thread", {
        method: 'POST',
        body: JSON.stringify({
          appId: APP_ID,
          threadId: data.threadId,
        }),
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${API_KEY}`,
        }
      });
  
      if (!threadResponse.ok) {
        throw new Error(`Thread API call failed: ${threadResponse.status} - ${threadResponse.statusText}`);
      }
  
      const threadData = await threadResponse.json();
      
      setThreadId(data.threadId);
      setResultData(threadData.thread);
      
      console.log('final Thread response data:', threadData);
      console.log('Final:', threadData.token);
  
    } catch (error) {
      console.error('Error executing MindStudio workflow:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      console.log('Please log in to submit the test.');
      return;
    }
    const userId = jwtDecode(token).id;

    const result = {
      userId,
      quizId,
      answers: responses,
    };

    try {
      await axios.post('http://localhost:5000/api/submit-quiz', result);
      console.log('Quiz submitted successfully:', result);
      await executeMindStudioWorkflow();

      toast.success(`Test submitted successfully!`, {
        onClose: () => {
          setTimeout(() => {
            navigate('/welcome');
          }, 200);
        }
      });
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error('Error submitting quiz. Please try again later.');
    }
  };


  const handleLogout = () => {
    setToken(null);
    navigate('/login');
  };

  const scrollToQuestion = (index) => {
    questionRefs.current[index].scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <ToastContainer />
      <Button
        variant="contained"
        color="secondary"
        className={classes.logoutButton}
        onClick={handleLogout}
      >
        Logout
      </Button>
      <div className={classes.root}>
        <div className={classes.mainContent}>
          <Typography variant="h5" component="h2" gutterBottom>
            Test Questions
          </Typography>
          <form onSubmit={handleSubmit}>
            {questions.map((q, index) => (
              <Box
                key={q.questionId}
                className={classes.question}
                ref={(el) => (questionRefs.current[index] = el)}
              >
                <Typography variant="body1" gutterBottom>{`Question ${index + 1}: ${q.questionText}`}</Typography>
                <RadioGroup
                  aria-label={`question-${q.questionId}`}
                  name={`question-${q.questionId}`}
                  value={responses[q.questionId] || ''}
                  onChange={(e) => handleChange(q.questionId, parseInt(e.target.value))}
                >
                  {q.answers.map(a => (
                    <FormControlLabel
                      key={a.answerId}
                      value={a.answerId.toString()}
                      control={<CustomRadio checked={responses[q.questionId] === a.answerId} />}
                      label={a.answerText}
                      className={`${classes.answer} ${responses[q.questionId] === a.answerId ? classes.selectedAnswer : ''}`}
                    />
                  ))}
                </RadioGroup>
              </Box>
            ))}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              className={classes.button}
            >
              Submit and Get Feedback
            </Button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Test;
