import { io } from "socket.io-client";
import { API_BASE_URL } from "./api";

function getSocketBaseUrl() {
  return API_BASE_URL.replace(/\/api\/?$/, "");
}

export function createAppSocket(token) {
  if (!token) return null;

  return io(getSocketBaseUrl(), {
    transports: ["websocket", "polling"],
    auth: { token },
  });
}

