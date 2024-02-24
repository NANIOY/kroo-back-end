const { CrewData, User } = require('../../../models/api/v1/User');

// create crew data
const createCrewData = async (req, res) => {
    try {
        const { userId, careerDetails } = req.body;

        // check if user ID is provided
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        // check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // verify if careerDetails exists and is an object
        if (!careerDetails || typeof careerDetails !== 'object') {
            return res.status(400).json({ message: 'Career details are required and must be an object' });
        }

        // create new crew data
        const newCrewData = new CrewData({
            careerDetails
        });
        await newCrewData.save();

        // assign crewData ID to user
        user.crewData = newCrewData._id;
        await user.save();

        res.status(201).json({ message: 'Crew data created successfully', data: { crewData: newCrewData } });
    } catch (error) {
        console.error('Error creating crew data:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = {
    createCrewData
};
