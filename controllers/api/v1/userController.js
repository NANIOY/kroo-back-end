const { User, CrewData } = require('../../../models/api/v1/User');

// get all users
const getAllUsers = async (req, res) => {
    try {
        // fetch all users
        const users = await User.find();

        res.status(200).json({ message: 'Users fetched successfully', data: { users } });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// get user by ID
const getUserById = async (req, res) => {
    try {
        const userId = req.params.id;

        // check if ID is valid
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        // fetch user by ID and populate CrewData
        const user = await User.findById(userId).populate('crewData');

        // check if user with provided ID exists
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User fetched successfully', data: { user } });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid user ID format' });
        }

        console.error('Error fetching user by ID:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// create new user
const createUser = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // check if all fields are provided
        if (!username || !email || !password || !role) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        // create new user
        const newUser = new User({ username, email, password, role });

        await newUser.save();

        res.status(201).json({ message: 'User created successfully', data: { user: newUser } });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// update user
const updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const updateData = req.body;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        // find user by ID and update it
        const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
            new: true,
            runValidators: true,
        });

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User updated successfully', data: { user: updatedUser } });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid user ID format' });
        }

        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// delete user
const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        // find user by ID and delete it
        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User deleted successfully', data: { user: deletedUser } });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid user ID format' });
        }

        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
};