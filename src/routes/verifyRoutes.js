const express = require('express');
const router = express.Router();
const { verifyCertificate } = require('../controllers/verifyController');

// GET request: Employer jab IPFS hash URL mein bhejay ga toh verification hogi
// Example: /api/verify/QmTestHash123456789abcdef
router.get('/:ipfsHash', verifyCertificate);

module.exports = router;