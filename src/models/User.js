const mongoose = require('mongoose');

const bcrypt = require('bcrypt');

const SALT_WORK_FACTOR = 10;

export const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    required: true,
    unique: true,
    /*eslint-disable no-useless-escape */
    match: /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
  },
  password: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

UserSchema.pre('save', function userPreSave(next) {
  const user = this;

  // only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) {
    return next();
  }

  // generate a salt
  return bcrypt.genSalt(SALT_WORK_FACTOR, (saltGenErr, salt) => {
    if (saltGenErr) {
      return next(saltGenErr);
    }

    // hash the password using our new salt
    return bcrypt.hash(user.password, salt, (hashErr, hash) => {
      if (hashErr) {
        return next(hashErr);
      }

      // override the cleartext password with the hashed one
      user.password = hash;
      return next();
    });
  });
});

UserSchema.methods.comparePassword = function comparePassword(userPassword, cb) {
  return bcrypt.compare(userPassword, this.password, (err, isMatch) => {
    if (err) {
      return cb(err);
    }
    
    return cb(null, isMatch);
  });
};

UserSchema.index({ email: 1 }, {unique: true, name: 'user_email_index'});

export const User = mongoose.model('User', UserSchema);