const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const JobSchema = new Schema({
    title : {
        type: String,
        required: true
    },
    company : {
        type: String,
        required: true
    },
    description : {
        type: String,
        required: true
    },
    wage : {
        type: Number,
        required: true
    },
    date : {
        type: Date,
        required: true
    },
    time : {
        type: String,
        required: true
    },
    skills : {
        type: Array,
        required: true
    },
    function : {
        type: String,
        required: true
    },
    location : {
        type: String,
        required: true
    },
    production_type : {
        type: String,
        required: true
    },
    union_status : {
        type: String,
        required: true
    },
    attachments : {
        type: Array,
        required: true
    },
});

const Job = mongoose.model('Job', JobSchema);

module.exports = Job;