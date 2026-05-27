import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { sendMail, verifyCode } from '../api/reqCodeApi';
import { useNavigate, useLocation } from 'react-router-dom';
import { createUser } from '../api/userApi';
import { toast, ToastContainer } from 'react-toastify';
import apiClient from '../api/apiClient';
import 'react-toastify/dist/ReactToastify.css';

function VerifyCard({
  title = "Reset Password",
  buttonText = "Verify",
  submitForVerifyEmail = false,
  registrationData = null
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const stateData = location.state || {};
  const finalSubmitMode = stateData.submitForVerifyEmail || submitForVerifyEmail;
  const initialEmail = stateData.email || '';

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const validCode = () => code && code.length === 6;
  const validEmail = () => email && email.includes('@');

  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!validEmail()) {
      toast.error("Please enter a valid email");
      return;
    }
    try {
      setLoading(true);
      const mode = finalSubmitMode ? "signup" : "reset";
      await sendMail(email, mode);
      toast.success("Verification code sent!");
    } catch (error) {
      // Check for rate‑limit error (429) or custom error message from backend
      let errorMsg = "Failed to send code";
      if (error.response) {
        if (error.response.status === 429) {
          errorMsg = "Too many code requests. Please wait an hour before trying again.";
        } else if (error.response.data) {
          errorMsg = error.response.data; // backend returns plain string or { error: ... }
        }
      } else if (error.message) {
        errorMsg = error.message;
      }
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validEmail() || !validCode() || loading) return;

    setLoading(true);

    // --- PIPELINE A: SIGNUP / USER CREATION ---
    if (finalSubmitMode) {
      const signupPayload = registrationData || stateData;
      const { username, password, country, profileImageFile } = signupPayload;

      try {
        // verify the code —> backend flips email_verified to true on the placeholder
        await verifyCode(email, code, "signup");

        // upsert the placeholder with full profile data
        const response = await createUser({ email, password, username, country });

        if (response) {
          if (profileImageFile) {
            const formData = new FormData();
            formData.append('profileImage', profileImageFile);
            try {
              // Separate API call for image upload to handle multipart/form-data
              await apiClient.post('/profile/upload-profile-image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
              });
            } catch (uploadError) {
              console.warn("Avatar upload failed:", uploadError);
              toast.warning("Account created, but your avatar upload encountered an error.");
            }
          }

          toast.success(`Welcome to the community, ${username || 'User'}!`);
          setTimeout(() => navigate('/'), 1000);
        }
      } catch (error) {
        console.error("Registration pipeline error:", error);
        let errorMsg = "Code invalid or registration failed.";
        if (error.response) {
          if (error.response.status === 429) {
            errorMsg = "Too many verification attempts. Please wait 15 minutes.";
          } else if (error.response.data) {
            errorMsg = typeof error.response.data === 'string' 
              ? error.response.data 
              : (error.response.data.error || errorMsg);
          }
        }
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
      return;
    }

    // --- PIPELINE B: PASSWORD RESET ---
    try {
      const { resetToken } = await verifyCode(email, code, "reset");
      toast.success("Code verified! Redirecting...");
      setTimeout(() => {
        navigate('/reset-password', { state: { email, resetToken } });
      }, 1000);
    } catch (error) {
      let errorMsg = "Invalid verification code. Please try again.";
      if (error.response) {
        if (error.response.status === 429) {
          errorMsg = "Too many verification attempts. Please wait 15 minutes.";
        } else if (error.response.data) {
          errorMsg = typeof error.response.data === 'string'
            ? error.response.data
            : (error.response.data.error || errorMsg);
        }
      }
      toast.error(errorMsg);
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
          <span style={{ fontSize: '3rem' }}>🔐</span>
          <Card.Title className="mt-2" style={{ fontSize: '1.75rem', color: '#2d3748' }}>
            {title}
          </Card.Title>
        </div>

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label className="fw-semibold">Email Address</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              isInvalid={email !== '' && !email.includes('@')}
              style={{ borderRadius: '0.75rem', padding: '0.75rem' }}
            />
            <Form.Control.Feedback type="invalid">
              Please enter a valid email
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-4" controlId="formResetInfo">
            <Form.Label className="fw-semibold">Verification Code</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter 6-digit code"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              style={{ borderRadius: '0.75rem', padding: '0.75rem', textAlign: 'center', fontSize: '1.25rem' }}
            />
          </Form.Group>

          <Row className="align-items-center">
            <Col>
              <Button
                variant="link"
                onClick={handleSendCode}
                disabled={loading}
                style={{ textDecoration: 'none', padding: 0 }}
              >
                {loading ? "Sending..." : "Send Code"}
              </Button>
            </Col>
            <Col className="d-flex justify-content-end">
              <Button
                variant="primary"
                type="submit"
                disabled={!validCode() || !validEmail() || loading}
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
                {loading ? "Verifying..." : buttonText}
              </Button>
            </Col>
          </Row>
        </Form>
      </Card.Body>
      <ToastContainer />
    </Card>
  );
}

export default VerifyCard;