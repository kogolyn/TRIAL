import express from "express";
import DispatchMessage from "../models/ambulance/DispatchMessage.mongo.js";

const router = express.Router();

router.post("/api/dispatch/message", async (req, res) => {
  try {
    const message = await DispatchMessage.create(req.body);

    if (global.ambulanceNotificationService) {
      await global.ambulanceNotificationService.notifyDispatchMessage(
        message.ambulanceId,
        message.toJSON(),
      );
    }

    return res.status(201).json(message);
  } catch (error) {
    return res.status(500).json({ message: "Failed to create dispatch message", error: error.message });
  }
});

router.get("/api/dispatch/messages/:ambulanceId/unread", async (req, res) => {
  try {
    const count = await DispatchMessage.countDocuments({
      ambulanceId: req.params.ambulanceId,
      isRead: false,
    });
    return res.json({ unread: count });
  } catch (error) {
    return res.status(500).json({ message: "Failed to get unread count", error: error.message });
  }
});

router.get("/api/dispatch/messages/:ambulanceId", async (req, res) => {
  try {
    const messages = await DispatchMessage.find({
      ambulanceId: req.params.ambulanceId,
    }).sort({ timestamp: -1 });
    return res.json(messages);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch messages", error: error.message });
  }
});

router.put("/api/dispatch/messages/:id/read", async (req, res) => {
  try {
    const message = await DispatchMessage.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    message.isRead = true;
    message.readAt = new Date();
    await message.save();
    return res.json(message);
  } catch (error) {
    return res.status(500).json({ message: "Failed to mark message as read", error: error.message });
  }
});

router.delete("/api/dispatch/messages/:id", async (req, res) => {
  try {
    const deleted = await DispatchMessage.deleteOne({ _id: req.params.id });
    if (!deleted.deletedCount) {
      return res.status(404).json({ message: "Message not found" });
    }
    return res.json({ message: "Message deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete message", error: error.message });
  }
});

export default router;
