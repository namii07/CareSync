const { authMiddleware } = require('../../middleware/auth');
const connectToDatabase = require('../../lib/db');
const Record = require('../../models/Record');

const handler = async (req, res) => {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { id } = req.query; // in Vercel API routes, path params go to req.query
        await connectToDatabase();

        const record = await Record.findById(id).populate('patientId', 'name email');

        if (!record) {
            return res.status(404).json({ error: 'Record not found' });
        }

        if (req.user.role === 'patient') {
            if (record.patientId._id.toString() !== req.user.id) {
                return res.status(403).json({ error: 'Access denied' });
            }
            return res.status(200).json(record);
        }

        return res.status(403).json({ error: 'Wait, doctors should access via access tokens. Use /api/access/[token]' });

    } catch (error) {
        console.error('Fetch record error:', error);
        res.status(500).json({ error: 'Server error fetching record' });
    }
};

module.exports = authMiddleware(handler);
