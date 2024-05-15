const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Jobs = require('./Jobs');

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
    date: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
    jobDetails: {
        type: Schema.Types.ObjectId,
        ref: 'Jobs'
    }
});

const JobApplication = mongoose.model('JobApplication', JobApplicationSchema);

module.exports = JobApplication;