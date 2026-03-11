import jwt from "jsonwebtoken";
import { verifyToken } from "../utils/token.js";

export default function socketAuth(socket, next) {
  const token = socket.handshake?.auth?.token;

  if (!token) {
    socket.role = "guest";
    return next();
  }

  try {
    let decoded = verifyToken(token);

    if (!decoded && process.env.JWT_SECRET) {
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch {
        decoded = null;
      }
    }

    if (!decoded) {
      socket.role = "guest";
      return next();
    }

    socket.userId = decoded.id || decoded.userId;
    socket.role = decoded.role || "guest";
    socket.ambulanceId = decoded.ambulanceId;
    return next();
  } catch (error) {
    socket.role = "guest";
    return next();
  }
}
