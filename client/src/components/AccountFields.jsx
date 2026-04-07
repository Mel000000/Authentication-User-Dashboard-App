import React from 'react';
import Form from 'react-bootstrap/Form';

export default function AccountFields({
  password, setPassword,
  confirmPassword, setConfirmPassword
}) {
  return (
    <>
      <Form.Group className="mb-3 mt-4" controlId="formBasicPassword">
        <Form.Label className="fw-semibold">Password</Form.Label>
        <Form.Control
          type="password"
          placeholder="Password"
          value={password}
          isInvalid={password !== '' && password.length < 6}
          onChange={(e) => setPassword(e.target.value)}
        />
      </Form.Group>
      <Form.Control.Feedback type="invalid">
          Password must be at least 6 characters long
      </Form.Control.Feedback>

      <Form.Group className="mb-3">
        <Form.Label className="fw-semibold">Confirm Password</Form.Label>
        <Form.Control
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          isInvalid={confirmPassword !== '' && confirmPassword !== password}
        />
        <Form.Control.Feedback type="invalid">
          Passwords do not match
        </Form.Control.Feedback>
      </Form.Group>
    </>
  );
}
