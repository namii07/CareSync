const mongoose = require('mongoose');

const AccessTokenSchema = new mongoose.Schema({
    recordId: { type: mongoose.Schema.Types.ObjectId, ref: 'Record', required: true },
    token: { type: String, required: true, unique: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' }, // Optional if anonymous link
    expiry: { type: Date, required: true },
}, { timestamps: true });

module.exports = mongoose.models.AccessToken || mongoose.model('AccessToken', AccessTokenSchema);
