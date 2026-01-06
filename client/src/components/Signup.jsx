import { useState, useRef } from 'react';    
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import { Container, Row, Col, CardTitle } from 'react-bootstrap';
import defaultProfilePic from '../assets/default-profile-pic.jpg';
import SignupMap from './SignupMap';
import ProfileImageUploader from './ProfileImageUploader';
import AccountFields from './AccountFields';
import CountrySelector from './CountrySelector';
import { getCountryLoc } from '../api/countryApi';



function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [profileImage, setProfileImage] = useState(defaultProfilePic);
    const [country, setCountry] = useState('');
    const [x, setX] = useState(20);
    const [y, setY] = useState(0);
    const [zoom, setZoom] = useState(1);
    const fileInputRef = useRef(null);
    

    const validForm = () => { 
        return email && password === confirmPassword && username;
    }

    const onCountryChange = async (countryName) => {
        try {
            setCountry(countryName);
            const countryData = await getCountryLoc(countryName);
            setX(countryData[0]);
            setY(countryData[1]);
            setZoom(4);
        } catch (error) {
            console.error("Error fetching country location:", error);
        }   
    };

    return(
    <Card style={{ width: '60rem' , margin: '2rem auto', boxShadow: '0 4px 12px rgba(0,0,0,0.15)'}}>
        <CardTitle className='mb-3' style={{ paddingLeft: '2rem', paddingTop: '1rem' }}>Create New Account</CardTitle>
      <Card.Body>
        <Form>
            <Container>
                <Row>
                    <Col md={6}>
                        <ProfileImageUploader profileImage={profileImage} setProfileImage={setProfileImage} fileInputRef={fileInputRef} />

                        <AccountFields
                          password={password} setPassword={setPassword}
                          confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword}
                        />

                        <CountrySelector value={country} onChange={onCountryChange} />
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
                            <SignupMap x={x} y={y} zoom={zoom} />
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
  );
}

export default Signup;