const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const uploadImage = upload.single('image');

module.exports = {
    uploadImage
};