const express = require('express');

const router = express.Router();

const User = require('../models/User.js');

const jwt = require('jsonwebtoken');

const HttpError = require('../models/HttpError.js');

const JWT_KEY = process.env.JWT_KEY || 'tradeblock';

router.post('/register', (req, res, next) => {
  let user = new User(req.body);
  user.save((err, newUser) => {
    if (err) {
      if (err.name === 'MongoError' && err.code === 11000) {
        return next(new HttpError(400, res.__('DUPLICATE_EMAIL')));
      } else if (err.name === 'ValidationError' && err.errors['email']) {
        return next(new HttpError(400, res.__('INVALID_EMAIL')));
      }
      
      return next(err);
    }
    
    return res.status(201).send({id: newUser._id});
  });
});

router.post('/login', (req, res, next) => {
  User.findOne({ email: req.body.email }, (findUserErr, user) => {
    if (findUserErr) {
      return next(findUserErr);
    }
    
    if (!user) {
      return next(new HttpError(400, res.__('USER_NOT_FOUND')));
    }
    
    return user.comparePassword(req.body.password, (passwordCompareErr, isMatch) => {
      if (passwordCompareErr) {
        return next(passwordCompareErr);
      }
      
      if (!isMatch) {
        return next(new HttpError(400, res.__('PASSWORD_MISMATCH')));
      }
      
      return res.status(200).send({token: jwt.sign({ id: user._id }, JWT_KEY)});
    });
  });
});

module.exports = router;