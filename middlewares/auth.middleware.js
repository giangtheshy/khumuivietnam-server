
import jwt from "jsonwebtoken";

const auth = (req, res, next) => {
  try {
    const token = req.header("x-auth-token");

    if (!token) return res.status(401).json({ message: "not authentication found" });
    const verify = jwt.verify(token, process.env.JWT_SECRET);
    if (!verify) return res.status(401).json({ message: "token is invalid" });
    req.user = verify.id;
    req.role = verify.role;
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export default auth;