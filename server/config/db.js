const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/national_scholarship_details';
    const isAtlas = uri.includes('mongodb+srv://') || uri.includes('mongodb.net');

    console.log(`Connecting to ${isAtlas ? 'MongoDB Atlas Cloud' : 'Local MongoDB'}...`);

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000,
    });

    console.log(`✓ MongoDB Connected: ${conn.connection.host} (${conn.connection.name})`);
  } catch (error) {
    console.error(`MongoDB Connection Error (${process.env.MONGO_URI ? 'Primary' : 'Default'}): ${error.message}`);
    
    // Automatic fallback to local MongoDB if Atlas Cloud fails or times out
    const localUri = 'mongodb://127.0.0.1:27017/national_scholarship_details';
    if (process.env.MONGO_URI && process.env.MONGO_URI !== localUri) {
      console.log(`⚡ Attempting automatic fallback to Local MongoDB (${localUri})...`);
      try {
        const localConn = await mongoose.connect(localUri, {
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000,
        });
        console.log(`✓ Fallback Successful! Connected to Local MongoDB: ${localConn.connection.host} (${localConn.connection.name})`);
        return;
      } catch (fallbackErr) {
        console.error(`Local MongoDB Fallback also failed: ${fallbackErr.message}`);
      }
    }

    if (error.message.includes('bad auth') || error.message.includes('Authentication failed')) {
      console.error('Hint: Check your MongoDB Atlas database username and password in server/.env.');
    } else if (error.message.includes('querySrv') || error.message.includes('ENOTFOUND') || error.message.includes('timed out')) {
      console.error('Hint: Check your Internet connection and verify your IP is whitelisted (e.g. 0.0.0.0/0) in MongoDB Atlas Network Access.');
    }
  }
};

module.exports = connectDB;

