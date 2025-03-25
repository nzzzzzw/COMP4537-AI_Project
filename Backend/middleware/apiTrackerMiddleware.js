const ApiStat = require('../models/ApiStat');

const trackApiRequest = async (req, res, next) => {
    const method = req.method;
    const endpoint = req.originalUrl;
    
    try {
        // Only track API endpoints (not static files)
        if (endpoint.startsWith('/api/')) {
            // Update or create stats for this endpoint
            await ApiStat.findOneAndUpdate(
                { method, endpoint },
                { $inc: { requests: 1 } },
                { upsert: true, new: true }
            );
        }
    } catch (error) {
        console.error('API tracking error:', error);
        // Don't block the request if tracking fails
    }
    
    next();
};

module.exports = { trackApiRequest };