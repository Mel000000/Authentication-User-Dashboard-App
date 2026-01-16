# 🛡️ Authentication User Dashboard App

A full-stack authentication and user dashboard application built with **Node.js, Express, MongoDB, and React**.  
The project supports user registration, email verification, secure password handling, and profile management.

---

## 🚀 Features

- User registration & login
- Email verification with one-time codes
- Secure password hashing with bcrypt
- MongoDB database with Mongoose
- API input validation using Zod
- Modular backend architecture
- Ready-to-use database seeding script
- Extensible for dashboards and profile features

---

## 📁 Project Structure

```text
Authentication-User-Dashboard-App/
│
├── models/
│   ├── user.js
│   └── userZSchema.js
│
├── routes/
│   ├── auth.js
│   └── email.js
│
├── controllers/
│   └── emailSender.js
│
├── seedUsers.js
├── index.js
├── package.json
├── .env
└── README.md
```
---

## 🧠 Tech Stack

**Frontend**
- React

**Backend**
- Node.js
- Express

**Database**
- MongoDB
- Mongoose

**Other Tools**
- Nodemailer (email verification)
- bcrypt (password hashing)
- Zod (schema validation)
- generate-password (verification codes)

---

## 🛠️ Future Improvements

- JWT authentication
- Role-based access control
- Profile image uploads
- OAuth (Google, GitHub)
- Email templates & expiration handling
