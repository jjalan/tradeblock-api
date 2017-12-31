import { Product } from '../models/Product';

const mongoose = require('mongoose');

const express = require('express');

const router = express.Router();

const HttpError = require('../models/HttpError.js');

router.get('/', (req, res, next) => {
  Product.find({seller: req.user._id, isActive: true}, (err, products) => {
    if (err) {
      return next(err);
    }
    
    return res.status(200).send(products);
  });
});

router.get('/latest', (req, res, next) => {
  Product.find({seller: { $ne: req.user._id }, isActive: true}).sort({createdAt: 'desc'}).limit(20).exec((err, products) => {
    if (err) {
      return next(err);
    }
    
    return res.status(200).send(products);
  });
});

router.post('/', (req, res, next) => {
  var product = new Product({
    name: req.body.name,
    description: req.body.description,
    priceInETH: req.body.priceInETH,
    seller: req.user._id
  });
  product.save((err, newProduct) => {
    if (err) {
      if (err.name === 'ValidationError' && err.errors['name']) {
        return next(new HttpError(400, res.__('INVALID_PRODUCT_NAME')));
      } else if (err.name === 'ValidationError' && err.errors['priceInETH']) {
        return next(new HttpError(400, res.__('INVALID_PRODUCT_PRICE')));
      }
      
      return next(err);
    }
    
    return res.status(201).send(newProduct);
  });
});

router.patch('/:id', (req, res, next) => {
  try {
    return Product.update({
      seller: req.user._id,
      _id: mongoose.Types.ObjectId(req.params.id) 
    },{ $set: req.body }, {}, (updateErr) => {
      if (updateErr) {
        return next(updateErr);
      }
    
      return res.status(204).send();
    });
  } catch (e) {
    // if req.params.id is not a valid id, it might throw
    // Argument passed in must be a single String of 12 bytes or a string of 24 hex characters
    return next(new HttpError(400, res.__('INVALID_PRODUCT_ID')));
  }
});

router.delete('/:id', (req, res, next) => {
  try {
    return Product.update({
      seller: req.user._id,
      _id: mongoose.Types.ObjectId(req.params.id)
    }, { $set: { isActive: false }}, {}, (updateErr) => {
      if (updateErr) {
        return next(updateErr);
      }
    
      return res.status(204).send();
    });
  } catch (e) {
    // if req.params.id is not a valid id, it might throw
    // Argument passed in must be a single String of 12 bytes or a string of 24 hex characters
    return next(new HttpError(400, res.__('INVALID_PRODUCT_ID')));
  }
});

module.exports = router;