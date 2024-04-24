const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// schema for crew data
const CrewDataSchema = new Schema({
    basicInfo: {
        agendaService: String,
        profileImage: String,
        bannerImage: String,
        functions: [String],
    },
    profileDetails: {
        skills: [String],
        age: Number,
        languages: [String],
        location: String,
        workRadius: Number,
        bio: String
    },
    careerDetails: {
        portfolioWork: [{
            title: String,
            type: {
                type: String,
                enum: ['Short Film', 'Feature Film', 'Documentary', 'Music Video', 'Commercial', 'Animation', 'Web Series', 'TV Show', 'Corporate Video', 'Experimental', 'Photography', 'Other']
            }
        }],
        educationTraining: [{
            title: String,
            where: String
        }],
        certificationsLicenses: [String],
        unionStatus: String
    },
    connectivity: {
        connectSocials: [String],
        extraWebsites: [{ title: String, url: String }],
    }
});

const CrewData = mongoose.model('CrewData', CrewDataSchema);

module.exports = CrewData;