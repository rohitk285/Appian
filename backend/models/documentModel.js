const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    name: { type: String, required: true }, // Separate name field
    document_type: [{ type: String, required: true }], // Array to hold multiple document types
    named_entities: { 
        type: mongoose.Schema.Types.Mixed, 
        required: true,
        default: {} // Default to an empty object if no data is provided
    }
}, { 
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Adding an index for performance
documentSchema.index({ name: 1 });

module.exports = mongoose.model('Document', documentSchema);
