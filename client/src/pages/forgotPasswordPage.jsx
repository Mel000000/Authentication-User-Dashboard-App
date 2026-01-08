import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ReqResetCard from "../components/ReqResetCard"

export default function ForgotPasswordPage() {
    return (
        <>
        <Container 
        className="d-flex flex-column justify-content-center align-items-center" 
        style={{ height: '100vh' }} >
            <Row><Col><ReqResetCard /></Col></Row>
            <Row><Col><a href="/">Already have an account?</a></Col></Row>
            <Row><Col><a href="/signup">Create new Account?</a></Col></Row>
        </Container>
        </>
    )
}