const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URL
);

const calendar = google.calendar({
    version: 'v3',
    auth: oauth2Client
});

exports.getAuthUrl = (req, res) => {
    const scopes = [
        'https://www.googleapis.com/auth/calendar'
    ];

    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes
    });

    res.redirect(url);
};

exports.getTokens = async (req, res) => {
    const code = req.query.code;

    try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);
        res.json({ message: "Successfully authenticated with Google." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.scheduleEvent = async (req, res) => {
    try {
        const result = await calendar.events.insert({
            calendarId: 'primary',
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
        });

        res.json(result.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
