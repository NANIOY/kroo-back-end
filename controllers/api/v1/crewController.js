const { CrewData, User } = require('../../../models/api/v1/User');

// create crew data
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

        let crewData;

        // check if user already has associated CrewData
        if (user.crewData) {
            // update existing CrewData
            crewData = await CrewData.findByIdAndUpdate(
                user.crewData,
                { basicInfo, profileDetails, careerDetails, connectivity },
                { new: true } // return the updated document
            );
        } else {
            // create new CrewData
            crewData = new CrewData({
                basicInfo,
                profileDetails,
                careerDetails,
                connectivity
            });
            await crewData.save();
            // assign crewData ID to user
            user.crewData = crewData._id;
            await user.save();
        }

        res.status(201).json({ message: 'Crew data created/updated successfully', data: { crewData } });
    } catch (error) {
        console.error('Error creating/updating crew data:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = {
    createCrewData
};