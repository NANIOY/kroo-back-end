const { User, CrewData } = require('../../../models/api/v1/User');

// create new user
const createUser = async (req, res) => {
    try {
        const { username, email, password, role, crewData } = req.body;

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
        const newUser = new User({ username, email, password, role, crewData });

        // if user has a crew role, include crewData
        if (role === 'crew') {
            // check if crewData is provided
            if (!crewData) {
                return res.status(400).json({ message: 'Crew data not provided' });
            }

            // check if portfolio work types are valid
            const validTypes = ['Short Film', 'Feature Film', 'Documentary', 'Music Video', 'Commercial', 'Animation', 'Web Series', 'TV Show', 'Corporate Video', 'Experimental', 'Photography', 'Other'];
            for (const work of crewData.careerDetails.portfolioWork) {
                if (!validTypes.includes(work.type)) {
                    return res.status(400).json({ message: `Invalid portfolio work type: ${work.type}` });
                }
            }

            // create new crewData with portfolioWork
            const newCrewData = new CrewData(crewData);
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
