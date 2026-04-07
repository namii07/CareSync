require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

app.use(cors());

app.use(express.json());

// Ensure DB is connected on every request (critical for Vercel serverless cold starts)
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        console.error('DB connection failed:', err.message);
        res.status(500).json({ error: 'Database connection failed' });
    }
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/records', require('./routes/records'));
app.use('/api/access', require('./routes/access'));

app.get('/', (req, res) => res.json({ status: 'CareSync API running' }));

// Local dev only
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    connectDB().then(() => {
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    }).catch(err => {
        console.error('Failed to connect to MongoDB:', err.message);
        process.exit(1);
    });
}

module.exports = app;
