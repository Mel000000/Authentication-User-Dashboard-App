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
        onErrored={() => {
          console.error("reCAPTCHA failed to load");
          setToken(null);               // clear any stale token
        }}
        ref={recaptchaRef}
        onExpired={() => {
          setToken(null);
          recaptchaRef.current?.reset();   // clears the widget
        }}
      />
    </div>
  );
}

export default RecaptchaComponent;