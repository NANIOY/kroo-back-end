const cloudinary = require('cloudinary').v2;
const { ObjectId } = require('mongoose').Types;
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
            let crewData = user.crewData ? await CrewData.findById(user.crewData) : null;
            if (crewData) {
                if (imageType === 'profile') {
                    crewData.basicInfo.profileImage = imageUrl;
                } else if (imageType === 'banner') {
                    crewData.basicInfo.bannerImage = imageUrl;
                }
                await crewData.save();
            } else {
                // create new crewData if it doesn't exist
                crewData = new CrewData({
                    basicInfo: { [imageType === 'profile' ? 'profileImage' : 'bannerImage']: imageUrl },
                });
                await crewData.save();
                user.crewData = crewData._id;
                await user.save();
            }
        } else if (dataType === 'business') {
            // update the appropriate field in businessData with the URL of the uploaded image
            let businessData = user.businessData ? await Business.findById(user.businessData) : null;
            if (businessData) {
                if (imageType === 'profile') {
                    businessData.businessInfo.logo = imageUrl;
                } else if (imageType === 'banner') {
                    businessData.businessInfo.bannerImage = imageUrl;
                }
                await businessData.save();
            } else {
                // create new businessData if it doesn't exist
                businessData = new Business({
                    businessInfo: {
                        companyName: user.username, // or another suitable default value
                        [imageType === 'profile' ? 'logo' : 'bannerImage']: imageUrl,
                    },
                });
                await businessData.save();
                user.businessData = businessData._id;
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
        const { userId, portfolioTitle, portfolioType } = req.body;

        if (!userId) {
            throw new Error('User ID is required');
        }

        // check if user exists
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        if (!req.file) {
            throw new Error('No file provided');
        }

        // validate file type
        const validMimeTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml', 'video/mp4'];
        if (!validMimeTypes.includes(req.file.mimetype)) {
            throw new Error('Only PNG, JPEG, WEBP, GIF, SVG, and MP4 files are allowed');
        }

        // upload file to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, { folder: 'portfolio-work' });

        // extract URL from Cloudinary response
        const fileUrl = result.secure_url;

        // update or create crewData with URL of uploaded file
        let crewData = user.crewData ? await CrewData.findById(user.crewData) : null;
        if (crewData) {
            crewData.careerDetails.portfolioWork.push({ title: portfolioTitle, type: portfolioType, url: fileUrl });
            await crewData.save();
        } else {
            crewData = new CrewData({
                careerDetails: { portfolioWork: [{ title: portfolioTitle, type: portfolioType, url: fileUrl }] },
            });
            await crewData.save();
            user.crewData = crewData._id;
            await user.save();
        }

        res.json({ message: 'Portfolio work uploaded successfully', fileUrl });
    } catch (error) {
        console.error('Error uploading portfolio work:', error);
        res.status(500).json({ error: error.message });
    }
};

const uploadPortfolio = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { portfolioTitle, portfolioType } = req.body;

        if (!userId) {
            throw new Error('User ID is required');
        }

        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        if (!req.file) {
            throw new Error('No file provided');
        }

        // validate file type
        const validMimeTypes = [
            'image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml',
            'video/mp4', 'video/webm', 'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/wave', 'audio/ogg'
        ];
        if (!validMimeTypes.includes(req.file.mimetype)) {
            throw new Error('Only PNG, JPEG, WEBP, GIF, SVG, MP4, WEBM, MP3, WAV, WAVE, and OGG files are allowed');
        }

        // determine resource type based on file type
        let resourceType = 'auto';
        if (req.file.mimetype.startsWith('image')) {
            resourceType = 'image';
        } else if (req.file.mimetype.startsWith('video')) {
            resourceType = 'video';
        } else if (req.file.mimetype.startsWith('audio')) {
            resourceType = 'video'; // cloudinary treats audio files as videos
        }

        // fetch crewData
        let crewData = user.crewData ? await CrewData.findById(user.crewData) : null;

        // set portfolio limits based on payment plan
        const portfolioLimits = {
            free: 6,
            silver: 18,
            gold: 56
        };

        const currentPlan = crewData ? crewData.paymentPlan : 'free';
        const portfolioLimit = portfolioLimits[currentPlan];

        // check current portfolio items
        if (crewData && crewData.careerDetails.portfolioWork.length >= portfolioLimit) {
            throw new Error(`Portfolio limit reached. Your current plan (${currentPlan}) allows for up to ${portfolioLimit} items.`);
        }

        // upload file to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, { folder: 'portfolio-work', resource_type: resourceType });

        // extract URL from Cloudinary response
        const fileUrl = result.secure_url;

        // update or create crewData with URL of uploaded file
        if (crewData) {
            crewData.careerDetails.portfolioWork.push({ title: portfolioTitle, type: portfolioType, url: fileUrl });
            await crewData.save();
        } else {
            crewData = new CrewData({
                careerDetails: { portfolioWork: [{ title: portfolioTitle, type: portfolioType, url: fileUrl }] },
                paymentPlan: currentPlan // ensure the default plan is set if creating new crewData
            });
            await crewData.save();
            user.crewData = crewData._id;
            await user.save();
        }

        res.json({ message: 'Portfolio work uploaded successfully', fileUrl });
    } catch (error) {
        console.error('Error uploading portfolio work:', error);
        res.status(500).json({ error: error.message });
    }
};

const updatePortfolio = async (req, res) => {
    try {
        const portfolioId = req.params.id;
        const { portfolioTitle, portfolioType } = req.body;
        const userId = req.user.userId;

        const user = await User.findById(new ObjectId(userId));
        if (!user) {
            console.log('User not found with ID:', userId);
            return res.status(404).json({ message: 'User not found' });
        }

        const crewData = await CrewData.findById(new ObjectId(user.crewData));
        if (!crewData) {
            console.log('Crew data not found for user with ID:', userId);
            return res.status(404).json({ message: 'Crew data not found' });
        }

        const portfolioItem = crewData.careerDetails.portfolioWork.id(new ObjectId(portfolioId));

        if (!portfolioItem) {
            console.log('Portfolio item not found in crew data with ID:', portfolioId);
            return res.status(404).json({ message: 'Portfolio item not found' });
        }

        portfolioItem.title = portfolioTitle || portfolioItem.title;
        portfolioItem.type = portfolioType || portfolioItem.type;

        await crewData.save();

        res.json({ message: 'Portfolio item updated successfully', portfolioItem });
    } catch (error) {
        console.error('Error updating portfolio item:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    uploadImage,
    uploadFile,
    uploadPortfolio,
    updatePortfolio
};
