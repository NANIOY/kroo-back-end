const Business = require('../../../models/api/v1/Business');

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

        // save the new business to the database
        await newBusiness.save();

        res.status(201).json({ message: 'Business created successfully', data: { business: newBusiness } });
    } catch (error) {
        console.error('Error creating business:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = {
    createBusiness
};
