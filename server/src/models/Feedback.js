import mongoose from 'mongoose'

const feedbackSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A user is required'],
      index: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'A category is required'],
      index: true,
    },
    rating: {
      type: Number,
      required: [true, 'A rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    comment: {
      type: String,
      required: [true, 'A comment is required'],
      trim: true,
      maxlength: [2000, 'Comment cannot exceed 2000 characters'],
    },
    suggestion: {
      type: String,
      trim: true,
      maxlength: [2000, 'Suggestion cannot exceed 2000 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: ['new', 'reviewed', 'resolved'],
      default: 'new',
    },
  },
  {
    timestamps: true,
  },
)

feedbackSchema.index({ userId: 1, createdAt: -1 })

const Feedback = mongoose.model('Feedback', feedbackSchema)

export default Feedback
