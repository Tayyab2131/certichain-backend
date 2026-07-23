const multer = require('multer');

// Multer ko batayen ke file ko "Memory" mein rakhe (Hard disk par save karne ki bajaye)
// Taake hum direct isay Pinata (IPFS) par bhej sakein
const storage = multer.memoryStorage();

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // Maximum 5 MB ki PDF file allow hogi
    }
});

module.exports = upload;