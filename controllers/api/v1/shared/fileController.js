const File = require('../../../../models/api/v1/File');


const uploadFile = async (req, res) => {
  try {
    const { originalname, filename, mimetype, size } = req.file;

    const file = new File({
      originalName: originalname,
      filename: filename,
      mimetype: mimetype,
      size: size,
    });
    await file.save();

    res.status(200).json({ message: 'File uploaded successfully', fileId: file._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  uploadFile,
};