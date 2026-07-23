const mongoose = require('mongoose');

const universityRequestSchema = new mongoose.Schema({
    institutionName: {
        type: String,
        required: true
    },
    officialEmail: {
        type: String,
        required: true,
        unique: true
    },
    registrationNo: {
        type: String,
        required: true
    },
    contactPerson: {
        type: String,
        required: true
    },
    walletAddress: { // 👈 Wallet Address yahan save hoga
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('UniversityRequest', universityRequestSchema);