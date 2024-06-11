const jwt = require('jsonwebtoken');

// authenticate middleware
const authenticate = (req, res, next) => {
    const sessionToken = req.headers.authorization && req.headers.authorization.split(' ')[1]; // get the token from the authorization header
    const rememberMeToken = req.cookies.rememberMeToken; // get the token from the cookie

    // check if session token is missing and rememberMe token is present
    if (!sessionToken && rememberMeToken) {
        try {
            // verify the token using secret key
            const decoded = jwt.verify(rememberMeToken, process.env.JWT_SECRET);

            // set user info in request for later use
            req.user = {
                userId: decoded.userId,
                isAdmin: decoded.isAdmin || false,
                isRemembered: true
            };

            return next();
        } catch (error) {
            // if verification fails, continue with regular authentication
        }
    }

    // proceed with regular authentication
    if (!sessionToken) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized: Missing token' });
    }

    try {
        // verify the token using secret key
        const decoded = jwt.verify(sessionToken, process.env.JWT_SECRET);
        
        // set user info in request for later use
        req.user = {
            userId: decoded.userId,
            isAdmin: decoded.isAdmin || false,
            isRemembered: false
        };

        next();
    } catch (error) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized: Invalid token' });
    }
};

module.exports = authenticate;
