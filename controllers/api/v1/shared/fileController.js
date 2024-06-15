const cloudinary = require('cloudinary').v2;
const { User, CrewData, Business } = require('../../../../models/api/v1/User');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadImage = async (req, res, next) => {
    try {
        const { userId, imageType, dataType } = req.body;

        if (!userId || !imageType || !dataType) {
            throw new Error('User ID, Image Type, and Data Type are required');
        }

        // check if user exists
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // validate image type
        if (!['image/png', 'image/jpeg', 'image/webp'].includes(req.file.mimetype)) {
            throw new Error('Only PNG, JPEG, and WEBP files are allowed');
        }

        // upload image to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, { folder: 'user-images' });

        // extract URL from Cloudinary response
        const imageUrl = result.secure_url;

        if (dataType === 'crew') {
            // update the appropriate field in crewData with the URL of the uploaded image
            const crewData = user.crewData ? await CrewData.findById(user.crewData) : null;
            if (crewData) {
                if (imageType === 'profile') {
                    crewData.basicInfo.profileImage = imageUrl;
                } else if (imageType === 'banner') {
                    crewData.basicInfo.bannerImage = imageUrl;
                }
                await crewData.save();
            } else {
                // create new crewData if it doesn't exist
                const newCrewData = new CrewData({
                    basicInfo: { [imageType === 'profile' ? 'profileImage' : 'bannerImage']: imageUrl },
                });
                await newCrewData.save();
                user.crewData = newCrewData._id;
                await user.save();
            }
        } else if (dataType === 'business') {
            // update the appropriate field in businessData with the URL of the uploaded image
            const businessData = user.businessData ? await Business.findById(user.businessData) : null;
            if (businessData) {
                if (imageType === 'profile') {
                    businessData.businessInfo.logo = imageUrl;
                } else if (imageType === 'banner') {
                    businessData.businessInfo.bannerImage = imageUrl;
                }
                await businessData.save();
            } else {
                // create new businessData if it doesn't exist
                const newBusinessData = new Business({
                    businessInfo: { 
                        companyName: user.username, // or another suitable default value
                        [imageType === 'profile' ? 'logo' : 'bannerImage']: imageUrl 
                    },
                });
                await newBusinessData.save();
                user.businessData = newBusinessData._id;
                await user.save();
            }
        } else {
            throw new Error('Invalid data type');
        }

        // if file is uploaded, return response
        res.json({ imageUrl });
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

        // upload file to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, { folder: 'user-files' });

        // extract URL from Cloudinary response
        const fileUrl = result.secure_url;

        // update or create crewData with URL of uploaded file
        if (user.crewData) {
            const crewData = await CrewData.findById(user.crewData);
            if (crewData) {
                crewData.careerDetails.certificationsLicenses = fileUrl;
                await crewData.save();
            }
        } else {
            const newCrewData = new CrewData({
                careerDetails: { certificationsLicenses: fileUrl },
            });
            await newCrewData.save();
            user.crewData = newCrewData._id;
            await user.save();
        }

        // if file is uploaded, return response
        res.json({ fileUrl });
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
