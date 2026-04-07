const Record = require('../models/Record');

const getRecords = async (req, res) => {
    try {
        if (req.user.role !== 'patient') {
            return res.status(403).json({ error: 'Please use access link flow to view records as doctor' });
        }
        const records = await Record.find({ patientId: req.user.id }).sort({ uploadedAt: -1 });
        res.json(records);
    } catch (error) {
        console.error('Fetch records error:', error);
        res.status(500).json({ error: 'Server error fetching records' });
    }
};

const getRecordById = async (req, res) => {
    try {
        const record = await Record.findById(req.params.id).populate('patientId', 'name email');
        if (!record) return res.status(404).json({ error: 'Record not found' });

        if (req.user.role === 'patient' && record.patientId._id.toString() !== req.user.id.toString()) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json(record);
    } catch (error) {
        console.error('Fetch record error:', error);
        res.status(500).json({ error: 'Server error fetching record' });
    }
};

module.exports = { getRecords, getRecordById };
