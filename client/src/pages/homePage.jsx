import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, logoutUser, deleteUserAccount, updateUserProfile } from '../api/userApi';
import {checkLoggedInUser} from "../utils/authUtils.js"
import { Container, Button, Card, Spinner, Row, Col, Image, Badge,Form, FormControl } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import apiClient from '../api/apiClient';
import ProfileImageUploader from '../components/ProfileImageUploader';
import CountrySelector from '../components/CountrySelector';
import ConfirmationModal from '../components/ConfirmationModal';
import 'react-toastify/dist/ReactToastify.css';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editProfile, setEditProfile] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [country, setCountry] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();



 useEffect(() => {
    const fetchUser = async () => {
      try {
        //const userData = await getCurrentUser();
        const userData = await checkLoggedInUser();
        setUser(userData.user);
        setLoading(false);
      } catch (err) {
        console.error('Auth error:', err);
        setError('Session expired. Please login again.');
        setLoading(false);
        
        // Only redirect if they aren't already sitting on the landing/login page
        if (window.location.pathname !== '/') {
          setTimeout(() => {
            navigate('/');
          }, 2000);
        }
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      toast.success("Logged out successfully! Redirecting to login page...", {
        position: "top-right",
        autoClose: 3000,
      });
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      console.error('Logout error:', err);
      toast.error("Failed to logout. Please try again.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteUserAccount(user?.email); // Pass the user's email to the API call
      toast.success("Account deleted successfully! Redirecting to login page...", {
        position: "top-right",
        autoClose: 3000,
      });
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      console.error('Delete account error:', err);
      toast.error("Failed to delete account. Please try again.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };


  const handleProfileUpdate = async (e) => {
      e.preventDefault();
      try{
        const user = await getCurrentUser(); // Get the current user data to ensure we have the latest email
        if (!user) {
          toast.error("User not found. Please refresh and try again.", {
            position: "top-right",
          });
          return;
        }

        await updateUserProfile({ email, username, country });
        toast.success("Profile updated successfully!", {
          position: "top-right",
          autoClose: 1000,
        });
        // If a new profile image was selected, upload it
        if (profileImageFile) {
          const formData = new FormData();
          formData.append('profileImage', profileImageFile);
          try {
            // Separate API call for image upload to handle multipart/form-data
            await apiClient.post('/profile/upload-profile-image', formData,{
              headers: { 'Content-Type': 'multipart/form-data' },
            });
            toast.success("Profile image updated successfully!", {
              position: "top-right",
              autoClose: 1000,
            });
          } catch (uploadError) {
            console.warn("Profile update succeeded but avatar upload failed:", uploadError);
            toast.warning("Profile updated, but your avatar upload encountered an error.");
          }
        }
        // Refresh user data to reflect updates
        const updatedUser = await getCurrentUser();
        setUser(updatedUser);
        setEditProfile(false);
      }catch(error){
        console.error("Profile update error:", error);
        toast.error("Failed to update profile. Please try again.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
  }


  if (loading) {
    return (
      <Container fluid className="d-flex flex-column justify-content-center align-items-center" style={{ 
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <Spinner animation="border" variant="light" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3 text-white">Loading your dashboard...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="d-flex flex-column justify-content-center align-items-center" style={{ 
        height: '100vh'
      }}>
        <div className="alert alert-danger shadow-lg">{error}</div>
        <p className="text-black">Redirecting to login...</p>
      </Container>
    );
  }

  return (
      <Container fluid className="d-flex flex-column justify-content-center align-items-center" 
        style={{ minHeight: '100vh', minWidth: '100%', padding: '2rem'}}>
        <Row className="justify-content-center align-items-center h-100">
          <Col xs={12} lg={15} xl={15} className="mb-4">
            <Card className="shadow-lg border-0" style={{ borderRadius: '1.5rem', overflow: 'hidden', background: editProfile ? 'linear-gradient(135deg, #f7fafc 0%, #e2e8f0 100%)' : 'none' }}>
              
              <Card.Body className="p-0">
                <Row className="g-0">
                  <Col md={5} className="text-center p-5" style={{
                    background: editProfile ? 'linear-gradient(135deg, #cbd2d9 0%, #b3bac6 100%)' : 'linear-gradient(135deg, #dfe6f0 0%, #ccd3de 100%)'
                  }}>
                    {editProfile ? 
                    (
                    <div>
                      <ProfileImageUploader
                          profileImage={profileImage || user?.profileImageUrl}
                          setProfileImage={setProfileImage}
                          setProfileImageFile={setProfileImageFile} // Pass the correct prop
                          fileInputRef={fileInputRef} 
                          extraStyles={{ borderRadius: '50%', objectFit: 'cover', border: '4px solid white', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}
                      />
 
                    </div>

                    ):(
                      <div className="position-relative d-inline-block">
                        <Image
                          src={user?.profileImageUrl || 'https://via.placeholder.com/180'}
                          alt={user?.username}
                          roundedCircle
                        style={{
                          width: '200px',
                          height: '200px',
                          objectFit: 'cover',
                          border: '4px solid white',
                          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                        }}
                        className="hover-scale"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.05)';
                          e.currentTarget.style.boxShadow = '0 15px 50px rgba(0,0,0,0.2)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.1)';
                        }}
                      />
                      <Badge 
                        bg="success" 
                        className="position-absolute bottom-0 end-0 rounded-circle p-2 border border-white"
                        style={{ transform: 'translate(10%, -10%)' }}
                      >
                        <span className="visually-hidden">Online</span>
                      </Badge>
                    </div>
                    )}
                    
                    <h2 className= {editProfile ? "mt-3 mb-2" : "mt-4 mb-2"}>{user?.username}</h2>
                    <p className="text-muted">Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently'}</p>
                  </Col>

                  <Col md={7} className="p-5">
                    <Row>
                      <Col md={10}>
                      <div className="mb-4">
                        <h1 className="display-6 fw-bold" style={{ color: '#2d3748' }}>
                          {editProfile ? `Happy Editing, ${user?.username}!` : `Welcome Home, ${user?.username}!`}
                        </h1>
                        <p className="text-muted">Here's your profile information</p>
                      </div>
                      </Col>
                      <Col md={2} className="d-flex justify-content-end align-items-start">
                      <Button className="btn btn-light border-0 p-2" style={{ borderRadius: '50%' }} onClick={() => setEditProfile(!editProfile)}>
                        <img src={editProfile ? "https://www.svgrepo.com/show/494409/cancel.svg": "https://www.svgrepo.com/show/522527/edit-3.svg"} alt="Edit Profile" width="24" height="24" />
                      </Button>
                      </Col>
                    </Row>
                    <Form>

                      

                      {editProfile ? (<></>):(

  
                        <div className="d-flex align-items-center mb-4 p-3 rounded" style={{ background: '#f7fafc' }}>
                          <span className="me-3" style={{ fontSize: '24px' }}>📧</span>
                          <div>
                            <small className="text-muted d-block">Email Address</small>
                            <strong className="fs-5">{user?.email}</strong>
                          </div>
                        </div>
                        )}

                        <div className="d-flex align-items-center mb-3 p-3 rounded" style={{ background: '#f7fafc' }}>
                          <span className="me-3" style={{ fontSize: '24px' }}>👤</span>
                          <div>
                            <small className="text-muted d-block">Username</small>
                            {editProfile ? (
                              <Form.Control 
                                type="text"
                                defaultValue={user?.username}
                                bordered={false}
                                onChange={(e) => setUsername(e.target.value)} // Update username state on change
                              />
                            ) : (
                              <strong className="fs-5">{user?.username}</strong>
                            )}
                          </div>
                        </div>

                        <div className="d-flex align-items-center mb-3 p-3 rounded" style={{ background: '#f7fafc' }}>
                          <span className="me-3" style={{ fontSize: '24px' }}>🌍</span>
                          <div>
                            <small className="text-muted d-block">Country</small>
                            {editProfile ? (
                              <CountrySelector value={country} onChange={(countryName) => setCountry(countryName)} disableLabel={true} />
                            ) : (
                              <strong className="fs-5">{user?.country || 'Not specified'}</strong>
                            )}
                          </div>
                        </div>

                        {editProfile ? (<></>):(

  
                        <div className="d-flex align-items-center mb-4 p-3 rounded" style={{ background: '#f7fafc' }}>
                          <span className="me-3" style={{ fontSize: '24px' }}>📅</span>
                          <div>
                            <small className="text-muted d-block">Member Since</small>
                            <strong className="fs-5">
                              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              }) : 'Recently'}
                            </strong>
                          </div>
                        </div>
                        )}

                      

                      <Row className="g-3">
                        
                        {editProfile ? (
                        <Col xs={12} md={12}>
                          <Button
                            onClick={handleProfileUpdate}
                            variant="primary"
                            className="w-100 py-2 fw-bold"
                            style={{ 
                              borderRadius: '0.75rem',
                              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                              background: 'linear-gradient(135deg, #6567f5 0%, #3e54e5 100%)',
                              border: 'none'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = '0 7px 14px rgba(229, 62, 62, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                          >
                            Submit Changes
                          </Button>
                        </Col>
                        ):(<>
                          <Col xs={12} md={6}>
                          <Button 
                            variant="primary" 
                            onClick={handleLogout}
                            className="w-100 py-2 fw-bold"
                            style={{ 
                              borderRadius: '0.75rem',
                              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                              background: 'linear-gradient(135deg, #6567f5 0%, #3e54e5 100%)',
                              border: 'none'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = '0 7px 14px rgba(229, 62, 62, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                          >
                            Logout
                          </Button>
                          </Col>

                          <Col xs={12} md={6}>
                          <Button 
                            variant="danger" 
                            onClick={() => setShowDeleteModal(true)}
                            className="w-100 py-2 fw-bold"
                            style={{ 
                              borderRadius: '0.75rem',
                              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                              background: 'linear-gradient(135deg, #f56565 0%, #e53e3e 100%)',
                              border: 'none'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = '0 7px 14px rgba(229, 62, 62, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                          >
                            Delete Account
                          </Button>
                          </Col>
                        </>
                        )}
                        
                      </Row>
                    </Form>
                    
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <ToastContainer />
        <ConfirmationModal 
          show={showDeleteModal} 
          onHide={() => setShowDeleteModal(false)} 
          onConfirm={handleDeleteAccount}
          title="Confirm Account Deletion"
          body="Are you sure you want to delete your account? This action cannot be undone."
          confirmationText={user?.email}
          buttonText="Yes, Delete My Account"
        />
      </Container>
  );
}