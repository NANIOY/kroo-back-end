const bcrypt = require('bcrypt');
const User = require('../../../models/api/v1/User');

// handle user login
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // find the user by username
        const user = await User.findOne({ username });
        
        // check if the user exists
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // check if the password is valid
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (isPasswordValid) {
            // issue JWT token if credentials are valid
            const token = jwt.sign({ userId: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: '1h' });
            console.log('Generated Token:', token);
            res.json({ token });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = {
    login
};