import express from 'express';
import Quiz from '../models/Quiz.js';
import User from '../models/User.js';
import upload from '../middleware/upload.js';
import { protect, admin } from '../middleware/auth.js';
import { processQuizFile, generateQuizWithAI, validateQuizData } from '../utils/aiProcessor.js';
import { generateQuizReportPDF } from '../utils/pdfGenerator.js';
import fs from 'fs/promises';

const router = express.Router();

/**
 * @route   GET /api/quizzes
 * @desc    Get all active quizzes
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
    try {
        const quizzes = await Quiz.find({ isActive: true })
            .select('-questions.correctAnswer -questions.explanation')
            .populate('createdBy', 'name email')
            .sort('-createdAt');

        res.json({
            success: true,
            count: quizzes.length,
            quizzes
        });
    } catch (error) {
        console.error('Get quizzes error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

/**
 * @route   GET /api/quizzes/:id
 * @desc    Get quiz by ID (without answers for students)
 * @access  Private
 */
router.get('/:id', protect, async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id)
            .populate('createdBy', 'name email');

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        // Remove correct answers and explanations for students
        const quizData = quiz.toObject();
        if (req.user.role !== 'admin') {
            quizData.questions = quizData.questions.map(q => ({
                _id: q._id,
                question: q.question,
                options: q.options
            }));
        }

        res.json({
            success: true,
            quiz: quizData
        });
    } catch (error) {
        console.error('Get quiz error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

/**
 * @route   POST /api/quizzes/upload
 * @desc    Upload file and create quiz (Admin only)
 * @access  Private/Admin
 */
router.post('/upload', protect, admin, upload.single('quizFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { numberOfQuestions, difficulty, category, title, description, apiKey } = req.body;

        // Process the uploaded file
        const fileData = await processQuizFile(req.file.path);

        let quizData;

        if (fileData.needsAIProcessing) {
            // Generate quiz using AI
            quizData = await generateQuizWithAI(fileData.text, {
                numberOfQuestions: parseInt(numberOfQuestions) || 10,
                difficulty: difficulty || 'medium',
                category: category || 'General',
                apiKey: apiKey || null
            });

            // Override with custom title/description if provided
            if (title) quizData.title = title;
            if (description) quizData.description = description;
        } else {
            // Use JSON data directly
            quizData = fileData;
        }

        // Validate quiz data
        validateQuizData(quizData);

        // Create quiz in database
        const quiz = await Quiz.create({
            ...quizData,
            createdBy: req.user._id,
            sourceFile: {
                filename: req.file.filename,
                uploadedAt: new Date()
            }
        });

        // Clean up uploaded file
        await fs.unlink(req.file.path);

        res.status(201).json({
            success: true,
            message: 'Quiz created successfully',
            quiz: {
                id: quiz._id,
                title: quiz.title,
                description: quiz.description,
                questionsCount: quiz.questions.length
            }
        });
    } catch (error) {
        console.error('Upload quiz error:', error);

        // Clean up file on error
        if (req.file) {
            try {
                await fs.unlink(req.file.path);
            } catch (unlinkError) {
                console.error('Error deleting file:', unlinkError);
            }
        }

        res.status(500).json({
            message: 'Failed to create quiz',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/quizzes/create
 * @desc    Create quiz manually (Admin only)
 * @access  Private/Admin
 */
router.post('/create', protect, admin, async (req, res) => {
    try {
        const quizData = req.body;

        // Validate quiz data
        validateQuizData(quizData);

        // Create quiz
        const quiz = await Quiz.create({
            ...quizData,
            createdBy: req.user._id
        });

        res.status(201).json({
            success: true,
            message: 'Quiz created successfully',
            quiz
        });
    } catch (error) {
        console.error('Create quiz error:', error);
        res.status(500).json({
            message: 'Failed to create quiz',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/quizzes/:id/submit
 * @desc    Submit quiz answers and get score
 * @access  Private
 */
router.post('/:id/submit', protect, async (req, res) => {
    try {
        const { answers } = req.body; // Array of { questionId, selectedAnswer }

        const quiz = await Quiz.findById(req.params.id);

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        // Calculate score
        let correctCount = 0;
        const detailedAnswers = [];

        answers.forEach(answer => {
            const question = quiz.questions.id(answer.questionId);
            if (question) {
                const isCorrect = question.correctAnswer === answer.selectedAnswer;
                if (isCorrect) correctCount++;

                detailedAnswers.push({
                    questionId: answer.questionId,
                    question: question.question,
                    selectedAnswer: answer.selectedAnswer,
                    correctAnswer: question.correctAnswer,
                    isCorrect,
                    explanation: question.explanation,
                    options: question.options
                });
            }
        });

        const totalQuestions = quiz.questions.length;
        const percentage = ((correctCount / totalQuestions) * 100).toFixed(2);

        // Save to user's quiz history
        const user = await User.findById(req.user._id);
        const submittedAt = new Date();

        user.quizzesTaken.push({
            quizId: quiz._id,
            score: correctCount,
            totalQuestions,
            percentage,
            completedAt: submittedAt,
            answers: answers.map(a => ({
                questionId: a.questionId,
                selectedAnswer: a.selectedAnswer,
                isCorrect: quiz.questions.id(a.questionId)?.correctAnswer === a.selectedAnswer
            }))
        });
        await user.save();

        // Generate PDF report for admin
        try {
            const pdfResult = await generateQuizReportPDF({
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email
                },
                quiz: {
                    title: quiz.title,
                    category: quiz.category,
                    difficulty: quiz.difficulty,
                    timeLimit: quiz.timeLimit
                },
                result: {
                    score: correctCount,
                    totalQuestions,
                    percentage,
                    passed: percentage >= 60,
                    detailedAnswers
                },
                submittedAt
            });

            console.log(`✅ PDF Report generated: ${pdfResult.filename}`);
        } catch (pdfError) {
            console.error('PDF generation error:', pdfError);
            // Don't fail the submission if PDF generation fails
        }

        res.json({
            success: true,
            result: {
                score: correctCount,
                totalQuestions,
                percentage,
                passed: percentage >= 60,
                detailedAnswers
            }
        });
    } catch (error) {
        console.error('Submit quiz error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

/**
 * @route   DELETE /api/quizzes/:id
 * @desc    Delete quiz (Admin only)
 * @access  Private/Admin
 */
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        await quiz.deleteOne();

        res.json({
            success: true,
            message: 'Quiz deleted successfully'
        });
    } catch (error) {
        console.error('Delete quiz error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

export default router;
