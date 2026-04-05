import { useState } from 'react';    
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import RecaptchaComponent from './RecaptchaComponent.jsx';
import { loginUser } from '../api/userApi';

function Login() {
    const [token, setToken] = useState(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const validForm = () => { 
        return email && password && token;
    }

    const onSubmit = async () => {
        try {
            const loginData = {email, password, token};
            await loginUser(loginData);
            alert("User logged in successfully!");
        }
        catch (error) {
            console.error("Login error:", error);
        }   
    }

  return (
    <Card style={{ width: '22rem', margin: '2rem auto', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
      <Card.Body>
        <Card.Title>Already have an account?</Card.Title>
        <Form onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
        }}>
            <Form.Group className="mb-3" controlId="formBasicEmail" onChange={(e) => setEmail(e.target.value)}>
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" placeholder="Enter email" />
                <Form.Text className="text-muted">
                We'll never share your email with anyone else.
                </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword" onChange={(e) => setPassword(e.target.value)}>
                <Form.Label>Password</Form.Label>
                <Form.Control type="password" placeholder="Password" />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicCheckbox">
                <RecaptchaComponent token={token} setToken={setToken} key={import.meta.env.RECAPTCHA_SITE_KEY } onChange={(value) => setToken(value)}/>
            </Form.Group>
            <Button variant="primary" type="submit" disabled={validForm() ? false : true}>
                Submit
            </Button>
        </Form>
      </Card.Body>
    </Card>
  );
}

export default Login;