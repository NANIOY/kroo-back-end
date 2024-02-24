const { User, CrewData } = require('../../../models/api/v1/User');

// create new user
const createUser = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // check if all fields are provided
        if (!username || !email || !password || !role) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // create new user
        const newUser = new User({ username, email, password, role });

        // if user has a crew role, include crewData
        if (role === 'crew') {
            const { basicInfo, profileDetails, connectivity, portfolioWork } = req.body.crewData;

            // check if crewData is provided
            if (!basicInfo || !profileDetails || !connectivity || !portfolioWork) {
                return res.status(400).json({ message: 'Crew data not provided' });
            }

            // create new crewData with portfolioWork
            const newCrewData = new CrewData({ basicInfo, profileDetails, connectivity, portfolioWork });
            await newCrewData.save();

            // assign crewData ID to newUser.crewData
            newUser.crewData = newCrewData._id;
        }
        // if user has a business role, include businessData
        else if (role === 'business') {
            // COMING SOON
        }

        await newUser.save();

        // fetch crewData from database and update newUser
        if (role === 'crew') {
            newUser.crewData = await CrewData.findById(newUser.crewData);
        }

        res.status(201).json({ message: 'User created successfully', data: { user: newUser } });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = {
    createUser,
};
