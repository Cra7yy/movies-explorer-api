const { checkToken } = require('../helpers/jwt');
const User = require('../models/user');
const AuthorizationError = require('../errors/authorizationError');

const isAuthorized = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) {
    next(new AuthorizationError('Авторизуруйтесь для доступа'));
  }

  const token = auth.replace('Bearer ', '');
  try {
    const payload = checkToken(token);
    User.findOne({ email: payload.email })
      .then((user) => {
        if (!user) {
          next(new AuthorizationError('Авторизуруйтесь для доступа'));
        }
        req.user = user._id;
        next();
      });
  } catch (err) {
    next(new AuthorizationError('Авторизуруйтесь для доступа'));
  }
};

module.exports = {
  isAuthorized,
};
