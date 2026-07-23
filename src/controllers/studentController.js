const Student = require('../models/Student');

const loginStudent = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and Password are required" });
        }

        console.log(`Login attempt for email: ${email}`);

        const student = await Student.findOne({ email: email });

        if (!student) {
            return res.status(404).json({ success: false, message: "No student found with this email." });
        }

        if (student.password !== password) {
            return res.status(401).json({ success: false, message: "Incorrect password." });
        }

        console.log(`Student ${student.studentName} logged in successfully!`);
        
        // 👇 Yahan se sara data Flutter App ko wapas jayega UI ke liye
        res.status(200).json({
            success: true,
            message: "Login Successful!",
            data: {
                studentName: student.studentName,
                email: student.email,
                regNumber: student.regNumber,
                program: student.program,
                cgpa: student.cgpa,
                universityName: student.universityName,
                issueDate: student.issuedAt,
                certificateIpfsHash: student.certificateIpfsHash,
                transactionHash: student.transactionHash,
                blockNumber: student.blockNumber,
                issuerWallet: student.issuerWallet,
                contractAddress: process.env.CONTRACT_ADDRESS // Smart Contract ka address env se bheja
            }
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            success: false,
            message: "Server error during login",
            error: error.message
        });
    }
};

module.exports = { loginStudent };