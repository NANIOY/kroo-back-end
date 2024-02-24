const Business = require('../../../models/api/v1/Business');

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

module.exports = {
    createBusiness
};
