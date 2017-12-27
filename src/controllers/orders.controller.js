import { Order } from '../models/Order';

import { Product } from '../models/Product';

const mongoose = require('mongoose');

const express = require('express');

const router = express.Router();

const HttpError = require('../models/HttpError.js');

router.get('/', (req, res, next) => {
  Order.find({buyer: req.user._id, isActive: true}, (err, orders) => {
    if (err) {
      return next(err);
    }
    
    return res.status(200).send(orders);
  });
});

router.post('/', (req, res, next) => {
  let productIds = [];
  let productIdQuantityMap = {};
  try {
    if (req.body.products && req.body.products.length > 0) {
      for (let i = 0 ; i < req.body.products.length; i += 1) {
        productIds.push(mongoose.Types.ObjectId(req.body.products[i].id));
        productIdQuantityMap[req.body.products[i].id] = req.body.products[i].quantity;
      }
    }
  } catch (e) {
    // if req.params.id is not a valid id, it might throw
    // Argument passed in must be a single String of 12 bytes or a string of 24 hex characters
  }
  
  if (productIds.length === 0) {
    return next(new HttpError(400, res.__('ORDER_WITH_EMPTY_BASKET')));
  }
  
  return Product.find({ '_id': { $in: productIds } }, (productSearchErr, products) => {
    if (productSearchErr) {
      return next(productSearchErr);
    }
    
    if (!products || products.length === 0) {
      return next(new HttpError(400, res.__('ORDER_WITH_EMPTY_BASKET')));
    }
    
    var productsWithQuantity = [];
    for (let i = 0; i < products.length ; i += 1) {
      productsWithQuantity.push({
        product: products[i],
        quantity: productIdQuantityMap[products[i]._id]
      })
    }
    
    var order = new Order({
      productsWithQuantity: productsWithQuantity,
      shippingAddress: req.body.shippingAddress,
      buyer: req.user._id
    });
    return order.save((err, newOrder) => {
      if (err) {
        return next(err);
      }
    
      return res.status(201).send(newOrder);
    });
  });
});

router.delete('/:id', (req, res, next) => {
  try {
    return Order.update({
      buyer: req.user._id,
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
    return next(new HttpError(400, res.__('INVALID_ORDER_ID')));
  }
});

module.exports = router;