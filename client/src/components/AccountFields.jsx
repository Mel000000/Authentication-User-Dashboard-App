import React from 'react';
import Form from 'react-bootstrap/Form';

export default function AccountFields({
  username, setUsername,
  email, setEmail,
  password, setPassword,
  confirmPassword, setConfirmPassword
}) {
  return (
    <>
      
      <Form.Group className="mb-3 mt-4" controlId="formBasicPassword" onChange={(e) => setPassword(e.target.value)}>
        <Form.Label>Password</Form.Label>
        <Form.Control type="password" placeholder="Password" value={password} />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Confirm Password</Form.Label>
        <Form.Control
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          isInvalid={confirmPassword !== '' && confirmPassword !== password}
        />
        <Form.Control.Feedback type="invalid">Passwords do not match</Form.Control.Feedback>
      </Form.Group>
    </>
  );
}
