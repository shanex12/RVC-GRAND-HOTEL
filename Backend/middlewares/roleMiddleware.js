const jwt = require("jsonwebtoken");

const JWT_SECRET =
  process.env.JWT_SECRET;

function verifyToken(req, res, next) {

  const authHeader =
    req.headers.authorization;

  console.log(
    "AUTH HEADER:",
    authHeader
  );

  if (
    !authHeader ||
    !authHeader.startsWith("Bearer ")
  ) {
    return res.status(401).json({
      error: "Unauthorized",
    });
  }

  const token =
    authHeader.split(" ")[1];

  try {

    const decoded = jwt.verify(
      token,
      JWT_SECRET
    );

    console.log("USER:", decoded);

    req.user = decoded;

    next();

  } catch (err) {

    console.error(err);

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