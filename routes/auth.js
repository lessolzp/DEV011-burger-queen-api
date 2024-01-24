const jwt = require('jsonwebtoken');
const config = require('../config');
const { connect } = require('../connect');

const { secret } = config;

module.exports = (app, nextMain) => {
  app.post('/login', async (req, resp, next) => {
    console.log('Getting log in');
    const { email, password } = req.body;

    if (!email || !password) {
      return next(400);
    }

    // TODO: Authenticate the user
    // It is necessary to confirm if the email and password
    // match a user in the database
    // If they match, send an access token created with JWT
    try {
      const db = connect();
      const user = db.collection('users');

      const query = { email, password };

      const userResult = await user.findOne(query);

      if (!userResult || userResult.password !== password) {
        return next(404); // Unauthorized
      }
      const accessToken = jwt.sign(email, secret);
      resp.status(200).json({ 'Access Token': accessToken });
      console.log('Token exists');
    } catch (error) {
      console.error('Error in /login', error);
      next(500); // Internal Server Error
    }
  });

  return nextMain();
};
