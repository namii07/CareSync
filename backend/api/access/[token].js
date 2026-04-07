const { authMiddleware, roleMiddleware } = require('../../middleware/auth');
const connectToDatabase = require('../../lib/db');
const AccessToken = require('../../models/AccessToken');
const Record = require('../../models/Record');

const handler = async (req, res) => {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { token } = req.query;
        await connectToDatabase();

        const access = await AccessToken.findOne({ token }).populate({
            path: 'recordId',
            populate: { path: 'patientId', select: 'name email' }
        });

        if (!access) {
            return res.status(404).json({ error: 'Invalid access link' });
        }

        if (new Date() > access.expiry) {
            return res.status(401).json({ error: 'Access link has expired' });
        }

        // Return the record details
        res.status(200).json({
            message: 'Access granted',
            record: access.recordId,
            expiry: access.expiry
        });

    } catch (error) {
        console.error('Fetch via token error:', error);
        res.status(500).json({ error: 'Server error retrieving via token' });
    }
};

// Doctors use tokens to view records securely
module.exports = roleMiddleware(['doctor'])(handler);
