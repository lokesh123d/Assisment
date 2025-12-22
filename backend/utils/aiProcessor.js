import fs from 'fs/promises';
import path from 'path';
import pdf from 'pdf-parse';

/**
 * Process uploaded file and extract quiz content
 * Supports JSON and PDF files
 */
export const processQuizFile = async (filePath) => {
    try {
        const ext = path.extname(filePath).toLowerCase();

        if (ext === '.json') {
            // Read and parse JSON file
            const fileContent = await fs.readFile(filePath, 'utf-8');
            const quizData = JSON.parse(fileContent);
            return quizData;
        } else if (ext === '.pdf') {
            // Read and parse PDF file
            const dataBuffer = await fs.readFile(filePath);
            const pdfData = await pdf(dataBuffer);
            const text = pdfData.text;

            // Return text for AI processing
            return { text, needsAIProcessing: true };
        } else if (ext === '.txt') {
            // Read text file
            const text = await fs.readFile(filePath, 'utf-8');
            return { text, needsAIProcessing: true };
        } else {
            throw new Error('Unsupported file format');
        }
    } catch (error) {
        console.error('Error processing file:', error);
        throw error;
    }
};

/**
 * Generate quiz using AI (OpenAI)
 * This is a placeholder - you'll need to add your OpenAI API key
 */
export const generateQuizWithAI = async (text, options = {}) => {
    const {
        numberOfQuestions = 10,
        difficulty = 'medium',
        category = 'General'
    } = options;

    // Mock AI response for demonstration
    // In production, replace this with actual OpenAI API call
    const mockQuiz = {
        title: `AI Generated Quiz - ${category}`,
        description: `Auto-generated quiz based on uploaded content`,
        category,
        difficulty,
        questions: generateMockQuestions(numberOfQuestions, text)
    };

    return mockQuiz;
};

/**
 * Generate mock questions from text
 */
const generateMockQuestions = (count, text) => {
    const questions = [];
    const words = text.split(' ').filter(w => w.length > 3);

    for (let i = 0; i < Math.min(count, 20); i++) {
        const randomWord = words[Math.floor(Math.random() * words.length)] || 'topic';
        questions.push({
            question: `Question ${i + 1}: What is the main concept related to "${randomWord}"?`,
            options: [
                `Option A: First explanation about ${randomWord}`,
                `Option B: Second explanation about ${randomWord}`,
                `Option C: Third explanation about ${randomWord}`,
                `Option D: Fourth explanation about ${randomWord}`
            ],
            correctAnswer: Math.floor(Math.random() * 4),
            explanation: `This question tests understanding of ${randomWord} from the provided content.`
        });
    }

    return questions;
};

/**
 * Validate quiz data structure
 */
export const validateQuizData = (quizData) => {
    if (!quizData.title || typeof quizData.title !== 'string') {
        throw new Error('Quiz must have a valid title');
    }

    if (!Array.isArray(quizData.questions) || quizData.questions.length === 0) {
        throw new Error('Quiz must have at least one question');
    }

    quizData.questions.forEach((q, index) => {
        if (!q.question || typeof q.question !== 'string') {
            throw new Error(`Question ${index + 1} must have a valid question text`);
        }

        if (!Array.isArray(q.options) || q.options.length < 2) {
            throw new Error(`Question ${index + 1} must have at least 2 options`);
        }

        if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer >= q.options.length) {
            throw new Error(`Question ${index + 1} must have a valid correctAnswer index`);
        }
    });

    return true;
};
