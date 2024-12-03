import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Typography, Paper, makeStyles, Grid, Card, CardContent, CardHeader,
  TextField, Button, CardMedia, InputLabel, Select, MenuItem, FormControl
} from '@material-ui/core';

import { toast } from 'react-toastify';

const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(3),
  },
  card: {
    marginBottom: theme.spacing(2),
  },
  media: {
    height: 200,
    objectFit: 'cover',
  },
}));

const UsersInfo = () => {
  const classes = useStyles();
  const { userId } = useParams();
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null);
  const [editMode, setEditMode] = useState(false);
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

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/user-info/${userId}`);
        const data = response.data;
        setUserDetails(data);
        setBio(data.bio);
        setStudentHobbies(data.studentHobbies ? data.studentHobbies.split(',') : []);
        setStudentGender(data.studentGender);
        setBirthDate(data.birthDate);
        setFatherJob(data.fatherJob);
        setMotherJob(data.motherJob);
        setTestResult(data.testResult);
        setGrade1(data.grade1);
        setGrade2(data.grade2);
        setGrade3(data.grade3);
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    fetchUserDetails();
  }, [userId]);

  const handleEditClick = () => {
    setEditMode(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('bio', bio);
    formData.append('studentHobbies', studentHobbies.join(','));
    formData.append('studentGender', studentGender);
    formData.append('birthDate', birthDate);
    formData.append('fatherJob', fatherJob);
    formData.append('motherJob', motherJob);
    if (testResult) formData.append('testResult', testResult);
    if (grade1) formData.append('grade1', grade1);
    if (grade2) formData.append('grade2', grade2);
    if (grade3) formData.append('grade3', grade3);

    try {
      await axios.put(`http://localhost:5000/api/user-info/${userId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('Information updated successfully!');
      setEditMode(false);
      navigate('/welcome');
    } catch (error) {
      console.error('Error updating user details:', error);
      toast.error('Failed to update information. Please try again.');
    }
  };

  if (!userDetails) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Container className={classes.container}>
      <Paper className={classes.paper} elevation={3}>
        <Typography variant="h4" gutterBottom>User Details</Typography>
        {!editMode ? (
          <>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Card className={classes.card}>
                  <CardHeader title="Personal Information" />
                  <CardContent>
                    <Typography variant="body1"><strong>Bio:</strong> {userDetails.bio}</Typography>
                    <Typography variant="body1"><strong>Hobbies:</strong> {userDetails.studentHobbies}</Typography>
                    <Typography variant="body1"><strong>Gender:</strong> {userDetails.studentGender}</Typography>
                    <Typography variant="body1"><strong>Birthdate:</strong> {userDetails.birthDate}</Typography>
                    <Typography variant="body1"><strong>Father's Job:</strong> {userDetails.fatherJob}</Typography>
                    <Typography variant="body1"><strong>Mother's Job:</strong> {userDetails.motherJob}</Typography>
                    <Typography variant="body1"><strong>Test Results:</strong></Typography>
                    {userDetails.testResult && (
                      <a href={`data:application/pdf;base64,${userDetails.testResult}`} download="testResult.pdf">Download Test Result</a>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card className={classes.card}>
                  <CardHeader title="Grades" />
                  <CardContent>
                    {userDetails.grade1 && (
                      <div>
                        <Typography variant="body1"><strong>Grade 1:</strong></Typography>
                        <CardMedia
                          className={classes.media}
                          component="img"
                          image={`http://localhost:5000${userDetails.grade1}`}
                          alt="Grade 1"
                        />
                      </div>
                    )}
                    {userDetails.grade2 && (
                      <div>
                        <Typography variant="body1"><strong>Grade 2:</strong></Typography>
                        <CardMedia
                          className={classes.media}
                          component="img"
                          image={`http://localhost:5000${userDetails.grade2}`}
                          alt="Grade 2"
                        />
                      </div>
                    )}
                    {userDetails.grade3 && (
                      <div>
                        <Typography variant="body1"><strong>Grade 3:</strong></Typography>
                        <CardMedia
                          className={classes.media}
                          component="img"
                          image={`http://localhost:5000${userDetails.grade3}`}
                          alt="Grade 3"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            <Button
              variant="contained"
              color="primary"
              onClick={handleEditClick}
            >
              Edit
            </Button>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Card className={classes.card}>
                  <CardHeader title="Personal Information" />
                  <CardContent>
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
                    <FormControl fullWidth variant="outlined" margin="normal" required>
                      <InputLabel id="hobbies-label">Hobbies</InputLabel>
                      <Select
                        labelId="hobbies-label"
                        id="hobbies"
                        multiple
                        value={studentHobbies}
                        onChange={(e) => setStudentHobbies(e.target.value)}
                        renderValue={(selected) => selected.join(', ')}
                      >
                        <MenuItem value="Reading">Reading</MenuItem>
                        <MenuItem value="Traveling">Traveling</MenuItem>
                        <MenuItem value="Sports">Sports</MenuItem>
                        <MenuItem value="Music">Music</MenuItem>
                        <MenuItem value="Football">Football</MenuItem>
                        <MenuItem value="Basketball">Basketball</MenuItem>
                        <MenuItem value="Swimming">Swimming</MenuItem>
                        <MenuItem value="Hunting">Hunting</MenuItem>
                      </Select>
                    </FormControl>
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
                    <TextField
                      fullWidth
                      variant="outlined"
                      label="Birthdate"
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      required
                    />
                    <TextField
                      fullWidth
                      variant="outlined"
                      label="Father's Job"
                      value={fatherJob}
                      onChange={(e) => setFatherJob(e.target.value)}
                      required
                    />
                    <TextField
                      fullWidth
                      variant="outlined"
                      label="Mother's Job"
                      value={motherJob}
                      onChange={(e) => setMotherJob(e.target.value)}
                      required
                    />
                    <Typography variant="body1"><strong>Test Results:</strong></Typography>
                    {testResult && (
                      <a href={`data:application/pdf;base64,${testResult}`} download="testResult.pdf">Download Test Result</a>
                    )}
                    <Button
                      variant="contained"
                      component="label"
                      color="default"
                    >
                      Upload Test Result
                      <input
                        type="file"
                        hidden
                        onChange={(e) => setTestResult(e.target.files[0])}
                      />
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card className={classes.card}>
                  <CardHeader title="Grades" />
                  <CardContent>
                    <Button
                      variant="contained"
                      component="label"
                      color="default"
                    >
                      Upload Grade 1
                      <input
                        type="file"
                        hidden
                        onChange={(e) => setGrade1(e.target.files[0])}
                      />
                    </Button>
                    <Button
                      variant="contained"
                      component="label"
                      color="default"
                    >
                      Upload Grade 2
                      <input
                        type="file"
                        hidden
                        onChange={(e) => setGrade2(e.target.files[0])}
                      />
                    </Button>
                    <Button
                      variant="contained"
                      component="label"
                      color="default"
                    >
                      Upload Grade 3
                      <input
                        type="file"
                        hidden
                        onChange={(e) => setGrade3(e.target.files[0])}
                      />
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            <Button
              type="submit"
              variant="contained"
              color="primary"
            >
              Save
            </Button>
          </form>
        )}
      </Paper>
    </Container>
  );
};

export default UsersInfo;
