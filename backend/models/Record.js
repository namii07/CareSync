const mongoose = require('mongoose');

const RecordSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    fileUrl: { type: String, required: true },
    mimeType: { type: String, default: 'application/pdf' },
    type: { type: String, required: true },
    title: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.models.Record || mongoose.model('Record', RecordSchema);
