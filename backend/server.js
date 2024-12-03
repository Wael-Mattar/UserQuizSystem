const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const multer = require('multer');

const app = express();
const PORT = 5000;

app.use(bodyParser.json());
app.use(cors());

const db = mysql.createConnection({
    host: 'localhost',
    port: 3307,
    user: 'your_username',
    password: 'your_password',
    database: 'your_database',
    connectionLimit: 10
});

db.connect(err => {
    if (err) {
        throw err;
    }
    console.log('MySQL Connected...');
});


const storage = multer.memoryStorage();
const upload = multer({ storage });
const fs = require('fs');
const path = require('path');
app.use('/images', express.static(path.join(__dirname, 'images')));

// app.get('/api/images/:imageName', (req, res) => {
//     const imageName = req.params.imageName;
//     const imagePath = path.join(__dirname, 'images', imageName);
  
//     res.sendFile(imagePath, (err) => {
//       if (err) {
//         res.status(404).send('Image not found');
//       }
//     });
//   });
  
app.post('/api/user-info/:id', upload.fields([
    { name: 'testResult' },
    { name: 'grade1' },
    { name: 'grade2' },
    { name: 'grade3' }
]), async (req, res) => {
    const { id } = req.params;
    const { bio, studentHobbies, studentGender, birthDate, fatherJob, motherJob } = req.body;
    const testResult = req.files['testResult'] ? req.files['testResult'][0].buffer : null;
    const grade1 = req.files['grade1'] ? req.files['grade1'][0].buffer : null;
    const grade2 = req.files['grade2'] ? req.files['grade2'][0].buffer : null;
    const grade3 = req.files['grade3'] ? req.files['grade3'][0].buffer : null;

    // Define the directory to save images
    const imageDir = path.join(__dirname, 'images');
    if (!fs.existsSync(imageDir)) {
        fs.mkdirSync(imageDir, { recursive: true });
    }

    // Save grade images locally
    if (grade1) {
        const grade1Path = path.join(imageDir, `grade1_${id}.jpg`);
        fs.writeFileSync(grade1Path, grade1);
    }
    if (grade2) {
        const grade2Path = path.join(imageDir, `grade2_${id}.jpg`);
        fs.writeFileSync(grade2Path, grade2);
    }
    if (grade3) {
        const grade3Path = path.join(imageDir, `grade3_${id}.jpg`);
        fs.writeFileSync(grade3Path, grade3);
    }

    const query = `
    UPDATE users
    SET bio = ?, studentHobbies = ?, studentGender = ?, birthDate = ?, fatherJob = ?, motherJob = ?, testResult = ?
    WHERE id = ?
  `;

    db.query(query, [bio, studentHobbies, studentGender, birthDate, fatherJob, motherJob, testResult, id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send({ msg: 'Failed to update user information' });
        }
        res.send({ msg: 'User information updated successfully!' });
    });
});


app.get('/api/user-info/:userId', (req, res) => {
    const { userId } = req.params;

    const query = `
      SELECT id, email, first_name, last_name, bio, studentHobbies, studentGender,
             birthDate, fatherJob, motherJob, testResult
      FROM users
      WHERE id = ?
    `;

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error fetching user information');
        }

        if (results.length === 0) {
            return res.status(404).send('User not found');
        }

        const user = results[0];

        let testResultData = null;
        if (user.testResult) {
            // Assuming testResult is stored as base64 in the database
            const decodedTestResult = Buffer.from(user.testResult, 'base64').toString('utf-8');
            testResultData = decodedTestResult.split(',').map(item => item.trim());
        }

        const userDetails = {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            bio: user.bio,
            studentHobbies: user.studentHobbies,
            studentGender: user.studentGender,
            birthDate: user.birthDate,
            fatherJob: user.fatherJob,
            motherJob: user.motherJob,
            testResult: testResultData,
            grade1: `/images/grade1_${userId}.jpg`,
            grade2: `/images/grade2_${userId}.jpg`,
            grade3: `/images/grade3_${userId}.jpg`
        };

        res.send(userDetails);
    });
});

app.use(bodyParser.urlencoded({ extended: true }));

app.put('/api/user-info/:id', upload.fields([
    { name: 'testResult' },
    { name: 'grade1' },
    { name: 'grade2' },
    { name: 'grade3' }
]), async (req, res) => {
    const { id } = req.params;
    const { bio, studentHobbies, studentGender, birthDate, fatherJob, motherJob } = req.body;
    const testResult = req.files['testResult'] ? req.files['testResult'][0].buffer : null;
    const grade1 = req.files['grade1'] ? req.files['grade1'][0].buffer : null;
    const grade2 = req.files['grade2'] ? req.files['grade2'][0].buffer : null;
    const grade3 = req.files['grade3'] ? req.files['grade3'][0].buffer : null;

    // Define the directory to save images
    const imageDir = path.join(__dirname, 'images');
    if (!fs.existsSync(imageDir)) {
        fs.mkdirSync(imageDir, { recursive: true });
    }

    // Save grade images locally
    if (grade1) {
        const grade1Path = path.join(imageDir, `grade1_${id}.jpg`);
        fs.writeFileSync(grade1Path, grade1);
    }
    if (grade2) {
        const grade2Path = path.join(imageDir, `grade2_${id}.jpg`);
        fs.writeFileSync(grade2Path, grade2);
    }
    if (grade3) {
        const grade3Path = path.join(imageDir, `grade3_${id}.jpg`);
        fs.writeFileSync(grade3Path, grade3);
    }

    const query = `
    UPDATE users
    SET bio = ?, studentHobbies = ?, studentGender = ?, birthDate = ?, fatherJob = ?, motherJob = ?, testResult = ?
    WHERE id = ?
  `;

    db.query(query, [bio, studentHobbies, studentGender, birthDate, fatherJob, motherJob, testResult, id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send({ msg: 'Failed to update user information' });
        }
        res.send({ msg: 'User information updated successfully!' });
    });
});




app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err) throw err;
        if (results.length === 0) {
            return res.status(401).send({ msg: 'Invalid email or password' });
        }

        const user = results[0];

        // if (user.is_verified === 0) {
        //     return res.status(401).send({ msg: 'Your email is not verified. Please check your email to verify your account.' });
        // }

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) throw err;
            if (!isMatch) {
                return res.status(401).send({ msg: 'Invalid email or password' });
            }

            const token = jwt.sign({ id: user.id, role: user.role }, "222=-//", { expiresIn: '1h' });
            res.send({ token });
        });
    });
});

// Get User Role
app.get('/api/user-role/:id', (req, res) => {
    const userId = req.params.id;
    db.query('SELECT role FROM users WHERE id = ?', [userId], (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            res.send({ role: results[0].role });
        } else {
            res.status(404).send({ msg: 'User not found' });
        }
    });
});

app.get('/api/super-admins', (req, res) => {
    db.query('SELECT role FROM users WHERE role = ?', ['super admin'], (err, results) => {
        if (err) {
            console.error('Error fetching super admins:', err);
            res.status(500).send({ error: 'An error occurred while fetching super admins.' });
        } else if (results.length === 0) {
            res.status(404).send({ msg: 'No super admins found' });
        } else {
            res.send(results);
        }
    });
});

// Get list of admins
app.get('/api/admins', (req, res) => {
    db.query('SELECT id, email, first_name, last_name, created_at FROM users WHERE role = "admin"', (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send({ error: 'An error occurred while fetching admins.' });
        } else {
            res.send(results);
        }
    });
});

// Enable or Disable an Admin
app.put('/api/admins/:id', (req, res) => {
    const { id } = req.params;
    const { isEnabled } = req.body;

    db.query('UPDATE users SET isEnabled = ? WHERE id = ?', [isEnabled, id], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send({ error: 'An error occurred while updating the admin status.' });
        } else {
            res.send({ msg: 'Admin status updated successfully.' });
        }
    });
});

app.put('/api/user/:userId', (req, res) => {
    const { userId } = req.params;
    const { isEnabled } = req.body;

    db.query('UPDATE users SET isEnabled = ? WHERE id = ?', [isEnabled, userId], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send({ error: 'An error occurred while updating the user status.' });
        } else {
            res.send({ msg: 'User status updated successfully.' });
        }
    });
});


// Get user by ID
app.get('/api/user/:id', (req, res) => {
    const userId = req.params.id;
    db.query('SELECT id, email, first_name, last_name, created_at, isEnabled FROM users WHERE id = ?', [userId], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send({ error: 'An error occurred while fetching the user.' });
        } else {
            if (results.length > 0) {
                res.send(results[0]);
            } else {
                res.status(404).send({ error: 'User not found' });
            }
        }
    });
});




// Get Users
app.get('/api/users', (req, res) => {
    db.query('SELECT * FROM users where role="user"', (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send({ error: 'An error occurred while fetching users.' });
        } else {
            res.send(results);
        }
    });
});

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'waelmattar11@gmail.com',
        pass: 'qenw nulm hjnp gzhz'
    }
});


app.post('/api/signup', (req, res) => {
    const { email, password, first_name, last_name } = req.body;

    bcrypt.hash(password, 10, (err, hash) => {
        if (err) throw err;

        const verificationToken = "shhhhaibckabckanck";
        const verificationTokenExpiry = Date.now() + 3600000; // 1 hour

        db.query('INSERT INTO users (email, password, first_name, last_name, is_verified, verification_token, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
            [email, hash, first_name, last_name, 0, verificationToken], (err, result) => {
                if (err) throw err;

                const verificationLink = `http://localhost:3000/verify-email?token=${verificationToken}`;

                const mailOptions = {
                    from: 'waelmattar11@gmail.com',
                    to: email,
                    subject: 'Email Verification',
                    text: `Please Click this link to verify your email: ${verificationLink}`
                };

                transporter.sendMail(mailOptions, (err, info) => {
                    if (err) {
                        return res.status(500).send({ msg: 'Error sending email' });
                    }
                    res.send({ msg: 'User registered successfully! Please check your email to verify your account.' });
                });
            });
    });
});

app.get('/api/verify-email', (req, res) => {
    const { token } = req.query;

    db.query('SELECT * FROM users WHERE verification_token = ?', [token], (err, results) => {
        if (err) throw err;

        if (results.length === 0) {
            return res.status(400).send({ msg: 'Invalid or expired token' });
        }

        const user = results[0];

        db.query('UPDATE users SET is_verified = 1 WHERE id = ?', [user.id], (err, result) => {
            if (err) {
                console.error('Error updating is_verified:', err);
                throw err;
            }
            console.log('Update result:', result);
            res.send({ msg: 'Email verified successfully!' });
        });
        
    });
});

// Add a new user with email, password, first name, and last name
// app.post('/api/signup', (req, res) => {
//     const { email, password, first_name, last_name } = req.body;

//     // Generate a verification token
//     //const verification_token = crypto.randomBytes(32).toString('hex');
//     const verification_token = "waelwael"
//     // Send verification email
//     const verificationUrl = `http://localhost:3000/verify-email?token=${verification_token}`;
//     const mailOptions = {
//         from: 'waelmattar11@gmail.com',
//         to: email,
//         subject: 'Email Verification',
//         text: `Please verify your email by clicking the following link: ${verificationUrl}`
//     };

//     transporter.sendMail(mailOptions, (err, info) => {
//         if (err) {
//             console.error('Error sending email:', err);
//             return res.status(500).send({ msg: 'Error sending verification email' });
//         }

//         // Save user details and verification token to database
//         bcrypt.hash(password, 10, (err, hash) => {
//             if (err) {
//                 console.error('Error hashing password:', err);
//                 return res.status(500).send({ msg: 'Error hashing password' });
//             }

//             const sql = 'INSERT INTO users (email, password, first_name, last_name, verification_token, is_verified) VALUES (?, ?, ?, ?, ?, 0)';
//             db.query(sql, [email, hash, first_name, last_name, verification_token], (err, result) => {
//                 if (err) {
//                     console.error('Error saving user to database:', err);
//                     return res.status(500).send({ msg: 'Error saving user to database' });
//                 }

//                 res.send({ msg: 'Verification email sent! Please check your email to verify your account.' });
//             });
//         });
//     });
// });




// // Verification route
// app.get('/api/verify-email', (req, res) => {
//     const { token } = "waelwael"

//     // Update user's verification status in the database
//     const sql = 'UPDATE users SET is_verified = 1 WHERE verification_token = ?';
//     db.query(sql, [token], (err, result) => {
//         if (err) {
//             console.error('Error verifying email:', err);
//             res.status(500).send({ msg: 'Error verifying email' });
//         } else if (result.affectedRows === 0) {
//             res.status(400).send({ msg: 'Invalid or expired token' });
//         } else {
//             res.send({ msg: 'Email verified successfully!' });
//         }
//     });
// });





async function executeQuery(sql, params) {
    try {
        const [rows, fields] = await db.promise().query(sql, params);
        return rows;
    } catch (error) {
        throw error;
    }
}


// Create a new quiz
app.post('/api/quizzes', async (req, res) => {
    try {
        const { name, description } = req.body;
        const result = await executeQuery('INSERT INTO Quiz (Name, Description) VALUES (?, ?)', [name, description]);
        const quizId = result.insertId;
        res.status(201).json({ quizId });
    } catch (error) {
        console.error('Error creating quiz:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Add a question to a quiz
app.post('/api/quizzes/:quizId/questions', async (req, res) => {
    try {
        const { quizId } = req.params;
        const { question, persoType } = req.body;
        const result = await executeQuery('INSERT INTO QuizQuestions (QuizId, Question, PersoType) VALUES (?, ?, ?)', [quizId, question, persoType]);
        const questionId = result.insertId;
        res.status(201).json({ questionId });
    } catch (error) {
        console.error('Error creating question:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Add an answer to a question
app.post('/api/quizzes/:quizId/questions/:questionId/answers', async (req, res) => {
    try {
        const { quizId, questionId } = req.params;
        const { answer, answerGrade } = req.body;

        await executeQuery('INSERT INTO QuizQuestAnswers (QuizId, QuizQuestionID, Answer, AnswerGrade) VALUES (?, ?, ?, ?)', [quizId, questionId, answer, answerGrade]);
        res.status(201).json({ message: 'Answer created' });
    } catch (error) {
        console.error('Error creating answer:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// Fetch all quizzes with their questions and answers
app.get('/api/quizzes-with-details', async (req, res) => {
    try {
        const quizzes = await executeQuery(`
            SELECT 
                q.id AS quizId, 
                q.name AS quizName, 
                q.description AS quizDescription,
                q.CreationDate as creationDate,
                q.isEnable,
                qq.id AS questionId,
                qq.question AS questionText,
                qq.persoType AS questionType,
                qa.id AS answerId,
                qa.answer AS answerText,
                qa.answerGrade AS answerGrade
            FROM Quiz q
            LEFT JOIN QuizQuestions qq ON q.id = qq.QuizId
            LEFT JOIN QuizQuestAnswers qa ON qq.id = qa.QuizQuestionID
            ORDER BY q.id, qq.id, qa.id
        `);

        const result = quizzes.reduce((acc, row) => {
            const {
                quizId, quizName, quizDescription, creationDate, isEnable,
                questionId, questionText, questionType,
                answerId, answerText, answerGrade
            } = row;

            let quiz = acc.find(q => q.quizId === quizId);
            if (!quiz) {
                quiz = { quizId, quizName, quizDescription, creationDate, isEnable, questions: [] };
                acc.push(quiz);
            }

            let question = quiz.questions.find(q => q.questionId === questionId);
            if (!question) {
                question = { questionId, questionText, questionType, answers: [] };
                quiz.questions.push(question);
            }

            if (answerId) {
                question.answers.push({ answerId, answerText, answerGrade });
            }

            return acc;
        }, []);

        res.json(result);
    } catch (error) {
        console.error('Error fetching quizzes:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/api/quizzes-with-details/:quizId', async (req, res) => {
    const { quizId } = req.params;
    try {
        const quizzes = await executeQuery(`
            SELECT 
                q.id AS quizId, 
                q.name AS quizName, 
                q.description AS quizDescription,
                q.CreationDate as creationDate,
                q.isEnable,
                qq.id AS questionId,
                qq.question AS questionText,
                qq.persoType AS questionType,
                qa.id AS answerId,
                qa.answer AS answerText,
                qa.answerGrade AS answerGrade
            FROM Quiz q
            LEFT JOIN QuizQuestions qq ON q.id = qq.QuizId
            LEFT JOIN QuizQuestAnswers qa ON qq.id = qa.QuizQuestionID
            WHERE q.id = ?
            ORDER BY q.id, qq.id, qa.id
        `, [quizId]);

        if (quizzes.length === 0) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        const result = quizzes.reduce((acc, row) => {
            const {
                quizId, quizName, quizDescription, creationDate, isEnable,
                questionId, questionText, questionType,
                answerId, answerText, answerGrade
            } = row;

            let quiz = acc.find(q => q.quizId === quizId);
            if (!quiz) {
                quiz = { quizId, quizName, quizDescription, creationDate, isEnable, questions: [] };
                acc.push(quiz);
            }

            let question = quiz.questions.find(q => q.questionId === questionId);
            if (!question) {
                question = { questionId, questionText, questionType, answers: [] };
                quiz.questions.push(question);
            }

            if (answerId) {
                question.answers.push({ answerId, answerText, answerGrade });
            }

            return acc;
        }, []);

        res.json(result[0]);
    } catch (error) {
        console.error('Error fetching quizzes:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// Enable or Disable a Quiz
app.put('/api/quiz/:id', (req, res) => {
    const { id } = req.params;
    const { isEnable } = req.body;

    db.query('UPDATE quiz SET isEnable = ? WHERE id = ?', [isEnable, id], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send({ error: 'An error occurred while updating the quiz status.' });
        } else {
            res.send({ msg: 'Admin status updated successfully.' });
        }
    });
});

app.get('/api/quiz/:id/isenable', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await executeQuery('SELECT isEnable FROM Quiz WHERE id = ?', [id]);

        if (result.length === 0) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        res.json({ quizId: id, isEnable: result[0].isEnable });
    } catch (error) {
        console.error('Error fetching quiz enable status:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});





app.post('/api/submit-quiz', async (req, res) => {
    const { userId, quizId, answers } = req.body;

    try {
        // Insert into UserQuiz table
        const userQuizResult = await executeQuery(
            'INSERT INTO UserQuiz (UserId, QuizID) VALUES (?, ?)',
            [userId, quizId]
        );

        const userQuizId = userQuizResult.insertId;

        // Iterate over the keys of the answers object
        for (const questionId in answers) {
            if (answers.hasOwnProperty(questionId)) {
                const answerId = answers[questionId];

                // Fetch the correct answer grade from the QuizQuestAnswers table
                const correctAnswer = await executeQuery(
                    'SELECT AnswerGrade FROM QuizQuestAnswers WHERE QuizQuestionID = ? AND ID = ?',
                    [questionId, answerId]
                );

                const grade = correctAnswer.length ? correctAnswer[0].AnswerGrade : 0;

                // Insert the user's answer into the UserQuizAnswers table
                await executeQuery(
                    'INSERT INTO UserQuizAnswers (UserQuizID, QuestionID, Answer, Grade) VALUES (?, ?, ?, ?)',
                    [userQuizId, questionId, answerId, grade]
                );
            }
        }

        // Calculate results grouped by question type
        const results = await executeQuery(
            `SELECT qq.PersoType, SUM(uqa.Grade) as TotalGrade
             FROM UserQuizAnswers uqa
             JOIN QuizQuestions qq ON uqa.QuestionID = qq.ID
             WHERE uqa.UserQuizID = ?
             GROUP BY qq.PersoType`,
            [userQuizId]
        );

        res.json({ message: 'Quiz submitted successfully', results });
    } catch (error) {
        console.error('Error submitting quiz:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// app.get('/api/users-tests-taken/:userId', async (req, res) => {
//     const { userId } = req.params;

//     try {
//         // Fetch test details and grades per question type for the given user ID
//         const testDetails = await executeQuery(`
//             SELECT q.Name AS quizName, qq.PersoType AS questionType, SUM(uqa.Grade) AS totalGrade
//             FROM UserQuiz uq
//             JOIN UserQuizAnswers uqa ON uq.ID = uqa.UserQuizID
//             JOIN QuizQuestions qq ON uqa.QuestionID = qq.ID
//             JOIN Quiz q ON qq.QuizId = q.ID
//             WHERE uq.UserId = ?
//             GROUP BY q.Name, qq.PersoType
//         `, [userId]);

//         res.json(testDetails);
//     } catch (error) {
//         console.error('Error fetching test details:', error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// });


app.get('/api/users-tests-taken/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        // Fetch detailed test results for the given user ID
        const testDetails = await executeQuery(`
            SELECT 
                q.Name AS quizName, 
                qq.Question AS question,
                uqa.Answer AS answer,
                uqa.Grade AS score,
                qq.PersoType AS questionType
            FROM 
                UserQuiz uq
            JOIN 
                UserQuizAnswers uqa ON uq.ID = uqa.UserQuizID
            JOIN 
                QuizQuestions qq ON uqa.QuestionID = qq.ID
            JOIN 
                Quiz q ON qq.QuizId = q.ID
            WHERE 
                uq.UserId = ?
        `, [userId]);

        res.json(testDetails);
    } catch (error) {
        console.error('Error fetching test details:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



/// Get a list of users who took a specific test
app.get('/api/test-takers/:quizId', async (req, res) => {
    const quizId = req.params.quizId;
    try {
        const users = await executeQuery(
            `SELECT u.id, u.first_name, u.last_name, u.email, uq.DateTaken as dateTaken, uq.ID as userQuizId
             FROM Users u
             JOIN UserQuiz uq ON u.id = uq.userId
             WHERE uq.quizId = ?`,
            [quizId]
        );
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).send('Error fetching users');
    }
});

// Get test results for a specific user
app.get('/api/user-test-results/:userQuizId', async (req, res) => {
    const userQuizId = req.params.userQuizId;
    try {
        const results = await executeQuery(
            `SELECT qq.PersoType, SUM(uqa.Grade) as TotalGrade
             FROM UserQuizAnswers uqa
             JOIN QuizQuestions qq ON uqa.QuestionID = qq.ID
             WHERE uqa.UserQuizID = ?
             GROUP BY qq.PersoType`,
            [userQuizId]
        );
        res.json(results);
    } catch (error) {
        console.error('Error fetching test results:', error);
        res.status(500).send('Error fetching test results');
    }
});


//Get a List of Tests Taken by a Specific User
app.get('/api/user-tests/:userId', async (req, res) => {
    const userId = req.params.userId;
    try {
        const userTests = await executeQuery(
            `SELECT uq.ID as userQuizId, q.Name as quizName, uq.DateTaken as dateTaken
             FROM UserQuiz uq
             JOIN Quiz q ON uq.QuizID = q.ID
             WHERE uq.UserId = ?`,
            [userId]
        );
        res.json(userTests);
    } catch (error) {
        console.error('Error fetching user tests:', error);
        res.status(500).send('Error fetching user tests');
    }
});


// Get users who took a specific test
app.get('/api/quiz/:quizId/users', async (req, res) => {
    const quizId = req.params.quizId;
    try {
        const users = await executeQuery(
            `SELECT u.ID as userId, u.first_name, u.last_name, u.email, uq.DateTaken
             FROM UserQuiz uq
             JOIN users u ON uq.UserId = u.ID
             WHERE uq.QuizID = ?`,
            [quizId]
        );
        res.json(users);
    } catch (error) {
        console.error('Error fetching users for quiz:', error);
        res.status(500).send('Error fetching users for quiz');
    }
});

app.get('/api/user/:userId/test-results', async (req, res) => {
    const { userId } = req.params;

    try {
        const results = await executeQuery(`
            SELECT uq.ID AS UserQuizID, q.Name AS QuizName, qq.PersoType, SUM(uqa.Grade) AS totalPoints
            FROM UserQuizAnswers uqa
            JOIN UserQuiz uq ON uqa.UserQuizID = uq.ID
            JOIN QuizQuestions qq ON uqa.QuestionID = qq.ID
            JOIN Quiz q ON qq.QuizId = q.ID
            WHERE uq.UserId = ?
            GROUP BY uq.ID, q.Name, qq.PersoType;
        `, [userId]);

        res.json(results);
    } catch (error) {
        console.error('Error fetching test results:', error);
        res.status(500).json({ error: 'Error fetching test results' });
    }
});



app.put('/api/quizzes/:quizId/questions/:questionId', async (req, res) => {
    const { quizId, questionId } = req.params;
    const { question, persoType } = req.body;

    try {
        const updateQuestionQuery = `
            UPDATE QuizQuestions 
            SET Question = ?, PersoType = ? 
            WHERE QuizId = ? AND ID = ?
        `;
        await executeQuery(updateQuestionQuery, [question, persoType, quizId, questionId]);

        res.status(200).json({ message: 'Question updated successfully' });
    } catch (error) {
        console.error('Error updating question:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.put('/api/quizzes/:quizId/questions/:questionId/answers/:answerId', async (req, res) => {
    const { quizId, questionId, answerId } = req.params;
    const { answerText, answerGrade } = req.body;
    try {
        const updateAnswerQuery = `
            UPDATE QuizQuestAnswers 
            SET Answer = ?, AnswerGrade = ? 
            WHERE QuizId = ? AND QuizQuestionID = ? AND ID = ?
        `;
        await executeQuery(updateAnswerQuery, [answerText, answerGrade, quizId, questionId, answerId]);

        res.status(200).json({ message: 'Answer updated successfully' });
    } catch (error) {
        console.error('Error updating answer:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.post('/api/quizzes-answers/:quizId/questions/:questionId/answers', async (req, res) => {
    const { quizId, questionId } = req.params;
    const { answerText, answerGrade } = req.body;

    try {
        const addAnswerQuery = `
            INSERT INTO QuizQuestAnswers (QuizId, QuizQuestionID, Answer, AnswerGrade)
            VALUES (?, ?, ?, ?)
        `;
        await executeQuery(addAnswerQuery, [quizId, questionId, answerText, answerGrade]);

        res.status(201).json({ answerText, answerGrade, message: 'Answer added successfully' });
    } catch (error) {
        console.error('Error adding answer:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// check if a quiz has been taken
app.get('/api/quiz/:quizId/taken', async (req, res) => {
    const quizId = req.params.quizId;
    try {
        const result = await executeQuery(
            `SELECT COUNT(*) as count FROM UserQuiz WHERE QuizID = ?`,
            [quizId]
        );
        const quizTaken = result[0].count > 0;
        res.json({ quizTaken });
    } catch (error) {
        console.error('Error checking if quiz has been taken:', error);
        res.status(500).send('Error checking if quiz has been taken');
    }
});




app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

