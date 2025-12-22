import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import { getReportsList } from '../utils/pdfGenerator.js';
import path from 'path';
import fs from 'fs';

const router = express.Router();

/**
 * @route   GET /api/submissions
 * @desc    Get all quiz submissions (Admin only)
 * @access  Private/Admin
 */
router.get('/', protect, admin, async (req, res) => {
    try {
        const reports = getReportsList();

        res.json({
            success: true,
            count: reports.length,
            submissions: reports
        });
    } catch (error) {
        console.error('Get submissions error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

/**
 * @route   GET /api/submissions/download/:filename
 * @desc    Download PDF report (Admin only)
 * @access  Private/Admin
 */
router.get('/download/:filename', protect, admin, (req, res) => {
    try {
        const filename = req.params.filename;
        const filepath = path.join(process.cwd(), 'reports', filename);

        // Check if file exists
        if (!fs.existsSync(filepath)) {
            return res.status(404).json({ message: 'Report not found' });
        }

        // Set headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        // Stream file
        const fileStream = fs.createReadStream(filepath);
        fileStream.pipe(res);
    } catch (error) {
        console.error('Download report error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

/**
 * @route   GET /api/submissions/view/:filename
 * @desc    View PDF report in browser (Admin only)
 * @access  Private/Admin
 */
router.get('/view/:filename', protect, admin, (req, res) => {
    try {
        const filename = req.params.filename;
        const filepath = path.join(process.cwd(), 'reports', filename);

        // Check if file exists
        if (!fs.existsSync(filepath)) {
            return res.status(404).json({ message: 'Report not found' });
        }

        // Set headers for viewing in browser
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${filename}"`);

        // Stream file
        const fileStream = fs.createReadStream(filepath);
        fileStream.pipe(res);
    } catch (error) {
        console.error('View report error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

export default router;
