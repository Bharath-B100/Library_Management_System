const BorrowRecord = require('../models/BorrowRecord');
const Book = require('../models/Book');

const FINE_PER_DAY = parseInt(process.env.FINE_PER_DAY) || 5;
const BORROW_DAYS = parseInt(process.env.BORROW_DAYS) || 14;

// @desc   Borrow a book
// @route  POST /api/borrow
// @access Private (User)
const borrowBook = async (req, res) => {
  try {
    const { bookId } = req.body;
    const book = await Book.findById(bookId);

    if (!book) return res.status(404).json({ message: 'Book not found' });
    if (book.availableCopies <= 0) {
      return res.status(400).json({ message: 'No copies available at the moment' });
    }

    // Check if user already has this book borrowed
    const existingBorrow = await BorrowRecord.findOne({
      user: req.user._id,
      book: bookId,
      status: 'borrowed',
    });
    if (existingBorrow) {
      return res.status(400).json({ message: 'You already have this book borrowed' });
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + BORROW_DAYS);

    const record = await BorrowRecord.create({
      user: req.user._id,
      book: bookId,
      dueDate,
      status: 'borrowed',
    });

    book.availableCopies -= 1;
    await book.save();

    const populated = await BorrowRecord.findById(record._id)
      .populate('book', 'title author coverImage category')
      .populate('user', 'name email');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Return a book
// @route  PUT /api/borrow/return/:id
// @access Private (User)
const returnBook = async (req, res) => {
  try {
    const record = await BorrowRecord.findById(req.params.id);

    if (!record) return res.status(404).json({ message: 'Borrow record not found' });
    if (record.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (record.status === 'returned') {
      return res.status(400).json({ message: 'Book already returned' });
    }

    const returnDate = new Date();
    const dueDate = new Date(record.dueDate);
    let fineAmount = 0;

    if (returnDate > dueDate) {
      const overdueDays = Math.ceil((returnDate - dueDate) / (1000 * 60 * 60 * 24));
      fineAmount = overdueDays * FINE_PER_DAY;
    }

    record.returnDate = returnDate;
    record.status = 'returned';
    record.fineAmount = fineAmount;
    await record.save();

    // Restore book copy
    const book = await Book.findById(record.book);
    if (book) {
      book.availableCopies = Math.min(book.availableCopies + 1, book.totalCopies);
      await book.save();
    }

    const populated = await BorrowRecord.findById(record._id)
      .populate('book', 'title author coverImage category')
      .populate('user', 'name email');

    res.json({ record: populated, fineAmount, message: fineAmount > 0 ? `Book returned. Fine: ₹${fineAmount}` : 'Book returned successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Get current user's borrow history
// @route  GET /api/borrow/my-history
// @access Private (User)
const getMyHistory = async (req, res) => {
  try {
    const records = await BorrowRecord.find({ user: req.user._id })
      .populate('book', 'title author coverImage category')
      .sort({ createdAt: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Get all borrow records (Admin)
// @route  GET /api/borrow/all
// @access Admin
const getAllBorrowRecords = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status && status !== 'all') query.status = status;

    // Auto-mark overdue
    await BorrowRecord.updateMany(
      { status: 'borrowed', dueDate: { $lt: new Date() } },
      { $set: { status: 'overdue' } }
    );

    const total = await BorrowRecord.countDocuments(query);
    const records = await BorrowRecord.find(query)
      .populate('book', 'title author coverImage category')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ records, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Get admin dashboard stats
// @route  GET /api/borrow/stats
// @access Admin
const getDashboardStats = async (req, res) => {
  try {
    const totalBooks = await Book.countDocuments();
    const totalUsers = require('../models/User').countDocuments({ role: 'user' });
    const activeBorrows = BorrowRecord.countDocuments({ status: { $in: ['borrowed', 'overdue'] } });
    const overdue = BorrowRecord.countDocuments({ status: 'overdue' });
    const totalFines = BorrowRecord.aggregate([
      { $match: { fineAmount: { $gt: 0 } } },
      { $group: { _id: null, total: { $sum: '$fineAmount' } } },
    ]);

    const [users, borrows, overdueCount, fines] = await Promise.all([
      totalUsers, activeBorrows, overdue, totalFines,
    ]);

    res.json({
      totalBooks,
      totalUsers: users,
      activeBorrows: borrows,
      overdueCount,
      totalFines: fines[0]?.total || 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { borrowBook, returnBook, getMyHistory, getAllBorrowRecords, getDashboardStats };
