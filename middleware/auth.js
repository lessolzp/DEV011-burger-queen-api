const jwt = require('jsonwebtoken');
const config = require('../config');

const { secret } = config;

module.exports = (secret) => (req, resp, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return next();
  }

  const [type, token] = authorization.split(' ');

  if (type.toLowerCase() !== 'bearer') {
    return next();
  }

  jwt.verify(token, secret, (err, decodedToken) => {
    if (err) {
      return next(403);
    }
    // TODO: Verify user identity using `decodeToken.uid`
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      roles: decodedToken.roles,
    };
  });
};

module.exports.isAuthenticated = (req) => {
  const token = req.header('Authorization');
  if (!token) {
    console.log('Not authenticated');
    return false;
  }
  return true;
};

module.exports.isAdmin = (req) => {
  const token = req.header('Authorization');
  if (!token) {
    console.log('No token provided');
    return false;
  } console.log(token);
  try {
    console.log('decoding');
    const decoded = jwt.verify(token, secret);
    console.log(decoded.roles);
    if (decoded.roles.includes('admin')) {
      // Check if the user has an admin role
      console.log('User is an admin:');
      return true;
    }
    console.log('User does not have admin role');
    return false;
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return false;
  }
};
module.exports.requireAuth = (req, resp, next) => (
  (!module.exports.isAuthenticated(req))
    ? next(401)
    : next()
);

module.exports.requireAdmin = (req, resp, next) => (
  // eslint-disable-next-line no-nested-ternary
  (!module.exports.isAuthenticated(req))
    ? next(401)
    : (!module.exports.isAdmin(req))
      ? next(405)
      : next()
);
