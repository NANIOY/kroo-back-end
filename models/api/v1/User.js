const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// schema for portfolio work
const PortfolioWorkSchema = new Schema({
    title: String,
    type: String, // type of portfolio work
});

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
    portfolioWork: [PortfolioWorkSchema],
    connectivity: {
        connectSocials: [String],
        extraWebsites: [{ title: String, url: String }],
        customUrl: String
    }
});

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
    }
});

const User = mongoose.model('User', UserSchema);
const CrewData = mongoose.model('CrewData', CrewDataSchema);

module.exports = {
    User,
    CrewData
};