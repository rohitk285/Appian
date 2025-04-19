const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    name: { type: String, required: true }, 
    document_type: [{ type: String, required: true }], 
    named_entities: { 
        type: mongoose.Schema.Types.Mixed, 
        required: true,
        default: {}
    }
}, { 
    timestamps: true
});

documentSchema.index({ name: 1 });

module.exports = mongoose.model('Document', documentSchema);
