import express from "express";
import CrewAssignment from "../models/CrewAssignment.js";

const router = express.Router();

router.post("/api/crew/assign", async (req, res) => {
  try {
    const assignment = await CrewAssignment.create(req.body);

    if (global.ambulanceNotificationService) {
      await global.ambulanceNotificationService.notifyCrewAssignment(
        assignment.ambulanceId,
        assignment.toJSON(),
      );
    }

    return res.status(201).json(assignment);
  } catch (error) {
    return res.status(500).json({ message: "Failed to assign crew", error: error.message });
  }
});

router.get("/api/crew/ambulance/:ambulanceId", async (req, res) => {
  try {
    const crew = await CrewAssignment.findAll({
      where: { ambulanceId: req.params.ambulanceId },
      order: [["assignedAt", "DESC"]],
    });
    return res.json(crew);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch crew assignments", error: error.message });
  }
});

router.put("/api/crew/:userId/status", async (req, res) => {
  try {
    const latestAssignment = await CrewAssignment.findOne({
      where: { userId: req.params.userId },
      order: [["assignedAt", "DESC"]],
    });

    if (!latestAssignment) {
      return res.status(404).json({ message: "Crew assignment not found" });
    }

    await latestAssignment.update({ status: req.body.status });
    return res.json(latestAssignment);
  } catch (error) {
    return res.status(500).json({ message: "Failed to update crew status", error: error.message });
  }
});

export default router;
