const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./User');
const Job = require('./Jobs');

const ApplicationSchema = new Schema({
    job: {
        type: Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
});

const Application = mongoose.model('Application', ApplicationSchema);

module.exports = Application;