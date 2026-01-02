import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Signup from "../components/Signup"

export default function SignupPage() {
    return (
        <>
         <Container 
        className="d-flex flex-column justify-content-center align-items-center" 
        style={{ height: '100vh' }} >
            <Row><Col><Signup /></Col></Row>
            <Row><Col><a href="/">Already have an account?</a></Col></Row>
        </Container>
        </>
    )
}