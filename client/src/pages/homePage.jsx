import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, logoutUser } from '../api/userApi';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Spinner from 'react-bootstrap/Spinner';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);  // Start with true
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
        setLoading(false);  // Only set loading false AFTER data arrives
      } catch (err) {
        console.error('Auth error:', err);
        setError('Session expired. Please login again.');
        setLoading(false);
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    };

    fetchUser();
  },[]);

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
      <Container className="d-flex flex-column justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading your dashboard...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="d-flex flex-column justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="alert alert-danger">{error}</div>
        <p>Redirecting to login...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <Card className="shadow-sm">
        <Card.Body>
          <h1 className="mb-4">Welcome Home, {user?.username}!</h1>
          <hr />
          <h5>Your Profile:</h5>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Username:</strong> {user?.username}</p>
          <p><strong>Country:</strong> {user?.country}</p>
          <p><strong>Member since:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}</p>
          <Button align="right" variant="danger" onClick={handleLogout}>
            Logout
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
}