const { ethers } = require('ethers');
const { provider, contract } = require('../config/blockchain');
const Student = require('../models/Student'); 
const University = require('../models/University'); 
const UniversityRequest = require('../models/UniversityRequest');
const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();

// 1. Request Access API (Partner With Us)
const requestAccess = async (req, res) => {
    try {
        const { institutionName, officialEmail, registrationNo, contactPerson, walletAddress } = req.body; 

        if (!institutionName || !officialEmail || !registrationNo || !contactPerson || !walletAddress) {
            return res.status(400).json({ success: false, message: "Sari fields (including wallet) zaroori hain!" });
        }

        const existingRequest = await UniversityRequest.findOne({ officialEmail });
        if (existingRequest) {
            return res.status(400).json({ success: false, message: "Is email se already request bheji ja chuki hai." });
        }

        const newRequest = new UniversityRequest({
            institutionName,
            officialEmail,
            registrationNo,
            contactPerson,
            walletAddress 
        });

        await newRequest.save();

        res.status(201).json({
            success: true,
            message: "Request submitted successfully! Admin will review it."
        });

    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// 2. University Login API
const loginUniversity = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required" });
        }

        const university = await University.findOne({ email });

        if (!university || university.password !== password) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        res.status(200).json({
            success: true,
            message: "University Login Successful!",
            data: {
                universityName: university.universityName,
                email: university.email,
                walletAddress: university.walletAddress
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// 3. Issue Certificate API (Single Issue via PDF) - UPDATED!
const issueCertificate = async (req, res) => {
    try {
        // studentEmail is completely removed. We auto-generate it now.
        const { studentName, regNumber, program, cgpa, universityName } = req.body; 
        const file = req.file; 

        if (!studentName || !regNumber || !program || !cgpa || !universityName || !file) {
            return res.status(400).json({ success: false, message: "Sari fields aur PDF file zaroori hai!" });
        }

        const formData = new FormData();
        formData.append('file', file.buffer, {
            filename: file.originalname,
            contentType: file.mimetype,
        });

        const pinataResponse = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
            headers: {
                'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
                'Authorization': `Bearer ${process.env.PINATA_JWT}` 
            }
        });

        const ipfsHash = pinataResponse.data.IpfsHash; 
        const uniWallet = new ethers.Wallet(process.env.UNIVERSITY_PRIVATE_KEY, provider);
        const uniConnectedContract = contract.connect(uniWallet);

        const tx = await uniConnectedContract.issueCertificate(ipfsHash);
        const receipt = await tx.wait();

        // 🟢 AUTO GENERATE EMAIL & PASSWORD 🟢
        const generatedPassword = Math.random().toString(36).slice(-8);
        const generatedEmail = `${regNumber.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}@student.com`;

        const newStudent = new Student({
            studentName: studentName,
            email: generatedEmail, 
            regNumber: regNumber,
            program: program, 
            cgpa: cgpa,
            universityName: universityName,
            password: generatedPassword, 
            certificateIpfsHash: ipfsHash,
            transactionHash: receipt.hash,
            blockNumber: receipt.blockNumber.toString(),
            issuerWallet: uniWallet.address 
        });

        await newStudent.save();

        res.status(200).json({
            success: true,
            message: "Certificate successfully issued on blockchain AND saved in DB!",
            transactionHash: receipt.hash,
            studentInfo: { 
                studentName, 
                regNumber, 
                program, 
                cgpa, 
                universityName, 
                ipfsHash, 
                loginEmail: generatedEmail,     // Flutter app ko email wapas bhej rahe hain
                loginPassword: generatedPassword // Flutter app ko password wapas bhej rahe hain
            }
        });

    } catch (error) {
        console.error("Error issuing certificate:", error);
        res.status(500).json({ success: false, message: "Failed to issue certificate", error: error.message });
    }
};

// 4. Bulk Issuance API (Option A - JSON Hashing)
const bulkIssueCertificate = async (req, res) => {
    try {
        const { studentsData, universityName } = req.body; 
        
        if (!studentsData || !Array.isArray(studentsData) || studentsData.length === 0) {
            return res.status(400).json({ success: false, message: "Invalid or empty student data array" });
        }

        const uniWallet = new ethers.Wallet(process.env.UNIVERSITY_PRIVATE_KEY, provider);
        const uniConnectedContract = contract.connect(uniWallet);

        const issuedRecords = [];

        // Loop chal raha hai har student ke data par
        for (let i = 0; i < studentsData.length; i++) {
            const student = studentsData[i];

            // 1. JSON Data banayen (PDF ki jagah yeh use hoga)
            const jsonData = {
                FullName: student.fullName,
                RegistrationNumber: student.regNumber,
                Degree: student.degree,
                CGPA: student.cgpa,
                GraduationYear: student.graduationYear,
                IssuedBy: universityName,
                IssuedAt: new Date().toISOString()
            };

            console.log(`Processing ${student.fullName}...`);

            // 2. JSON ko Pinata (IPFS) par upload karein
            const pinataResponse = await axios.post('https://api.pinata.cloud/pinning/pinJSONToIPFS', jsonData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.PINATA_JWT}`
                }
            });
            const ipfsHash = pinataResponse.data.IpfsHash;

            // 3. Blockchain par Hash save karein
            const tx = await uniConnectedContract.issueCertificate(ipfsHash);
            const receipt = await tx.wait();

            // 4. Database mein save karein (Auto Email & Password)
            const generatedPassword = Math.random().toString(36).slice(-8);
            // Email auto generate ki (e.g., fa22bse001@student.com)
            const generatedEmail = `${student.regNumber.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}@student.com`; 

            const newStudent = new Student({
                studentName: student.fullName,
                email: generatedEmail, 
                regNumber: student.regNumber,
                program: student.degree,
                cgpa: student.cgpa,
                universityName: universityName,
                password: generatedPassword,
                certificateIpfsHash: ipfsHash,
                transactionHash: receipt.hash,
                blockNumber: receipt.blockNumber.toString(),
                issuerWallet: uniWallet.address
            });

            await newStudent.save();

            // Result array mein daal dein
            issuedRecords.push({
                name: student.fullName,
                regNumber: student.regNumber,
                ipfsHash: ipfsHash,
                transactionHash: receipt.hash,
                loginEmail: generatedEmail,
                loginPassword: generatedPassword
            });
        }

        res.status(200).json({
            success: true,
            message: `Successfully issued ${issuedRecords.length} certificates in bulk!`,
            data: issuedRecords
        });

    } catch (error) {
        console.error("Bulk issuance error:", error);
        res.status(500).json({ success: false, message: "Bulk issuance failed", error: error.message });
    }
};

// 5. Get Dashboard Stats API
const getDashboardStats = async (req, res) => {
    try {
        const { universityName } = req.query; 

        if (!universityName) {
            return res.status(400).json({ success: false, message: "University name is required as query parameter" });
        }

        const totalIssued = await Student.countDocuments({ universityName: universityName });

        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        
        const thisMonthIssued = await Student.countDocuments({
            universityName: universityName,
            issuedAt: { $gte: startOfMonth }
        });

        const recentCertificates = await Student.find({ universityName: universityName })
            .sort({ issuedAt: -1 }) 
            .limit(10) 
            .select('studentName regNumber program email password issuedAt transactionHash certificateIpfsHash'); 

        res.status(200).json({
            success: true,
            data: {
                totalIssued: totalIssued,
                thisMonthIssued: thisMonthIssued,
                recentCertificates: recentCertificates
            }
        });

    } catch (error) {
        console.error("Error fetching stats:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

module.exports = { requestAccess, loginUniversity, issueCertificate, bulkIssueCertificate, getDashboardStats };