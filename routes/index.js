const router = require('express').Router();
const userRouter = require('./users');
const movieRouter = require('./movies');
const { login, postUser } = require('../controllers/users');
const NotFoundError = require('../errors/notFoundError');
const { isAuthorized } = require('../middlewares/auth');
const { validateLogin, validatePostUser } = require('../middlewares/validation');

router.post('/signin', validateLogin, login);
router.post('/signup', validatePostUser, postUser);

router.use(isAuthorized);
router.use('/users', userRouter);
router.use('/movies', movieRouter);

router.use('*', (req, res, next) => {
  next(new NotFoundError('Маршрут не найден', req.originalUrl));
});

module.exports = router;
