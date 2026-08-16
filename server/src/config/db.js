import mongoose from 'mongoose'

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/feedback-management-system'
  const conn = await mongoose.connect(uri)
  return conn
}

export default connectDB
