const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const upload = async (req, res) => {
  try {
    // upload file to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, { folder: 'user-images' });

    // if file is uploaded, return URL
    res.json(result);
  } catch (error) {
    // return error if file is not uploaded
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Error uploading image' });
  }
};

module.exports = { upload };
