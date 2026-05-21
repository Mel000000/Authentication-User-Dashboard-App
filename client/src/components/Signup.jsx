import { useState, useRef } from 'react';    
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import { Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom'; // Missing import!
import axios from 'axios';
import defaultProfilePic from '../assets/default-profile-pic.jpg';
import SignupMap from './SignupMap';
import ProfileImageUploader from './ProfileImageUploader';
import AccountFields from './AccountFields';
import CountrySelector from './CountrySelector';
import { getCountryLoc } from '../api/countryApi';
import { createUser } from '../api/userApi';

function Signup() {
    const navigate = useNavigate(); // Was missing!
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [profileImage, setProfileImage] = useState(defaultProfilePic);
    const [profileImageFile, setProfileImageFile] = useState(null); // Need separate state for file
    const [country, setCountry] = useState('');
    const [x, setX] = useState(20);
    const [y, setY] = useState(0);
    const [zoom, setZoom] = useState(1);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false); // Prevent double submission
    const fileInputRef = useRef(null);

    const validForm = () => {
        const hasEmail = email.trim().length > 0 && email.includes("@");
        const hasUsername = username.trim().length > 0;
        const passwordsMatch = password.length > 0 && password === confirmPassword;
        const hasCountry = country.trim().length > 0;

        return hasEmail && hasUsername && passwordsMatch && hasCountry;
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

    const onSubmit = async (e) => {
        e.preventDefault();
        
        // Prevent double submission
        if (loading || submitted) {
            console.log("Already submitting, ignoring...");
            return;
        }
        
        setLoading(true);
        setSubmitted(true);
        
        try {
            // create the user account
            const userData = { email, password, username, country };
            const response = await createUser(userData);
            
            if (response.user) {
                if (profileImageFile && profileImage !== defaultProfilePic) {
                    const formData = new FormData();
                    formData.append('profileImage', profileImageFile); // Use the file, not the preview URL
                    try{
                        await axios.post('http://localhost:3000/api/profile/upload-profile-image', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                        withCredentials: true
                    });
                    }catch (error) {
                        console.warn("Avatar upload failed, but account created:", error);
                        alert("Account created, but profile picture could not be uploaded. You can retry later.");
                    }
                    
                }
                
                alert("User created successfully!");
                navigate('/');
            }
        } catch (error) {
            console.error("Error creating user:", error);
            if (error.response) {
                if (error.response.status === 409) {
                    alert(error.response.data.error || "Email or username already exists");
                } else {
                    alert(error.response.data.error || "Failed to create user");
                }
            } else {
                alert("An error occurred. Please try again.");
            }
            setSubmitted(false); // Reset on error so user can try again
        } finally {
            setLoading(false);
        }
    }

    return (
        <Card className="shadow-lg border-0" style={{ 
            width: 'min(70rem, 95vw)', 
            borderRadius: '1.5rem', 
            overflow: 'hidden' 
        }}>
            
            <Card.Body className="p-0">
                <div style={{ padding: '2rem', borderBottom: '1px solid #e9ecef' }}>
                    <h2 style={{ color: '#2d3748', margin: 0 }}>Create New Account</h2>
                    <p className="text-muted mt-2 mb-0">Join our community today</p>
                </div>
                
                <Form onSubmit={onSubmit}>
                    <Container fluid className="p-4">
                        <Row>
                            <Col md={6}>
                                <div className="text-center mb-5">
                                    <ProfileImageUploader
                                        profileImage={profileImage} 
                                        setProfileImage={setProfileImage}
                                        setProfileImageFile={setProfileImageFile} // Pass the correct prop
                                        fileInputRef={fileInputRef} 
                                    />
                                </div>

                                
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

                                <CountrySelector value={country} onChange={onCountryChange} />
                            </Col>

                            <Col md={6}>
                                <AccountFields
                                    password={password} 
                                    setPassword={setPassword}
                                    confirmPassword={confirmPassword} 
                                    setConfirmPassword={setConfirmPassword}
                                />
                                

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
                            disabled={!validForm() || loading}
                            className="px-4 py-2 fw-bold"
                            style={{ 
                                borderRadius: '0.75rem',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                border: 'none',
                                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                                if (!validForm() || loading) return;
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 7px 14px rgba(102, 126, 234, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </Button>
                    </div>
                </Form>
            </Card.Body>
        </Card>
    );
}

export default Signup;