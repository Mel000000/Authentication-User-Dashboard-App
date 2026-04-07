import React, { useState } from 'react';    
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { resetPassword} from '../api/reqCodeApi';
import { useLocation } from 'react-router-dom';


function ResetPasswordCard() {
    const location = useLocation();
    const email = location.state?.email || '';
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const validForm = () => { 
        return password.length >= 6 && password === confirmPassword;
    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await resetPassword(email, password);
            alert("Password reset successfully! Please log in with your new password.");
        } catch (error) {
            console.error("Error resetting password:", error);
            alert("Failed to reset password. Please try again.");
        }
    }

    return (
        <Card className="shadow-lg border-0" style={{ 
            width: '26rem', 
            borderRadius: '1.5rem', 
            overflow: 'hidden' 
        }}>  
            <Card.Body className="p-4">
                <div className="text-center mb-4">
                    <span style={{ fontSize: '3rem' }}>🔐</span>
                    <Card.Title className="mt-2" style={{ fontSize: '1.75rem', color: '#2d3748' }}>
                        Reset Password
                    </Card.Title>
                    <p className="text-muted">We'll help you reset it</p>
                </div>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label className="fw-semibold">New Password</Form.Label>
                        <Form.Control 
                            type="password" 
                            placeholder="Enter your new password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            isInvalid={password !== '' && password.length < 6}
                            style={{ borderRadius: '0.75rem', padding: '0.75rem' }}
                        />
                        <Form.Control.Feedback type="invalid">
                            Password must be at least 6 characters long
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formBasicConfirmPassword">
                        <Form.Label className="fw-semibold">Confirm New Password</Form.Label>
                        <Form.Control 
                            type="password" 
                            placeholder="Confirm your new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            isInvalid={confirmPassword !== '' && confirmPassword !== password}
                            style={{ borderRadius: '0.75rem', padding: '0.75rem' }}
                        />
                        <Form.Control.Feedback type="invalid">
                            Passwords do not match
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Button onClick={handleSubmit} variant="primary" type="submit" className="w-100" disabled={!validForm()} style={{ borderRadius: '0.75rem', padding: '0.75rem' }}>
                        Reset Password
                    </Button>
                </Form>
            </Card.Body>
        </Card>
    );
}

export default ResetPasswordCard;