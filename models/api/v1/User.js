const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const CrewData = require('./Crew');
const Business = require('./Business');

// schema for user
const UserSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    roles: [{
        type: String,
        enum: ['crew', 'business'],
    }],
    lastUsedRole: {
        type: String,
        enum: ['crew', 'business']
    },
    userUrl: {
        type: String,
        unique: true
    },
    crewData: {
        type: Schema.Types.ObjectId,
        ref: 'CrewData'
    },
    businessData: {
        type: Schema.Types.ObjectId,
        ref: 'Business'
    },
    userJobs: {
        applications: [{
            type: Schema.Types.ObjectId,
            ref: 'JobApplication'
        }],
        saved_jobs: [{
            type: Schema.Types.ObjectId,
            ref: 'Job'
        }],
        offered_jobs: [{
            type: Schema.Types.ObjectId,
            ref: 'Job'
        }],
        active_jobs: [{
            type: Schema.Types.ObjectId,
            ref: 'Job'
        }],
    },
    resetPasswordToken: {
        type: String
    },
});

const User = mongoose.model('User', UserSchema);

module.exports = {
    User,
    CrewData,
    Business
};