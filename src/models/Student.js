const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    studentName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    regNumber: {  // 👈 NAYA IZAFA
        type: String,
        required: true
    },
    program: { 
        type: String,
        required: true
    },
    cgpa: {      // 👈 NAYA IZAFA
        type: String,
        required: true
    },
    universityName: { // 👈 NAYA IZAFA
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    certificateIpfsHash: {
        type: String,
        required: true
    },
    transactionHash: {
        type: String,
        required: true
    },
    blockNumber: { // 👈 NAYA IZAFA (Blockchain receipt se aayega)
        type: String,
        required: true
    },
    issuerWallet: { // 👈 NAYA IZAFA (University ka wallet address)
        type: String,
        required: true
    },
    issuedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Student', studentSchema);