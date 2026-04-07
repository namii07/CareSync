const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const axios = require('axios');
const { protect, requireRole } = require('../middleware/auth');
const { getRecords, getRecordById } = require('../controllers/recordController');
const Record = require('../models/Record');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const upload = multer({ storage: multer.memoryStorage() });

const uploadToCloudinary = (buffer, mimetype) => {
    const resource_type = mimetype === 'application/pdf' ? 'raw' : 'image';
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: 'caresync_records', resource_type },
            (error, result) => (error ? reject(error) : resolve(result))
        );
        streamifier.createReadStream(buffer).pipe(stream);
    });
};

const router = express.Router();

router.post('/upload', protect, requireRole('patient'), upload.single('file'), async (req, res) => {
    try {
        const { type, title } = req.body;
        if (!type || !title || !req.file) {
            return res.status(400).json({ error: 'Please provide type, title, and a file' });
        }
        const result = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
        const newRecord = await Record.create({
            patientId: req.user.id,
            fileUrl: result.secure_url,
            mimeType: req.file.mimetype,
            type,
            title
        });
        res.status(201).json({ message: 'Record uploaded successfully', record: newRecord });
    } catch (error) {
        console.error('Upload error:', error.message || error);
        res.status(500).json({ error: error.message || 'Server error during file upload' });
    }
});

router.get('/', protect, getRecords);

// Proxy route: streams file from Cloudinary inline.
// Auth via ?token= query param because iframes cannot send Authorization headers.
router.get('/proxy/:recordId', async (req, res) => {
    try {
        const jwt = require('jsonwebtoken');
        const qToken = req.query.token;
        if (!qToken) return res.status(401).send('Authentication required');

        try { jwt.verify(qToken, process.env.JWT_SECRET); }
        catch { return res.status(401).send('Invalid or expired token'); }

        const record = await Record.findById(req.params.recordId);
        if (!record) return res.status(404).send('Record not found');

        let cloudRes;
        try {
            cloudRes = await axios.get(record.fileUrl, {
                responseType: 'stream',
                timeout: 15000,
            });
        } catch (fetchErr) {
            const status = fetchErr.response?.status;
            console.error('Cloudinary fetch failed:', status, record.fileUrl);
            // Return a friendly PDF error page instead of crashing
            res.setHeader('Content-Type', 'text/html');
            return res.status(200).send(`
                <html><body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#f8fafc">
                <div style="text-align:center;color:#64748b">
                    <div style="font-size:48px;margin-bottom:16px">📄</div>
                    <p style="font-size:18px;font-weight:600;color:#1e293b">File not available</p>
                    <p style="font-size:14px;margin-top:8px">This file may have been deleted from storage (HTTP ${status || 'error'}).</p>
                    <p style="font-size:13px;margin-top:4px">Please re-upload the document.</p>
                </div></body></html>
            `);
        }

        // Force correct content-type — Cloudinary raw uploads return application/octet-stream
        const mimeType = record.mimeType || 'application/pdf';
        res.setHeader('Content-Type', mimeType);
        res.setHeader('Content-Disposition', 'inline');
        res.setHeader('Cache-Control', 'private, max-age=3600');
        // Forward content-length if present so browser shows progress
        if (cloudRes.headers['content-length']) {
            res.setHeader('Content-Length', cloudRes.headers['content-length']);
        }
        cloudRes.data.pipe(res);
    } catch (error) {
        console.error('Proxy error:', error.message);
        res.status(500).send('Could not load file');
    }
});

router.get('/:id', protect, getRecordById);

// One-time migration: fix old PDF records saved with /image/upload/ URL
router.post('/fix-pdf-urls', protect, async (req, res) => {
    try {
        const records = await Record.find({ fileUrl: /\/image\/upload\// });
        let fixed = 0;
        for (const record of records) {
            if (record.fileUrl.toLowerCase().endsWith('.pdf')) {
                record.fileUrl = record.fileUrl.replace('/image/upload/', '/raw/upload/');
                await record.save();
                fixed++;
            }
        }
        res.json({ message: `Fixed ${fixed} PDF record(s)` });
    } catch (error) {
        res.status(500).json({ error: 'Migration failed' });
    }
});

module.exports = router;
