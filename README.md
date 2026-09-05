# Cloud Media Storage - Backend

This is the backend API for the Cloud Media Storage application.

The backend handles user authentication, Google OAuth authentication, file management, and file sharing functionality.

## Features

- User registration
- User login
- Google OAuth 2.0 login
- JWT-based authentication
- Access token and refresh token authentication
- Secure HTTP-only refresh token cookies
- File upload
- File download
- File deletion
- File sharing
- File search
- User authentication and authorization

## Tech Stack

- Node.js
- Express.js
- MongoDB
- JWT
- Passport.js
- Google OAuth 2.0

## Project Structure

```text
backend/
├── config/
├── controllers/
├── middleware/
├── model/
├── routes/
├── services/
├── server.js
├── package.json
└── README.md
```

## Authentication

The backend supports two authentication methods:

### Email and Password

Users can create an account and log in using their email and password.

### Google OAuth

Users can also sign in using their Google account through Google OAuth 2.0.

After successful authentication, an access token is generated and the user is redirected to the frontend.

## API Routes

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup` | Create a new user |
| POST | `/api/auth/login` | Login with email and password |
| GET | `/api/auth/google` | Start Google OAuth login |
| GET | `/api/auth/google/callback` | Handle Google OAuth callback |
| POST | `/api/auth/logout` | Logout the user |

## Environment Variables

The following environment variables are required:

```env
PORT=8080
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=your_google_callback_url
FRONTEND_URL=your_frontend_url
```

## Installation

Clone the repository and navigate to the backend directory:

```bash
cd backend
```

Install the dependencies:

```bash
npm install
```

Create a `.env` file and add the required environment variables.

## Running the Backend Locally

Start the development server:

```bash
npm run dev
```

The backend runs locally on:

```text
http://localhost:8080
```

## Google OAuth Configuration

For Google authentication, create an OAuth 2.0 Client ID in Google Cloud Console.

### Local

```text
http://localhost:8080/api/auth/google/callback
```

### Production

```text
https://cloud-media-storage-backend.onrender.com/api/auth/google/callback
```

The production callback URL must also be added to the Google OAuth application's authorized redirect URIs.

## Google OAuth Flow

```text
Frontend
   ↓
/api/auth/google
   ↓
Google Authentication
   ↓
/api/auth/google/callback
   ↓
Find or Create User
   ↓
Generate Access Token
   ↓
Redirect to Frontend
   ↓
Dashboard
```

## Deployment

The backend is deployed using Render.

For production deployment:

1. Add the required environment variables to Render.
2. Configure the production `GOOGLE_CALLBACK_URL`.
3. Configure the production `FRONTEND_URL`.
4. Add the production Google callback URL to Google Cloud Console.
5. Deploy the backend.
6. Test the authentication and API functionality.

## Security

The application uses several security practices:

- JWT-based authentication
- HTTP-only cookies for refresh tokens
- Environment variables for sensitive configuration
- Google OAuth for secure third-party authentication
- Authentication middleware for protected routes

Sensitive credentials should never be committed to the repository.

## Production Backend

The production backend is deployed on Render:

```text
https://cloud-media-storage-backend.onrender.com
```

## Frontend

The backend is connected to the Cloud Media Storage frontend:

```text
https://cloud-media-storage-frontend.vercel.app
```

## Author

Cloud Media Storage