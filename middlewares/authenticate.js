const jwt = require('jsonwebtoken');

// authenticate middleware
const authenticate = (req, res, next) => {
    const token = req.headers.authorization; // get the token from the authorization header

    // check if token is missing
    if (!token) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized: Missing token' });
    }

    try {
        // verify the token using secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // set user info in request for later use
        req.user = {
            userId: decoded.userId,
            isAdmin: decoded.isAdmin || false,
        };

        next();
    } catch (error) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized: Invalid token' });
    }
};

module.exports = authenticate;
