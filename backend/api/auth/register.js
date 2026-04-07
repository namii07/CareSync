const bcrypt = require('bcryptjs');
const { corsMiddleware } = require('../../middleware/auth');
const connectToDatabase = require('../../lib/db');
const Patient = require('../../models/Patient');
const Doctor = require('../../models/Doctor');

const handler = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        await connectToDatabase();

        const { name, email, password, role, specialization } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Please provide all required fields' });
        }

        // Role must be 'patient' or 'doctor'
        const finalRole = role === 'doctor' ? 'doctor' : 'patient';

        let Model = finalRole === 'doctor' ? Doctor : Patient;

        const existingUser = await Model.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUserData = {
            name,
            email,
            password: hashedPassword,
            role: finalRole
        };

        if (finalRole === 'doctor') {
            if (!specialization) {
                return res.status(400).json({ error: 'Doctor requires a specialization' });
            }
            newUserData.specialization = specialization;
        }

        const newUser = await Model.create(newUserData);

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error during registration' });
    }
};

module.exports = corsMiddleware(handler);
