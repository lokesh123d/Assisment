import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

/**
 * Generate PDF report for quiz submission
 */
export const generateQuizReportPDF = async (submissionData) => {
    const { user, quiz, result, submittedAt } = submissionData;

    // Create reports directory if it doesn't exist
    const reportsDir = path.join(process.cwd(), 'reports');
    if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
    }

    // Generate filename
    const timestamp = new Date().getTime();
    const filename = `quiz-report-${user._id}-${timestamp}.pdf`;
    const filepath = path.join(reportsDir, filename);

    return new Promise((resolve, reject) => {
        try {
            // Create PDF document
            const doc = new PDFDocument({ margin: 50, bufferPages: true });
            const stream = fs.createWriteStream(filepath);

            doc.pipe(stream);

            // Header
            doc.fontSize(24).fillColor('#2563eb').text('Quiz Submission Report', { align: 'center' });
            doc.moveDown();

            // Horizontal line
            doc.strokeColor('#2563eb').lineWidth(2).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown();

            // Student Information
            doc.fontSize(16).fillColor('#1e293b').text('Student Information', { underline: true });
            doc.moveDown(0.5);
            doc.fontSize(12).fillColor('#475569');
            doc.text(`Name: ${user.name}`);
            doc.text(`Email: ${user.email}`);
            doc.text(`Submitted At: ${new Date(submittedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
            doc.moveDown();

            // Quiz Information
            doc.fontSize(16).fillColor('#1e293b').text('Quiz Information', { underline: true });
            doc.moveDown(0.5);
            doc.fontSize(12).fillColor('#475569');
            doc.text(`Quiz Title: ${quiz.title}`);
            doc.text(`Category: ${quiz.category || 'General'}`);
            doc.text(`Difficulty: ${quiz.difficulty || 'Medium'}`);
            doc.text(`Total Questions: ${result.totalQuestions}`);
            doc.text(`Time Limit: ${quiz.timeLimit || 30} minutes`);
            doc.moveDown();

            // Score Summary
            doc.fontSize(16).fillColor('#1e293b').text('Score Summary', { underline: true });
            doc.moveDown(0.5);

            // detailedAnswers helps determine if it's a manual review
            const hasManualQuestions = result.detailedAnswers.some(a =>
                a.type === 'long-answer' || a.type === 'short-answer' || a.type === 'code-write'
            );

            // Score box
            const scoreBoxY = doc.y;
            let scoreColor = result.percentage >= 80 ? '#10b981' : result.percentage >= 60 ? '#2563eb' : result.percentage >= 40 ? '#f59e0b' : '#ef4444';
            let statusText = result.passed ? 'PASSED ✓' : 'NEEDS IMPROVEMENT';

            if (hasManualQuestions) {
                scoreColor = '#f59e0b'; // Orange
                statusText = 'PENDING REVIEW ⏳';
            }

            doc.roundedRect(50, scoreBoxY, 500, 80, 5).fillAndStroke(scoreColor, scoreColor);
            doc.fillColor('#ffffff').fontSize(14);
            doc.text(`Score: ${result.score} / ${result.totalQuestions}`, 60, scoreBoxY + 15);

            if (hasManualQuestions) {
                doc.text(`Percentage: N/A (Manual Grading)`, 60, scoreBoxY + 35);
            } else {
                doc.text(`Percentage: ${result.percentage}%`, 60, scoreBoxY + 35);
            }

            doc.text(`Status: ${statusText}`, 60, scoreBoxY + 55);

            doc.moveDown(6);

            // Detailed Answers
            doc.fontSize(16).fillColor('#1e293b').text('Detailed Answers', { underline: true });
            doc.moveDown();

            result.detailedAnswers.forEach((answer, index) => {
                // Check if we need a new page (conservative check)
                if (doc.y > 650) {
                    doc.addPage();
                }

                // Question number and status
                const startY = doc.y;
                let statusColor = answer.isCorrect ? '#10b981' : '#ef4444';
                let statusIcon = answer.isCorrect ? '✓' : '✗';

                if (answer.type === 'long-answer' || answer.type === 'short-answer' || answer.type === 'code-write') {
                    statusColor = '#f59e0b';
                    statusIcon = '⏳';
                }

                doc.fontSize(14).fillColor('#1e293b').text(`Question ${index + 1}:`, 50, startY);
                doc.fontSize(12).fillColor(statusColor).text(statusIcon, 520, startY);

                doc.moveDown(0.5);

                // Question text - Use Flow Logic
                doc.x = 50;
                doc.fontSize(11).fillColor('#1e293b').text(answer.question, { width: 500 });
                doc.moveDown(0.5);

                // Options or Text Answer
                if (answer.type === 'mcq' || !answer.type) {
                    // Standard MCQ Display
                    if (answer.options && Array.isArray(answer.options)) {
                        answer.options.forEach((option, optIndex) => {
                            const isSelected = optIndex === answer.selectedAnswer;
                            const isCorrect = optIndex === answer.correctAnswer;

                            let optionColor = '#64748b';
                            let optionPrefix = String.fromCharCode(65 + optIndex) + '. ';

                            if (isCorrect) {
                                optionColor = '#10b981';
                                optionPrefix += '✓ ';
                            }
                            if (isSelected && !isCorrect) {
                                optionColor = '#ef4444';
                                optionPrefix += '✗ ';
                            }

                            doc.x = 50;
                            doc.fontSize(10).fillColor(optionColor).text(optionPrefix + option, { indent: 10, width: 480 });
                        });
                    }
                } else if (answer.type === 'code-output' || answer.type === 'short-answer' || answer.type === 'code-write') {
                    // Text/Code Answer Display
                    doc.x = 50;
                    doc.fontSize(10).fillColor('#475569').text('Your Answer:', { indent: 10, bold: true });

                    doc.x = 50;
                    doc.fontSize(10).fillColor('#1e293b').text(String(answer.selectedAnswer || 'No Answer'), { indent: 20, width: 480 });

                    if (answer.type === 'code-output') {
                        // Show correct answer for output predictions
                        doc.moveDown(0.3);
                        doc.x = 50;
                        doc.fontSize(10).fillColor('#10b981').text('Correct Answer:', { indent: 10, bold: true });

                        doc.x = 50;
                        doc.fontSize(10).fillColor('#10b981').text(String(answer.correctAnswer), { indent: 20 });
                    }
                } else if (answer.type === 'long-answer') {
                    // Long Answer Display
                    doc.x = 50;
                    doc.fontSize(10).fillColor('#475569').text('Your Essay:', { indent: 10, bold: true });

                    doc.x = 50;
                    doc.fontSize(10).fillColor('#1e293b').text(String(answer.selectedAnswer || 'No Answer'), { indent: 20, width: 480 });
                }

                doc.moveDown(0.3);

                // Explanation
                if (answer.explanation) {
                    doc.fontSize(9).fillColor('#6b7280').text(`Explanation: ${answer.explanation}`, { indent: 10, width: 500 });
                }

                doc.moveDown();

                // Separator line
                doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
                doc.moveDown();
            });

            // Footer
            const pageCount = doc.bufferedPageRange();
            for (let i = 0; i < pageCount.count; i++) {
                doc.switchToPage(i);
                doc.fontSize(8).fillColor('#94a3b8').text(
                    `Page ${i + 1} of ${pageCount.count} | Generated by QuizMaster`,
                    50,
                    750,
                    { align: 'center' }
                );
            }

            // Finalize PDF
            doc.end();

            stream.on('finish', () => {
                resolve({ filename, filepath });
            });

            stream.on('error', (error) => {
                reject(error);
            });

        } catch (error) {
            reject(error);
        }
    });
};

/**
 * Get all quiz reports
 */
export const getReportsList = () => {
    const reportsDir = path.join(process.cwd(), 'reports');

    if (!fs.existsSync(reportsDir)) {
        return [];
    }

    const files = fs.readdirSync(reportsDir);

    return files
        .filter(file => file.endsWith('.pdf'))
        .map(file => {
            const stats = fs.statSync(path.join(reportsDir, file));
            return {
                filename: file,
                size: stats.size,
                createdAt: stats.birthtime
            };
        })
        .sort((a, b) => b.createdAt - a.createdAt);
};

/**
 * Delete old reports (older than 30 days)
 */
export const cleanOldReports = () => {
    const reportsDir = path.join(process.cwd(), 'reports');

    if (!fs.existsSync(reportsDir)) {
        return;
    }

    const files = fs.readdirSync(reportsDir);
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);

    files.forEach(file => {
        const filepath = path.join(reportsDir, file);
        const stats = fs.statSync(filepath);

        if (stats.birthtime.getTime() < thirtyDaysAgo) {
            fs.unlinkSync(filepath);
        }
    });
};
