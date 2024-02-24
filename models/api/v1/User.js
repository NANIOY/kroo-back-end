const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// schema for crew data
const CrewDataSchema = new Schema({
    basicInfo: {
        agendaService: String,
        profileImage: String,
        bannerImage: String,
        function: String,
    },
    profileDetails: {
        skills: [String],
        age: Number,
        language: String,
        location: String,
        workRadius: Number,
        bio: String
    },
    careerDetails: {
        type: Schema.Types.Mixed,
        default: {}
    },
    connectivity: {
        connectSocials: [String],
        extraWebsites: [{ title: String, url: String }],
        customUrl: String
    }
});

// schema for regular user data
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
    }
});

const User = mongoose.model('User', UserSchema);
const CrewData = mongoose.model('CrewData', CrewDataSchema);

module.exports = {
    User,
    CrewData
};