const mongoose = require('mongoose');

const universitySchema = new mongoose.Schema({
    universityName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    walletAddress: {
        type: String,
        required: true
    },
    isActive: { // 👈 NAYA IZAFA: Kill switch ke liye
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('University', universitySchema);