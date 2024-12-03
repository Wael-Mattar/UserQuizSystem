User Management and Quiz System
This project is a comprehensive User Management and Quiz System designed to streamline the process of managing users, creating quizzes, and enabling role-based access control. It includes distinct functionalities for Users, Admins, and Super Admins to ensure a seamless and secure experience.

Features
User Features
•	Sign-Up and Email Verification: Users register and verify their email via a secure link.
•	Login: Secure authentication with hashed passwords.
•	Quiz Participation: Users can attempt enabled quizzes and receive grades.

Admin Features
•	User Management:
o	View all registered users.
o	Enable or disable user accounts (disabled users cannot log in).
•	Quiz Management:
o	Create quizzes with customizable questions, answers, and grading.
o	Edit quizzes unless they have been attempted by users.
o	Enable or disable quizzes (disabled quizzes are hidden from users).
o	Export quiz and user participation data.

Super Admin Features
•	All Admin functionalities.
•	View all admin accounts.
•	Enable or disable admin accounts.

Technologies Used
Frontend
•	React.js: Dynamic and component-based user interface.
•	Material-UI (MUI): Professional UI components and themes.

Backend
•	Node.js: Server-side logic with asynchronous capabilities.
•	Express.js: RESTful API endpoints for frontend-backend communication.

Database
•	MySQL: Relational database for managing users, quizzes, and data integrity.

Additional Tools
•	Nodemailer: Email verification during user registration.
•	Bcrypt: Secure password hashing.



