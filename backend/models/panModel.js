const mongoose = require('mongoose');

const panSchema = new mongoose.Schema({
    name: { type: String, required: true },
    fileLink: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Pan', panSchema);