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
        portfolioWork: [String],
        type: String,
        educationTraining: [{ title: String, where: String }],
        certificationsLicenses: [String],
        unionStatus: String
    },
    connectivity: {
        connectSocials: [String],
        extraWebsites: [{ title: String, url: String }],
        customUrl: String
    }
});

// schema for general user data
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
        type: CrewDataSchema,
        required: function() {
            return this.role === 'crew';
        }
    }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
