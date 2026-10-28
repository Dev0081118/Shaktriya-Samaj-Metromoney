import mongoose from 'mongoose';

let listenersAttached = false;

function attachConnectionListeners() {
  if (listenersAttached) return;
  listenersAttached = true;

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB disconnected. Mongoose will attempt automatic reconnection...');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('✅ MongoDB reconnected successfully.');
  });

  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err.message);
  });
}

export const connectDatabase = (uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/kshatriya_matrimonial') => {
  attachConnectionListeners();
  return mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
    family: 4
  });
};

export const disconnectDatabase = async () => {
  if (mongoose.connection && mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
};
