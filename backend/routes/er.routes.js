// routes/er.routes.js - ER Module Routes
const express = require('express');
const router = express.Router();

// Import controllers
const alertController = require('../controllers/alert.controller');
const bedController = require('../controllers/bed.controller');
const equipmentController = require('../controllers/equipment.controller');
const bloodBankController = require('../controllers/bloodBank.controller');
const referralController = require('../controllers/referral.controller');
const hospitalController = require('../controllers/hospital.controller');

// Import middleware (assuming you have auth middleware)
const { protect, authorize } = require('../middleware/auth');

// ============================================
// INCOMING ALERTS ROUTES
// ============================================

// Public endpoint - called by Ambulance Service
router.post('/alerts/incoming', alertController.receiveIncomingAlert);

// Protected endpoints
router.get('/alerts', protect, alertController.getAllAlerts);
router.get('/alerts/:alertId', protect, alertController.getAlert);
router.put('/alerts/:alertId/acknowledge', protect, authorize('er_coordinator', 'admin'), alertController.acknowledgeAlert);
router.put('/alerts/:alertId/assign-room', protect, authorize('er_coordinator', 'admin'), alertController.assignRoom);
router.put('/alerts/:alertId/notify-team', protect, authorize('er_coordinator', 'admin'), alertController.notifyTeam);
router.put('/alerts/:alertId/arrived', protect, alertController.markArrived);
router.put('/alerts/:alertId/cancel', protect, alertController.cancelAlert);

// ============================================
// BED MANAGEMENT ROUTES
// ============================================

router.get('/beds/availability', protect, bedController.getBedAvailability);
router.get('/beds/departments', protect, bedController.getBedsByDepartment);
router.get('/beds', protect, bedController.getAllBeds);
router.put('/beds/:bedId/status', protect, authorize('er_coordinator', 'nurse', 'admin'), bedController.updateBedStatus);
router.put('/beds/:bedId/assign', protect, authorize('er_coordinator', 'nurse', 'admin'), bedController.assignPatientToBed);
router.put('/beds/:bedId/release', protect, authorize('er_coordinator', 'nurse', 'admin'), bedController.releaseBed);

// ============================================
// EQUIPMENT ROUTES
// ============================================

router.get('/equipment', protect, equipmentController.getAllEquipment);
router.get('/equipment/:equipmentId', protect, equipmentController.getEquipment);
router.put('/equipment/:equipmentId', protect, authorize('er_coordinator', 'admin'), equipmentController.updateEquipment);
router.post('/equipment', protect, authorize('admin'), equipmentController.createEquipment);

// ============================================
// BLOOD BANK ROUTES
// ============================================

router.get('/blood-bank', protect, bloodBankController.getBloodInventory);
router.get('/blood-bank/:bloodType', protect, bloodBankController.getBloodType);
router.put('/blood-bank/:bloodType/update', protect, authorize('er_coordinator', 'admin'), bloodBankController.updateBloodInventory);
router.post('/blood-bank/request', protect, bloodBankController.requestBlood);

// ============================================
// REFERRAL ROUTES
// ============================================

router.get('/referrals', protect, referralController.getReferrals);
router.get('/referrals/:referralId', protect, referralController.getReferral);
router.post('/referrals', protect, authorize('er_coordinator', 'doctor', 'admin'), referralController.createReferral);
router.put('/referrals/:referralId/accept', protect, authorize('er_coordinator', 'admin'), referralController.acceptReferral);
router.put('/referrals/:referralId/decline', protect, authorize('er_coordinator', 'admin'), referralController.declineReferral);
router.put('/referrals/:referralId/complete', protect, referralController.completeReferral);

// ============================================
// HOSPITAL CAPACITY ROUTES (for Dispatcher)
// ============================================

router.get('/hospital/capacity', protect, hospitalController.getCapacity);
router.put('/hospital/capacity/update', protect, authorize('admin', 'er_coordinator'), hospitalController.updateCapacity);

module.exports = router;