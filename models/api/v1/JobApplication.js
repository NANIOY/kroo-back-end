const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./User');
const Job = require('./Jobs');

const JobApplicationSchema = new Schema({
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

const JobApplication = mongoose.model('Application', JobApplicationSchema);

module.exports = JobApplication;