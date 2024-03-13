const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const CrewData = require('./Crew');

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
    role: {
        type: String,
        required: true,
        default: 'user'
    },
    crewData: {
        type: Schema.Types.ObjectId,
        ref: 'CrewData'
    },
    applications: [{
        type: Schema.Types.ObjectId,
        ref: 'JobApplication'
    }]
});

const User = mongoose.model('User', UserSchema);

module.exports = {
    User,
    CrewData
};