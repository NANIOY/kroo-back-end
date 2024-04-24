const cloudinary = require('cloudinary').v2;
const { User } = require('../../../../models/api/v1/User');
const { getUserById } = require('./userController'); // import the getUserById function

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadImage = async (req, res, next) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            throw new Error('User ID is required');
        }

        // check if user exists
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // continue with upload process
        if (!['image/png', 'image/jpeg', 'image/webp'].includes(req.file.mimetype)) {
            throw new Error('Only PNG, JPEG, and WEBP files are allowed');
        }
        const result = await cloudinary.uploader.upload(req.file.path, { folder: 'user-images' });

        // if file is uploaded, return response
        res.json(result);
    } catch (error) {
        // return error if userId is missing, invalid, or user not found
        // or if file is not uploaded or not of allowed type
        console.error('Error uploading image:', error);
        res.status(500).json({ error: error.message });
    }
};

const uploadFile = async (req, res, next) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            throw new Error('User ID is required');
        }

        // check if user exists
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // continue with the upload process
        if (req.file.mimetype !== 'application/pdf') {
            throw new Error('Only PDF files are allowed');
        }
        const result = await cloudinary.uploader.upload(req.file.path, { folder: 'user-files' });

        // if file is uploaded, return response
        res.json(result);
    } catch (error) {
        // return error if userId is missing, invalid, or user not found
        // or if file is not uploaded or not of the allowed type
        console.error('Error uploading file:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    uploadImage,
    uploadFile
};
