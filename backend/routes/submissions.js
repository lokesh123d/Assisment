import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import { streamQuizReport } from '../utils/pdfGenerator.js';
import User from '../models/User.js';
import Quiz from '../models/Quiz.js';

const router = express.Router();

/**
 * @route   GET /api/submissions
 * @desc    Get all quiz submissions (Admin only) - Fetched from DB
 * @access  Private/Admin
 */
router.get('/', protect, admin, async (req, res) => {
    try {
        // Fetch users who have taken at least one quiz
        const users = await User.find({ 'quizzesTaken.0': { $exists: true } })
            .populate('quizzesTaken.quizId', 'title')
            .select('name email quizzesTaken')
            .lean();

        let allSubmissions = [];

        users.forEach(user => {
            if (user.quizzesTaken && user.quizzesTaken.length > 0) {
                user.quizzesTaken.forEach(sub => {
                    // Create a virtual file object for the frontend
                    // Path is now a composite key: 'userId|submissionId'
                    const safeName = (user.name || 'User').replace(/[^a-z0-9]/gi, '_');
                    const timestamp = new Date(sub.completedAt).getTime();

                    allSubmissions.push({
                        filename: `${safeName}-${timestamp}.pdf`,
                        studentName: user.name,
                        path: `${user._id}|${sub._id}`,
                        quizTitle: sub.quizId ? sub.quizId.title : 'Deleted Quiz',
                        size: 50 * 1024, // Approximation
                        createdAt: sub.completedAt
                    });
                });
            }
        });

        // Sort by newest first
        allSubmissions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json({
            success: true,
            count: allSubmissions.length,
            submissions: allSubmissions
        });
    } catch (error) {
        console.error('Get submissions error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

/**
 * Helper to generate and stream report
 */
const handleReportRequest = async (req, res, disposition) => {
    try {
        const fileParam = req.query.file; // Expected: "userId|submissionId"

        if (!fileParam || !fileParam.includes('|')) {
            return res.status(400).json({ message: 'Invalid report identifier' });
        }

        const [userId, submissionId] = fileParam.split('|');

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const submission = user.quizzesTaken.id(submissionId);
        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        // Fetch Quiz Data to reconstruct report (Questions text, Correct Answers)
        // Check if quizId exists (it might be null if populated failed above, but here we use raw ID)
        let quiz = null;
        if (submission.quizId) {
            quiz = await Quiz.findById(submission.quizId);
        }

        // Reconstruct detailed answers
        // If quiz is deleted, we might miss question text.
        const detailedAnswers = submission.answers.map(ans => {
            let questionText = 'Question not found (Quiz updated or deleted)';
            let correctAnswer = 'N/A';
            let type = 'mcq';
            let options = [];

            if (quiz) {
                const question = quiz.questions.id(ans.questionId);
                if (question) {
                    questionText = question.question;
                    correctAnswer = question.correctAnswer;
                    type = question.type;
                    options = question.options;
                }
            }

            return {
                question: questionText,
                selectedAnswer: ans.selectedAnswer,
                correctAnswer: correctAnswer,
                isCorrect: ans.isCorrect,
                type: type,
                options: options
            };
        });

        const submissionData = {
            user: {
                name: user.name,
                email: user.email
            },
            quiz: {
                title: quiz ? quiz.title : 'Unknown Quiz',
                timeLimit: quiz ? quiz.timeLimit : 0
            },
            result: {
                score: submission.score,
                totalQuestions: submission.totalQuestions,
                percentage: submission.percentage,
                passed: submission.percentage >= 60,
                detailedAnswers
            },
            submittedAt: submission.completedAt
        };

        // Set Headers
        const filename = `${user.name.replace(/[^a-z0-9]/gi, '_')}-Report.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `${disposition}; filename="${filename}"`);

        // Generate and Stream
        streamQuizReport(res, submissionData);

    } catch (error) {
        console.error('Report generation error:', error);
        // If headers not sent, send JSON error. If partly sent, stream will die.
        if (!res.headersSent) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }
};

/**
 * @route   GET /api/submissions/download
 * @desc    Download PDF report (Admin only)
 * @access  Private/Admin
 */
router.get('/download', protect, admin, (req, res) => {
    handleReportRequest(req, res, 'attachment');
});

/**
 * @route   GET /api/submissions/view
 * @desc    View PDF report in browser (Admin only)
 * @access  Private/Admin
 */
router.get('/view', protect, admin, (req, res) => {
    handleReportRequest(req, res, 'inline');
});

export default router;
