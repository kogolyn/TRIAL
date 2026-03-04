import jwt from "jsonwebtoken";

export default function socketAuth(socket, next) {
  const token = socket.handshake?.auth?.token;

  if (!token) {
    return next(new Error("Authentication error"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    socket.role = decoded.role;
    socket.ambulanceId = decoded.ambulanceId;
    return next();
  } catch (error) {
    return next(new Error("Authentication error"));
  }
}
