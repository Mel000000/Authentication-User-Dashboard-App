import React, { useState } from 'react';    
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import RecaptchaComponent from './RecaptchaComponent.jsx';

function BasicExample() {
    const [token, setToken] = useState(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const validForm = () => { 
        return email && password && token;
    }

  return (
    <Card style={{ width: '22rem' }}>
      <Card.Body>
        <Card.Title>Already have an account?</Card.Title>
        <Form>
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
                <RecaptchaComponent token={token} setToken={setToken}/>
            </Form.Group>
            <Button variant="primary" type="submit" disabled={validForm() ? false : true}>
                Submit
            </Button>
        </Form>
      </Card.Body>
    </Card>
  );
}

export default BasicExample;