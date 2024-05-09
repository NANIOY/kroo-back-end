const bcrypt = require('bcrypt');
const saltRounds = 12;
const jwt = require('jsonwebtoken');
const { User } = require('../../../../models/api/v1/User');
const { CustomError } = require('../../../../middlewares/errorHandler');

const hashPassword = async (password) => {
    return await bcrypt.hash(password, saltRounds);
}

// handle user login
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

        const sessionToken = jwt.sign(
            { userId: user._id, roles: user.roles },
            process.env.JWT_SECRET,
            { expiresIn: '4h' }
        );

        let rememberMeToken = null;
        if (rememberMe) {
            rememberMeToken = jwt.sign(
                { userId: user._id, roles: user.roles },
                process.env.JWT_SECRET,
                { expiresIn: '365d' }
            );
        }

        res.status(200).json({
            message: 'Login successful',
            data: {
                sessionToken,
                rememberMeToken,
                userId: user._id,
                roles: user.roles
            }
        });
    } catch (error) {
        next(error);
    }
};

// reset password
const resetPassword = async (req, res, next) => {
    try {
        const { token } = req.query;
        const { password, confirmPassword } = req.body;

        if (!password || !confirmPassword) {
            return res.status(400).json({ message: 'Both password and confirmPassword are required' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Password and confirmPassword do not match' });
        }

        const user = await User.findOne({ resetPasswordToken: token });
        if (!user) {
            return res.status(404).json({ message: 'User not found or invalid token' });
        }

        user.password = await hashPassword(password);
        user.resetPasswordToken = undefined;
        await user.save();

        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    hashPassword,
    login,
    resetPassword
};