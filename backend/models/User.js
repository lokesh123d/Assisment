import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: function (v) {
                return v.endsWith('@navgurukul.org');
            },
            message: 'Only @navgurukul.org emails are allowed'
        }
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    picture: {
        type: String
    },
    role: {
        type: String,
        enum: ['student', 'admin'],
        default: 'student'
    },
    quizzesTaken: [{
        quizId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Quiz'
        },
        score: Number,
        totalQuestions: Number,
        percentage: Number,
        completedAt: {
            type: Date,
            default: Date.now
        },
        answers: [{
            questionId: String,
            selectedAnswer: mongoose.Schema.Types.Mixed,
            isCorrect: Boolean
        }]
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('User', userSchema);

export default User;
