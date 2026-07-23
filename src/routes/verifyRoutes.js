const express = require('express');
const router = express.Router();
const { verifyCertificate, verifyCertificatePDF } = require('../controllers/verifyController');
const upload = require('../middlewares/uploadMiddleware'); // 👈 File upload karne ka middleware

// POST request: Jab PDF upload hogi toh ye hit hoga
router.post('/verify-pdf', upload.single('certificatePDF'), verifyCertificatePDF);

// GET request: Jab IPFS hash (QR code) aayega toh ye hit hoga
router.get('/:ipfsHash', verifyCertificate);

module.exports = router;