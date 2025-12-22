import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * @route   POST /api/auth/google
 * @desc    Authenticate user with Google OAuth
 * @access  Public
 */
router.post('/google', async (req, res) => {
    try {
        const { credential } = req.body;

        // Verify Google token
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;

        // Allow any Gmail account
        // Removed domain restriction - any Gmail user can login

        // Find or create user
        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                email,
                name,
                googleId,
                picture,
                role: 'student' // Default role
            });
        } else {
            // Update user info if changed
            user.name = name;
            user.picture = picture;
            user.googleId = googleId;
            await user.save();
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                picture: user.picture,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Google auth error:', error);
        res.status(500).json({
            message: 'Authentication failed',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-__v');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                picture: user.picture,
                role: user.role,
                quizzesTaken: user.quizzesTaken
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(401).json({ message: 'Invalid token' });
    }
});

export default router;
