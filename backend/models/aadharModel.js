const mongoose = require('mongoose');

const aadharSchema = new mongoose.Schema({
    name: { type: String, required: true },
    fileLink: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Aadhar', aadharSchema);