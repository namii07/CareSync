const { authMiddleware } = require('../../middleware/auth');
const connectToDatabase = require('../../lib/db');
const Record = require('../../models/Record');

const handler = async (req, res) => {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        await connectToDatabase();

        // Patients can see their own records.
        if (req.user.role === 'patient') {
            const records = await Record.find({ patientId: req.user.id }).sort({ uploadedAt: -1 });
            return res.status(200).json(records);
        }

        // For doctors, typically they access records via tokens, but if we want to list 
        // all records they have specific access to, we could query AccessToken table.
        // Assuming /api/records is mainly for patient dashboard.
        return res.status(403).json({ error: 'Please use access link flow to view records as doctor' });

    } catch (error) {
        console.error('Fetch records error:', error);
        res.status(500).json({ error: 'Server error fetching records' });
    }
};

module.exports = authMiddleware(handler);
