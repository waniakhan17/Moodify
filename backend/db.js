const mongoose = require("mongoose");

const connectDB = async () => {
  // Read the MongoDB URI from environment variables
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    console.error("Error: MONGO_URI is not defined. Set it in your environment variables.");
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(mongoURI); // options optional in Mongoose 6+
    console.log(`MongoDB connected successfully: ${conn.connection.host}`);
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1); // exit process with failure
  }
};

module.exports = connectDB;
