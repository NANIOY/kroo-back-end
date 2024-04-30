const { google } = require('googleapis');
const Event = require('../../../../models/api/v1/Calendar');
const CrewData = require('../../../../models/api/v1/Crew');
const { User } = require('../../../../models/api/v1/User');

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
    const userId = req.query.userId;
    const scopes = ['https://www.googleapis.com/auth/calendar'];

    const state = JSON.stringify({ userId });
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        state: state
    });

    res.redirect(url);
};

// GET tokens from Google Calendar API access code and set credentials for OAuth2 client
const getTokens = async (req, res) => {
    const code = req.query.code;
    const state = JSON.parse(req.query.state);
    const userId = state.userId;

    try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        if (!tokens.refresh_token || !tokens.access_token) {
            throw new Error('Missing access or refresh tokens');
        }

        const expiryDate = new Date(tokens.expiry_date);

        const user = await User.findById(userId);
        if (!user) {
            console.log(`User not found with ID: ${userId}`);
            return res.status(404).send({ message: 'User not found' });
        }

        let crewData = await CrewData.findById(user.crewData);
        if (!crewData) {
            crewData = new CrewData({ userId: user._id });
            await crewData.save();
            user.crewData = crewData._id;
            await user.save();
        }

        crewData.googleCalendar = {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiryDate: expiryDate
        };
        await crewData.save();

        res.send({ message: "Google Calendar linked successfully!" });
    } catch (error) {
        console.error('Failed to retrieve tokens:', error);
        res.status(500).send({ message: 'Failed to link Google Calendar.', error: error.message });
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