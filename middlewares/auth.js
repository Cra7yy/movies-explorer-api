const { checkToken } = require('../helpers/jwt');
const AuthorizationError = require('../errors/authorizationError');

const isAuthorized = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) {
    next(new AuthorizationError('Авторизуруйтесь для доступа'));
  }
  const token = auth.replace('Bearer ', '');
  let payload;
  try {
    payload = checkToken(token);
  } catch (err) {
    next(new AuthorizationError('Авторизуруйтесь для доступа'));
  }
  req.user = payload;
  next();
};

module.exports = {
  isAuthorized,
};
