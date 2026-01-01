import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Login from '../components/Login.jsx';

export default function dashboard() {
    return (
        <>
        <Container 
        className="d-flex flex-column justify-content-center align-items-center" 
        style={{ height: '100vh' }} >
            <Row><Col><Login /></Col></Row>
            <Row><Col><a href="/signup">Create new Account?</a></Col></Row>
        </Container>
        </>
    )
}
