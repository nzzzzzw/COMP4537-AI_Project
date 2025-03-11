const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// Endpoint to generate AI response
router.post('/generate-response', protect, async (req, res) => {
    try {
        const { answers } = req.body;
        
        // Simple response logic (to be replaced with actual AI implementation)
        let response = "Thank you for sharing. ";
        
        // Basic response generation based on answers
        if (answers.includes("Stressed")) {
            response += "I notice you're feeling stressed. Try taking deep breaths or going for a short walk.";
        } else if (answers.includes("Tired")) {
            response += "It sounds like you need some rest. Consider taking a short break or getting some fresh air.";
        } else if (answers.includes("Sad")) {
            response += "I'm sorry you're feeling down. Remember that it's okay to not be okay, and consider talking to someone you trust.";
        } else if (answers.includes("Happy")) {
            response += "I'm glad you're feeling good! Keep up whatever is working well for you.";
        }

        // Increment API calls for the user
        req.user.apiCalls += 1;
        await req.user.save();

        // Check API call limit
        if (req.user.apiCalls > 20) {
            return res.status(403).json({ 
                message: "You have exceeded the free API call limit"
            });
        }

        res.json({ reply: response });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;