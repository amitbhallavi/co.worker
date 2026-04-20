import dotenv from "dotenv"
dotenv.config()

import mongoose from "mongoose"

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI
        
        if (!mongoURI) {
            throw new Error("MONGO_URI is not defined in .env file")
        }

        const connect = await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 10000,     // 10 seconds
            socketTimeoutMS: 45000,              // 45 seconds
            retryWrites: true,
            w: 'majority',
            connectTimeoutMS: 10000,
            family: 4,                           // Use IPv4 (fixes DNS timeout issues)
        })
        
        console.log(`MongoDB Connected: ${connect.connection.name}`.bgGreen.black)
    } catch (error) {
        console.error(`MongoDB Failed: ${error.message}`.bgRed.black)
        console.error("Troubleshooting tips:")
        console.error("1. Check your internet connection")
        console.error("2. Verify MONGO_URI in .env file")
        console.error("3. Check MongoDB Atlas IP whitelist (allow 0.0.0.0/0 for development)")
        console.error("4. Ensure credentials are correct (no special characters need encoding)")
        console.error("5. Try using connection string with retryWrites=true")
        process.exit(1)
    }
}

export default connectDB