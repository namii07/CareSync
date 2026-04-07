const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');

const register = async (req, res) => {
    try {
        const { name, email, password, role, specialization } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Please provide all required fields' });
        }

        const finalRole = role === 'doctor' ? 'doctor' : 'patient';
        const Model = finalRole === 'doctor' ? Doctor : Patient;

        if (await Model.findOne({ email })) {
            return res.status(400).json({ error: 'User already exists' });
        }

        if (finalRole === 'doctor' && !specialization) {
            return res.status(400).json({ error: 'Doctor requires a specialization' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userData = { name, email, password: hashedPassword, role: finalRole };
        if (finalRole === 'doctor') userData.specialization = specialization;

        const newUser = await Model.create(userData);
        res.status(201).json({
            message: 'User registered successfully',
            user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Server error during registration' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password, role } = req.body;
        if (!email || !password || !role) {
            return res.status(400).json({ error: 'Please provide email, password, and role' });
        }

        const Model = role === 'doctor' ? Doctor : Patient;
        const user = await Model.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
};

module.exports = { register, login };
