import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";

import connectDB from "./config/db.js";
import userRoutes from "./routes/user.routes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import emergencyRoutes from "./routes/emergency.js";
import ambulanceRoutes from "./routes/ambulanceRoutes.js";
import hospitalRoutes from "./routes/hospital.routes.js";
import hospitalLegacyRoutes from "./routes/hospitalRoutes.js";
import transferRoutes from "./routes/transferRoutes.js";
import dispatcherRoutes from "./routes/dispatcher.routes.js";
import NotificationService from "./services/notificationService.js";
import { initSocket } from "./realtime/socket.js";

dotenv.config();

const app = express();
const httpServer = http.createServer(app);
const io = initSocket(httpServer);
global.notificationService = new NotificationService(io);

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to Uzima API");
});


app.use("/users", userRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/emergencies", emergencyRoutes);
app.use("/api/ambulances", ambulanceRoutes);
app.use("/api/hospitals", hospitalRoutes);
app.use("/api/hospitals", hospitalLegacyRoutes);
app.use("/api/transfers", transferRoutes);
app.use("/dispatcher", dispatcherRoutes);

connectDB()
  .then(() => {
    setInterval(async () => {
      if (!global.notificationService) {
        return;
      }
      try {
        await global.notificationService.escalateUnacknowledged(3);
      } catch (error) {
        console.error("[Notification] Escalation loop failed:", error.message);
      }
    }, 60 * 1000);

    httpServer.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database connection failed:", error);
    process.exit(1);
  });

export default app;
