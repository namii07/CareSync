const crypto = require('crypto');
const { roleMiddleware } = require('../../middleware/auth');
const connectToDatabase = require('../../lib/db');
const Record = require('../../models/Record');
const AccessToken = require('../../models/AccessToken');

const handler = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        await connectToDatabase();

        const { recordId, expiresInHours } = req.body;

        if (!recordId || !expiresInHours) {
            return res.status(400).json({ error: 'Please provide recordId and expiresInHours' });
        }

        // Verify ownership
        const record = await Record.findById(recordId);
        if (!record || record.patientId.toString() !== req.user.id) {
            return res.status(404).json({ error: 'Record not found or access denied' });
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expiry = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

        const access = await AccessToken.create({
            recordId,
            token,
            expiry
        });

        res.status(201).json({
            message: 'Access link generated',
            token: access.token,
            expiry: access.expiry
            // Client will build the URL e.g. /access/xxxxxxxxxx
        });

    } catch (error) {
        console.error('Generate access error:', error);
        res.status(500).json({ error: 'Server error generating access link' });
    }
};

module.exports = roleMiddleware(['patient'])(handler);
