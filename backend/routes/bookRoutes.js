const express = require('express');
const router = express.Router();
const {
  getBooks, getBookById, addBook, updateBook, deleteBook, getCategoryStats,
} = require('../controllers/bookController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

router.get('/categories', protect, adminOnly, getCategoryStats);
router.get('/', getBooks);
router.get('/:id', getBookById);
router.post(
  '/',
  protect,
  adminOnly,
  upload.fields([{ name: 'coverImage', maxCount: 1 }, { name: 'pdfFile', maxCount: 1 }]),
  addBook
);
router.put(
  '/:id',
  protect,
  adminOnly,
  upload.fields([{ name: 'coverImage', maxCount: 1 }, { name: 'pdfFile', maxCount: 1 }]),
  updateBook
);
router.delete('/:id', protect, adminOnly, deleteBook);

module.exports = router;
