const bcrypt = require('bcrypt');
const User = require('../models/user');
const { generateToken } = require('../helpers/jwt');
const BadRequestError = require('../errors/badRequestError');
const NotFoundError = require('../errors/notFoundError');
const ConflictingRequestError = require('../errors/conflictingRequestError');
const AuthorizationError = require('../errors/authorizationError');

const MONGO_DUPLICATE_ERROR_CODE = 11000;
const SALT_ROUNDS = 10;

const getUser = (req, res, next) => {
  const userId = req.user._id;
  User.findById(userId)
    .then((user) => {
      if (!user) {
        next(new NotFoundError('Пользователь по указанному _id не найден'));
      }
      return res.status(200).send(user);
    })
    .catch(next);
};

const changeUserData = (req, res, next) => {
  const { email, name } = req.body;
  User.findByIdAndUpdate(req.user._id, { name, email }, { new: true, runValidators: true })
    .orFail(() => {
      throw new NotFoundError('Пользователь по указанному _id не найден');
    })
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('переданы некоректные данные'));
      } else if (err.code === MONGO_DUPLICATE_ERROR_CODE) {
        next(new ConflictingRequestError('email занят'));
      } else {
        next(err);
      }
    });
};

const postUser = (req, res, next) => {
  const {
    name,
    email,
    password,
  } = req.body;
  bcrypt
    .hash(password, SALT_ROUNDS)
    .then((hash) => User.create({
      name,
      email,
      password: hash,
    }))
    .then((user) => res.status(201).send({ data: user.email }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('переданы некоректные данные'));
      }
      if (err.code === MONGO_DUPLICATE_ERROR_CODE) {
        next(new ConflictingRequestError('email занят'));
      } else {
        next(err);
      }
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      if (!user) {
        next(new AuthorizationError('неправильный email или password'));
      }
      return generateToken({ email: user.email });
    })
    .then((token) => {
      res.send({ token });
    })
    .catch((err) => {
      next(err);
    });
};

module.exports = {
  getUser,
  postUser,
  changeUserData,
  login,
};
