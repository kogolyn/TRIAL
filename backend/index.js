import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import socketAuth from "./middleware/socketAuth.js";
import { requireSql } from "./middleware/sqlAvailability.js";
import AmbulanceNotificationService from "./services/ambulanceNotificationService.js";

import userRoutes from "./routes/user.routes.js";
import patientCareRoutes from "./routes/patientCareRoutes.js";
import vitalsRoutes from "./routes/vitalsRoutes.js";
import dispatchRoutes from "./routes/dispatchRoutes.js";
import ambulanceRoutes from "./routes/ambulanceRoutes.js";
import facilitiesRoutes from "./routes/facilitiesRoutes.js";
import crewRoutes from "./routes/crewRoutes.js";

const app = express();
const server = http.createServer(app);

dotenv.config(); 

const PORT = process.env.PORT || 5000;

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

io.use(socketAuth);

io.on("connection", (socket) => {
  if (socket.role === "dispatcher" || socket.role === "admin") {
    socket.join("dispatch-room");
  }

  if (socket.role === "hospital" || socket.role === "medical") {
    socket.join("hospital-room");
  }

  if (socket.ambulanceId) {
    socket.join(`ambulance-${socket.ambulanceId}`);
  }
});

global.ambulanceNotificationService = new AmbulanceNotificationService(io);
global.sqlReady = false;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Welcome to Uzima API");
});
app.use("/users", userRoutes);
app.use(patientCareRoutes);
app.use(vitalsRoutes);
app.use(dispatchRoutes);
app.use(ambulanceRoutes);
app.use(facilitiesRoutes);
app.use(requireSql, crewRoutes);

async function startServer() {
  try {
    await connectDB();
    console.log("MongoDB routes enabled for ambulance module");

    server.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
}

startServer();
