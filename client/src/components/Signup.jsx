import { useState } from 'react';    
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import { Container, Row, Col, Image, CardTitle} from 'react-bootstrap';
import defaultProfilePic from '../assets/default-profile-pic.jpg';
import SignupMap from './SignupMap';

const containerStyle = {
  width: "100%",
  height: "400px",
};

const center = {
  lat: 52.52,   // example: Berlin
  lng: 13.405,
};


function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [imgHover, setImgHover] = useState(false);   
    

    const validForm = () => { 
        return email && password === confirmPassword && username;
    }

  return (
    <>
    
    <Card style={{ width: '60rem' }}>
        <CardTitle className='mb-3' style={{ paddingLeft: '2rem', paddingTop: '1rem' }}>Create New Account</CardTitle>
      <Card.Body>
        <Form>
            <Container>
                <Row>
                    <Col md={6}>
                        <Form.Group className="mb-3" controlId="formProfilePic">
                            <Image
                                src={defaultProfilePic}
                                alt="Profile"
                                roundedCircle
                                onMouseEnter={() => setImgHover(true)}
                                onMouseLeave={() => setImgHover(false)}
                                style={{
                                    width: '150px',
                                    height: '150px',
                                    objectFit: 'cover',
                                    transition: 'transform .18s ease, box-shadow .18s ease',
                                    transform: imgHover ? 'scale(1.08)' : 'scale(1)',
                                    boxShadow: imgHover ? '0 6px 18px rgba(0,0,0,0.25)' : 'none',
                                    cursor: 'pointer'
                                }}
                            />
                        </Form.Group>
                        
                        
                        <Form.Group className="mb-3" controlId="formBasicPassword" onChange={(e) => setPassword(e.target.value)}>
                            <Form.Label>Password</Form.Label>
                            <Form.Control type="password" placeholder="Password" />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Confirm Password</Form.Label>
                            <Form.Control 
                                type="password" 
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                isInvalid={confirmPassword !== '' && confirmPassword !== password}
                            />
                            <Form.Control.Feedback type="invalid">
                                Passwords do not match
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formCountrySelect">
                            <Form.Label>Select your Country</Form.Label>
                            <Form.Select >
                                <option>United States</option>
                                <option>Canada</option>
                                <option>Mexico-City</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formCitySelect">
                            <Form.Label>Select your City</Form.Label>
                            <Form.Select >
                                <option>Washington DC</option>
                                <option>Ottawa</option>
                                <option>Mexico</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>

                    <Col md={6} className="d-flex flex-column justify-content-center align-items-start">


                        <Form.Group className="mb-3 w-100" controlId="formUsername" onChange={(e) => setUsername(e.target.value)}>
                            <Form.Label>Username</Form.Label>
                            <Form.Control type="text" placeholder="Enter username" />
                        </Form.Group>

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

                        <Form.Group className="mb-3 w-100" controlId="formSignupMap">
                            <SignupMap />
                        </Form.Group>
                    </Col>
                </Row>
            </Container>
            <Button variant="primary" type="submit" disabled={validForm() ? false : true}>
                Submit
            </Button>
        </Form>
      </Card.Body>
    </Card>
    </>
  );
}

export default Signup;