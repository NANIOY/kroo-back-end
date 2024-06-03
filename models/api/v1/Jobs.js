const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const JobApplication = require('./JobApplication');

const JobSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    businessId: {
        type: Schema.Types.ObjectId,
        ref: 'Business'
    },
    description: {
        type: String,
        required: true
    },
    wage: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    skills: {
        type: Array,
        required: true
    },
    jobFunction: {
        type: String,
        required: true
    },
    location: {
        city: { type: String, required: true },
        country: { type: String, required: true },
        address: { type: String, required: true }
    },
    production_type: {
        type: String,
        required: true
    },
    union_status: {
        type: String,
        required: true
    },
    attachments: {
        type: Array,
        required: true
    },
    applications: [{
        type: Schema.Types.ObjectId,
        ref: 'JobApplication'
    }],
    url: {
        type: String,
        required: true,
        unique: true
    },
    activeCrew: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    status: {
        type: String,
        enum: ['open', 'filled', 'complete'],
        default: 'open',
        required: true
    }
});

const Job = mongoose.model('Job', JobSchema);

module.exports = Job;