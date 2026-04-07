import { Container, Row, Col } from 'react-bootstrap';

export default function SharedPageContainer({ children, showLinks = true, links = [] }) {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
        }}>
            <Container style={{ width: 'auto' }}>
                <Row className="justify-content-center">
                    <Col xs={12} md="auto" lg="auto" xl="auto" style={{ display: 'flex', justifyContent: 'center' }}>
                        {children}
                    </Col>
                </Row>
                {showLinks && links.length > 0 && (
                    <Row className="justify-content-center mt-4">
                        <Col xs="auto">
                            <div className="text-center">
                                {links.map((link, index) => (
                                    <div key={index} className="mt-2">
                                        <a 
                                            href={link.href} 
                                            style={{ 
                                                color: 'black',
                                                textDecoration: 'none',
                                                opacity: 0.8,
                                                transition: 'opacity 0.2s ease'
                                            }}
                                            onMouseEnter={(e) => e.target.style.opacity = '1'}
                                            onMouseLeave={(e) => e.target.style.opacity = '0.9'}
                                        >
                                            {link.text}
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </Col>
                    </Row>
                )}
            </Container>
        </div>
    );
}