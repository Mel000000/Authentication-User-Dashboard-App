import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react'
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Dashboard from './pages/dashboard.jsx';
import SignupPage from './pages/signupPage.jsx';
import ForgotPasswordPage from './pages/forgotPasswordPage.jsx';
import HomePage from './pages/homePage.jsx';


const router = createBrowserRouter([
  {
    path: "/",
    element: <Dashboard />
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
    path: "/home",
    element: <HomePage/>
  }
]);

function App() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App
