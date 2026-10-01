import mongoose from 'mongoose';
export const connectDatabase = () =>
  mongoose.connect(
    process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/kshatriya_matrimonial'
  );
