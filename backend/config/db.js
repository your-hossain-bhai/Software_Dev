const mongoose = require('mongoose');
const config = require('./env');

const connectDB = async () => {
  let uri = config.mongodbUri || process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not set. Create .env file with MONGODB_URI in backend folder.');
    process.exit(1);
  }

  const hasAtlasPlaceholders =
    uri.includes('USER') ||
    uri.includes('PASSWORD') ||
    uri.includes('cluster.mongodb.net');

  if (hasAtlasPlaceholders && config.nodeEnv !== 'production') {
    console.warn('MONGODB_URI appears to be a template URI. Falling back to local MongoDB for development.');
    uri = 'mongodb://127.0.0.1:27017/nextcareer';
  }

  try {
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    const isSrvLookupFailure =
      typeof error.message === 'string' &&
      (error.message.includes('querySrv ECONNREFUSED') || error.message.includes('querySrv ENOTFOUND'));

    const canFallbackToLocal =
      config.nodeEnv !== 'production' &&
      uri.startsWith('mongodb+srv://') &&
      isSrvLookupFailure;

    if (canFallbackToLocal) {
      const localUri = process.env.MONGODB_LOCAL_URI || 'mongodb://127.0.0.1:27017/nextcareer';
      console.warn('Atlas SRV DNS lookup failed in development. Trying local MongoDB instead...');

      try {
        const localConn = await mongoose.connect(localUri, { serverSelectionTimeoutMS: 10000 });
        console.log(`MongoDB Connected (local fallback): ${localConn.connection.host}`);
        return;
      } catch (localError) {
        console.error('MongoDB local fallback connection error:', localError.message);
      }
    }

    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
