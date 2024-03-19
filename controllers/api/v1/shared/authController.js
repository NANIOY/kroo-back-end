const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../../../../models/api/v1/User');
const { CustomError } = require('../../../../middlewares/errorHandler');

// function to handle user login
const login = async (req, res, next) => {
    try {
        const { email, password, rememberMe } = req.body;

        if (!email || !password) {
            throw new CustomError('Email and password are required', 400);
        }

        const user = await User.findOne({ email });
        if (!user) {
            throw new CustomError('User not found', 404);
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new CustomError('Invalid password', 401);
        }

        const sessionToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        let rememberMeToken = null;
        if (rememberMe) {
            rememberMeToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '365d' });
        }

        res.status(200).json({ message: 'Login successful', data: { sessionToken, rememberMeToken } });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    login
};