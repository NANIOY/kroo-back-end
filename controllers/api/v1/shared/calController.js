const { google } = require('googleapis');
const Event = require('../../../../models/api/v1/Calendar');

// create OAuth2 client
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URL
);

// create calendar client
const calendar = google.calendar({
    version: 'v3',
    auth: oauth2Client
});

// GET auth URL for Google Calendar API access
const getAuthUrl = (req, res) => {
    const scopes = [
        'https://www.googleapis.com/auth/calendar'
    ];

    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes
    });

    res.redirect(url);
};

// GET tokens from Google Calendar API access code and set credentials for OAuth2 client
const getTokens = async (req, res) => {
    const code = req.query.code;

    try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);
        res.json({ message: "Successfully authenticated with Google." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// POST schedule event to Google Calendar API and save event to database
const scheduleEvent = async (req, res) => {
    const { summary, description, startDateTime, endDateTime, timeZone } = req.body;

    try {
        const newEvent = new Event({
            summary,
            description,
            startDateTime,
            endDateTime,
            timeZone
        });

        await newEvent.save();

        const result = await calendar.events.insert({
            calendarId: 'primary',
            requestBody: {
                summary: newEvent.summary,
                description: newEvent.description,
                start: { dateTime: newEvent.startDateTime, timeZone: newEvent.timeZone },
                end: { dateTime: newEvent.endDateTime, timeZone: newEvent.timeZone }
            }
        });

        res.json(result.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET all events from Google Calendar API and return as JSON response to client request
const listEvents = async (req, res) => {
    try {
        const result = await calendar.events.list({
            calendarId: 'primary',
            timeMin: (new Date()).toISOString(),
            maxResults: 10,
            singleEvents: true,
            orderBy: 'startTime',
        });

        const events = result.data.items;
        res.json(events);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAuthUrl,
    getTokens,
    scheduleEvent,
    listEvents
};