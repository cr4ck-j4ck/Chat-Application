import mongoose from 'mongoose';


// Create a function to connect to MongoDB
export async function connectDB(MONGO_URI:string) {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1); // Exit process with failure
  }
}
