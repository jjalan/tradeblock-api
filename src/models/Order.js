import { ProductSchema } from './Product';

const mongoose = require('mongoose');

export const OrderSchema = new mongoose.Schema({
  products: [ProductSchema],
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

export const Order = mongoose.model('Order', OrderSchema);