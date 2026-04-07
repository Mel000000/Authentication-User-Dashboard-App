import { useState, useRef } from 'react';    
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import { Container, Row, Col } from 'react-bootstrap';
import defaultProfilePic from '../assets/default-profile-pic.jpg';
import SignupMap from './SignupMap';
import ProfileImageUploader from './ProfileImageUploader';
import AccountFields from './AccountFields';
import CountrySelector from './CountrySelector';
import { getCountryLoc } from '../api/countryApi';
import { createUser } from '../api/userApi';

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
        const hasEmail = email.trim().length > 0 && email.includes("@");
        const hasUsername = username.trim().length > 0;
        const passwordsMatch = password.length > 0 && password === confirmPassword;
        const hasCountry = country.trim().length > 0;
        const hasCustomProfileImage = profileImage !== defaultProfilePic;

        return hasEmail && hasUsername && passwordsMatch && hasCountry && hasCustomProfileImage;
    };

    const onCountryChange = async (countryName) => {
        try {
            setCountry(countryName);
            const countryData = await getCountryLoc(countryName);
            if (!countryData) {
                setX(20);
                setY(0);
                setZoom(1);
                return;
            }
            setX(countryData[0]);
            setY(countryData[1]);
            setZoom(4);
        } catch (error) {
            console.error("Error fetching country location:", error);
        }   
    };

    const onSubmit = async () => {
        try {
            const userData = { email, password, username, country };
            await createUser(userData);
            alert("User created successfully!");
        } catch (error) {
            console.error("Error creating user:", error);
        }
    }

    return (
        <Card className="shadow-lg border-0" style={{ 
            width: '70rem', 
            borderRadius: '1.5rem', 
            overflow: 'hidden' 
        }}>
            
            <Card.Body className="p-0">
                <div style={{ padding: '2rem', borderBottom: '1px solid #e9ecef' }}>
                    <h2 style={{ color: '#2d3748', margin: 0 }}>Create New Account</h2>
                    <p className="text-muted mt-2 mb-0">Join our community today</p>
                </div>
                
                <Form onSubmit={(e) => {
                    e.preventDefault();
                    onSubmit();
                }}>
                    <Container fluid className="p-4">
                        <Row>
                            <Col md={6}>
                                <div className="text-center mb-5">
                                    <ProfileImageUploader
                                        profileImage={profileImage} 
                                        setProfileImage={setProfileImage} 
                                        fileInputRef={fileInputRef} 
                                    />
                                </div>

                                <AccountFields
                                    password={password} 
                                    setPassword={setPassword}
                                    confirmPassword={confirmPassword} 
                                    setConfirmPassword={setConfirmPassword}
                                />

                                <CountrySelector value={country} onChange={onCountryChange} />
                            </Col>

                            <Col md={6}>
                                <Form.Group className="mb-3" controlId="formUsername">
                                    <Form.Label className="fw-semibold">Username</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Choose a username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        style={{ borderRadius: '0.75rem', padding: '0.75rem' }}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formBasicEmail">
                                    <Form.Label className="fw-semibold">Email Address</Form.Label>
                                    <Form.Control 
                                        type="email" 
                                        placeholder="Enter email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        isInvalid={email !== '' && !email.includes('@')}
                                        style={{ borderRadius: '0.75rem', padding: '0.75rem' }}
                                    />
                                    <Form.Text className="text-muted">
                                        We'll never share your email with anyone else.
                                    </Form.Text>
                                    <Form.Control.Feedback type="invalid">
                                        Please enter a valid email
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formSignupMap">
                                    <Form.Label className="fw-semibold">Your Location on Map</Form.Label>
                                    <SignupMap x={x} y={y} zoom={zoom} country={country} />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Container>
                    
                    <div style={{ padding: '1.5rem 2rem', background: '#f8f9fa', borderTop: '1px solid #e9ecef' }}>
                        <Button 
                            variant="primary" 
                            type="submit" 
                            disabled={!validForm()}
                            className="px-4 py-2 fw-bold"
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
                            Create Account
                        </Button>
                    </div>
                </Form>
            </Card.Body>
        </Card>
    );
}

export default Signup;