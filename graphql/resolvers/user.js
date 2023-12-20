const User = require('../../models/User');
const { ApolloError } = require('apollo-server-errors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

module.exports = {
    Mutation: {
        async registerUser(_, { registerInput: { email, username, password } }) {
            const oldUser = await User.findOne({ email });

            if (oldUser) {
                throw new ApolloError('A user already exists with this email.');
            }

            // Encrypt password
            const encryptedPassword = await bcrypt.hash(password, 10);

            // Build out mongoose model user
            const newUser = new User({
                username: username,
                email: email.toLowerCase(),
                password: encryptedPassword,
            });

            // Create JWT
            const token = jwt.sign(
                { user_id: newUser._id, email },
                "YOUR_SECRET_KEY", // Replace with your actual secret key
                {
                    expiresIn: "2h",
                }
            );

            newUser.token = token;

            const res = await newUser.save();

            return {
                id: res.id,
                ...res._doc,
            };
        },
        async loginUser(_, { loginUser: { email, password } }) {
            // See if user exists with the email
            const user = await User.findOne({ email });

            // Check if the entered password is correct
            if (user && (await bcrypt.compare(password, user.password))) {
                // Create a new token
                const token = jwt.sign(
                    { user_id: user._id, email },
                    "YOUR_SECRET_KEY", // Replace with your actual secret key
                    {
                        expiresIn: "2h",
                    }
                );

                user.token = token;

                return {
                    id: user.id,
                    ...user._doc,
                };
            } else {
                throw new ApolloError('Incorrect password');
            }
        },
    },
    Query: {
        user: (_, { ID }) => User.findById(ID),
    },
};
