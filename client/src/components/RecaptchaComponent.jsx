import React, { useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";

const SITE_KEY = import.meta.env.REACT_APP_RECAPTCHA_SITE_KEY; // set your key in .env

console.log("Loaded RECAPTCHA SITE KEY:", SITE_KEY);

function RecaptchaComponent({ onVerify,token,setToken,key }) {
  const recaptchaRef = useRef(null);
  console.log("RECAPTCHA SITE KEY:", key);

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
