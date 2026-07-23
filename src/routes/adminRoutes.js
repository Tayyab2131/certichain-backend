const express = require('express');
const router = express.Router();
const { 
    loginAdmin, 
    getDashboardStats, 
    getPendingRequests, 
    getActiveUniversities, 
    approveRequest, 
    rejectRequest, 
    manualAddUniversity, 
    toggleStatus 
} = require('../controllers/adminController'); 

// Admin Routes
router.post('/login', loginAdmin);
router.get('/dashboard-stats', getDashboardStats);
router.get('/pending-requests', getPendingRequests);
router.get('/active-universities', getActiveUniversities);
router.post('/approve-request', approveRequest);
router.post('/reject-request', rejectRequest);
router.post('/manual-add', manualAddUniversity);
router.post('/toggle-status', toggleStatus);

module.exports = router;