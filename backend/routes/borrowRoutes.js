const express = require('express');
const router = express.Router();
const {
  borrowBook, returnBook, getMyHistory, getAllBorrowRecords, getDashboardStats,
} = require('../controllers/borrowController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/', protect, borrowBook);
router.put('/return/:id', protect, returnBook);
router.get('/my-history', protect, getMyHistory);
router.get('/stats', protect, adminOnly, getDashboardStats);
router.get('/all', protect, adminOnly, getAllBorrowRecords);

module.exports = router;
