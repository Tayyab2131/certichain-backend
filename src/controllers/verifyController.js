const { contract } = require('../config/blockchain');
const Student = require('../models/Student');
const Hash = require('ipfs-only-hash'); // 👈 Naya package IPFS hash nikalne ke liye

// 1. Existing: Verify by Hash String (QR Code)
const verifyCertificate = async (req, res) => {
    try {
        const { ipfsHash } = req.params;

        if (!ipfsHash) {
            return res.status(400).json({ success: false, message: "IPFS Hash is required" });
        }

        console.log(`Verifying certificate with hash: ${ipfsHash}...`);

        const result = await contract.verifyCertificate(ipfsHash);
        const isValid = result[0];
        const issuerAddress = result[1];
        const issuanceDate = new Date(Number(result[2]) * 1000);

        if (isValid) {
            const student = await Student.findOne({ certificateIpfsHash: ipfsHash });
            res.status(200).json({
                success: true,
                message: "✅ Certificate is Valid and Authentic!",
                data: {
                    studentName: student ? student.studentName : "Verified Graduate",
                    universityName: student ? student.universityName : "Authorized Institution",
                    program: student ? student.program : "Degree Program",
                    issuerAddress: issuerAddress,
                    issuanceDate: issuanceDate,
                    ipfsHash: ipfsHash
                }
            });
        } else {
            res.status(404).json({ success: false, message: "❌ Certificate not found or is invalid." });
        }

    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to verify", error: error.message });
    }
};

// 2. NEW: Verify by Direct PDF Upload (For Tampering Demo)
const verifyCertificatePDF = async (req, res) => {
    try {
        const file = req.file;

        if (!file) {
            return res.status(400).json({ success: false, message: "Please upload a PDF document." });
        }

        console.log(`Calculating IPFS Hash locally for uploaded document...`);

        // 👇 Yahan magic ho raha hai! Cloud par upload kiye baghair Hash nikal rahe hain
        const calculatedIpfsHash = await Hash.of(file.buffer);
        console.log(`Calculated Hash: ${calculatedIpfsHash}`);

        // Ab blockchain se check karein ke yeh hash mojood hai ya nahi
        const result = await contract.verifyCertificate(calculatedIpfsHash);
        const isValid = result[0];
        const issuerAddress = result[1];
        const issuanceDate = new Date(Number(result[2]) * 1000);

        if (isValid) {
            const student = await Student.findOne({ certificateIpfsHash: calculatedIpfsHash });
            res.status(200).json({
                success: true,
                message: "✅ Certificate is Valid and Authentic!",
                data: {
                    studentName: student ? student.studentName : "Verified Graduate",
                    universityName: student ? student.universityName : "Authorized Institution",
                    program: student ? student.program : "Degree Program",
                    issuerAddress: issuerAddress,
                    issuanceDate: issuanceDate,
                    ipfsHash: calculatedIpfsHash
                }
            });
        } else {
            // Agar hash blockchain par na mile (Yani document tampered hai)
            res.status(404).json({
                success: false,
                message: "❌ Verification Failed! Document is tampered or fake.",
                calculatedHash: calculatedIpfsHash // Flutter app ko hash bhej rahe hain dikhane ke liye
            });
        }

    } catch (error) {
        console.error("Error verifying PDF:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

module.exports = { verifyCertificate, verifyCertificatePDF };