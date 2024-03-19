// import dependencies
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// create express app
const app = express();
const port = process.env.PORT || 3000;

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

// routes
const { errorHandler } = require('./middlewares/errorHandler');

    // crew routes
    const crewJobRouter = require('./routes/api/v1/crew/crewJob');
    const crewJobIntRouter = require('./routes/api/v1/crew/crewJobInt');

    // business routes
    const bussJobIntRouter = require('./routes/api/v1/business/bussJobInt');
    const bussJobRouter = require('./routes/api/v1/business/bussJob');

const usersRouter = require('./routes/api/v1/user');
const crewRouter = require('./routes/api/v1/crew');
const businessRouter = require('./routes/api/v1/business');
const mailRouter = require('./routes/api/v1/mail');
const authRouter = require('./routes/api/v1/auth');

// route handlers
app.use(errorHandler);

    // crew routes
    app.use('/api/v1/crew/crewJob', crewJobRouter);
    app.use('/api/v1/crew/crewJobInt', crewJobIntRouter);

    // business routes
    app.use('/api/v1/business/bussJobInt', bussJobIntRouter);
    app.use('/api/v1/business/bussJob', bussJobRouter);
    
// app.use('/api/v1/jobs', jobsRouter);
app.use('/api/v1/user', usersRouter);
app.use('/api/v1/crew', crewRouter);
app.use('/api/v1/business', businessRouter);
app.use('/api/v1/mail', mailRouter);
app.use('/api/v1/auth', authRouter);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

module.exports = app;