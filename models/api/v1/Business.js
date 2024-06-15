const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// schema for invited employees
const EmployeeSchema = new Schema({
    email: String,
    role: {
        type: String,
        enum: ['Producer', 'Editor', 'Audience']
    }
});

// schema for business data
const BusinessSchema = new Schema({
    businessInfo: {
        companyName: {
            type: String,
            required: true
        },
        companyEmail: String,
        mediaTypes: [{
            type: String,
            enum: ["Animation", "Children's programming", "Commercials", "Documentaries", "Feature films", "Game shows", "Music videos", "Reality television", "Short films", "Sports broadcasts", "Television programs", "Television shows", "Web series"]
        }],
        languages: [String],
        location: String,
        logo: String,
        bannerImage: String,
        bio: String,
        tagline: String,
    },
    connectivity: {
        connectSocials: [String],
        // extraWebsites: [{ title: String, url: String }],
        customUrl: String
    },
    showProjects: {
        portfolioWork: [{
            title: String,
            type: {
                type: String,
                enum: ['Short Film', 'Feature Film', 'Documentary', 'Music Video', 'Commercial', 'Animation', 'Web Series', 'TV Show', 'Corporate Video', 'Experimental', 'Photography', 'Other']
            }
        }],
    },
    paymentInfo: {
        numberOfUsers: {
            type: String,
            enum: ['1', '1-4', '5-10', '11-20', '20+']
        },
        billingCycle: {
            type: String,
            enum: ['monthly', 'yearly']
        },
        paymentMethod: {
            type: Number,
            enum: [1, 2, 3, 4, 5, 6]
        }
    },
    invitedEmployees: [EmployeeSchema],
    businessJobs: {
        linkedJobs: [{
            type: Schema.Types.ObjectId,
            ref: 'Job'
        }],
        offeredJobs: [{
            type: Schema.Types.ObjectId,
            ref: 'Job'
        }],
    },
    active_crew: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
});

const Business = mongoose.model('Business', BusinessSchema);

module.exports = Business;