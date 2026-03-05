import express from 'express';
import * as emergencyController from '../controllers/emergencycontroller.js';

const router = express.Router();

router.post('/', emergencyController.createEmergency);
router.get('/', emergencyController.getAllEmergencies);
router.get('/pending', emergencyController.getPendingEmergencies);
router.get('/:id', emergencyController.getEmergencyById);
router.put('/:id', emergencyController.updateEmergency);
router.delete('/:id', emergencyController.deleteEmergency);
export default router;