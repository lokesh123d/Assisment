import express from 'express';
import User from '../models/User.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/users/history
 * @desc    Get user's quiz history
 * @access  Private
 */
router.get('/history', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('quizzesTaken.quizId', 'title category difficulty');

        res.json({
            success: true,
            history: user.quizzesTaken.sort((a, b) => b.completedAt - a.completedAt)
        });
    } catch (error) {
        console.error('Get history error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

/**
 * @route   GET /api/users/stats
 * @desc    Get user's statistics
 * @access  Private
 */
router.get('/stats', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        const totalQuizzes = user.quizzesTaken.length;
        const totalScore = user.quizzesTaken.reduce((sum, quiz) => sum + quiz.score, 0);
        const totalQuestions = user.quizzesTaken.reduce((sum, quiz) => sum + quiz.totalQuestions, 0);
        const averagePercentage = totalQuizzes > 0
            ? (user.quizzesTaken.reduce((sum, quiz) => sum + parseFloat(quiz.percentage), 0) / totalQuizzes).toFixed(2)
            : 0;

        res.json({
            success: true,
            stats: {
                totalQuizzes,
                totalScore,
                totalQuestions,
                averagePercentage,
                recentQuizzes: user.quizzesTaken.slice(-5).reverse()
            }
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

/**
 * @route   PUT /api/users/role/:userId
 * @desc    Update user role (Admin only)
 * @access  Private/Admin
 */
router.put('/role/:userId', protect, admin, async (req, res) => {
    try {
        const { role } = req.body;

        if (!['student', 'admin'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const user = await User.findById(req.params.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.role = role;
        await user.save();

        res.json({
            success: true,
            message: 'User role updated successfully',
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Update role error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

/**
 * @route   GET /api/users
 * @desc    Get all users (Admin only)
 * @access  Private/Admin
 */
router.get('/', protect, admin, async (req, res) => {
    try {
        const users = await User.find().select('-__v').sort('-createdAt');

        res.json({
            success: true,
            count: users.length,
            users
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

export default router;
