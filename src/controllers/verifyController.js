const { contract } = require('../config/blockchain');
const Student = require('../models/Student');

const verifyCertificate = async (req, res) => {
    try {
        // IPFS Hash URL parameter se aayega (e.g., /api/verify/QmTestHash...)
        const { ipfsHash } = req.params;

        if (!ipfsHash) {
            return res.status(400).json({ success: false, message: "IPFS Hash is required" });
        }

        console.log(`Verifying certificate with hash: ${ipfsHash}...`);

        // Blockchain par verifyCertificate function call kar rahe hain
        const result = await contract.verifyCertificate(ipfsHash);

        const isValid = result[0];
        const issuerAddress = result[1];
        
        // Blockchain time seconds mein deta hai, Javascript milliseconds mein leti hai
        const issuanceDate = new Date(Number(result[2]) * 1000);

        if (isValid) {
            // Blockchain se verify hone ke baad, hum DB se student ka naam aur details nikal rahe hain
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
            res.status(404).json({
                success: false,
                message: "❌ Certificate not found or is invalid."
            });
        }

    } catch (error) {
        console.error("Error verifying certificate:", error);
        res.status(500).json({
            success: false,
            message: "Failed to verify certificate",
            error: error.message
        });
    }
};

module.exports = { verifyCertificate };