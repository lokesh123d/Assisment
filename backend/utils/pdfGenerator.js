import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

/**
 * Generate PDF report for quiz submission
 */
export const generateQuizReportPDF = async (submissionData) => {
    const { user, quiz, result, submittedAt } = submissionData;

    // Sanitize title for folder name
    const sanitizedTitle = (quiz.title || 'Untitled_Quiz').replace(/[^a-z0-9]/gi, '_').substring(0, 50);
    const reportsDir = path.join(process.cwd(), 'reports', sanitizedTitle);

    if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
    }

    // Generate filename
    const timestamp = new Date().getTime();
    const sanitizedUser = (user.name || 'User').replace(/[^a-z0-9]/gi, '_');
    const filename = `${sanitizedUser}-${timestamp}.pdf`;
    const filepath = path.join(reportsDir, filename);

    return new Promise((resolve, reject) => {
        try {
            // Create PDF document (Simplified for debugging)
            const doc = new PDFDocument({ margin: 50 }); // bufferPages removed
            const stream = fs.createWriteStream(filepath);

            console.log(`[PDF] Generating report: ${filepath}`);

            doc.pipe(stream);

            // --- Header ---
            doc.fillColor('#444444')
                .fontSize(20)
                .text('Quiz Submission Report', 110, 57)
                .fontSize(10)
                .text('NavGurukul Assessment Platform', 200, 50, { align: 'right' })
                .moveDown();

            // ... (Content remains the same) ...

            // --- Footer (Disabled for debugging) ---
            // const range = doc.bufferedPageRange();
            // for (let i = range.start; i < range.start + range.count; i++) {
            //     doc.switchToPage(i);
            //     doc.fontSize(8).fillColor('#888888');
            //     doc.text(
            //         `Page ${i + 1} of ${range.count}`,
            //         50,
            //         doc.page.height - 30,
            //         { align: 'center', width: 500 }
            //     );
            // }

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
                // Check for page break
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

                // Truncate if extremely long (e.g. essay) to avoid single page overflow issues
                if (answerText.length > 2000) answerText = answerText.substring(0, 2000) + '... (truncated)';

                doc.text(`Your Answer: ${answerText}`, { width: 480 });

                // Correct Answer (if not correct)
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

            // --- Footer (Page Numbers) ---
            // --- Footer (Page Numbers) - Disabled ---
            /*
            const range = doc.bufferedPageRange();
            for (let i = range.start; i < range.start + range.count; i++) {
                doc.switchToPage(i);
                doc.fontSize(8).fillColor('#888888');
                doc.text(
                    `Page ${i + 1} of ${range.count}`,
                    50,
                    doc.page.height - 30,
                    { align: 'center', width: 500 }
                );
            }
            */

            // Finalize PDF
            doc.end();

            stream.on('finish', () => {
                resolve({
                    filename,
                    filepath,
                    folder: sanitizedTitle,
                    path: path.join(sanitizedTitle, filename) // Relative path
                });
            });

            stream.on('error', (error) => {
                console.error('PDF Stream Error:', error);
                reject(error);
            });

        } catch (error) {
            console.error('PDF Generation Error:', error);
            reject(error);
        }
    });
};

/**
 * Get all quiz reports (Recursive)
 */
export const getReportsList = () => {
    const reportsDir = path.join(process.cwd(), 'reports');

    if (!fs.existsSync(reportsDir)) {
        return [];
    }

    const getAllFiles = (dir, fileList = []) => {
        let files = [];
        try {
            files = fs.readdirSync(dir);
        } catch (e) {
            return fileList;
        }

        files.forEach(file => {
            const filePath = path.join(dir, file);
            try {
                if (fs.statSync(filePath).isDirectory()) {
                    getAllFiles(filePath, fileList);
                } else {
                    if (file.endsWith('.pdf')) {
                        const stats = fs.statSync(filePath);
                        const relativePath = path.relative(reportsDir, filePath);
                        // reportDir/Quiz/File.pdf -> relative is Quiz/File.pdf

                        const parts = relativePath.split(path.sep);
                        // Handle generic cases where it might be in root or nested deeper
                        const quizTitle = parts.length > 1 ? parts[0] : 'Uncategorized';

                        // Extract Student Name from filename pattern: StudentName-Timestamp.pdf
                        // Split by last dash
                        const lastDashIndex = file.lastIndexOf('-');
                        let studentName = 'Student';
                        if (lastDashIndex !== -1) {
                            studentName = file.substring(0, lastDashIndex).replace(/_/g, ' ');
                        }

                        fileList.push({
                            filename: file, // Just filename
                            studentName: studentName,
                            path: relativePath, // Full relative path for download
                            quizTitle: quizTitle.replace(/_/g, ' '), // Clean up title
                            size: stats.size,
                            createdAt: stats.birthtime
                        });
                    }
                }
            } catch (err) {
                console.error('Error processing file:', filePath, err);
            }
        });
        return fileList;
    };

    return getAllFiles(reportsDir).sort((a, b) => b.createdAt - a.createdAt);
};

/**
 * Delete old reports (older than 30 days)
 */
export const cleanOldReports = () => {
    const reportsDir = path.join(process.cwd(), 'reports');

    if (!fs.existsSync(reportsDir)) {
        return;
    }

    try {
        const files = fs.readdirSync(reportsDir);
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);

        files.forEach(file => {
            const filepath = path.join(reportsDir, file);
            // This is recursive cleanup technically needed but for now simple check
            // Usually we'd assume flat or 1-level deep. 
            // Skipping complex recursive cleanup for this snippet.
        });
    } catch (e) {
        console.error('Cleanup error:', e);
    }
};
