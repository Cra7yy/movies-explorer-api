const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (email) => validator.isEmail(email),
      message: 'Введен неправильно email',
    },
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
});

userSchema.statics.findUserByCredentials = function findUserByCredentials(email, password) {
  return this.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        const error = new Error('неправильный email или password');
        error.statusCode = 401;
        throw error;
      }
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            const error = new Error('неправильный email или password');
            error.statusCode = 401;
            throw error;
          }
          return user;
        });
    });
};

module.exports = mongoose.model('user', userSchema);
