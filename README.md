# Authentication-User-Dashboard-App

⭐ A production-style full-stack authentication system demonstrating secure user workflows and real-world backend architecture.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)  
![Status](https://img.shields.io/badge/status-in%20progress-yellow)

A full-stack authentication and user dashboard application built with **Node.js (Express), MongoDB, and React**.  
This project demonstrates secure authentication flows used in real-world web applications.

---

## Table of Contents

- [Overview](#overview)
- [Status](#status)
- [Features](#features)
- [Architecture](#architecture)
- [Authentication Flow](#authentication-flow)
- [Tech Stack](#tech-stack)
- [Running Locally](#running-locally)
- [Environment Variables](#environment-variables)
- [Goals of This Project](#goals-of-this-project)

---

## Overview

This application implements a secure authentication system including:

- User signup  
- Email verification  
- Login with CAPTCHA  
- Password reset via email code  
- Protected dashboard  
- Country API integration  
- Google Maps country preview  

The goal is to simulate a realistic production-style authentication architecture.

---

## Status

🚧 Currently under development  
Deployment planned using MongoDB Atlas + Render/Vercel

---

## Features

### Authentication

- Password hashing (bcrypt)
- Email verification system
- JWT-based authentication
- HttpOnly cookie storage
- Protected routes

### Password Recovery

- Time-limited reset codes
- Secure password update
- Expiration validation

### Security

- CAPTCHA validation
- Server-side validation
- Rate limiting
- Secure cookies
- Passwords hashed using bcrypt
- JWT stored in HttpOnly cookies to prevent XSS
- Reset and verification codes are time-limited
- Sensitive credentials stored in environment variables

### Dashboard

- Authenticated user data
- Profile information
- Country selection preview

### Integrations

- Country API (dynamic data fetching)
- Google Maps API (auto-zoom to selected country)
- Email service (SMTP-based)

---

## Architecture

```
React Frontend
      ↓
Express API
      ↓
MongoDB Database
      ↓
Email Service
```

---

## Authentication Flow

### Signup

```
User registers
   ↓
Verification code sent
   ↓
Email verified
   ↓
Account activated
```

### Login

```
Login form
   ↓
Captcha validation
   ↓
JWT issued (HttpOnly cookie)
   ↓
Access dashboard
```

### Password Reset

```
Request reset
   ↓
Email reset code
   ↓
Code verification
   ↓
Password updated
```

---

## Tech Stack

### Frontend

- React  
- Vite  
- Bootstrap (React)  
- Fetch API  
- Google Maps API  

### Backend

- Node.js  
- Express  
- MongoDB  
- Mongoose  
- bcrypt  
- JSON Web Token (JWT)  

### Other Services

- SMTP email service  
- Country REST API  
- CAPTCHA provider  

---

## Running Locally

### Backend

```bash
npm install
nodemon index.js
```

### Frontend

```bash
npm install
npm run dev
```

---

## Environment Variables

```env
MONGO_URI=

JWT_SECRET=

EMAIL_USER=
EMAIL_PASS=

CAPTCHA_SECRET=

GOOGLE_MAPS_KEY=
```

---

## Goals of This Project

- Implement real-world authentication logic  
- Practice secure backend architecture  
- Integrate external APIs  
- Build a production-style full-stack application  
