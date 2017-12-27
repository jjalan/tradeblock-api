import { ProductSchema } from './Product';

import { AddressSchema } from './User';

const mongoose = require('mongoose');

const ProductWithQuantitySchema = new mongoose.Schema({
  product: ProductSchema,
  quantity: {
    type: Number,
    required: true
  }
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

export const OrderSchema = new mongoose.Schema({
  productsWithQuantity: [ProductWithQuantitySchema],
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  shippingAddress: {
    type: AddressSchema,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

export const Order = mongoose.model('Order', OrderSchema);