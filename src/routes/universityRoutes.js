const express = require('express');
const router = express.Router();
const { requestAccess, loginUniversity, issueCertificate, bulkIssueCertificate, getDashboardStats } = require('../controllers/universityController'); 
const upload = require('../middlewares/uploadMiddleware'); 

// University Routes

// 1. Request Access (Partner With Us)
router.post('/request-access', requestAccess); 

// 2. Login
router.post('/login', loginUniversity); 

// 3. Issue Single Certificate (PDF upload required)
// NOTE: Email is no longer required in the form data.
router.post('/issue-certificate', upload.single('certificatePDF'), issueCertificate);

// 4. Bulk Issue Certificates (No PDF, sending JSON data)
router.post('/bulk-issue', bulkIssueCertificate);

// 5. Dashboard Stats (GET Request)
router.get('/dashboard-stats', getDashboardStats);

module.exports = router;