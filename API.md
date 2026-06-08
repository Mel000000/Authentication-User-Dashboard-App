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
  Response (201 Created):
  ```json
  { "message": "User created. Please verify your email." }
  ```

- **POST /loginUser**  
  Request body:
  ```json
  {
    "email": "user@example.com",
    "password": "yourPassword",
    "recaptchaToken": "..."
  }
  ```
  Response (200 OK): sets `dashboard.sid` cookie and returns user data.

## Code Request Endpoints (`/api/codeRequest`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/` | Send email verification code (signup) | No |
| POST | `/verifyCode` | Verify the 6‑digit code | No |

## Profile Image Endpoints (`/api/profile`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/upload` | Upload a profile image (multipart/form-data) | Yes (cookie) |
| DELETE | `/:imagePublicId` | Delete a profile image by Cloudinary public ID | Yes (cookie) |

## Country Endpoints (`/api/country`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Fetch list of countries (uses REST Countries API) | No |

## Error Codes

Common HTTP status codes:

- `200 OK` – Request succeeded
- `201 Created` – Resource created
- `400 Bad Request` – Invalid input (e.g., missing fields)
- `401 Unauthorized` – Missing or invalid authentication
- `403 Forbidden` – CSRF token missing/invalid
- `429 Too Many Requests` – Rate limit exceeded
- `500 Internal Server Error` – Server‑side error

All error responses include a `message` field describing the issue.
