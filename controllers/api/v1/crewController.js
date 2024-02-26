const { CrewData, User } = require('../../../models/api/v1/User');

// create or update crew data
const createOrUpdateCrewData = async (req, res) => {
    try {
        const { userId, basicInfo, profileDetails, careerDetails, connectivity } = req.body;

        // check if user ID is provided
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        // check if user exists
        let user = await User.findById(userId);
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

        // re-fetch the user to populate the crewData field
        user = await User.findById(userId).populate('crewData');

        res.status(200).json({ message: 'Crew data created/updated successfully', data: { user } });
    } catch (error) {
        console.error('Error creating/updating crew data:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const getCrewDataById = async (req, res) => {
    try {
        const crewDataId = req.params.id;

        // check if crew data ID is provided
        if (!crewDataId) {
            return res.status(400).json({ message: 'Crew Data ID is required' });
        }

        // fetch crew data by ID
        const crewData = await CrewData.findById(crewDataId);

        // check if crew data with provided ID exists
        if (!crewData) {
            return res.status(404).json({ message: 'Crew Data not found' });
        }

        res.status(200).json({ message: 'Crew Data fetched successfully', data: crewData });
    } catch (error) {
        console.error('Error fetching crew data by ID:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = {
    createOrUpdateCrewData,
    getCrewDataById
};
