import React, { useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";

const SITE_KEY = "6LdGLj0sAAAAAApMewW50XzHEh5NNNw6WAyoFbRy"//process.env.REACT_APP_RECAPTCHA_SITE_KEY; // set your key in .env

function RecaptchaComponent({ onVerify,token,setToken }) {
  const recaptchaRef = useRef(null);

  const handleChange = (value) => {
    // value is the reCAPTCHA token
    setToken(value);
    if (onVerify) onVerify(value);
  };

  return (
    <div>
      <ReCAPTCHA
        sitekey={SITE_KEY}
        onChange={handleChange}
        ref={recaptchaRef}
      />
      {token && <p>Human verified!</p>}
    </div>
  );
}

export default RecaptchaComponent;
