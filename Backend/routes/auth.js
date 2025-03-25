const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { protect, admin } = require('../middleware/authMiddleware');
const crypto = require('crypto');
const { sendResetPasswordEmail } = require('../utils/emailService');
const ApiStat = require('../models/ApiStat');

// Get all users (admin only)
router.get('/users', protect, admin, async (req, res) => {
    try {
        const users = await User.find({})
            .select('-password')
            .sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Register user
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            username,
            email,
            password
        });

        if (user) {
            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
                expiresIn: '30d'
            });

            res.cookie('jwt', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV !== 'development',
                sameSite: 'strict',
                maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
            });

            res.status(201).json({
                _id: user._id,
                username: user.username,
                email: user.email,
                isAdmin: user.isAdmin
            });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
                expiresIn: '30d'
            });

            res.cookie('jwt', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 30 * 24 * 60 * 60 * 1000
            });

            res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                isAdmin: user.isAdmin,
                apiCalls: user.apiCalls, 
                token: token 
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


router.post('/forgot-password', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        
        if (!user) {
            return res.status(200).json({ 
                message: 'If an account exists with this email, you will receive a password reset link' 
            });
        }

        // Generate reset token
        const resetToken = user.createResetPasswordToken();
        await user.save();

        // Create reset URL - replace hardcoded URL with environment variable
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

        // Send email
        try {
            await sendResetPasswordEmail(user.email, resetUrl);
            
            res.status(200).json({
                message: 'Password reset link has been sent to your email'
            });
        } catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();
            
            return res.status(500).json({
                message: 'Error sending reset password email'
            });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error processing request' });
    }
});

// Reset password route
router.put('/reset-password/:token', async (req, res) => {
    try {
        // Hash the token from params
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        // Find user with valid token
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        // Set new password
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error resetting password' });
    }
});

// Get API stats (admin only)
router.get('/api-stats', protect, admin, async (req, res) => {
    try {
        const stats = await ApiStat.find({})
            .sort({ requests: -1 });
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete user (admin only)
router.delete('/users/:id', protect, admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Prevent admin from deleting themselves
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'You cannot delete your own admin account' });
        }
        
        await User.deleteOne({ _id: req.params.id });
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: 'Error deleting user' });
    }
});

module.exports = router;
