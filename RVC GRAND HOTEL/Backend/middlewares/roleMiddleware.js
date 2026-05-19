export const allowRoles = (...roles) => {
  return (req, res, next) => {

    // ยังไม่ได้ login
    if (!req.user) {
      return res.status(401).json({
        error: "Unauthorized"
      });
    }

    // role ไม่มีสิทธิ์
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Forbidden"
      });
    }

    // ผ่าน
    next();
  };
};