const mongoose = require('mongoose');

const chequeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    fileLink: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Cheque', chequeSchema);