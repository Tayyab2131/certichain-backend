const mongoose = require('mongoose');

// This function will handle connecting to your MongoDB Atlas cluster
const connectDB = async () => {
    try {
        // We use process.env to keep the password hidden and secure
        const connectionString = process.env.MONGODB_URI;
        
        if (!connectionString) {
            console.error("Error: MONGODB_URI is not defined in the .env file.");
            process.exit(1);
        }

        const conn = await mongoose.connect(connectionString);
        
        console.log(`✅ MongoDB Connected successfully! Hosted at: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ Error connecting to MongoDB: ${error.message}`);
        // Exit process with failure
        process.exit(1); 
    }
};

module.exports = connectDB;