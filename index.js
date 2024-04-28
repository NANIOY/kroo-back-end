// import dependencies
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const routes = require('./routes');
const { google } = require('googleapis');

const calendar = google.calendar({
    version: 'v3',
    auth: 'process.env.GOOGLE_CALENDAR_API_KEY'
});

// create express app
const app = express();
const port = process.env.PORT || 3000;

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URL
);

const scopes = [
    'https://www.googleapis.com/auth/calendar'
];
const token = ""

app.get('/google', (req, res) => {
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes
    });
    res.redirect(url);
});

app.get('/google/redirect', async (req, res) => {
    const code = req.query.code;

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    console.log(tokens);

    res.send({
        msg: "You have successfully authenticated with Google!"
    })
});

app.get('/schedule_event', async (req, res) => {
    calendar.events.insert({
        calendarId: 'primary',
        auth: oauth2Client,
        requestBody: {
            summary: 'Test Event',
            description: 'This is a test event',
            start: {
                dateTime: '2024-04-28T00:00:00-07:00',
                timeZone: 'America/Los_Angeles'
            },
            end: {
                dateTime: '2024-04-28T23:59:59-07:00',
                timeZone: 'America/Los_Angeles'
            }
        }
    }, (err, result) => {
        if (err) {
            console.log(err);
            res.send(err);
        } else {
            console.log(result);
            res.send(result);
        }
    });
});

// middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// connect to database
mongoose.connect(process.env.MONGODB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to database');
});

app.use(routes);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

module.exports = app;