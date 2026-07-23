const express = require('express');
const router = express.Router();
const { loginStudent } = require('../controllers/studentController');

// POST request: Student jab login karega
// Example URL: /api/student/login
router.post('/login', loginStudent);

module.exports = router;