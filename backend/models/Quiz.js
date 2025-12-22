import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    category: {
        type: String,
        default: 'General'
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    },
    timeLimit: {
        type: Number,
        default: 30
    },
    questions: [{
        type: {
            type: String,
            enum: [
                'mcq',                    // Multiple Choice
                'multiple-select',        // Multiple answers can be selected
                'true-false',            // True/False
                'short-answer',          // Short text answer
                'long-answer',           // Essay/Paragraph
                'fill-blank',            // Fill in the blanks
                'matching',              // Match items
                'ordering',              // Arrange in order
                'code-output',           // Predict code output
                'code-debug',            // Find and fix error
                'code-complete',         // Complete the code
                'code-write',            // Write full code
                'numerical',             // Number answer
                'file-upload'            // Upload file
            ],
            default: 'mcq'
        },
        question: {
            type: String,
            required: true
        },

        // For MCQ, Multiple-Select, True-False
        options: [{
            type: String
        }],
        correctAnswer: {
            type: mongoose.Schema.Types.Mixed  // Can be number, array, or string
        },

        // For Code Questions
        codeSnippet: {
            type: String
        },
        language: {
            type: String,
            enum: ['javascript', 'python', 'java', 'cpp', 'html', 'css', 'sql']
        },
        testCases: [{
            input: String,
            expectedOutput: String
        }],

        // For Written Questions
        sampleAnswer: {
            type: String
        },
        keywords: [{
            type: String
        }],
        minWords: {
            type: Number
        },
        maxWords: {
            type: Number
        },

        // For Fill in the Blanks
        blanks: [{
            position: Number,
            correctAnswer: String,
            alternateAnswers: [String]
        }],

        // For Matching
        leftItems: [{
            type: String
        }],
        rightItems: [{
            type: String
        }],
        correctPairs: [{
            left: Number,
            right: Number
        }],

        // For Ordering
        items: [{
            type: String
        }],
        correctOrder: [{
            type: Number
        }],

        // Common fields
        explanation: {
            type: String
        },
        points: {
            type: Number,
            default: 1
        },
        hints: [{
            type: String
        }],
        difficulty: {
            type: String,
            enum: ['easy', 'medium', 'hard']
        },
        tags: [{
            type: String
        }]
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    sourceFile: {
        filename: String,
        uploadedAt: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

quizSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const Quiz = mongoose.model('Quiz', quizSchema);

export default Quiz;
