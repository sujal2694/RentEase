import mongoose from "mongoose";

export const connectDB = async () => {
    const connectionString = process.env.MONGODB_URL;
    if (!connectionString) {
        throw new Error("MONGODB_URL is required to connect the database");
    }
    await mongoose.connect(connectionString);
    console.log("DB connected");
};
