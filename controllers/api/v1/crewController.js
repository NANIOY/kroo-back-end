const { CrewData, User } = require('../../../models/api/v1/User');

// create crew data by user ID
const createCrewData = async (req, res) => {
    try {
        const { userId, basicInfo, profileDetails, careerDetails, connectivity } = req.body;

        // check if user ID is provided
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        // check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // check if user already has crewData assigned
        if (user.crewData) {
            return res.status(400).json({ message: 'User already has crewData assigned. Use PATCH or PUT to update.' });
        }

        // verify if careerDetails exists and is an object
        if (!careerDetails || typeof careerDetails !== 'object') {
            return res.status(400).json({ message: 'Career details are required and must be an object' });
        }

        // verify if portfolioWork exists and is an array
        if (!careerDetails.portfolioWork || !Array.isArray(careerDetails.portfolioWork)) {
            return res.status(400).json({ message: 'Portfolio work must be an array' });
        }

        // iterate over portfolioWork array
        for (const work of careerDetails.portfolioWork) {
            // check if each work item is an object
            if (typeof work !== 'object') {
                return res.status(400).json({ message: 'Each portfolio work item must be an object' });
            }

            // check if each work item has required properties
            if (!work.title || !work.type) {
                return res.status(400).json({ message: 'Each portfolio work item must have title and type' });
            }
        }

        // create new crew data
        const newCrewData = new CrewData({
            basicInfo,
            profileDetails,
            careerDetails,
            connectivity
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

// delete crew data by ID
const deleteCrewData = async (req, res) => {
    try {
        const { userId } = req.body;

        // check if user ID is provided
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        // check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // check if user has crewData assigned
        if (!user.crewData) {
            return res.status(404).json({ message: 'No crewData found for the user' });
        }

        // delete crewData by ID
        await CrewData.findByIdAndDelete(user.crewData);

        // remove crewData ID from user
        user.crewData = undefined;
        await user.save();

        res.status(200).json({ message: 'Crew data deleted successfully' });
    } catch (error) {
        console.error('Error deleting crew data:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = {
    createCrewData,
    deleteCrewData
};