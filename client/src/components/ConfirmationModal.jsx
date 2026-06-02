import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

function ConfirmationModal({ show, onHide, onConfirm, title, body, confirmationText, buttonText }) {
    const [inputValue, setInputValue] = useState('');
    const [disabled, setDisabled] = useState(true);

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
        setDisabled(e.target.value !== confirmationText);
    }

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                Please type your email <strong>"{confirmationText}"</strong> to confirm
                <input type="text" className="form-control mt-2" placeholder="Enter your email" value={inputValue} onChange={handleInputChange} />
            </Modal.Body>
            <Modal.Footer>
                <Button 
                variant="danger"
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
                onClick={onConfirm} 
                disabled={disabled}>
                    {buttonText}
                </Button>
            </Modal.Footer>
        </Modal>
  );
}

export default ConfirmationModal;