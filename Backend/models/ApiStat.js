const mongoose = require('mongoose');

const apiStatSchema = new mongoose.Schema({
    method: {
        type: String,
        required: true,
        enum: ['GET', 'POST', 'PUT', 'DELETE']
    },
    endpoint: {
        type: String,
        required: true
    },
    requests: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

const ApiStat = mongoose.model('ApiStat', apiStatSchema);
module.exports = ApiStat;