const crypto = require('crypto');
const Record = require('../models/Record');
const AccessToken = require('../models/AccessToken');

const generateAccess = async (req, res) => {
    try {
        const { recordId, expiresInHours = 24 } = req.body;
        if (!recordId) return res.status(400).json({ error: 'Please provide recordId' });

        const record = await Record.findById(recordId);
        if (!record || record.patientId.toString() !== req.user.id.toString()) {
            return res.status(404).json({ error: 'Record not found or access denied' });
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expiry = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

        const access = await AccessToken.create({ recordId, token, expiry });
        res.status(201).json({ message: 'Access link generated', token: access.token, expiry: access.expiry });
    } catch (error) {
        console.error('Generate access error:', error);
        res.status(500).json({ error: 'Server error generating access link' });
    }
};

const getByToken = async (req, res) => {
    try {
        if (req.user.role !== 'doctor') {
            return res.status(403).json({ error: 'Only doctors can access shared records' });
        }

        const access = await AccessToken.findOne({ token: req.params.token }).populate({
            path: 'recordId',
            populate: { path: 'patientId', select: 'name email' }
        });

        if (!access) return res.status(404).json({ error: 'Invalid access link' });
        if (new Date() > access.expiry) return res.status(410).json({ error: 'Access link has expired' });

        res.json({ message: 'Access granted', record: access.recordId, expiry: access.expiry });
    } catch (error) {
        console.error('Fetch via token error:', error);
        res.status(500).json({ error: 'Server error retrieving via token' });
    }
};

module.exports = { generateAccess, getByToken };
