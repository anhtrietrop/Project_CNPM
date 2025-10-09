import jwt from "jsonwebtoken";

const isAuth = (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(400).json({ message: "Token not found" });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    if (!decodedToken) {
      return res.status(400).json({ message: "Invalid token" });
    }

    req.userId = decodedToken.userId;
    next();
  } catch (error) {
    console.log("Auth error:", error);
    return res.status(500).json({ message: "Auth middleware error", error });
  }
};

export default isAuth;
