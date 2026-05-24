import { useState } from 'react';    
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import RecaptchaComponent from './RecaptchaComponent.jsx';
import { loginUser, getCurrentUser } from '../api/userApi';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Login() {
    const navigate = useNavigate();
    const [token, setToken] = useState(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const validForm = () => { 
        return email && password && token;
    }

    const onSubmit = async () => {
        try {
            const loginData = { email, password, token };
            const data = await loginUser(loginData);
          
            if (data && data.token) {
                localStorage.setItem("authToken", data.token);
                
                const userProfile = await getCurrentUser(data.token);
                toast.success("Login successful! Redirecting to your dashboard...", {
                    position: "top-right",
                    autoClose: 3000,
                });
                setTimeout(() => {
                    navigate("/home");
                }, 1500);
            } else {
                console.error("Backend authenticated you, but didn't return a 'token' property in the JSON body.");
            }
        }
        catch (error) {
            console.error("Login error:", error);
            toast.error("Login failed. Please check your credentials and try again.", {
                position: "top-right",
                autoClose: 3000,
            });
        }   
    }

    return (
        <Card className="shadow-lg border-0" style={{ 
            width: '24rem', 
            borderRadius: '1.5rem', 
            overflow: 'hidden' 
        }}>
            
            <Card.Body className="p-4">
                <Card.Title className="text-center mb-4" style={{ fontSize: '1.75rem', color: '#2d3748' }}>
                    Welcome Back!
                </Card.Title>
                
                <Form onSubmit={(e) => {
                    e.preventDefault();
                    onSubmit();
                }}>
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label className="fw-semibold">Email Address</Form.Label>
                        <Form.Control 
                            type="email" 
                            placeholder="Enter email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{ borderRadius: '0.75rem', padding: '0.75rem' }}
                        />
                        <Form.Text className="text-muted">
                            We'll never share your email with anyone else.
                        </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formBasicPassword">
                        <Form.Label className="fw-semibold">Password</Form.Label>
                        <Form.Control 
                            type="password" 
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ borderRadius: '0.75rem', padding: '0.75rem' }}
                        />
                    </Form.Group>
                    
                    <Form.Group className="mb-3" controlId="formBasicCheckbox">
                        <RecaptchaComponent token={token} setToken={setToken} />
                    </Form.Group>
                    
                    <Button 
                        variant="primary" 
                        type="submit" 
                        disabled={!validForm()}
                        className="w-100 py-2 fw-bold"
                        style={{ 
                            borderRadius: '0.75rem',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            border: 'none',
                            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 7px 14px rgba(102, 126, 234, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        Sign In
                    </Button>
                </Form>
            </Card.Body>
            <ToastContainer />
        </Card>
    );
}

export default Login;