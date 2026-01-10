import { useState } from 'react';    
import { Container, Row, Col,Card,Form,Button } from 'react-bootstrap';
import '../../design/codeStyle.css';
import { sendMail, verifyCode } from '../api/reqCodeApi';


function ReqResetCard() {
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);

    const validCode = () => { 
        return code ? true && code.length ===6 : false ;
    }

    const validEmail = () => { 
        return email ? true : false; // later add more validation -> compare with database
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try{
            await verifyCode(email,code);
            alert("Code verified!"); // proceed to reset password step
        }
        catch{
            alert("Invalid code");
        }
    }

  return (
    <Card style={{ width: '22rem', margin: '2rem auto', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
      <Card.Body>
        <Card.Title>Forgot your password?</Card.Title>
        <Form>
            <Form.Group className="mb-3 w-100" controlId="formBasicEmail">
                <Form.Label>Email</Form.Label>
                <Form.Control 
                    type="email" 
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    isInvalid={email !== '' && !email.includes('@')}
                />
                <Form.Text className="text-muted">
                We'll never share your email with anyone else.
                </Form.Text>
                <Form.Control.Feedback type="invalid">
                    Please enter a valid email
                </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3 w-100" controlId="formResetInfo">
                <Form.Control
                    type="text"
                    className="code-input"
                    maxLength={6}
                    onChange={(e) => setCode(e.target.value)}
                />
            </Form.Group>
            <Row>
            <Col>
            <a
            href="#"
            onClick={async (e) => {
                e.preventDefault();
                if (!validEmail()) {
                alert("Invalid email");
                return;
                }
                try {
                setLoading(true);
                await sendMail(email);
                alert("Code sent!");
                } catch {
                alert("Failed to send code");
                } finally {
                setLoading(false);
                }
            }}
            >
            {loading ? "Sending..." : "Send Code"}
            </a>
            </Col>
            <Col className="d-flex justify-content-end">
            <Button variant="primary" type="submit" disabled={!validCode()} onClick={(e)=>handleSubmit(e)}>
                Submit
            </Button>
            </Col>
            </Row>
        </Form>
      </Card.Body>
    </Card>
  );
}

export default ReqResetCard;