const mongoose = require('mongoose');

const creditCardSchema = new mongoose.Schema({
    name: { type: String, required: true },
    fileLink: { type: String, required: true },
}, { timestamps: true }); // Adds createdAt and updatedAt fields automatically

module.exports = mongoose.model('CreditCard', creditCardSchema);