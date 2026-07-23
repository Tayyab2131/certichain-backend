require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Initialize the Express application
const app = express();

// Database connect kar rahe hain
connectDB();

// --- Middlewares ---
app.use(cors());
app.use(express.json());

// --- Import Routes ---
const adminRoutes = require('./routes/adminRoutes');
const universityRoutes = require('./routes/universityRoutes');
const verifyRoutes = require('./routes/verifyRoutes');
const studentRoutes = require('./routes/studentRoutes'); // 👈 NAYI LINE: Student routes import kiye

// --- Register Routes ---
app.use('/api/admin', adminRoutes);
app.use('/api/university', universityRoutes);
app.use('/api/verify', verifyRoutes);
app.use('/api/student', studentRoutes); // 👈 NAYI LINE: Student API register ki

// --- API Routes ---
app.get('/test', (req, res) => {
    res.json({
        success: true,
        message: "Hello from Node.js! Your backend is successfully running."
    });
});

// --- Start the Server ---
// 👇 Yahan PORT ko update kiya hai taake Render apna port khud set kar sake
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});