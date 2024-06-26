const Business = require('../../../../models/api/v1/Business');
const { sendEmailToEmployees } = require('../shared/mailController');
const { User } = require('../../../../models/api/v1/User');
const { sendJoinRequest } = require('../shared/mailController');
const { CustomError } = require('../../../../middlewares/errorHandler');

// function to validate email format
function isValidEmail(email) {
    // regular expression for basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// function to validate URL format
function isValidURL(url) {
    // regular expression for basic URL validation
    const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
    return urlRegex.test(url);
}

// get all businesses
const getAllBusinesses = async (req, res, next) => {
    try {
        const businesses = await Business.find();
        res.status(200).json({ message: 'Businesses fetched successfully', data: { businesses } });
    } catch (error) {
        next(error);
    }
};

// get business by ID
const getBusinessById = async (req, res, next) => {
    try {
        const businessId = req.params.id;
        if (!businessId) {
            throw new CustomError('Business ID is required', 400);
        }
        const business = await Business.findById(businessId);
        if (!business) {
            throw new CustomError('Business not found', 404);
        }
        res.status(200).json({ message: 'Business fetched successfully', data: { business: { name: business.name, ...business._doc } } });
    } catch (error) {
        next(error);
    }
};

// create new business
const createBusiness = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const user = await User.findById(userId);

        if (!user) {
            throw new CustomError('User not found', 404);
        }

        if (!user.roles.includes('business')) {
            user.roles.push('business');
        }

        const existingBusiness = await Business.findOne({ name: req.body.businessInfo.companyName });
        if (existingBusiness) {
            await sendJoinRequest(existingBusiness);
            throw new CustomError('Company name already exists. Join request sent to the existing business.', 400);
        }

        // const numberOfEmployees = req.body.invitedEmployees.length;
        // if (numberOfEmployees > req.body.paymentInfo.numberOfUsers) {
        //     throw new CustomError('Number of invited employees exceeds the allowed limit', 400);
        // }

        if (!isValidEmail(req.body.businessInfo.companyEmail)) {
            throw new CustomError('Invalid email format', 400);
        }

        if (req.body.connectivity.customUrl) {
            req.body.connectivity.customUrl = `kroo.site/business/${req.body.connectivity.customUrl}`;
        } else {
            const businessName = req.body.name.trim().toLowerCase().replace(/\s+/g, '-');
            req.body.connectivity.customUrl = `kroo.site/business/${businessName}`;
        }

        let business;
        if (user.businessData) {
            // update existing business
            business = await Business.findById(user.businessData);
            if (!business) {
                throw new CustomError('Linked business not found', 404);
            }

            // preserve existing fields and merge with new data
            const updatedBusinessInfo = {
                ...business.businessInfo.toObject(),
                ...req.body.businessInfo
            };

            business.set({
                ...req.body,
                businessInfo: updatedBusinessInfo
            });

            await business.save();
            res.status(200).json({ message: 'Business updated successfully', data: { business } });
        } else {
            business = new Business(req.body);
            await business.save();
            user.businessData = business._id;
            await user.save();
            res.status(201).json({ message: 'Business created successfully', data: { business } });
        }
    } catch (error) {
        next(error);
    }
};

// request to join existing business
const joinBusiness = async (req, res, next) => {
    try {
        if (!req.user || !req.user.userId) {
            throw new CustomError('User not authenticated', 401);
        }

        const userId = req.user.userId;
        const user = await User.findById(userId).populate('businessData');
        if (!user) {
            throw new CustomError('User not found', 404);
        }
        if (user.businessData) {
            throw new CustomError('User already has a linked business', 400);
        }

        const businessId = req.query.businessId;
        if (!businessId) {
            throw new CustomError('Business ID is required', 400);
        }
        const business = await Business.findById(businessId);
        if (!business) {
            throw new CustomError('Business not found', 404);
        }

        // await sendJoinRequest(business);
        res.status(200).json({ message: 'Join request sent successfully' });
    } catch (error) {
        next(error);
    }
};

const updateBusiness = async (req, res, next) => {
    try {
        const businessId = req.params.id;
        const updates = req.body;
        if (!businessId) {
            throw new CustomError('Business ID is required', 400);
        }
        let business = await Business.findById(businessId);
        if (!business) {
            throw new CustomError('Business not found', 404);
        }
        if (updates.name && updates.name !== business.name) {
            const existingName = await Business.findOne({ name: updates.name });
            if (existingName) {
                throw new CustomError('Business name already exists', 400);
            }
        }
        if (updates.businessInfo && updates.businessInfo.companyEmail &&
            updates.businessInfo.companyEmail !== business.businessInfo.companyEmail) {
            const existingEmail = await Business.findOne({ 'businessInfo.companyEmail': updates.businessInfo.companyEmail });
            if (existingEmail) {
                throw new CustomError('Email already exists', 400);
            }
        }
        Object.keys(updates).forEach(key => {
            if (key !== '_id') {
                business[key] = updates[key];
            }
        });
        await business.save();
        res.status(200).json({ message: 'Business updated successfully', data: { business } });
    } catch (error) {
        next(error);
    }
};

const deleteBusiness = async (req, res, next) => {
    try {
        const businessId = req.params.id;
        if (!businessId) {
            throw new CustomError('Business ID is required', 400);
        }
        const deletedBusiness = await Business.findByIdAndDelete(businessId);
        if (!deletedBusiness) {
            throw new CustomError('Business not found', 404);
        }
        const linkedUser = await User.findOneAndUpdate(
            { businessData: businessId },
            { $unset: { businessData: 1 } },
            { new: true }
        );
        if (!linkedUser) {
            throw new CustomError('User not found', 404);
        }
        res.status(200).json({ message: 'Business deleted successfully' });
    } catch (error) {
        if (error.name === 'CastError') {
            next(new CustomError('Invalid business ID format', 400));
        } else {
            next(error);
        }
    }
};

module.exports = {
    getAllBusinesses,
    getBusinessById,
    createBusiness,
    joinBusiness,
    updateBusiness,
    deleteBusiness
};