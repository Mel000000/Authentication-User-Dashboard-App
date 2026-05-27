import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { resetPassword } from '../api/reqCodeApi';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ResetPasswordCard() {
  const location = useLocation();
  const { email, resetToken } = location.state || {};
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validForm = () => {
    return password.length >= 6 && password === confirmPassword;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validForm() || loading) return;

    if (!email || !resetToken) {
      toast.error("Missing session data. Please restart the password reset flow.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email, password, resetToken);
      toast.success("Password reset successful! Redirecting to login page...", {
        position: "top-right",
        autoClose: 3000,
      });
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (error) {
      console.error("Error resetting password:", error);
      
      // Detect rate‑limit (429) or other error types
      let errorMsg = "Failed to reset password. Please try again.";
      
      if (error.response) {
        if (error.response.status === 429) {
          errorMsg = "Too many reset attempts. Please wait 15 minutes before trying again.";
        } else if (error.response.data) {
          errorMsg = typeof error.response.data === 'string'
            ? error.response.data
            : (error.response.data.error || errorMsg);
        }
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      toast.error(errorMsg, {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-lg border-0" style={{
      width: 'min(26rem, 95vw)',
      borderRadius: '1.5rem',
      overflow: 'hidden'
    }}>
      <Card.Body className="p-4">
        <div className="text-center mb-4">
          <span style={{ fontSize: '3rem' }}>🔑</span>
          <Card.Title className="mt-2" style={{ fontSize: '1.75rem', color: '#2d3748' }}>
            New Password
          </Card.Title>
          <p className="text-muted" style={{ fontSize: '0.9rem' }}>
            Choose a password at least 6 characters long.
          </p>
        </div>

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="formNewPassword">
            <Form.Label className="fw-semibold">New Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              isInvalid={password !== '' && password.length < 6}
              style={{ borderRadius: '0.75rem', padding: '0.75rem' }}
            />
            <Form.Control.Feedback type="invalid">
              Password must be at least 6 characters
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-4" controlId="formConfirmPassword">
            <Form.Label className="fw-semibold">Confirm Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              isInvalid={confirmPassword !== '' && confirmPassword !== password}
              style={{ borderRadius: '0.75rem', padding: '0.75rem' }}
            />
            <Form.Control.Feedback type="invalid">
              Passwords do not match
            </Form.Control.Feedback>
          </Form.Group>

          <div className="d-flex justify-content-end">
            <Button
              variant="primary"
              type="submit"
              disabled={!validForm() || loading}
              style={{
                borderRadius: '0.75rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                padding: '0.5rem 1.5rem',
                transition: 'transform 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
          </div>
        </Form>
      </Card.Body>
      <ToastContainer />
    </Card>
  );
}

export default ResetPasswordCard;