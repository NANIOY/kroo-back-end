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
    name: {
        type: String,
        required: true
    },
    businessInfo: {
        companyEmail: String,
        mediaTypes: {
            type: String,
            enum: ['Film', 'Television', 'Photography', 'Animation', 'Digital Media', 'Marketing', 'Other']
        },
        languages: [String],
        location: String,
        logo: String,
        bannerImage: String,
        bio: String
    },
    connectivity: {
        connectSocials: [String],
        extraWebsites: [{ title: String, url: String }],
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
    }
});

const Business = mongoose.model('Business', BusinessSchema);

module.exports = Business;