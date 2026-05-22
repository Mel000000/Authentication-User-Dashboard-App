# Authentication-User-Dashboard-App

⭐ A production‑style full‑stack authentication system demonstrating secure user workflows and real‑world backend architecture.

A full‑stack authentication and user dashboard application built with **Node.js (Express)**, **MongoDB**, and **React**. This project implements secure authentication flows, CAPTCHA protection, and third‑party API integrations used in real‑world web applications.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-green)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.x-000000)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-18.x-blue)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF)](https://vitejs.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.x-brightgreen)](https://mongodb.com/)
[![Mongoose](https://img.shields.io/badge/Mongoose-8.x-880000)](https://mongoosejs.com/)
[![JWT](https://img.shields.io/badge/JWT-9.x-000000)](https://jwt.io/)
[![Axios](https://img.shields.io/badge/Axios-1.x-5A29E4)](https://axios-http.com/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.x-7952B3)](https://getbootstrap.com/)
[![Status](https://img.shields.io/badge/status-active-success)]()

---

## Table of Contents
- [Overview](#overview)
- [Why This Project Exists](#why-this-project-exists)
- [Usage Example](#usage-example)
- [Architecture](#architecture)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Authentication Flows](#authentication-flows)
- [API Endpoints](#api-endpoints)
- [Deployment Quirks Resolved](#deployment-quirks-resolved)
- [Roadmap](#roadmap)
- [License](#license)

---

## Overview

This application implements a secure authentication system with:

- User signup & login
- CAPTCHA‑protected login
- Password reset via email code
- **Cross-Domain Adaptive Auth:** JWT strategies parsing both `HttpOnly Cookies` (SameSite: None) and dynamic fallback `Authorization headers`
- Protected user dashboard
- Country selection with live Google Maps preview

The goal is to simulate a realistic, production‑ready authentication architecture.

---

<div align="center">
  <img src="./readmeAssets/CreatingUser.gif" width="700" alt="Creating User Video"/>
</div>
<div align="center">
  Demonstration of signup
</div>

---

## Why This Project Exists

This project is a **portfolio centerpiece** showcasing my full‑stack capabilities:

| Area | What I Demonstrated |
|------|---------------------|
| **Backend** | Express REST API, JWT auth, bcrypt hashing, Nodemailer, Zod validation |
| **Frontend** | React components, React Router, Axios interceptors, Bootstrap, Google Maps embed |
| **Security** | HttpOnly cookies, Cross-Origin Cookie management, reCAPTCHA, input validation |
| **Integrations** | REST Countries API, Google Maps API, SMTP email service |
| **Database** | MongoDB schema design, Mongoose ODM, user data persistence |
| **DevOps** | Decoupled cross-origin cloud environments, Environment orchestration |

---

## Usage Example

1. **Sign up** – Choose a country, and the map auto‑zooms to it.
2. **Log in** – Solve the reCAPTCHA, receive a secure session handshake.
3. **Dashboard** – View your profile (email, username, country, join date).
4. **Reset your password via Email-Verification** – Receive a 6‑digit code by email.

---

## Architecture

```mermaid
flowchart TB
    subgraph Client["🖥️ React Client (Render Static Site)"]
        direction TB
        A["Login / Signup / Dashboard Pages"]
        B["Axios HTTP Client + Interceptors"]
    end

    subgraph Server["⚙️ Express Server (Render Web Service)"]
        direction TB
        C["🌐 API Routes<br/>• /api/user<br/>• /api/country<br/>• /api/codeRequest"]
        
        D["🔐 Authentication Middleware<br/>• Cookie & Auth Header Handlers<br/>• bcrypt Hashing"]
        
        E["✅ Validation Layer<br/>• reCAPTCHA Verification<br/>• Zod Schema Validation"]
        
        F["📧 Email Service<br/>• Nodemailer<br/>• Reset Code Generator"]
    end

    subgraph Data["🗄️ Data Layer"]
        direction TB
        G[("MongoDB Atlas<br/>Users Collection")]
        H[("Memory Store<br/>Reset Codes")]
    end

    subgraph External["🌐 External APIs"]
        I["Google reCAPTCHA"]
        J["REST Countries API"]
        K["Google Maps API"]
        L["SMTP (Gmail)"]
    end

    Client -->|HTTP Requests with Credentials/Headers| Server
    Server -->|Read/Write| Data
    Server -->|Verify Token| I
    Server -->|Fetch Countries| J
    Client -->|Direct Embed| K
    Server -->|Send Emails| L

    style Client fill:#6366F1,color:#fff,stroke:#333,stroke-width:1px
    style Server fill:#F6821F,color:#fff,stroke:#333,stroke-width:3px
    style Data fill:#2DBA4E,color:#fff,stroke:#333,stroke-width:1px
    style External fill:#F38020,color:#fff,stroke:#333,stroke-width:1px
