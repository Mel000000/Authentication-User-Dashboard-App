# API Reference

Base URL: `https://authentication-user-dashboard-app.onrender.com/api` (or `http://localhost:3000/api` locally)

## Authentication & User Endpoints (`/api/user`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/createUser` | Register a new user | No |
| POST | `/loginUser` | Log in an existing user | No |
| POST | `/logoutUser` | Log out the current user | Yes (cookie) |
| GET | `/profile` | Get the authenticated user’s profile | Yes (cookie) |
| PUT | `/profile` | Update user profile (e.g., name, country) | Yes (cookie) |
| POST | `/requestPasswordReset` | Request a password reset email | No |
| POST | `/resetPassword` | Reset password using verification code | No |

**Request/Response Examples**

- **POST /createUser**  
  Request body:
  ```json
  {
    "email": "user@example.com",
    "password": "yourPassword",
    "name": "John Doe",
    "country": "US"
  }
  ```
