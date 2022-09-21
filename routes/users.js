const router = require('express').Router();
const { getUser, changeUserData } = require('../controllers/users');
const { validateChangeUserData } = require('../middlewares/validation');

router.get('/me', getUser);
router.patch('/me', validateChangeUserData, changeUserData);

module.exports = router;
