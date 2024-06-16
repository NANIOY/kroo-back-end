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
        prompt: 'consent',
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

    console.log('Authorization Code:', code);
    console.log('State:', state);

    try {
        const response = await oauth2Client.getToken(code);
        console.log('OAuth2 Response:', response);

        const { tokens } = response;
        oauth2Client.setCredentials(tokens);

        console.log('Retrieved Tokens:', tokens);

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

        if (tokens.refresh_token) {
            crewData.googleCalendar = {
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token,
                expiryDate: new Date(tokens.expiry_date)
            };
        } else {
            const existingData = crewData.googleCalendar;
            crewData.googleCalendar = {
                accessToken: tokens.access_token,
                refreshToken: existingData ? existingData.refreshToken : null,
                expiryDate: new Date(tokens.expiry_date)
            };
        }
        await crewData.save();

        res.redirect(`https://app.kroo.site/#/register/crew/step-2?status=success&userId=${userId}`);
    } catch (error) {
        console.error('Failed to retrieve tokens:', error);
        res.redirect(`https://app.kroo.site/#/register/crew/step-1?status=error`);
    }
};

// SET credentials for OAuth2 client
const setCredentials = async (userId) => {
    const user = await User.findById(userId).populate('crewData');
    if (!user) {
        throw new Error('User not found.');
    }

    if (!user.crewData) {
        throw new Error('No crewData linked to user.');
    }

    const { googleCalendar } = user.crewData;
    if (!googleCalendar) {
        throw new Error('No calendar link found for user.');
    }

    const { accessToken, refreshToken, expiryDate } = googleCalendar;

    oauth2Client.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken,
        expiry_date: new Date(expiryDate).getTime()
    });

    // auto refresh access token if expired
    if (new Date() >= new Date(expiryDate)) {
        const newTokens = await oauth2Client.refreshAccessToken();
        const newAccessToken = newTokens.credentials.access_token;
        const newExpiryDate = newTokens.credentials.expiry_date;

        user.crewData.googleCalendar.accessToken = newAccessToken;
        user.crewData.googleCalendar.expiryDate = new Date(newExpiryDate);
        await user.crewData.save();
    }
};

// POST schedule event to Google Calendar API and save event to database
const scheduleEvent = async (req, res) => {
    const { summary, description, startDateTime, endDateTime, timeZone, userId, type } = req.body;

    try {
        console.log('Received scheduleEvent request with userId:', userId);
        await setCredentials(userId);

        const newEvent = new Event({
            summary,
            description,
            startDateTime,
            endDateTime,
            timeZone,
            type
        });

        await newEvent.save();

        const result = await calendar.events.insert({
            calendarId: 'primary',
            requestBody: {
                summary: newEvent.summary,
                description: newEvent.description,
                start: { dateTime: newEvent.startDateTime, timeZone: newEvent.timeZone },
                end: { dateTime: newEvent.endDateTime, timeZone: newEvent.timeZone },
                extendedProperties: {
                    private: {
                        type: newEvent.type
                    }
                }
            }
        });

        res.json(result.data);
    } catch (error) {
        console.error('Error scheduling event:', error);
        res.status(500).json({ error: error.message });
    }
};

// GET all events for user from Google Calendar API
const listEvents = async (req, res) => {
    const userId = req.query.userId;

    try {
        await setCredentials(userId);

        const timeMinConfig = new Date('2000-01-01').toISOString();

        const result = await calendar.events.list({
            calendarId: 'primary',
            timeMin: timeMinConfig,
            singleEvents: true,
            orderBy: 'startTime'
        });

        const eventsWithTypes = result.data.items.map(event => {
            let type = 'personal';
            if (event.extendedProperties && event.extendedProperties.private && event.extendedProperties.private.type) {
                type = event.extendedProperties.private.type;
            }
            return {
                ...event,
                type
            };
        });

        res.json(eventsWithTypes);
    } catch (error) {
        console.error('Failed to list events:', error);
        res.status(500).send({ message: 'Failed to retrieve events from Google Calendar.', error: error.message });
    }
};

module.exports = {
    getAuthUrl,
    getTokens,
    scheduleEvent,
    listEvents
};