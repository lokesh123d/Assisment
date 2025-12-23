import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import os from 'os';

/**
 * Shared PDF Content Generator
 * Draws the content onto the provided doc
 */
const generatePDFContent = (doc, submissionData) => {
    const { user, quiz, result, submittedAt } = submissionData;

    // --- Header ---
    doc.fillColor('#4a9eff') // Blue header for verification
        .fontSize(20)
        .text('Quiz Submission Report', 110, 57)
        .fontSize(10)
        .text('NavGurukul Assessment Platform', 200, 50, { align: 'right' })
        .moveDown();

    // --- Quiz Info ---
    doc.strokeColor('#aaaaaa')
        .lineWidth(1)
        .moveTo(50, 90)
        .lineTo(550, 90)
        .stroke();

    doc.fontSize(14).text(`Subject: ${quiz.title}`, 50, 100);
    doc.fontSize(10)
        .text(`Student: ${user.name} (${user.email})`, 50, 120)
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

    result.detailedAnswers.forEach((ans, index) => {
        // Check for page break if y position is too low
        if (doc.y > 650) {
            doc.addPage();
        }

        const questionNum = index + 1;
        const isCorrect = ans.isCorrect;

        // Question Title
        doc.fontSize(11).font('Helvetica-Bold').fillColor('#000000');
        doc.text(`Q${questionNum}: ${ans.question}`, { width: 500 });
        doc.moveDown(0.5);

        // User Answer
        doc.fontSize(10).font('Helvetica').fillColor(isCorrect ? '#2b8a3e' : '#c92a2a');

        let answerText = String(ans.selectedAnswer || 'No Answer');
        if (answerText.length > 2000) answerText = answerText.substring(0, 2000) + '... (truncated)';

        doc.text(`Your Answer: ${answerText}`, { width: 480 });

        // Correct Answer
        if (!isCorrect) {
            doc.fillColor('#555555');
            doc.text(`Correct Answer: ${ans.correctAnswer}`, { width: 480 });
        }

        // Marks / Type
        doc.fillColor('#888888').fontSize(9);
        doc.text(`Type: ${ans.type || 'MCQ'}`, { width: 480 });

        doc.moveDown();
        doc.strokeColor('#eeeeee').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown();
    });
};

/**
 * Generate PDF Report and stream to response (For Web View/Download)
 */
export const streamQuizReport = (res, submissionData) => {
    try {
        const doc = new PDFDocument({ margin: 50 });

        // Pipe directly to response
        doc.pipe(res);

        generatePDFContent(doc, submissionData);

        doc.end();
    } catch (error) {
        console.error('PDF Stream Error:', error);
        if (!res.headersSent) {
            res.status(500).send('Error generating PDF');
        }
    }
};

/**
 * Generate PDF report for quiz submission (File based - Legacy/Background)
 */
export const generateQuizReportPDF = async (submissionData) => {
    const { user, quiz, submittedAt } = submissionData;

    // Use system temp directory for cloud compatibility (Vercel/Render)
    const reportsBaseDir = path.join(os.tmpdir(), 'quiz_reports');
    const sanitizedTitle = (quiz.title || 'Untitled_Quiz').replace(/[^a-z0-9]/gi, '_').substring(0, 50);
    const reportsDir = path.join(reportsBaseDir, sanitizedTitle);

    if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
    }

    const timestamp = new Date().getTime();
    const sanitizedUser = (user.name || 'User').replace(/[^a-z0-9]/gi, '_');
    const filename = `${sanitizedUser}-${timestamp}.pdf`;
    const filepath = path.join(reportsDir, filename);

    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            const stream = fs.createWriteStream(filepath);

            doc.pipe(stream);
            generatePDFContent(doc, submissionData);
            doc.end();

            stream.on('finish', () => {
                resolve({
                    filename,
                    filepath,
                    folder: sanitizedTitle,
                    path: path.join(sanitizedTitle, filename)
                });
            });

            stream.on('error', (error) => {
                reject(error);
            });

        } catch (error) {
            reject(error);
        }
    });
};

// Legacy support (safe to remove imports if unused elsewhere, but keeping for compatibility)
export const getReportsList = () => {
    // This function is deprecated in favor of DB-based listing 
    // but kept empty/minimal to prevent crash if called
    return [];
};

export const cleanOldReports = () => { };

