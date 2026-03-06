// controllers/integration.controller.js - External Service Integration
const axios = require('axios');
const Hospital = require('../models/Hospital.model');
const IncomingAlert = require('../models/IncomingAlert.model');

/**
 * Integration with Ambulance Service
 */
class AmbulanceIntegration {
  constructor() {
    this.baseURL = process.env.AMBULANCE_SERVICE_URL || 'http://localhost:5001/api';
  }

  /**
   * Send hospital confirmation to ambulance
   */
  async sendHospitalConfirmation(ambulanceId, hospitalId, roomAssigned, status) {
    try {
      const response = await axios.put(
        `${this.baseURL}/ambulances/${ambulanceId}/hospital-confirmation`,
        {
          hospitalId,
          hospitalReady: true,
          roomAssigned,
          status,
          timestamp: new Date()
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.SERVICE_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error sending confirmation to ambulance:', error.message);
      throw error;
    }
  }

  /**
   * Get ambulance real-time location
   */
  async getAmbulanceLocation(ambulanceId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/ambulances/${ambulanceId}/location`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.SERVICE_API_KEY}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error getting ambulance location:', error.message);
      return null;
    }
  }
}

/**
 * Integration with Dispatcher Service
 */
class DispatcherIntegration {
  constructor() {
    this.baseURL = process.env.DISPATCHER_SERVICE_URL || 'http://localhost:5002/api';
  }

  /**
   * Send real-time hospital capacity to dispatcher
   */
  async updateHospitalCapacity(hospitalId, capacityData) {
    try {
      const response = await axios.put(
        `${this.baseURL}/hospitals/${hospitalId}/capacity`,
        {
          hospitalId,
          totalBeds: capacityData.totalBeds,
          availableBeds: capacityData.availableBeds,
          status: capacityData.status,
          departments: capacityData.departments,
          timestamp: new Date()
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.SERVICE_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error updating capacity with dispatcher:', error.message);
      throw error;
    }
  }

  /**
   * Notify dispatcher of critical status (full ER, blood shortage, etc.)
   */
  async notifyCriticalStatus(hospitalId, alertType, message) {
    try {
      const response = await axios.post(
        `${this.baseURL}/alerts/critical`,
        {
          hospitalId,
          alertType, // 'er_full', 'blood_critical', 'equipment_shortage'
          message,
          severity: 'critical',
          timestamp: new Date()
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.SERVICE_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error notifying dispatcher:', error.message);
      throw error;
    }
  }

  /**
   * Request ambulance dispatch for referral
   */
  async requestAmbulanceForReferral(referralData) {
    try {
      const response = await axios.post(
        `${this.baseURL}/dispatch/referral-transport`,
        referralData,
        {
          headers: {
            'Authorization': `Bearer ${process.env.SERVICE_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error requesting ambulance:', error.message);
      throw error;
    }
  }
}

/**
 * Integration with Admin Service
 */
class AdminIntegration {
  constructor() {
    this.baseURL = process.env.ADMIN_SERVICE_URL || 'http://localhost:5003/api';
  }

  /**
   * Verify hospital registration with admin
   */
  async verifyHospitalRegistration(hospitalId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/hospitals/${hospitalId}/verify`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.SERVICE_API_KEY}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error verifying hospital:', error.message);
      return { verified: false };
    }
  }

  /**
   * Send analytics data to admin dashboard
   */
  async sendAnalytics(hospitalId, analyticsData) {
    try {
      const response = await axios.post(
        `${this.baseURL}/analytics/hospital/${hospitalId}`,
        analyticsData,
        {
          headers: {
            'Authorization': `Bearer ${process.env.SERVICE_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error sending analytics:', error.message);
      throw error;
    }
  }

  /**
   * Report system issue to admin
   */
  async reportSystemIssue(hospitalId, issueData) {
    try {
      const response = await axios.post(
        `${this.baseURL}/system/issues`,
        {
          hospitalId,
          ...issueData,
          timestamp: new Date()
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.SERVICE_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error reporting issue:', error.message);
      throw error;
    }
  }
}

/**
 * Integration with Notification Service
 */
class NotificationIntegration {
  constructor() {
    this.baseURL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:5004/api';
  }

  /**
   * Send notification to hospital staff
   */
  async notifyStaff(staffIds, notificationData) {
    try {
      const response = await axios.post(
        `${this.baseURL}/notifications/send`,
        {
          recipients: staffIds,
          ...notificationData,
          timestamp: new Date()
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.SERVICE_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error sending notification:', error.message);
      throw error;
    }
  }

  /**
   * Send SMS alert
   */
  async sendSMS(phoneNumber, message) {
    try {
      const response = await axios.post(
        `${this.baseURL}/sms/send`,
        {
          to: phoneNumber,
          message,
          timestamp: new Date()
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.SERVICE_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error sending SMS:', error.message);
      throw error;
    }
  }
}

// Export instances
module.exports = {
  ambulanceService: new AmbulanceIntegration(),
  dispatcherService: new DispatcherIntegration(),
  adminService: new AdminIntegration(),
  notificationService: new NotificationIntegration()
};