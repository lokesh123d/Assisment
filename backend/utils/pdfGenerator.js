import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';
import os from 'os';

/**
 * Shared PDF Content Generator
 * Draws the content onto the provided doc
 */
const generatePDFContent = (doc, submissionData) => {
    const { user, quiz, result, submittedAt } = submissionData;

    // Helper to safe string
    const safeStr = (str) => (str === null || str === undefined) ? '' : String(str);

    // DEBUG: Force visible text at top
    doc.fillColor('black').fontSize(10).text('Verification Code: ' + Date.now(), 10, 10);

    // --- Header ---
    doc.fillColor('#4a9eff') // Blue header for verification
        .fontSize(20)
        .font('Helvetica-Bold')
        .text('Quiz Submission Report', 110, 57)
        .fontSize(10)
        .font('Helvetica')
        .text('NavGurukul Assessment Platform', 200, 50, { align: 'right' })
        .moveDown();

    // --- Quiz Info ---
    doc.strokeColor('#aaaaaa')
        .lineWidth(1)
        .moveTo(50, 90)
        .lineTo(550, 90)
        .stroke();

    doc.fontSize(14).font('Helvetica').text(`Subject: ${safeStr(quiz.title)}`, 50, 100);
    doc.fontSize(10)
        .text(`Student: ${safeStr(user.name)} (${safeStr(user.email)})`, 50, 120)
        .text(`Date: ${new Date(submittedAt).toLocaleString()}`, 50, 135)
        .text(`Duration: ${quiz.timeLimit || 'N/A'} mins`, 50, 150)
        .moveDown();

    // --- Score Section ---
    doc.fontSize(14).font('Helvetica-Bold').text('Results Summary', 50, 175);
    doc.fontSize(12).font('Helvetica').text(`Score: ${result.score} / ${result.totalQuestions}`, 50, 195);
    doc.text(`Percentage: ${result.percentage}%`, 50, 215);

    const statusColor = result.passed ? '#2b8a3e' : '#c92a2a';
    doc.fillColor(statusColor)
        .font('Helvetica-Bold')
        .text(`Status: ${result.passed ? 'PASSED' : 'FAILED'}`, 50, 235);

    doc.fillColor('#000000').font('Helvetica'); // Reset

    doc.strokeColor('#aaaaaa')
        .lineWidth(1)
        .moveTo(50, 260)
        .lineTo(550, 260)
        .stroke();

    // --- Detailed Answers ---
    doc.moveDown(4); // Move past summary
    doc.fontSize(14).font('Helvetica-Bold').text('Detailed Answers', 50, doc.y);
    doc.moveDown();

    if (result.detailedAnswers && result.detailedAnswers.length > 0) {
        result.detailedAnswers.forEach((ans, index) => {
            // Check for page break if y position is too low
            if (doc.y > 650) {
                doc.addPage();
            }

            const questionNum = index + 1;
            const isCorrect = ans.isCorrect;

            // Question Title
            doc.fontSize(11).font('Helvetica-Bold').fillColor('#000000');
            doc.text(`Q${questionNum}: ${safeStr(ans.question)}`, { width: 500 });
            doc.moveDown(0.5);

            // User Answer
            doc.fontSize(10).font('Helvetica').fillColor(isCorrect ? '#2b8a3e' : '#c92a2a');

            let answerText = safeStr(ans.selectedAnswer || 'No Answer');
            if (answerText.length > 2000) answerText = answerText.substring(0, 2000) + '... (truncated)';

            doc.text(`Your Answer: ${answerText}`, { width: 480 });

            // Correct Answer
            if (!isCorrect) {
                doc.fillColor('#555555');
                doc.text(`Correct Answer: ${safeStr(ans.correctAnswer)}`, { width: 480 });
            }

            // Marks / Type
            doc.fillColor('#888888').fontSize(9);
            doc.text(`Type: ${safeStr(ans.type || 'MCQ')}`, { width: 480 });

            doc.moveDown();
            doc.strokeColor('#eeeeee').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown();
        });
    } else {
        doc.fontSize(12).font('Helvetica-Oblique').text('No detailed answers available.', 50, doc.y);
    }
};

/**
 * Generate PDF Report and return as Buffer (Safe for Vercel/Async)
 */
export const generateQuizReportBuffer = async (submissionData) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50, size: 'A4' });
            const buffers = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });
            doc.on('error', (err) => {
                reject(err);
            });

            generatePDFContent(doc, submissionData);

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

/**
 * Generate PDF Report and stream to response (Kept for compatibility)
 */
export const streamQuizReport = (res, submissionData) => {
    // Redirect to buffer logic to ensure safety even here
    generateQuizReportBuffer(submissionData)
        .then(buffer => {
            res.write(buffer);
            res.end();
        })
        .catch(err => {
            console.error('PDF Buffer Error:', err);
            if (!res.headersSent) res.status(500).send('Error generating PDF');
        });
};

/**
 * Legacy Support - Not used primarily anymore
 */
export const generateQuizReportPDF = async (submissionData) => {
    // If saving file is still needed for some internal logic (unlikely)
    // We mock it or implement it using buffer
    return generateQuizReportBuffer(submissionData).then(buffer => {
        return {
            filename: 'report.pdf',
            buffer: buffer
        };
    });
};

export const getReportsList = () => [];
export const cleanOldReports = () => { };
