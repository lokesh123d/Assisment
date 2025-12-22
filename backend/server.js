import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import quizRoutes from './routes/quiz.js';
import userRoutes from './routes/users.js';
import submissionsRoutes from './routes/submissions.js';
import leaderboardRoutes from './routes/leaderboard.js';
import fs from 'fs';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Create necessary directories if they don't exist
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}
if (!fs.existsSync('reports')) {
    fs.mkdirSync('reports');
}

// Middleware
app.use(cors({
    origin: function (origin, callback) {
        const allowedOrigins = [
            'http://localhost:5173',
            'http://localhost:5000',
            process.env.FRONTEND_URL
        ].filter(Boolean);

        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log('Blocked by CORS:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/users', userRoutes);
app.use('/api/submissions', submissionsRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// Health check route
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Quiz App API is running',
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 API: http://localhost:${PORT}/api`);
});
