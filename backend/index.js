import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import connectDB from "./config/db.js";
import { initSocket } from "./realtime/socket.js";

import userRoutes from "./routes/user.routes.js";
import hospitalRoutes from "./routes/hospital.routes.js";
import dispatcherRoutes from "./routes/dispatcher.routes.js";
import emergencyRoutes from "./routes/emergency.js";

const app = express();

dotenv.config();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to Uzima API");
});

app.use("/users", userRoutes);
app.use("/hospital", hospitalRoutes);
app.use("/dispatcher", dispatcherRoutes);
app.use("/api/emergency", emergencyRoutes);

connectDB()
  .then(() => {
    const server = http.createServer(app);
    initSocket(server);
    server.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database connection failed:", error);
    process.exit(1);
  });
