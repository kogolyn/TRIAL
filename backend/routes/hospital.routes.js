import express from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  acceptIncomingReferral,
  cancelOutgoingReferral,
  createReferral,
  getReferrals,
  rejectIncomingReferral,
} from "../controllers/hospital/referral.controller.js";
import { getOverview } from "../controllers/hospital/overview.controller.js";
import { confirmRoom, getAlerts, pageTeam, reassignRoom } from "../controllers/hospital/alerts.controller.js";
import { getResources } from "../controllers/hospital/resources.controller.js";

const router = express.Router();

router.get("/referrals", requireAuth, getReferrals);
router.post("/referrals", requireAuth, createReferral);
router.patch("/referrals/:id/accept", requireAuth, acceptIncomingReferral);
router.patch("/referrals/:id/reject", requireAuth, rejectIncomingReferral);
router.delete("/referrals/:id/cancel", requireAuth, cancelOutgoingReferral);
router.get("/overview", requireAuth, getOverview);
router.get("/alerts", requireAuth, getAlerts);
router.patch("/alerts/:id/confirm-room", requireAuth, confirmRoom);
router.patch("/alerts/:id/reassign-room", requireAuth, reassignRoom);
router.patch("/alerts/:id/page-team", requireAuth, pageTeam);
router.get("/resources", requireAuth, getResources);

export default router;
