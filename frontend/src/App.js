import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import Signup from './Components/Signup';
import Login from './Components/Login';
import Test from './Components/Test';
import UsersPage from './Components/UsersPage'; 
import Admin from './Components/Admin';
import UsersDetails from './Components/UsersDetails';
import CreateTest from './Components/CreateTest';
import TestsCreated from './Components/TestsCreated';
import WelcomePage from './Components/WelcomePage';
import UsersTestsTaken from './Components/UsersTestsTaken';
import UsersTestResults from './Components/UsersTestResults';
import QuizUsers from './Components/QuizUsers';
import ResponseFromAPI from './Components/ResponseFromAPI';
import VerifyEmail from './Components/VerifyEmail';
import UserInputDetails from './Components/UserInputDetails';
import UsersInfo from './Components/UsersInfo';
import APIResponseDetails from './Components/APIResponseDetails';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<Signup />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/verify-email" element={<VerifyEmail />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/api-response-details/:userId" element={<APIResponseDetails />} />
                    <Route path="/user-info-details" element={<UserInputDetails />} />
                    <Route path="/user-info/:userId" element={<UsersInfo />} />
                    <Route path="/welcome" element={<WelcomePage />} />
                    <Route path="/response-from-api" element={<ResponseFromAPI />} />
                    <Route path="/users" element={<UsersPage />} /> 
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/user-details/:userId" element={<UsersDetails />} /> 
                    <Route path="/users/:id" element={<UsersPage />} />
                    <Route path="/create-test" element={<CreateTest />} />
                    <Route path="/tests-created" element={<TestsCreated/>} />
                    <Route path="/test/:quizId" element={<Test />} />
                    <Route path="/users-tests-taken/:userId" element={<UsersTestsTaken />} />
                    {/* <Route path="/users/:quizId" element={<UsersPage />} /> */}
                    <Route path="/user-test-results/:userQuizId" element={<UsersTestResults />} />
                    <Route path="/quiz-users/:quizId" element={<QuizUsers />} />
                </Routes>
            </Router>
            <ToastContainer position="top-center" style={{ marginTop: '120px' }} />
        </AuthProvider>
    );
};

export default App;
