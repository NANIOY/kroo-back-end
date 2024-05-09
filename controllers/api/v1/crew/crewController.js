const { CrewData, User } = require('../../../../models/api/v1/User');
const { CustomError } = require('../../../../middlewares/errorHandler');

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

// create or update crew data by user ID
const createCrewData = async (req, res, next) => {
    try {

        const { userId, basicInfo, profileDetails, careerDetails, connectivity, userUrl, googleCalendar } = req.body;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (userUrl) {
            const updatedUserUrl = `kroo.site/user/${userUrl}`;
            user.userUrl = updatedUserUrl;
        }

        let crewData;
        if (user.crewData) {
            const crewData = await CrewData.findById(user.crewData);
            if (!crewData) {
                throw new CustomError('Crew Data not found', 404);
            }
            crewData.basicInfo = { ...crewData.basicInfo, ...basicInfo };
            crewData.profileDetails = { ...crewData.profileDetails, ...profileDetails };
            crewData.careerDetails = { ...crewData.careerDetails, ...careerDetails };
            crewData.connectivity = { ...crewData.connectivity, ...connectivity };
            crewData.googleCalendar = { ...crewData.googleCalendar, ...googleCalendar };
            await crewData.save();
        } else {
            const newCrewData = new CrewData({ basicInfo, profileDetails, careerDetails, connectivity, googleCalendar });
            await newCrewData.save();
            user.crewData = newCrewData._id;
        }

        await user.save();
        res.status(201).json({ message: 'Crew data created or updated successfully', data: { crewData: user.crewData } });
    } catch (error) {
        console.error("Error in createCrewData:", error);
        next(error);
    }
};

// update crew data by user ID
const updateCrewData = async (req, res, next) => {
    const { userId, basicInfo, profileDetails, careerDetails, connectivity, googleCalendar } = req.body;

    if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    try {
        const user = await User.findById(userId);
        if (!user || !user.crewData) {
            return res.status(404).json({ message: 'User or associated Crew Data not found' });
        }

        const updatedCrewData = await CrewData.findByIdAndUpdate(
            user.crewData,
            {
                basicInfo,
                profileDetails,
                careerDetails,
                connectivity,
                googleCalendar
            },
            { new: true }
        );

        res.status(200).json({ message: 'Crew data updated successfully', data: updatedCrewData });
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

// upload image
const handleImageUpload = async (req, res, next) => {
    try {
        console.log('Request body:', req.body);
        console.log('Request file:', req.file);

        if (!req.file) {
            throw new CustomError('No image file provided', 400);
        }

        res.status(200).json({
            message: 'Image uploaded successfully',
            filename: req.file.originalname,
            size: req.file.size
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllCrewData,
    getCrewData,
    createCrewData,
    updateCrewData,
    deleteCrewData,
    handleImageUpload
};