// import dependencies
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const routes = require('./routes');
const fs = require('fs');
const path = require('path');

const googleAuthBase64 = process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64;

// check if google auth credentials exist
if (googleAuthBase64) {
    try {
        // convert googleAuthBase64 to googleAuthJson
        const googleAuthJson = Buffer.from(googleAuthBase64, 'base64').toString('utf8');
        // set path to google-auth.json
        const googleAuthPath = path.join(__dirname, 'config/google-auth.json');

        // create directory if it doesn't exist
        if (!fs.existsSync(path.dirname(googleAuthPath))) {
            fs.mkdirSync(path.dirname(googleAuthPath), { recursive: true });
        }

        // write googleAuthJson to google-auth.json if it doesn't exist
        if (!fs.existsSync(googleAuthPath)) {
            fs.writeFileSync(googleAuthPath, googleAuthJson);
        }

        // set GOOGLE_APPLICATION_CREDENTIALS environment variable
        process.env.GOOGLE_APPLICATION_CREDENTIALS = googleAuthPath;
    } catch (error) {
        console.error('Error writing Google auth credentials:', error);
        process.exit(1);
    }
} else {
    console.error('Google auth credentials not found');
    process.exit(1);
}

// create express app
const app = express();
const port = process.env.PORT || 3000;

// middleware
const allowedOrigins = ['http://localhost:5173', 'https://app.kroo.site'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));
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

// use routes
app.use(routes);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

module.exports = app;