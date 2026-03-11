import Notification from "../models/ambulance/Notification.mongo.js";

class AmbulanceNotificationService {
  constructor(io) {
    this.io = io;
  }

  async send(data) {
    const priority = data.priority || "normal";
    const playSound =
      typeof data.playSound === "boolean"
        ? data.playSound
        : ["high", "critical"].includes(priority);
    const recipients = Array.isArray(data.recipients) ? data.recipients : [];

    const notificationPayload = {
      ...data,
      priority,
      playSound,
      timestamp: new Date(),
    };

    const records = [];
    if (Array.isArray(data.userIds) && data.userIds.length > 0) {
      for (const userId of data.userIds) {
        const record = await Notification.create({
          userId,
          ambulanceId: data.ambulanceId || null,
          hospitalId: data.hospitalId || null,
          type: data.type,
          title: data.title || data.type,
          message: data.message,
          priority,
          payload: notificationPayload,
          isRead: false,
          timestamp: notificationPayload.timestamp,
        });
        records.push(record);
      }
    }

    if (notificationPayload.ambulanceId) {
      this.io
        .to(`ambulance-${notificationPayload.ambulanceId}`)
        .emit("ambulance-notification", notificationPayload);
    }

    if (recipients.includes("dispatcher")) {
      this.io.to("dispatch-room").emit("ambulance-notification", notificationPayload);
    }

    if (recipients.includes("hospital")) {
      if (notificationPayload.hospitalUserId) {
        this.io
          .to(`hospital-user-${notificationPayload.hospitalUserId}`)
          .emit("ambulance-notification", notificationPayload);
      } else {
        this.io.to("hospital-room").emit("ambulance-notification", notificationPayload);
      }
    }

    console.log(
      `[${notificationPayload.timestamp.toISOString()}] Notification sent: ${notificationPayload.type}`,
      {
        priority: notificationPayload.priority,
        ambulanceId: notificationPayload.ambulanceId || null,
        recipients,
      },
    );

    return records[0] || notificationPayload;
  }

  async notifyPatientCareRecorded(patientCare) {
    return this.send({
      type: "patient-care",
      title: "Patient Care Update",
      message: `Patient care recorded for incident ${patientCare.incidentId}`,
      priority: "high",
      recipients: ["hospital", "dispatcher"],
      ambulanceId: patientCare.ambulanceId,
      hospitalId: patientCare.facilityId || null,
      hospitalUserId: patientCare.hospitalUserId || null,
      payload: patientCare,
    });
  }

  async notifyVitalsRecorded(vitals) {
    const priority = vitals.isCritical ? "critical" : "normal";
    return this.send({
      type: "vitals",
      title: "Vitals Update",
      message: `New vitals recorded for incident ${vitals.incidentId}`,
      priority,
      recipients: ["hospital", "dispatcher"],
      ambulanceId: vitals.ambulanceId,
      hospitalId: vitals.facilityId || null,
      hospitalUserId: vitals.hospitalUserId || null,
      payload: vitals,
    });
  }

  async notifyVitalsCritical(vitals) {
    return this.send({
      type: "critical-vitals",
      title: "Critical Vitals Alert",
      message: `Critical vitals detected for incident ${vitals.incidentId}`,
      priority: "critical",
      recipients: ["hospital", "dispatcher", "ambulance"],
      ambulanceId: vitals.ambulanceId,
      hospitalId: vitals.facilityId || null,
      hospitalUserId: vitals.hospitalUserId || null,
      playSound: true,
      payload: vitals,
    });
  }

  async notifyDispatchMessage(ambulanceId, message) {
    return this.send({
      type: "dispatch",
      title: "Dispatch Message",
      message: message.message,
      priority: message.priority || "normal",
      recipients: ["ambulance"],
      ambulanceId,
      payload: message,
    });
  }

  async notifyLocationUpdate(ambulanceId, location) {
    return this.send({
      type: "location",
      title: "Ambulance Location Update",
      message: `Location update from ambulance ${ambulanceId}`,
      priority: "low",
      recipients: ["dispatcher"],
      ambulanceId,
      payload: location,
    });
  }

  async notifyEmergencyAlert(alert) {
    return this.send({
      type: "emergency-alert",
      title: "Emergency Alert",
      message: alert.message,
      priority: "critical",
      recipients: ["dispatcher", "hospital"],
      ambulanceId: alert.ambulanceId,
      playSound: true,
      payload: alert,
    });
  }

  async notifyRouteUpdate(ambulanceId, routeData) {
    return this.send({
      type: "route-update",
      title: "Route Update",
      message: `Route updated for ambulance ${ambulanceId}`,
      priority: "normal",
      recipients: ["ambulance"],
      ambulanceId,
      payload: routeData,
    });
  }

  async notifyHospitalArrival(ambulanceId, hospitalId, eta, hospitalUserId = null) {
    return this.send({
      type: "arrival-notice",
      title: "Arrival Notice",
      message: `Ambulance ${ambulanceId} ETA to hospital ${hospitalId}: ${eta}`,
      priority: "high",
      recipients: ["hospital"],
      ambulanceId,
      hospitalId,
      hospitalUserId,
      payload: { eta },
    });
  }

  async notifyCrewAssignment(ambulanceId, crewData) {
    return this.send({
      type: "assignment",
      title: "Crew Assignment",
      message: `Crew assigned to ambulance ${ambulanceId}`,
      priority: "normal",
      recipients: ["ambulance"],
      ambulanceId,
      payload: crewData,
    });
  }

  async getUserNotifications(userId, limit = 50) {
    return Notification.find({ userId }).sort({ timestamp: -1 }).limit(limit);
  }

  async markAsRead(notificationId, userId) {
    const updated = await Notification.updateOne(
      { _id: notificationId, userId },
      { $set: { isRead: true, readAt: new Date() } },
    );
    return updated.modifiedCount > 0;
  }

  async getUnreadCount(userId) {
    return Notification.countDocuments({ userId, isRead: false });
  }
}

export default AmbulanceNotificationService;
