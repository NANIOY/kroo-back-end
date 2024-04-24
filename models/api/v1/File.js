const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  originalName: String,
  filename: String,
  mimetype: String,
  size: Number,
});

const File = mongoose.model('File', fileSchema);

module.exports = File;
