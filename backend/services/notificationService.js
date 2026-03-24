import mongoose from "mongoose";
import Notification from "../models/Notification.js";
import User from "../models/user.model.js";

class NotificationService {
  constructor(io) {
    this.io = io;
  }

  normalizeRole(role) {
    if (role === "medical") {
      return "hospital";
    }
    return role;
  }

  toObjectId(id) {
    if (!id || !mongoose.isValidObjectId(id)) {
      return null;
    }
    return new mongoose.Types.ObjectId(id);
  }

  async send(data) {
    try {
      const normalizedRecipients = (data.recipients || []).map((recipient) => ({
        ...recipient,
        role: recipient?.role ? this.normalizeRole(recipient.role) : recipient?.role,
      }));

      const payload = {
        type: data.type || "info",
        priority: data.priority || "normal",
        title: data.title,
        message: data.message,
        details: data.details || "",
        recipients: normalizedRecipients,
        relatedEmergency: data.relatedEmergency || undefined,
        relatedAmbulance: data.relatedAmbulance || undefined,
        relatedHospital: data.relatedHospital || undefined,
        expiresAt: data.expiresAt || undefined,
      };

      const notification = await Notification.create(payload);
      const socketPayload = {
        ...notification.toObject(),
        playSound: ["high", "critical"].includes(notification.priority),
      };

      const recipients = notification.recipients || [];
      if (!recipients.length) {
        this.io.emit("notification:new", socketPayload);
      } else {
        const roleRooms = [...new Set(recipients.map((r) => r.role).filter(Boolean))];
        const userRooms = [
          ...new Set(recipients.map((r) => (r.userId ? String(r.userId) : null)).filter(Boolean)),
        ];
        const targetRooms = [
          ...new Set(
            recipients
              .map((r) => (r.targetType && r.targetId ? `${r.targetType}:${String(r.targetId)}` : null))
              .filter(Boolean),
          ),
        ];

        roleRooms.forEach((role) => {
          this.io.to(role).emit("notification:new", socketPayload);
          this.io.to(`role:${role}`).emit("notification:new", socketPayload);
        });

        userRooms.forEach((userId) => {
          this.io.to(userId).emit("notification:new", socketPayload);
          this.io.to(`user:${userId}`).emit("notification:new", socketPayload);
        });

        targetRooms.forEach((room) => {
          this.io.to(room).emit("notification:new", socketPayload);
        });
      }

      console.log(`[Notification] Sent: ${notification.title} (${notification.priority})`);
      return notification;
    } catch (error) {
      console.error("[Notification] send() failed:", error.message);
      throw error;
    }
  }

  async getRoleRecipients(role) {
    const normalizedRole = this.normalizeRole(role);
    try {
      const rolesToQuery = normalizedRole === "hospital" ? ["hospital", "medical"] : [normalizedRole];
      const users = await User.find({ role: { $in: rolesToQuery } }).select("_id role").lean();
      return users.map((user) => ({ userId: user._id, role: normalizedRole }));
    } catch (error) {
      console.error(`[Notification] getRoleRecipients(${normalizedRole}) failed:`, error.message);
      return [{ role: normalizedRole }];
    }
  }

  async notifyEmergencyReported(emergency) {
    const dispatcherRecipients = await this.getRoleRecipients("dispatcher");
    return this.send({
      type: "emergency",
      priority: "critical",
      title: "New Emergency Reported",
      message: `Emergency reported at ${emergency.location || "unknown location"}`,
      details: emergency.description || "No description provided",
      recipients: dispatcherRecipients,
      relatedEmergency: emergency._id,
    });
  }

  async notifyAmbulanceAssigned(emergency, ambulance) {
    const recipients = [{ role: "ambulance", targetType: "ambulance", targetId: ambulance?._id }];
    if (ambulance?.userId) {
      recipients.push({
        userId: ambulance.userId,
        role: "ambulance",
        targetType: "ambulance",
        targetId: ambulance._id,
      });
    }

    return this.send({
      type: "ambulance",
      priority: "high",
      title: "Ambulance Assigned",
      message: `Ambulance ${ambulance.vehicleNumber || "N/A"} assigned to emergency`,
      details: `Severity: ${emergency.severity || "unknown"}`,
      recipients,
      relatedEmergency: emergency._id,
      relatedAmbulance: ambulance._id,
    });
  }

  async notifyAmbulanceEnRoute(ambulance, emergency) {
    return this.send({
      type: "ambulance",
      priority: "normal",
      title: "Ambulance En Route",
      message: `Ambulance ${ambulance.vehicleNumber || "N/A"} is en route`,
      details: ambulance.eta ? `ETA: ${ambulance.eta}` : "ETA not provided",
      recipients: [{ role: "dispatcher" }, { role: "reporter", userId: emergency.reporterId }].filter(
        (r) => r.role || r.userId,
      ),
      relatedEmergency: emergency._id,
      relatedAmbulance: ambulance._id,
    });
  }

  async notifyAmbulanceArrived(ambulance, emergency) {
    return this.send({
      type: "ambulance",
      priority: "high",
      title: "Ambulance Arrived",
      message: `Ambulance ${ambulance.vehicleNumber || "N/A"} arrived at emergency scene`,
      details: emergency.location ? `Location: ${emergency.location}` : "Location unavailable",
      recipients: [{ role: "dispatcher" }, { role: "reporter", userId: emergency.reporterId }].filter(
        (r) => r.role || r.userId,
      ),
      relatedEmergency: emergency._id,
      relatedAmbulance: ambulance._id,
    });
  }

  async notifyHospitalAccepted(hospital, emergency) {
    return this.send({
      type: "hospital",
      priority: "normal",
      title: "Hospital Accepted Patient",
      message: `${hospital.name || "Hospital"} accepted patient from emergency`,
      details: hospital.assignedBed
        ? `Assigned bed: ${hospital.assignedBed}${hospital.eta ? ` | ETA: ${hospital.eta}` : ""}`
        : "Bed information not provided",
      recipients: [
        { role: "dispatcher" },
        { role: "ambulance" },
        { role: "hospital", targetType: "hospital", targetId: hospital._id },
      ],
      relatedEmergency: emergency._id,
      relatedHospital: hospital._id,
    });
  }

  async notifyHospitalCapacityWarning(hospital) {
    const dispatcherRecipients = await this.getRoleRecipients("dispatcher");
    return this.send({
      type: "warning",
      priority: "critical",
      title: "Hospital Capacity Warning",
      message: `${hospital.name || "Hospital"} has high bed occupancy`,
      details:
        hospital.capacityPercentage !== undefined
          ? `Capacity: ${hospital.capacityPercentage}%`
          : "Capacity percentage not provided",
      recipients: dispatcherRecipients,
      relatedHospital: hospital._id,
    });
  }

  async notifyPatientTransferred(transfer) {
    return this.send({
      type: "success",
      priority: "normal",
      title: "Patient Transfer Complete",
      message: `Transfer completed to ${transfer.toHospital?.name || "destination hospital"}`,
      details: `From: ${transfer.fromHospital?._id || "unknown"} | To: ${transfer.toHospital?._id || "unknown"}`,
      recipients: [{ role: "dispatcher" }, { role: "admin" }],
      relatedHospital: transfer.toHospital?._id,
    });
  }

  async notifyEmergencyResolved(emergency) {
    return this.send({
      type: "success",
      priority: "normal",
      title: "Emergency Resolved",
      message: `Emergency at ${emergency.location || "unknown location"} marked as resolved`,
      details: emergency.description || "No additional details",
      recipients: [{ role: "dispatcher" }, { role: "reporter", userId: emergency.reporterId }].filter(
        (r) => r.role || r.userId,
      ),
      relatedEmergency: emergency._id,
    });
  }

  async getUserNotifications(userId, limit = 50) {
    const objectId = this.toObjectId(userId);
    if (!objectId) {
      return [];
    }

    return Notification.find({ "recipients.userId": objectId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  async markAsRead(notificationId, userId) {
    const objectId = this.toObjectId(userId);
    if (!objectId) {
      return false;
    }

    const result = await Notification.updateOne(
      {
        _id: notificationId,
        "recipients.userId": objectId,
      },
      {
        $set: { "recipients.$.read": true },
      },
    );

    return result.modifiedCount > 0;
  }

  async acknowledge(notificationId, userId) {
    const objectId = this.toObjectId(userId);
    if (!objectId) {
      return false;
    }

    const result = await Notification.updateOne(
      {
        _id: notificationId,
        "recipients.userId": objectId,
      },
      {
        $set: {
          "recipients.$.acknowledged": true,
          "recipients.$.acknowledgedAt": new Date(),
          "recipients.$.read": true,
        },
      },
    );

    if (result.modifiedCount > 0) {
      this.io.to(`user:${String(objectId)}`).emit("notification:acknowledged", {
        notificationId: String(notificationId),
        userId: String(objectId),
      });
    }

    return result.modifiedCount > 0;
  }

  async escalateUnacknowledged(minutes = 3) {
    const threshold = new Date(Date.now() - minutes * 60 * 1000);
    const staleAlerts = await Notification.find({
      createdAt: { $lte: threshold },
      priority: { $in: ["high", "critical"] },
      recipients: { $elemMatch: { acknowledged: false } },
      escalatedAt: { $exists: false },
      title: { $not: /^Escalated:/i },
      details: { $not: /ESCALATED_FROM:/ },
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    for (const alert of staleAlerts) {
      await this.send({
        type: alert.type,
        priority: "critical",
        title: `Escalated: ${alert.title}`,
        message: `No acknowledgement received within ${minutes} minutes`,
        details: `${alert.message} [ESCALATED_FROM:${alert._id}]`,
        recipients: [{ role: "dispatcher" }, { role: "admin" }],
        relatedEmergency: alert.relatedEmergency,
        relatedAmbulance: alert.relatedAmbulance,
        relatedHospital: alert.relatedHospital,
      });

      await Notification.updateOne({ _id: alert._id }, { $set: { escalatedAt: new Date() } });
    }

    return staleAlerts.length;
  }

  async getUnreadCount(userId) {
    const objectId = this.toObjectId(userId);
    if (!objectId) {
      return 0;
    }

    return Notification.countDocuments({
      recipients: {
        $elemMatch: {
          userId: objectId,
          read: false,
        },
      },
    });
  }
}

export default NotificationService;
