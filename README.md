# Authentication-User-Dashboard-App
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

⭐ Production-style authentication system with MongoDB, Express, and React

A full-stack authentication and user dashboard application built with Node.js (Express), MongoDB, and React.
This project demonstrates secure authentication flows used in real-world web applications.

## Table of Contents

- [Overview](#overview)
- [Features](#features)


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

### Dashboard
- Authenticated user data
- Profile information
- Country selection preview

### Integrations
- Country API (dynamic data fetching)
- Google Maps API (auto-zoom to selected country)
- Email service (SMTP-based)
