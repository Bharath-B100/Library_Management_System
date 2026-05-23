const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, updateUserStatus } = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', protect, adminOnly, getAllUsers);
router.get('/:id', protect, adminOnly, getUserById);
router.patch('/:id/status', protect, adminOnly, updateUserStatus);

module.exports = router;
