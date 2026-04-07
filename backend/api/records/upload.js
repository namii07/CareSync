const { authMiddleware, roleMiddleware } = require('../../middleware/auth');
const connectToDatabase = require('../../lib/db');
const Record = require('../../models/Record');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const handler = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        await connectToDatabase();

        const { type, title, fileBase64 } = req.body;

        if (!type || !title || !fileBase64) {
            return res.status(400).json({ error: 'Please provide type, title, and file data' });
        }

        // Upload to Cloudinary using Data URI Base64
        const uploadResponse = await cloudinary.uploader.upload(fileBase64, {
            folder: 'caresync_records',
            resource_type: 'auto'
        });

        const newRecord = await Record.create({
            patientId: req.user.id,
            fileUrl: uploadResponse.secure_url,
            type,
            title
        });

        res.status(201).json({
            message: 'Record uploaded successfully',
            record: newRecord
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Server error during file upload' });
    }
};

module.exports = roleMiddleware(['patient'])(handler);
