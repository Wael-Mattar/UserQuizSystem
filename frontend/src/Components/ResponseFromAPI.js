import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Paper, Typography, CircularProgress, Button, makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: theme.spacing(3),
  },
  paper: {
    padding: theme.spacing(4),
    maxWidth: 800,
    width: '100%',
    backgroundColor: '#ffffff',
  },
  sectionTitle: {
    marginBottom: theme.spacing(2),
    color: theme.palette.primary.main,
  },
  subSectionTitle: {
    marginBottom: theme.spacing(1),
    color: theme.palette.secondary.main,
  },
  content: {
    marginBottom: theme.spacing(2),
    color: '#333',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 100,
  },
  loadingText: {
    marginLeft: theme.spacing(2),
    color: '#666',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: theme.spacing(3),
  },
}));

const ResponseFromAPI = () => {
  const classes = useStyles();
  const location = useLocation();
  const navigate = useNavigate();
  const { log9Value } = location.state || {};
  const { userId } = location.state || {};

  const parseResponse = (response) => {
    const sections = response.split('### ').filter(Boolean);
    return sections.map((section, index) => {
      const [title, ...content] = section.split('\n').filter(Boolean);
      return { title, content: content.join('\n') };
    });
  };

  const parsedResponse = log9Value ? parseResponse(log9Value) : [];

  const handleBackToWelcome = () => {
    navigate('/welcome', { state: {userId }} );
  };

  return (
    <Container className={classes.container}>
      <Paper elevation={3} className={classes.paper}>
        <div className={classes.buttonContainer}>
          <Button variant="contained" color="primary" onClick={handleBackToWelcome}>
            Back to Welcome
          </Button>
        </div>
        <Typography variant="h4" align="center" gutterBottom>
          API Response
        </Typography>
        {log9Value ? (
          parsedResponse.map((section, index) => (
            <div key={index} className={classes.content}>
              <Typography variant="h5" className={classes.sectionTitle} gutterBottom>
                {section.title}
              </Typography>
              {section.content.split('#### ').filter(Boolean).map((subSection, subIndex) => {
                const [subTitle, ...subContent] = subSection.split('\n').filter(Boolean);
                return (
                  <div key={subIndex} className={classes.content}>
                    {subTitle && (
                      <Typography variant="h6" className={classes.subSectionTitle} gutterBottom>
                        {subTitle}
                      </Typography>
                    )}
                    <Typography variant="body1" paragraph>
                      {subContent.join(' ')}
                    </Typography>
                  </div>
                );
              })}
            </div>
          ))
        ) : (
          <div className={classes.loadingContainer}>
            <CircularProgress />
            <Typography variant="body2" className={classes.loadingText}>
              Loading...
            </Typography>
          </div>
        )}
      </Paper>
    </Container>
  );
};

export default ResponseFromAPI;
