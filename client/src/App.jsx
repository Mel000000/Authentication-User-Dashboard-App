import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react'
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import SignupPage from './pages/signupPage.jsx';
import ForgotPasswordPage from './pages/forgotPasswordPage.jsx';
import HomePage from './pages/homePage.jsx';
import LoginPage from './pages/loginPage.jsx';
import ResetPasswordPage from './pages/resetPasswordPage.jsx';
import VerifyEmailPage from './pages/verifyEmailPage.jsx';
import { AuthProvider } from './helper/AuthContext.jsx';
import {Toaster} from "react-hot-toast";
import ProtectedRoute from './components/ProtectedRoute.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <LoginPage />
  },
  {
    path: "/signup",
    element: <SignupPage />
  },
  {
    path: "/forgot-password",
    element: <ForgotPasswordPage/>
  },
  {
    path: "/reset-password",
    element: <ResetPasswordPage />
  },
  {
    path: "/verify-email",
    element: <VerifyEmailPage />
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
      path: "/home",
      element: <HomePage/>,
      }
    ]
  }
]);

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right"/>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}

export default App
