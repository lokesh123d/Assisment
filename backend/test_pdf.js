
import { generateQuizReportPDF } from './utils/pdfGenerator.js';
import fs from 'fs';
import path from 'path';

const mockData = {
    user: { name: 'TestUser', email: 'test@example.com' },
    quiz: { title: 'Test Quiz', timeLimit: 30 },
    result: {
        score: 5,
        totalQuestions: 10,
        percentage: 50,
        passed: true,
        detailedAnswers: [
            { question: 'What is 2+2?', selectedAnswer: '4', correctAnswer: '4', isCorrect: true, type: 'mcq' },
            { question: 'What is 5+5?', selectedAnswer: '11', correctAnswer: '10', isCorrect: false, type: 'mcq' }
        ]
    },
    submittedAt: new Date()
};

async function test() {
    console.log('Starting PDF generation test...');
    try {
        const result = await generateQuizReportPDF(mockData);
        console.log('PDF Generated:', result);

        const stats = fs.statSync(result.filepath);
        console.log(`File Size: ${stats.size} bytes`);

        if (stats.size > 1000) {
            console.log('SUCCESS: File has content.');
        } else {
            console.log('FAILURE: File is empty or too small.');
        }
    } catch (e) {
        console.error('Test Failed:', e);
    }
}

test();
