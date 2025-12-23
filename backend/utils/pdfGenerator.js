import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

/**
 * Generate PDF report for quiz submission
 */
export const generateQuizReportPDF = async (submissionData) => {
    const { user, quiz, result, submittedAt } = submissionData;

    // Sanitize title for folder name
    const sanitizedTitle = quiz.title.replace(/[^a-z0-9]/gi, '_').substring(0, 50);
    const reportsDir = path.join(process.cwd(), 'reports', sanitizedTitle);

    if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
    }

    // Generate filename
    const timestamp = new Date().getTime();
    const sanitizedUser = user.name.replace(/[^a-z0-9]/gi, '_');
    const filename = `${sanitizedUser}-${timestamp}.pdf`;
    const filepath = path.join(reportsDir, filename);

    return new Promise((resolve, reject) => {
        try {
            // Create PDF document
            const doc = new PDFDocument({ margin: 50, bufferPages: true });
            const stream = fs.createWriteStream(filepath);

            doc.pipe(stream);
            // ... (rest of PDF generation is same, just filepath changed)

            // ... inside doc logic ...

            // Finalize PDF
            doc.end();

            stream.on('finish', () => {
                resolve({ filename, filepath, folder: sanitizedTitle });
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
 * Get all quiz reports (Recursive)
 */
export const getReportsList = () => {
    const reportsDir = path.join(process.cwd(), 'reports');

    if (!fs.existsSync(reportsDir)) {
        return [];
    }

    const getAllFiles = (dir, fileList = []) => {
        const files = fs.readdirSync(dir);

        files.forEach(file => {
            const filePath = path.join(dir, file);
            if (fs.statSync(filePath).isDirectory()) {
                getAllFiles(filePath, fileList);
            } else {
                if (file.endsWith('.pdf')) {
                    const stats = fs.statSync(filePath);
                    const relativePath = path.relative(reportsDir, filePath);
                    // reportDir/Quiz/File.pdf -> relative is Quiz/File.pdf

                    const parts = relativePath.split(path.sep);
                    const quizTitle = parts.length > 1 ? parts[0] : 'Uncategorized';

                    fileList.push({
                        filename: file, // Just filename
                        path: relativePath, // Full relative path for download
                        quizTitle: quizTitle,
                        size: stats.size,
                        createdAt: stats.birthtime
                    });
                }
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
