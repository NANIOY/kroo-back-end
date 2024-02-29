const Business = require('../../../models/api/v1/Business');
const { sendEmailToEmployees } = require('./mailController');

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
const getAllBusinesses = async (req, res) => {
    try {
        // fetch all businesses
        const businesses = await Business.find();

        res.status(200).json({ message: 'Businesses fetched successfully', data: { businesses } });
    } catch (error) {
        console.error('Error fetching businesses:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// get business by ID
const getBusinessById = async (req, res) => {
    try {
        const businessId = req.params.id;

        // check if business ID is provided
        if (!businessId) {
            return res.status(400).json({ message: 'Business ID is required' });
        }

        // fetch business by ID
        const business = await Business.findById(businessId);

        // check if business with provided ID exists
        if (!business) {
            return res.status(404).json({ message: 'Business not found' });
        }

        res.status(200).json({ message: 'Business fetched successfully', data: { business: { name: business.name, ...business._doc } } });
    } catch (error) {
        console.error('Error fetching business by ID:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// create new business
const createBusiness = async (req, res) => {
    try {
        // check if the company name already exists
        const existingBusiness = await Business.findOne({ name: req.body.name });
        if (existingBusiness) {
            return res.status(400).json({ message: 'Company name already exists' });
        }
        // create a new business instance
        const newBusiness = new Business(req.body);

        // check if the number of invited employees exceeds the allowed limit
        const numberOfEmployees = req.body.invitedEmployees.length;
        if (numberOfEmployees > newBusiness.paymentInfo.numberOfUsers) {
            return res.status(400).json({ message: 'Number of invited employees exceeds the allowed limit' });
        }

        // validate email format
        if (!isValidEmail(req.body.businessInfo.companyEmail)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        // validate URL format for each extra website
        const extraWebsites = req.body.connectivity.extraWebsites || [];
        for (const website of extraWebsites) {
            if (!isValidURL(website.url)) {
                return res.status(400).json({ message: 'Invalid URL format' });
            }
        }

        // set maximum portfolio projects to 20
        const maxPortfolioProjects = 20;
        if (req.body.showProjects.portfolioWork.length > maxPortfolioProjects) {
            return res.status(400).json({ message: `Maximum allowed number of portfolio projects exceeded (${maxPortfolioProjects})` });
        }

        // save the new business to the database
        await newBusiness.save();

        // send email to invited employees
        await sendEmailToEmployees(req.body.invitedEmployees, newBusiness);

        res.status(201).json({ message: 'Business created successfully', data: { business: newBusiness } });
    } catch (error) {
        console.error('error creating business:', error);
        if (error.name === 'ValidationError') {
            // handle validation errors
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// update business
const updateBusiness = async (req, res) => {
    try {
        const businessId = req.params.id;
        const updates = req.body;

        // check if business ID is provided
        if (!businessId) {
            return res.status(400).json({ message: 'Business ID is required' });
        }

        // find business by ID
        let business = await Business.findById(businessId);
        if (!business) {
            return res.status(404).json({ message: 'Business not found' });
        }

         // check if updated business name already exists
         if (updates.name && updates.name !== business.name) {
            const existingName = await Business.findOne({ name: updates.name });
            if (existingName) {
                return res.status(400).json({ message: 'Business name already exists' });
            }
        }

        // check if updated email already exists
        if (updates.businessInfo && updates.businessInfo.companyEmail &&
            updates.businessInfo.companyEmail !== business.businessInfo.companyEmail) {
            const existingEmail = await Business.findOne({ 'businessInfo.companyEmail': updates.businessInfo.companyEmail });
            if (existingEmail) {
                return res.status(400).json({ message: 'Email already exists' });
            }
        }

        // Update business fields
        Object.keys(updates).forEach(key => {
            if (key !== '_id') {
                business[key] = updates[key];
            }
        });

        // save updated business
        await business.save();

        res.status(200).json({ message: 'Business updated successfully', data: { business } });
    } catch (error) {
        console.error('Error updating business:', error);
        if (error.name === 'ValidationError') {
            // handle validation errors
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// delete business
const deleteBusiness = async (req, res) => {
    try {
        const businessId = req.params.id;

        // check if business ID is provided
        if (!businessId) {
            return res.status(400).json({ message: 'Business ID is required' });
        }

        // find business by ID and delete it
        const deletedBusiness = await Business.findByIdAndDelete(businessId);

        if (!deletedBusiness) {
            return res.status(404).json({ message: 'Business not found' });
        }

        res.status(200).json({ message: 'Business deleted successfully'});
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid business ID format' });
        }
        console.error('Error deleting business:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

module.exports = {
    getAllBusinesses,
    getBusinessById,
    createBusiness,
    updateBusiness,
    deleteBusiness
};
