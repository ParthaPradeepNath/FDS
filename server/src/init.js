import 'dotenv/config'
import mongoose from 'mongoose'
import connectDB from './config/db.js'
import Category from './models/Category.js'

const init = async () => {
  try {
    await connectDB()

    await mongoose.connection.dropDatabase()
    console.log('Database reset complete')

    const categories = await Category.insertMany([
      { name: 'Service', description: 'Overall service quality and responsiveness' },
      { name: 'Faculty', description: 'Teaching quality, knowledge, and engagement' },
      { name: 'Product', description: 'Product quality, usability, and features' },
      { name: 'Support', description: 'Help desk, technical support, and assistance' },
      { name: 'Facilities', description: 'Physical spaces, equipment, and amenities' },
    ])

    console.log('Categories:', categories.map((c) => c.name).join(', '))

    await mongoose.disconnect()
    process.exit(0)
  } catch (error) {
    console.error('Init failed:', error)
    process.exit(1)
  }
}

init()
