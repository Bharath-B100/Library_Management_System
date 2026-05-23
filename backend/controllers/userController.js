const User = require('../models/User');
const BorrowRecord = require('../models/BorrowRecord');

// @desc   Get all users
// @route  GET /api/users
// @access Admin
const getAllUsers = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const query = { role: 'user' };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Attach borrow count to each user
    const usersWithBorrows = await Promise.all(
      users.map(async (user) => {
        const activeBorrows = await BorrowRecord.countDocuments({
          user: user._id,
          status: { $in: ['borrowed', 'overdue'] },
        });
        const totalBorrows = await BorrowRecord.countDocuments({ user: user._id });
        return { ...user.toObject(), activeBorrows, totalBorrows };
      })
    );

    res.json({ users: usersWithBorrows, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Get single user profile
// @route  GET /api/users/:id
// @access Admin
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Update user status (activate/deactivate)
// @route  PATCH /api/users/:id/status
// @access Admin
const updateUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'}`, isActive: user.isActive });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllUsers, getUserById, updateUserStatus };
