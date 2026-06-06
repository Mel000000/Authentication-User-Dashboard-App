const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
  let token = req.cookies?.token;

  if (!token && req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }
  
  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

const authTemp = async (req, res, next) => {
  let token = req.cookies?.tempEmail;;

  if (!token) {
    return res.status(401).json({ error: "Temporary authentication required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); 
    req.tempEmail = decoded.email; // Store the email in the request object for later use
    // delete the cookie immediately after verifying the token to prevent reuse
    res.clearCookie("tempEmail", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.status(401).json({ error: "Invalid or expired temporary token" });
  }
}

module.exports = { auth, authTemp };