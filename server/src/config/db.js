import mongoose from 'mongoose';

let isConnected = false;

export const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/agriculture_advisor';

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 4000, // Timeout after 4s instead of hanging
    });

    isConnected = true;
    console.log(`[Database] MongoDB Connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    isConnected = false;
    console.warn(`[Database Warning] Unable to connect to MongoDB at ${mongoURI}.`);
    console.warn(`[Database Details] ${error.message}`);
    console.warn(`[Notice] Set a valid MONGO_URI in 'server/.env' (e.g. MongoDB Atlas connection string or start local MongoDB). The server will continue running.`);
    return null;
  }
};

export const getDBStatus = () => {
  return {
    isConnected: mongoose.connection.readyState === 1,
    readyState: mongoose.connection.readyState,
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    stateDescription: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] || 'unknown'
  };
};
