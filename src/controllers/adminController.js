const { contract } = require('../config/blockchain');
const University = require('../models/University'); 
const UniversityRequest = require('../models/UniversityRequest');
const Student = require('../models/Student'); // Stats ke liye import kiya

// 1. Admin Login API
const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            res.status(200).json({ success: true, message: "Admin Login Successful!" });
        } else {
            res.status(401).json({ success: false, message: "Invalid Admin Email or Password" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// 2. Get Dashboard Stats API (Naya)
const getDashboardStats = async (req, res) => {
    try {
        const totalDegrees = await Student.countDocuments();
        const whitelistedUnis = await University.countDocuments(); // 👇 Pura count
        const activeNodes = await University.countDocuments({ isActive: true }); // 👇 Sirf Active count
        
        // Feed ke liye latest 5 students utha rahe hain
        const recentActivity = await Student.find().sort({ issuedAt: -1 }).limit(5).select('universityName issuedAt');
        
        const mappedFeed = recentActivity.map(cert => ({
            universityName: cert.universityName,
            action: "Issued a verified digital certificate.",
            date: cert.issuedAt
        }));

        res.status(200).json({
            success: true,
            data: {
                totalDegrees: totalDegrees,
                whitelistedUnis: whitelistedUnis,
                activeNodes: activeNodes, // 👇 NAYA: Active nodes ki tadad frontend ko bhej rahe hain
                recentActivity: mappedFeed
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching stats", error: error.message });
    }
};

// 3. Pending Requests API
const getPendingRequests = async (req, res) => {
    try {
        const requests = await UniversityRequest.find({ status: 'Pending' });
        res.status(200).json({ success: true, data: requests });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// 4. Active Universities API (Naya)
const getActiveUniversities = async (req, res) => {
    try {
        const unis = await University.find({}).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: unis });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// 5. Approve Request API
const approveRequest = async (req, res) => {
    try {
        const { requestId } = req.body;
        if (!requestId) return res.status(400).json({ success: false, message: "Request ID zaroori hai!" });

        const request = await UniversityRequest.findById(requestId);
        if (!request || request.status !== 'Pending') {
            return res.status(404).json({ success: false, message: "Pending request nahi mili." });
        }

        const walletAddress = request.walletAddress; 
        const tx = await contract.authorizeUniversity(walletAddress.trim());
        const receipt = await tx.wait();

        const generatedPassword = Math.random().toString(36).slice(-8); 
        const newUniversity = new University({
            universityName: request.institutionName,
            email: request.officialEmail,
            password: generatedPassword, 
            walletAddress: walletAddress.trim(),
            isActive: true
        });
        await newUniversity.save();

        request.status = 'Approved';
        await request.save();

        res.status(200).json({ success: true, message: "University Approved!", transactionHash: receipt.hash, generatedPassword });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to approve", error: error.message });
    }
};

// 6. Reject Request API (Naya)
const rejectRequest = async (req, res) => {
    try {
        const { requestId } = req.body;
        await UniversityRequest.findByIdAndDelete(requestId);
        res.status(200).json({ success: true, message: "Request rejected and deleted." });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error rejecting", error: error.message });
    }
};

// 7. Manual Add University (Naya)
const manualAddUniversity = async (req, res) => {
    try {
        const { name, wallet } = req.body;
        
        // Direct blockchain pe authorize karein
        const tx = await contract.authorizeUniversity(wallet.trim());
        await tx.wait();

        const generatedPassword = Math.random().toString(36).slice(-8);
        const generatedEmail = name.toLowerCase().replace(/\s/g, '') + "@hec.edu.pk"; // Fake email for manual entry

        const newUni = new University({
            universityName: name,
            email: generatedEmail,
            password: generatedPassword,
            walletAddress: wallet.trim(),
            isActive: true
        });
        await newUni.save();

        res.status(200).json({ success: true, message: "Added manually", generatedPassword });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed", error: error.message });
    }
};

// 8. Toggle Kill Switch (Naya)
const toggleStatus = async (req, res) => {
    try {
        const { universityId, isActive } = req.body;
        await University.findByIdAndUpdate(universityId, { isActive: isActive });
        res.status(200).json({ success: true, message: "Status updated" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error toggling status", error: error.message });
    }
};

module.exports = { 
    loginAdmin, 
    getDashboardStats, 
    getPendingRequests, 
    getActiveUniversities, 
    approveRequest, 
    rejectRequest, 
    manualAddUniversity, 
    toggleStatus 
};