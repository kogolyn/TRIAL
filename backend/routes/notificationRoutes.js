import express from "express";
import mongoose from "mongoose";
import Notification from "../models/Notification.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(100).lean();
    return res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = Number(req.query.limit) || 50;

    if (!global.notificationService) {
      return res.status(500).json({ success: false, message: "Notification service not initialized" });
    }

    const notifications = await global.notificationService.getUserNotifications(userId, limit);
    return res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/unread/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!global.notificationService) {
      return res.status(500).json({ success: false, message: "Notification service not initialized" });
    }

    const count = await global.notificationService.getUnreadCount(userId);
    return res.status(200).json({ success: true, unreadCount: count });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.put("/:id/read", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: "userId is required" });
    }

    if (!global.notificationService) {
      return res.status(500).json({ success: false, message: "Notification service not initialized" });
    }

    const updated = await global.notificationService.markAsRead(id, userId);
    if (!updated) {
      return res.status(404).json({ success: false, message: "Notification not found or already read" });
    }

    return res.status(200).json({ success: true, message: "Notification marked as read" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.put("/:id/ack", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: "userId is required" });
    }

    if (!global.notificationService) {
      return res.status(500).json({ success: false, message: "Notification service not initialized" });
    }

    const updated = await global.notificationService.acknowledge(id, userId);
    if (!updated) {
      return res.status(404).json({ success: false, message: "Notification not found or already acknowledged" });
    }

    return res.status(200).json({ success: true, message: "Notification acknowledged" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/dispatch", async (req, res) => {
  try {
    if (!global.notificationService) {
      return res.status(500).json({ success: false, message: "Notification service not initialized" });
    }

    const {
      title,
      message,
      details,
      type = "info",
      priority = "normal",
      roles = [],
      userIds = [],
      ambulanceId,
      hospitalId,
    } = req.body;

    if (!title || !message) {
      return res.status(400).json({ success: false, message: "title and message are required" });
    }

    const recipients = [];
    for (const role of roles) {
      if (typeof role === "string" && role.trim()) {
        recipients.push({ role: role.trim() });
      }
    }

    for (const id of userIds) {
      if (mongoose.isValidObjectId(id)) {
        recipients.push({ userId: new mongoose.Types.ObjectId(id) });
      }
    }

    if (ambulanceId && mongoose.isValidObjectId(ambulanceId)) {
      recipients.push({
        role: "ambulance",
        targetType: "ambulance",
        targetId: new mongoose.Types.ObjectId(ambulanceId),
      });
    }

    if (hospitalId && mongoose.isValidObjectId(hospitalId)) {
      recipients.push({
        role: "hospital",
        targetType: "hospital",
        targetId: new mongoose.Types.ObjectId(hospitalId),
      });
    }

    const notification = await global.notificationService.send({
      type,
      priority,
      title,
      message,
      details,
      recipients,
    });

    return res.status(201).json({ success: true, data: notification });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Notification.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    return res.status(200).json({ success: true, message: "Notification deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
