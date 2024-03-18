const { CrewData, User } = require('../../../models/api/v1/User');
const { CustomError } = require('../../../middlewares/errorHandler');

// GET all crew data
const getAllCrewData = async (req, res, next) => {
    try {
        const crewData = await CrewData.find();
        res.status(200).json({ message: 'Crew Data fetched successfully', data: crewData });
    } catch (error) {
        next(error);
    }
};

// GET crew data by ID
const getCrewData = async (req, res, next) => {
    try {
        const crewDataId = req.params.id;

        if (!crewDataId) {
            throw new CustomError('Crew Data ID is required', 400);
        }

        const crewData = await CrewData.findById(crewDataId);

        if (!crewData) {
            throw new CustomError('Crew Data not found', 404);
        }

        res.status(200).json({ message: 'Crew Data fetched successfully', data: crewData });
    } catch (error) {
        next(error);
    }
};

// create crew data by user ID
const createCrewData = async (req, res, next) => {
    try {
        const { userId, basicInfo, profileDetails, careerDetails, connectivity } = req.body;

        if (!userId) {
            throw new CustomError('User ID is required', 400);
        }

        const user = await User.findById(userId);
        if (!user) {
            throw new CustomError('User not found', 404);
        }

        if (user.crewData) {
            throw new CustomError('User already has crewData assigned. Use PATCH or PUT to update.', 400);
        }

        if (!careerDetails || typeof careerDetails !== 'object') {
            throw new CustomError('Career details are required and must be an object', 400);
        }

        if (!careerDetails.portfolioWork || !Array.isArray(careerDetails.portfolioWork)) {
            throw new CustomError('Portfolio work must be an array', 400);
        }

        for (const work of careerDetails.portfolioWork) {
            if (typeof work !== 'object') {
                throw new CustomError('Each portfolio work item must be an object', 400);
            }

            if (!work.title || !work.type) {
                throw new CustomError('Each portfolio work item must have title and type', 400);
            }
        }

        const newCrewData = new CrewData({ basicInfo, profileDetails, careerDetails, connectivity });
        await newCrewData.save();

        user.crewData = newCrewData._id;
        await user.save();

        res.status(201).json({ message: 'Crew data created successfully', data: { crewData: newCrewData } });
    } catch (error) {
        next(error);
    }
};

// update crew data by user ID
const updateCrewData = async (req, res, next) => {
    try {
        const { userId, basicInfo, profileDetails, careerDetails, connectivity } = req.body;

        if (!userId) {
            throw new CustomError('User ID is required', 400);
        }

        const user = await User.findById(userId);
        if (!user) {
            throw new CustomError('User not found', 404);
        }

        if (!user.crewData) {
            throw new CustomError('No crewData found for the user', 404);
        }

        const updatedCrewData = await CrewData.findByIdAndUpdate(
            user.crewData,
            { basicInfo, profileDetails, careerDetails, connectivity },
            { new: true }
        );

        res.status(200).json({ message: 'Crew data updated successfully', data: { crewData: updatedCrewData } });
    } catch (error) {
        next(error);
    }
};

// delete crew data by ID
const deleteCrewData = async (req, res, next) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            throw new CustomError('User ID is required', 400);
        }

        const user = await User.findById(userId);
        if (!user) {
            throw new CustomError('User not found', 404);
        }

        if (!user.crewData) {
            throw new CustomError('No crewData found for the user', 404);
        }

        await CrewData.findByIdAndDelete(user.crewData);

        user.crewData = undefined;
        await user.save();

        res.status(200).json({ message: 'Crew data deleted successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllCrewData,
    getCrewData,
    createCrewData,
    updateCrewData,
    deleteCrewData
};
