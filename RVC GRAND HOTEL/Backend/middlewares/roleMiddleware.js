const jwt = require("jsonwebtoken");

const JWT_SECRET =
  "rvc_hotel_secret_key_2026";

function verifyToken(req, res, next) {

  const token =
    req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      error: "Unauthorized",
    });
  }

  try {

    const decoded = jwt.verify(
      token,
      JWT_SECRET
    );

    req.user = decoded;

    next();

  } catch (err) {

    return res.status(401).json({
      error: "Invalid token",
    });

  }
}

function allowRoles(...roles) {

  return (req, res, next) => {

    if (!req.user) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Forbidden",
      });
    }

    next();
  };
}

module.exports = {
  verifyToken,
  allowRoles,
};