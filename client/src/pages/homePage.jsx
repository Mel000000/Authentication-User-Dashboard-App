import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, logoutUser } from '../api/userApi';
import { Container, Button, Card, Spinner, Row, Col, Image, Badge } from 'react-bootstrap';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
        setLoading(false);
      } catch (err) {
        console.error('Auth error:', err);
        setError('Session expired. Please login again.');
        setLoading(false);
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

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
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div className="alert alert-danger shadow-lg">{error}</div>
        <p className="text-white">Redirecting to login...</p>
      </Container>
    );
  }

  return (
      <Container fluid className="d-flex flex-column justify-content-center align-items-center" 
        style={{ minHeight: '100vh', padding: '2rem'}}>
        <Row className="justify-content-center align-items-center h-100">
          <Col xs={12} lg={15} xl={15} className="mb-4">
            <Card className="shadow-lg border-0" style={{ borderRadius: '1.5rem', overflow: 'hidden' }}>
              
              <Card.Body className="p-0">
                <Row className="g-0">
                  <Col md={5} className="text-center p-5" style={{
                    background: 'linear-gradient(135deg, #dfe6f0 0%, #ccd3de 100%)'
                  }}>
                    <div className="position-relative d-inline-block">
                      <Image
                        src={user?.profileImageUrl || 'https://via.placeholder.com/180'}
                        alt={user?.username}
                        roundedCircle
                        style={{
                          width: '180px',
                          height: '180px',
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
                    
                    <h2 className="mt-4 mb-2">{user?.username}</h2>
                    <p className="text-muted">Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently'}</p>
                  </Col>

                  <Col md={7} className="p-5">
                    <div className="mb-4">
                      <h1 className="display-6 fw-bold" style={{ color: '#2d3748' }}>
                        Welcome Home, {user?.username}!
                      </h1>
                      <p className="text-muted">Here's your profile information</p>
                    </div>

                    <div className="mb-4">
                      <div className="d-flex align-items-center mb-3 p-3 rounded" style={{ background: '#f7fafc' }}>
                        <span className="me-3" style={{ fontSize: '24px' }}>📧</span>
                        <div>
                          <small className="text-muted d-block">Email Address</small>
                          <strong className="fs-5">{user?.email}</strong>
                        </div>
                      </div>

                      <div className="d-flex align-items-center mb-3 p-3 rounded" style={{ background: '#f7fafc' }}>
                        <span className="me-3" style={{ fontSize: '24px' }}>👤</span>
                        <div>
                          <small className="text-muted d-block">Username</small>
                          <strong className="fs-5">{user?.username}</strong>
                        </div>
                      </div>

                      <div className="d-flex align-items-center mb-3 p-3 rounded" style={{ background: '#f7fafc' }}>
                        <span className="me-3" style={{ fontSize: '24px' }}>🌍</span>
                        <div>
                          <small className="text-muted d-block">Country</small>
                          <strong className="fs-5">{user?.country || 'Not specified'}</strong>
                        </div>
                      </div>

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
                    </div>

                    <Button 
                      variant="danger" 
                      onClick={handleLogout}
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
                      Logout
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
  );
}