# User Management System

Hey there! 👋 This is a full-stack user management application I built using Node.js, Express, React, and MongoDB. It's got everything you need to manage users with different roles, handle authentication securely, and keep things organized.

## What This Does

Basically, it's a web app where:
- Users can sign up and log in securely
- Admins can manage all users (view, activate, deactivate accounts)
- Regular users can update their own profile and change passwords
- Everything is protected with JWT tokens and role-based access control

The UI is pretty modern with smooth animations, and the backend has multiple layers of security to keep things safe.

## Tech Stack

I used these technologies:

Backend:
- Node.js with Express (pretty standard choice)
- MongoDB with Mongoose (Atlas for cloud hosting)
- JWT for authentication
- bcryptjs for password hashing
- express-validator for input validation
- Helmet, xss-clean, and other security middleware
- Jest for testing

Frontend:
- React 18 with hooks
- React Router for navigation
- Axios for API calls
- react-toastify for notifications
- Custom CSS with modern gradients and animations

Deployment:
- Backend: Render or Railway (both work great)
- Frontend: Vercel or Netlify
- Database: MongoDB Atlas (free tier is enough to start)

## Project Structure

Here's how I organized everything:

   
PurpleMerit/
├── backend/              # All the API stuff
│   ├── models/          # Database models
│   ├── routes/          # API endpoints
│   ├── middleware/      # Auth, security, validation
│   ├── tests/           # Unit tests
│   └── server.js        # Main server file
├── frontend/            # React app
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Main pages
│   │   ├── context/     # React context for auth
│   │   └── utils/       # Helper functions
│   └── public/          # Static files
└── README.md           # This file!
   

## Getting Started Locally

### Prerequisites

Make sure you have these installed:
- Node.js (v14 or higher) - [Download here](https://nodejs.org/)
- npm (comes with Node.js)
- A MongoDB Atlas account (free tier works) or local MongoDB

### Setting Up the Backend

1. Navigate to the backend folder:
      bash
   cd backend
      

2. Install all the dependencies:
      bash
   npm install
      
   This might take a minute or two, grab a coffee ☕

3. Create your environment file:
   
   Create a new file called  .env  in the  backend  folder. You can copy the example:
      bash
   # On Windows
   copy env.example .env
   
   # On Mac/Linux
   cp env.example .env
      

4. Fill in your  .env  file:
      env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/user-management?appName=YourApp
   JWT_SECRET=make-this-a-really-long-random-string-at-least-32-characters
   JWT_EXPIRE=7d
   FRONTEND_URL=http://localhost:3000
      

   Important notes:
   - Get your  MONGODB_URI  from MongoDB Atlas (I'll explain this in the deployment guide)
   - Make  JWT_SECRET  a long random string - you can use an online generator or just mash your keyboard
   - The  FRONTEND_URL  should match where your React app runs

5. Start the server:
      bash
   npm run dev
      
   
   You should see "MongoDB connected successfully" and "Server running on port 5000" 🎉

### Setting Up the Frontend

1. Open a new terminal and navigate to frontend:
      bash
   cd frontend
      

2. Install dependencies:
      bash
   npm install
      

3. Create your  .env  file:
      bash
   # Windows
   copy .env.example .env
   
   # Mac/Linux
   cp .env.example .env
      

4. Update the  .env  file:
      env
   REACT_APP_API_URL=http://localhost:5000/api
      

5. Start the React app:
      bash
   npm start
      

   It should automatically open in your browser at  http://localhost:3000 

### Creating an Admin User

Once everything is running, you'll want to create an admin account. You have a few options:

Option 1: Using the script (easiest)
   bash
cd backend
npm run create-admin
   

This creates a user with:
- Email:  admin@example.com 
- Password:  Admin1234 
- Role:  admin 

⚠️ Change this password immediately after first login!

Option 2: Sign up normally, then update in MongoDB
- Sign up through the frontend
- Go to MongoDB Atlas
- Find your user in the database
- Change  role  from  "user"  to  "admin" 

## Running Tests

I included some tests for the backend. To run them:

   bash
cd backend
npm test
   

This will run all the tests and show you coverage. The tests check authentication, user management, and error handling.

## Environment Variables Explained

### Backend Variables

| Variable | What It Does | Example |
|----------|-------------|---------|
|  PORT  | Which port the server runs on |  5000  |
|  NODE_ENV  | Environment mode |  development  or  production  |
|  MONGODB_URI  | Your MongoDB connection string |  mongodb+srv://...  |
|  JWT_SECRET  | Secret key for signing tokens |  your-super-secret-key  |
|  JWT_EXPIRE  | How long tokens last |  7d  (7 days) |
|  FRONTEND_URL  | Where your React app is hosted |  http://localhost:3000  |

### Frontend Variables

| Variable | What It Does | Example |
|----------|-------------|---------|
|  REACT_APP_API_URL  | Where your backend API is |  http://localhost:5000/api  |

Note: In React, environment variables must start with  REACT_APP_  to be accessible in the browser.

## API Endpoints

Here are all the endpoints you can use. I've included a Postman collection in  backend/postman_collection.json  that you can import to test them easily.

### Authentication

Sign Up
   
POST /api/auth/signup
Body: { email, password, fullName }
   

Login
   
POST /api/auth/login
Body: { email, password }
   

Get Current User
   
GET /api/auth/me
Headers: Authorization: Bearer <token>
   

Logout
   
POST /api/auth/logout
Headers: Authorization: Bearer <token>
   

### User Management

Get All Users (Admin Only)
   
GET /api/users?page=1&limit=10
Headers: Authorization: Bearer <token>
   

Get Your Profile
   
GET /api/users/profile
Headers: Authorization: Bearer <token>
   

Update Your Profile
   
PUT /api/users/profile
Headers: Authorization: Bearer <token>
Body: { fullName?, email? }
   

Change Password
   
PUT /api/users/change-password
Headers: Authorization: Bearer <token>
Body: { currentPassword, newPassword }
   

Activate User (Admin Only)
   
PUT /api/users/:userId/activate
Headers: Authorization: Bearer <token>
   

Deactivate User (Admin Only)
   
PUT /api/users/:userId/deactivate
Headers: Authorization: Bearer <token>
   

All responses follow this format:
   json
{
  "success": true/false,
  "message": "Some message",
  "data": { ... }
}
   

## Security Features

I've added several security measures:

- Password Hashing: All passwords are hashed with bcrypt before storing
- JWT Tokens: Secure token-based authentication
- Rate Limiting: Prevents brute force attacks (5 login attempts per 15 minutes)
- Input Validation: Everything is validated on both frontend and backend
- XSS Protection: xss-clean middleware prevents cross-site scripting
- NoSQL Injection Protection: express-mongo-sanitize prevents injection attacks
- CORS: Configured to only allow requests from your frontend
- Helmet: Adds security headers to responses
- Strong Password Requirements: Must have uppercase, lowercase, number, and special character

## Password Requirements

Passwords must:
- Be 8-128 characters long
- Contain at least one uppercase letter
- Contain at least one lowercase letter
- Contain at least one number
- Contain at least one special character (@$!%*?&#)

This might seem strict, but it keeps accounts secure!

## Troubleshooting

Backend won't start:
- Check if MongoDB connection string is correct
- Make sure JWT_SECRET is set
- Check if port 5000 is already in use

Frontend can't connect to backend:
- Verify  REACT_APP_API_URL  in frontend  .env 
- Make sure backend is running
- Check CORS settings in backend

MongoDB connection fails:
- Verify your connection string
- Check if your IP is whitelisted in MongoDB Atlas
- Make sure database user credentials are correct

Tests failing:
- Make sure MongoDB test database is accessible
- Check if all environment variables are set

## What's Next?

For deployment, check out the  DEPLOYMENT.md  file. It has step-by-step instructions for deploying to Render/Railway (backend) and Vercel/Netlify (frontend).

## Additional Resources

- Postman Collection: Import  backend/postman_collection.json  to test all endpoints
- Deployment Guide: See  DEPLOYMENT.md  for detailed deployment steps
- Create Admin: Use  npm run create-admin  in the backend folder

## Notes

This was built as an assessment project. If you're using it in production, consider:
- Adding email verification
- Implementing password reset functionality
- Adding more detailed logging
- Setting up monitoring and alerts
- Adding more granular permissions
- Implementing audit logs

## Contact

If you have questions or run into issues, feel free to reach out at career@purplemerit.com

---

Happy coding! 🚀
