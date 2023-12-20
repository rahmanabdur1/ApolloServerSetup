const { AuthenticationError } = require('apollo-server');
const jwt = require('jsonwebtoken');

module.exports = (context) => {
    const authHeader = context.req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split('Bearer ')[1]; // Extract the token after 'Bearer '

        if (token) {
            try {
                const user = jwt.verify(token, 'YOUR_SECRET_KEY'); // Replace with your actual secret key

                return user;
            } catch (err) {
                throw new AuthenticationError('Invalid/Expired token');
            }
        }

        throw new Error("Authentication token must be 'Bearer [token]'");
    }

    throw new Error('Authorization header must be provided');
};
