const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventSchema = new Schema({
    summary: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    startDateTime: {
        type: Date,
        required: true
    },
    endDateTime: {
        type: Date,
        required: true
    },
    timeZone: {
        type: String,
        required: true
    },
    location: String,
    type: {
        type: String,
        enum: ['job', 'personal'],
    },
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;