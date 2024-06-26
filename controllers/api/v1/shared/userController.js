const { User, CrewData } = require('../../../../models/api/v1/User');
const { CustomError } = require('../../../../middlewares/errorHandler');
const { hashPassword } = require('./authController');

// get all users
const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find();
        res.status(200).json({ message: 'Users fetched successfully', data: { users } });
    } catch (error) {
        next(error);
    }
};

// get user by ID
const getUserById = async (req, res, next) => {
    try {
        const userId = req.params.id;

        if (!userId) {
            throw new CustomError('User ID is required', 400);
        }

        const user = await User.findById(userId).populate('crewData');

        if (!user) {
            throw new CustomError('User not found', 404);
        }

        res.status(200).json({ message: 'User fetched successfully', data: { user } });
    } catch (error) {
        next(error);
    }
};


// create new user
const createUser = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // check if all fields are provided
        if (!username || !email || !password, !role) {
            return res.status(400).json({ message: 'Username, email, password, and role are required' });
        }

        // check if role is valid
        if (!['crew', 'business'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        // check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        // generate unique URL for user
        let userUrl = `${username.toLowerCase().replace(/\s/g, '-')}`;
        let counter = 1;
        while (await User.findOne({ userUrl })) {
            userUrl = `${username.toLowerCase().replace(/\s/g, '-')}-${counter}`;
            counter++;
        }

        // hash the password
        const hashedPassword = await hashPassword(password);

        // create new user with hashed password
        const newUser = new User({ username, email, password: hashedPassword, userUrl, roles: [role] });
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
            throw new CustomError('User ID is required', 400);
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
            new: true,
            runValidators: true,
        });

        if (!updatedUser) {
            throw new CustomError('User not found', 404);
        }

        res.status(200).json({ message: 'User updated successfully', data: { user: updatedUser } });
    } catch (error) {
        console.error('Error updating user:', error);

        if (error instanceof CustomError) {
            res.status(error.statusCode).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
};

// delete user
const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;

        if (!userId) {
            throw new CustomError('User ID is required', 400);
        }

        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            throw new CustomError('User not found', 404);
        }

        res.status(200).json({ message: 'User deleted successfully', data: { user: deletedUser } });
    } catch (error) {
        console.error('Error deleting user:', error);

        if (error instanceof CustomError) {
            res.status(error.statusCode).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
};

// get user data based on userUrl
const getUserData = async (req, res) => {
    try {
        const userUrl = req.params.userUrl;
        const user = await User.findOne({ userUrl }).populate('crewData');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    getUserData
};