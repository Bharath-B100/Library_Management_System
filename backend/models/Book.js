const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Book title is required'],
      trim: true,
    },
    author: {
      type: String,
      required: [true, 'Author is required'],
      trim: true,
    },
    isbn: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Fiction',
        'Non-Fiction',
        'Science',
        'Technology',
        'History',
        'Biography',
        'Self-Help',
        'Mystery',
        'Romance',
        'Fantasy',
        'Horror',
        'Children',
        'Academic',
        'Other',
      ],
      default: 'Other',
    },
    description: {
      type: String,
      default: '',
    },
    coverImage: {
      type: String,
      default: '',
    },
    // PDF stored as binary in MongoDB — excluded from list queries via select:false
    pdfData: {
      type: Buffer,
      select: false,
    },
    pdfMimeType: {
      type: String,
      default: 'application/pdf',
    },
    hasPdf: {
      type: Boolean,
      default: false,
    },
    totalCopies: {
      type: Number,
      required: [true, 'Total copies is required'],
      min: [1, 'Must have at least 1 copy'],
      default: 1,
    },
    availableCopies: {
      type: Number,
      default: 1,
    },
    publisher: {
      type: String,
      default: '',
    },
    publishedYear: {
      type: Number,
      default: null,
    },
    language: {
      type: String,
      default: 'English',
    },
  },
  { timestamps: true }
);

// Ensure availableCopies defaults to totalCopies on creation
bookSchema.pre('save', function () {
  if (this.isNew) {
    this.availableCopies = this.totalCopies;
  }
});

module.exports = mongoose.model('Book', bookSchema);
