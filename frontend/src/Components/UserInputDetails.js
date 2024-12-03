import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  TextField, Button, Grid, Typography, Paper, MenuItem, Select,
  InputLabel, FormControl
} from '@material-ui/core';
import { toast } from 'react-toastify';
import ResponseFromAPI from './ResponseFromAPI'; // Adjust the import path as per your directory structure

const UserInfoDetails = () => {
  const [bio, setBio] = useState('');
  const [studentHobbies, setStudentHobbies] = useState([]);
  const [studentGender, setStudentGender] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [fatherJob, setFatherJob] = useState('');
  const [motherJob, setMotherJob] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [grade1, setGrade1] = useState(null);
  const [grade2, setGrade2] = useState(null);
  const [grade3, setGrade3] = useState(null);
  const [log9Value, setLog9Value] = useState(''); // State to hold log9Value

  const navigate = useNavigate();
  const location = useLocation();
  const { userId } = location.state || {};

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('bio', bio);
    formData.append('studentHobbies', JSON.stringify(studentHobbies)); // Convert array to string
    formData.append('studentGender', studentGender);
    formData.append('birthDate', birthDate);
    formData.append('fatherJob', fatherJob);
    formData.append('motherJob', motherJob);
    formData.append('testResult', testResult);
    formData.append('grade1', grade1);
    formData.append('grade2', grade2);
    formData.append('grade3', grade3);

    try {
      await axios.post(`http://localhost:5000/api/user-info/${userId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // API call constants
      const APP_ID = "ec92e672-5fbc-425b-b5b6-19a11a0c373f";
      const API_KEY = "sk52be3bd924f5fe4ab106892bfa849040e333f92e4d4911811f1c1b8aa39dad2a8994df146f5b936d7e5f1b5161a2c310c33dbfb9fc00e28bb8db18a183963465";

      // Fetch user information after updating it
      const res = await axios.get(`http://localhost:5000/api/user-info/${userId}`);
      const userInfo = res.data;

      // Initial API call to start the workflow and get thread id
      const response = await fetch("https://api.mindstudio.ai/developer/v1/apps/run", {
        method: 'POST',
        body: JSON.stringify({
          appId: APP_ID,
          variables: {
            fatherJob: userInfo.fatherJob,
            motherJob: userInfo.motherJob,
            studName: userInfo.firstName,
            studentInput: userInfo.bio,
            testResult: userInfo.testResult.join(','), // Join CSV array into string
            grade1: `http://localhost:5000${userInfo.grade1}`,
            grade2: `http://localhost:5000${userInfo.grade2}`,
            grade3: `http://localhost:5000${userInfo.grade3}`,
          },
          workflow: 'Main21.flow'
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
      console.log('Thread response data:', threadData);

      let log9Value = '';

      // Check if posts exist and log the last one
      if (threadData.thread && threadData.thread.posts && Array.isArray(threadData.thread.posts) && threadData.thread.posts.length > 0) {
        const lastPost = threadData.thread.posts[threadData.thread.posts.length - 1];
        console.log('Last post:', lastPost);

        if (lastPost.debugLog && lastPost.debugLog.logs && Array.isArray(lastPost.debugLog.logs) && lastPost.debugLog.logs.length > 0) {
          const log9 = lastPost.debugLog.logs[9];
          console.log('Log 9:', log9);
          log9Value = log9.value;
          console.log('Log 9 value:', log9Value);
        } else {
          console.log('No debugLog or logs available in last post.');
        }
      } else {
        console.log('No posts available in thread data.');
      }

      // Set log9Value in state
      setLog9Value(log9Value);


      toast.success('Information updated and workflow executed successfully!');

      // Inside handleSubmit function after setting log9Value
      navigate('/response-from-api', { state: { log9Value, userId } }); 



    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to update information or execute workflow. Please try again.');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <Paper elevation={3} style={{ padding: 20, maxWidth: 400, width: '100%' }}>
        <Typography variant="h4" align="center" gutterBottom>Update Your Information</Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12}>
              <TextField
                fullWidth
                variant="outlined"
                label="Bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                multiline
                rows={4}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined" required>
                <InputLabel id="hobbies-label">Hobbies</InputLabel>
                <Select
                  labelId="hobbies-label"
                  id="hobbies"
                  multiple
                  value={studentHobbies}
                  onChange={(e) => setStudentHobbies(e.target.value)}
                  renderValue={(selected) => selected.join(', ')}
                  inputProps={{
                    name: 'hobbies',
                    id: 'hobbies',
                  }}
                >
                  <MenuItem value="Reading">Reading</MenuItem>
                  <MenuItem value="Traveling">Traveling</MenuItem>
                  <MenuItem value="Sports">Sports</MenuItem>
                  <MenuItem value="Music">Music</MenuItem>
                  <MenuItem value="Football">Football</MenuItem>
                  <MenuItem value="Basketball">Basketball</MenuItem>
                  <MenuItem value="Hiking">Hiking</MenuItem>
                  <MenuItem value="Swimming">Swimming</MenuItem>
                  <MenuItem value="Hunting">Hunting</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                variant="outlined"
                label="Gender"
                value={studentGender}
                onChange={(e) => setStudentGender(e.target.value)}
                required
                select
              >
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                variant="outlined"
                label="Birthdate"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                required
                InputLabelProps={{
                  shrink: true
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                variant="outlined"
                label="Father's Job"
                value={fatherJob}
                onChange={(e) => setFatherJob(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                variant="outlined"
                label="Mother's Job"
                value={motherJob}
                onChange={(e) => setMotherJob(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body1">Test Results (CSV):</Typography>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setTestResult(e.target.files[0])}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body1">Grades Year 1:</Typography>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setGrade1(e.target.files[0])}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body1">Grades Year 2:</Typography>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setGrade2(e.target.files[0])}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body1">Grades Year 3:</Typography>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setGrade3(e.target.files[0])}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
              >
                Save
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </div>
  );
};

export default UserInfoDetails;
