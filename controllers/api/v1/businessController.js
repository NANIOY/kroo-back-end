const Business = require('../../../models/api/v1/Business');

// create new business
const createBusiness = async (req, res) => {
    try {
        // create new business instance
        const newBusiness = new Business(req.body);

        // save new business to database
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
