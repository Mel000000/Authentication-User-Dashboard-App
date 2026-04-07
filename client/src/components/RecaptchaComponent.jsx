import React, { useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";

const SITE_KEY = import.meta.env.VITE_REACT_APP_RECAPTCHA_SITE_KEY;

function RecaptchaComponent({ onVerify, token, setToken }) {
  const recaptchaRef = useRef(null);

  const handleChange = (value) => {
    setToken(value);
    if (onVerify) onVerify(value);
  };

  return (
    <div className="d-flex justify-content-center">
      <ReCAPTCHA
        sitekey={SITE_KEY}
        onChange={handleChange}
        ref={recaptchaRef}
      />
      {token && <p className="text-success mt-2">✓ Human verified!</p>}
    </div>
  );
}

export default RecaptchaComponent;