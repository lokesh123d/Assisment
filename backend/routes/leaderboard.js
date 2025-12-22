import express from 'express';
import Quiz from '../models/Quiz.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/leaderboard/:quizId
 * @desc    Get leaderboard for a specific quiz
 * @access  Private
 */
/**
 * @route   GET /api/leaderboard/global/all
 * @desc    Get global leaderboard (top performers across all quizzes)
 * @access  Private
 */
router.get('/global/all', protect, async (req, res) => {
    try {
        const users = await User.find({
            'quizzesTaken.0': { $exists: true }
        }).select('name email quizzesTaken');

        const globalStats = users.map(user => {
            const totalQuizzes = user.quizzesTaken.length;
            const totalScore = user.quizzesTaken.reduce((sum, qt) => sum + qt.score, 0);
            const totalQuestions = user.quizzesTaken.reduce((sum, qt) => sum + qt.totalQuestions, 0);
            const averagePercentage = totalQuizzes > 0
                ? (user.quizzesTaken.reduce((sum, qt) => sum + parseFloat(qt.percentage), 0) / totalQuizzes).toFixed(2)
                : 0;

            return {
                userId: user._id,
                name: user.name,
                email: user.email,
                totalQuizzes,
                totalScore,
                totalQuestions,
                averagePercentage: parseFloat(averagePercentage)
            };
        });

        // Sort by average percentage
        globalStats.sort((a, b) => b.averagePercentage - a.averagePercentage);

        // Add rank
        globalStats.forEach((entry, index) => {
            entry.rank = index + 1;
        });

        res.json({
            success: true,
            totalUsers: globalStats.length,
            leaderboard: globalStats
        });

    } catch (error) {
        console.error('Global leaderboard error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

/**
 * @route   GET /api/leaderboard/:quizId
 * @desc    Get leaderboard for a specific quiz
 * @access  Private
 */
router.get('/:quizId', protect, async (req, res) => {
    try {
        const quizId = req.params.quizId;

        // Check if quiz exists
        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        // Get all users who took this quiz
        const users = await User.find({
            'quizzesTaken.quizId': quizId
        }).select('name email quizzesTaken');

        // Format leaderboard data
        const leaderboard = [];

        users.forEach(user => {
            const quizAttempts = user.quizzesTaken.filter(
                qt => qt.quizId.toString() === quizId
            );

            quizAttempts.forEach(attempt => {
                leaderboard.push({
                    userId: user._id,
                    name: user.name,
                    email: user.email,
                    score: attempt.score,
                    totalQuestions: attempt.totalQuestions,
                    percentage: parseFloat(attempt.percentage),
                    completedAt: attempt.completedAt,
                    answers: attempt.answers
                });
            });
        });

        // Sort by score (descending), then by completion time (ascending)
        leaderboard.sort((a, b) => {
            if (b.score !== a.score) {
                return b.score - a.score;
            }
            return new Date(a.completedAt) - new Date(b.completedAt);
        });

        // Add rank
        leaderboard.forEach((entry, index) => {
            entry.rank = index + 1;
        });

        res.json({
            success: true,
            quiz: {
                id: quiz._id,
                title: quiz.title,
                category: quiz.category,
                totalQuestions: quiz.questions.length
            },
            totalAttempts: leaderboard.length,
            leaderboard
        });

    } catch (error) {
        console.error('Leaderboard error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

export default router;
