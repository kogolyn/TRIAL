import { Server } from "socket.io";

let ioInstance = null;

export function initSocket(server) {
  ioInstance = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    },
  });

  ioInstance.on("connection", (socket) => {
    socket.on("dispatcher:join", (payload = {}) => {
      const role = payload.role || "guest";
      socket.join(`role:${role}`);
      socket.emit("dispatcher:connected", {
        socketId: socket.id,
        joinedRole: role,
      });
    });

    socket.on("dispatcher:join-incident", (incidentId) => {
      if (!incidentId) return;
      socket.join(`incident:${incidentId}`);
    });
  });

  return ioInstance;
}

export function getIO() {
  return ioInstance;
}

export function emitDispatcherEvent(eventName, payload, room = null) {
  if (!ioInstance) return;
  if (room) {
    ioInstance.to(room).emit(eventName, payload);
    return;
  }
  ioInstance.emit(eventName, payload);
}
