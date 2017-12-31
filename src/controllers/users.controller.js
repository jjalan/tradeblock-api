import { User } from '../models/User';

const express = require('express');

const router = express.Router();

router.get('/me', (req, res) => {
  return res.status(200).send(req.user);
});

router.patch('/me', (req, res, next) => {
  return User.update({
    _id: req.user._id
  },{ $set: req.body }, {}, (updateErr) => {
    if (updateErr) {
      return next(updateErr);
    }
  
    return res.status(204).send();
  });
});

module.exports = router;