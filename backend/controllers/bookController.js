const Book = require('../models/Book');
const fs = require('fs');
const path = require('path');

// @desc   Get all books with search & filter
// @route  GET /api/books
// @access Public
const getBooks = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 12 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { isbn: { $regex: search, $options: 'i' } },
      ];
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    const total = await Book.countDocuments(query);
    const books = await Book.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      books,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Get single book
// @route  GET /api/books/:id
// @access Public
const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Add a new book
// @route  POST /api/books
// @access Admin
const addBook = async (req, res) => {
  try {
    const {
      title, author, isbn, category, description,
      totalCopies, publisher, publishedYear, language,
    } = req.body;

    const bookData = {
      title, author, isbn, category, description,
      totalCopies: parseInt(totalCopies) || 1,
      publisher, publishedYear: publishedYear ? parseInt(publishedYear) : null,
      language,
    };

    if (req.files) {
      if (req.files.coverImage) {
        bookData.coverImage = `/uploads/covers/${req.files.coverImage[0].filename}`;
      }
      if (req.files.pdfFile) {
        bookData.pdfFile = `/uploads/pdfs/${req.files.pdfFile[0].filename}`;
      }
    }

    const book = await Book.create(bookData);
    res.status(201).json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Update a book
// @route  PUT /api/books/:id
// @access Admin
const updateBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    const {
      title, author, isbn, category, description,
      totalCopies, publisher, publishedYear, language,
    } = req.body;

    // Handle file updates
    if (req.files) {
      if (req.files.coverImage) {
        // Delete old cover if exists
        if (book.coverImage) {
          const oldPath = path.join(__dirname, '..', book.coverImage);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        book.coverImage = `/uploads/covers/${req.files.coverImage[0].filename}`;
      }
      if (req.files.pdfFile) {
        if (book.pdfFile) {
          const oldPath = path.join(__dirname, '..', book.pdfFile);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        book.pdfFile = `/uploads/pdfs/${req.files.pdfFile[0].filename}`;
      }
    }

    book.title = title || book.title;
    book.author = author || book.author;
    book.isbn = isbn !== undefined ? isbn : book.isbn;
    book.category = category || book.category;
    book.description = description !== undefined ? description : book.description;
    book.publisher = publisher !== undefined ? publisher : book.publisher;
    book.publishedYear = publishedYear ? parseInt(publishedYear) : book.publishedYear;
    book.language = language || book.language;

    if (totalCopies !== undefined) {
      const diff = parseInt(totalCopies) - book.totalCopies;
      book.availableCopies = Math.max(0, book.availableCopies + diff);
      book.totalCopies = parseInt(totalCopies);
    }

    const updatedBook = await book.save();
    res.json(updatedBook);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Delete a book
// @route  DELETE /api/books/:id
// @access Admin
const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    // Clean up uploaded files
    if (book.coverImage) {
      const coverPath = path.join(__dirname, '..', book.coverImage);
      if (fs.existsSync(coverPath)) fs.unlinkSync(coverPath);
    }
    if (book.pdfFile) {
      const pdfPath = path.join(__dirname, '..', book.pdfFile);
      if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
    }

    await book.deleteOne();
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Get book categories stats
// @route  GET /api/books/categories
// @access Admin
const getCategoryStats = async (req, res) => {
  try {
    const stats = await Book.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getBooks, getBookById, addBook, updateBook, deleteBook, getCategoryStats };
