import { ProductSchema } from './Product';

import { AddressSchema } from './User';

import web3 from '../web3';

const mongoose = require('mongoose');

const ProductWithQuantitySchema = new mongoose.Schema({
  product: ProductSchema,
  quantity: {
    type: Number,
    required: true
  }
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

const TransactionSchema = new mongoose.Schema({
  txHash: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    trim: true,
    required: true,
    validate: {
      validator: function(v) {
        return web3.isAddress(v);
      }
    }
  },
  amountTransferredInETH: {
    type: Number,
    required: true,
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
  tradeContractAddress: {
    type: String,
    trim: true,
    required: true,
    validate: {
      validator: function(v) {
        return web3.isAddress(v);
      }
    }
  },
  txHash: {
    type: String,
    required: true,
    trim: true
  },
  totalOrderAmountInETH: {
    type: Number,
    required: true,
    min: 0
  },
  transactions: [TransactionSchema],
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

export const Order = mongoose.model('Order', OrderSchema);