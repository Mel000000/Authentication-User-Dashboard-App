import { useState } from 'react';    
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { sendMail, verifyCode } from '../api/reqCodeApi';

function ReqResetCard() {
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);

    const validCode = () => { 
        return code && code.length === 6;
    }

    const validEmail = () => { 
        return email && email.includes('@');
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await verifyCode(email, code);
            alert("Code verified! Proceed to reset password.");
        } catch {
            alert("Invalid code");
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
                        Forgot Password?
                    </Card.Title>
                    <p className="text-muted">We'll help you reset it</p>
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
                                onClick={async (e) => {
                                    e.preventDefault();
                                    if (!validEmail()) {
                                        alert("Please enter a valid email");
                                        return;
                                    }
                                    try {
                                        setLoading(true);
                                        await sendMail(email);
                                        alert("Verification code sent!");
                                    } catch {
                                        alert("Failed to send code");
                                    } finally {
                                        setLoading(false);
                                    }
                                }}
                                style={{ textDecoration: 'none', padding: 0 }}
                            >
                                {loading ? "Sending..." : "Send Code"}
                            </Button>
                        </Col>
                        <Col className="d-flex justify-content-end">
                            <Button 
                                variant="primary" 
                                type="submit" 
                                disabled={!validCode()}
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
                                Verify & Reset
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </Card.Body>
        </Card>
    );
}

export default ReqResetCard;