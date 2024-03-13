const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../../../models/api/v1/User');

// function to handle user login
const login = async (req, res) => {
    try {
        const { email, password, rememberMe } = req.body;

        // check if email and password are provided
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // check if user with provided email exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // check if password is correct
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        // generate regular session token
        const sessionToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // generate long-lived token if rememberMe is true
        let rememberMeToken = null;
        if (rememberMe) {
            rememberMeToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '365d' });
        }

        res.status(200).json({ message: 'Login successful', data: { sessionToken, rememberMeToken } });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = {
    login
};