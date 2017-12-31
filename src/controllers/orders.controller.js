import { Order } from '../models/Order';

import { Product } from '../models/Product';

import { User } from '../models/User';

import web3 from '../web3';

const _ = require('underscore');

const mongoose = require('mongoose');

const express = require('express');

const router = express.Router();

const HttpError = require('../models/HttpError.js');

const SolidityFunction = require('web3/lib/web3/function');

const Tx = require('ethereumjs-tx');

const TRADE_CONTRACT_ABI = require('../abi/trade-contract.js');

const CONTRACT_FACTORY_ABI = require('../abi/trade-contract-factory.js');

// Ropsten
const CONTRACT_FACTORY_ADDRESS = '0xFf73b29eCF0553428f1958E73161dCba87CB876D';

const ETH_ACCOUNT_ADDRESS = '0xeD9f9fF4881F4Fff1662633483F6Ea9832244F42';

const ETH_ACCOUNT_PRIVATE_KEY = '1217441c714f193bcf87c3e8f68ccd51f0cd7ae0063900d94168a10cd316c8ed';

router.get('/', (req, res, next) => {
  Order.find({buyer: req.user._id, isActive: true}, (err, orders) => {
    if (err) {
      return next(err);
    }
    
    return res.status(200).send(orders);
  });
});

function getNumberFromBigNumber (bigNumber) {
  return parseFloat(bigNumber.toString(10));
}

function getEtherFromWei(wei) {
  return (wei/1000000000000000000);
}

function getTradeContractFactorySignedTransaction (
  buyerAddress,
  sellerAddresses,
  sellersDueAmountBeforeCommissionInWei,
  sellersDueAmountAfterCommissionInWei
) {
  const payload = new SolidityFunction('', _.find(CONTRACT_FACTORY_ABI, { name: 'create' }), '').toPayload([buyerAddress, sellerAddresses, sellersDueAmountBeforeCommissionInWei, sellersDueAmountAfterCommissionInWei]).data;
  
  const gasLimit = web3.eth.estimateGas({
    from:ETH_ACCOUNT_ADDRESS,
    to: CONTRACT_FACTORY_ADDRESS,
    data: payload
  });
  
  const tx = new Tx({
    nonce: web3.toHex(web3.eth.getTransactionCount(ETH_ACCOUNT_ADDRESS)),
    gasPrice: web3.toHex(web3.eth.gasPrice),
    gasLimit: web3.toHex(gasLimit),
    from: ETH_ACCOUNT_ADDRESS,
    to: CONTRACT_FACTORY_ADDRESS,
    value: '0x00', 
    data: payload
  });
  tx.sign(Buffer.from(ETH_ACCOUNT_PRIVATE_KEY, 'hex'));
  return tx;
}

function createTradeContract(
  buyerAddress,
  sellerAddresses,
  sellersDueAmountBeforeCommissionInWei,
  sellersDueAmountAfterCommissionInWei,
  cb
) {
  const factoryContract = web3.eth.contract(CONTRACT_FACTORY_ABI).at(CONTRACT_FACTORY_ADDRESS);
  const contractInstantiationEvent = factoryContract.ContractInstantiation({fromBlock: 0, toBlock: 'latest'});
  
  let txHash = null;
  // ContractInstantiation event listener
  var onTradeContractCreated = function TradeContractEventListener(err, event) {
    if (err) {
      cb(err);
    } else {
      if (event && event.args && event.args.sender === ETH_ACCOUNT_ADDRESS.toLowerCase()) {
        cb(null, {
          txHash: txHash,
          tradeContractAddress: event.args.instantiation
        });
      }
    
      contractInstantiationEvent.stopWatching();
    }
  }
  
  // Listen to ContractInstantiation event
  let tx = getTradeContractFactorySignedTransaction(
    buyerAddress,
    sellerAddresses,
    sellersDueAmountBeforeCommissionInWei,
    sellersDueAmountAfterCommissionInWei
  );
  contractInstantiationEvent.watch(onTradeContractCreated);
  txHash = web3.eth.sendRawTransaction('0x' + tx.serialize().toString('hex'));
}

function getPaySellerSignedTransction(tradeContractAddress, sellerWalletAddress) {
  const payload = new SolidityFunction('', _.find(TRADE_CONTRACT_ABI, { name: 'paySeller' }), '').toPayload([sellerWalletAddress]).data;
  
  const gasLimit = web3.eth.estimateGas({
    from: ETH_ACCOUNT_ADDRESS,
    to: tradeContractAddress,
    data: payload
  });
  
  const tx = new Tx({
    nonce: web3.toHex(web3.eth.getTransactionCount(ETH_ACCOUNT_ADDRESS)),
    gasPrice: web3.toHex(web3.eth.gasPrice),
    gasLimit: web3.toHex(gasLimit),
    from: ETH_ACCOUNT_ADDRESS,
    to: tradeContractAddress,
    value: '0x00', 
    data: payload
  });
  tx.sign(Buffer.from(ETH_ACCOUNT_PRIVATE_KEY, 'hex'));
  return tx;
}
function paySeller(tradeContractAddress, sellerWalletAddress, cb) {
  const tradeContractInstance = web3.eth.contract(TRADE_CONTRACT_ABI).at(tradeContractAddress);
  const paidEvent = tradeContractInstance.Paid({fromBlock: 0, toBlock: 'latest'});
  
  let txHash = null;
  var onPaid = function PaidEvent(err, event) {
    if (err) {
      cb(err);
    } else {
      let eventArgs = event.args;
      
      let amtToSellerInWei = getNumberFromBigNumber(eventArgs.amountTransferredToSellerInWei);
      let amtToOwnerInWei = getNumberFromBigNumber(eventArgs.amountTransferredToOwnerInWei);
      
      cb(null, {
        txHash: txHash,
        sellerWalletAddress: eventArgs.seller,
        amountTransferredToSellerInETH: getEtherFromWei(amtToSellerInWei),
        transferredRemainingToOwner: eventArgs.transferredRemainingToOwner,
        amountTransferredToOwnerInETH: getEtherFromWei(amtToOwnerInWei)
      });
    }
    
    paidEvent.stopWatching();
  }
  
  paidEvent.watch(onPaid);
  
  try {
    txHash = web3.eth.sendRawTransaction('0x' + getPaySellerSignedTransction(tradeContractAddress, sellerWalletAddress).serialize().toString('hex'));
  } catch (e) {
    paidEvent.stopWatching();
    cb(e);
  }
}

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
  
  return Product.find({ '_id': { $in: productIds } }).populate('seller').exec((productSearchErr, products) => {
    if (productSearchErr) {
      next(productSearchErr);
    } else if (!products || products.length === 0) {
      next(new HttpError(400, res.__('ORDER_WITH_EMPTY_BASKET')));
    } else {
      let productsWithQuantity = [];
      let totalOrderAmountInETH = 0;
      let sellersMap = {};
    
      for (let i = 0; i < products.length ; i += 1) {
        let product = products[i];
        let quantity = productIdQuantityMap[products[i]._id];
        
        if (!sellersMap[product.seller.walletAddress]) {
          sellersMap[product.seller.walletAddress] = 0;
        }
      
        sellersMap[product.seller.walletAddress] += (product.priceInETH * quantity);
        totalOrderAmountInETH = totalOrderAmountInETH + (product.priceInETH * quantity);
      
        productsWithQuantity.push({
          product: product,
          quantity: quantity
        });
      }
    
      let buyerAddress = req.user.walletAddress;
      let sellerAddresses = [];
      let sellersDueAmountBeforeCommissionInWei = [];
      let sellersDueAmountAfterCommissionInWei = [];
      let index = 0;
      Object.keys(sellersMap).forEach(function (key) {
        sellerAddresses[index] = key;
        
        let amtBeforeComission = web3.toWei(sellersMap[key], "ether");
        sellersDueAmountBeforeCommissionInWei[index] = amtBeforeComission;
        
        let amtAfterCommission = Math.floor(((0.99) * amtBeforeComission));
        sellersDueAmountAfterCommissionInWei[index] = amtAfterCommission;
        index += 1;
      });
    
      createTradeContract(
        buyerAddress,
        sellerAddresses,
        sellersDueAmountBeforeCommissionInWei,
        sellersDueAmountAfterCommissionInWei,
        (err, result) => {
          if (err) {
            next(err);
          } else {
            var order = new Order({
              buyer: req.user._id,
              productsWithQuantity: productsWithQuantity,
              shippingAddress: req.body.shippingAddress,
              totalOrderAmountInETH: totalOrderAmountInETH,
              tradeContractAddress: result.tradeContractAddress,
              txHash: result.txHash
            });
            order.save((newOrderErr, newOrder) => {
              if (newOrderErr) {
                next(newOrderErr);
              } else {
                res.status(201).send(newOrder);
              }
            });
          }
        }
      );
    }
  });
});

router.post('/:id/seller/:sellerId/pay', (req, res, next) => {
  try {
    Order.findOne({_id: mongoose.Types.ObjectId(req.params.id)}).populate('buyer').exec((findOrderErr, order) => {
      if (findOrderErr) {
        next(findOrderErr);
      } else if (!order) {
        next(new HttpError(400, res.__('ORDER_NOT_FOUND_BY_ID')));
      } else if (!req.user._id.equals(order.buyer._id)) {
        next(new HttpError(400, res.__('ORDER_BUYER_MISMATCH')));
      } else {
        User.findById(mongoose.Types.ObjectId(req.params.sellerId), (findSellerErr, seller) => {
          if (findSellerErr) {
            next(findSellerErr);
          } else if (!seller) {
            next(new HttpError(400, res.__('SELLER_NOT_FOUND_BY_ID')));
          } else {
            paySeller(order.tradeContractAddress, seller.walletAddress, (paySellerErr, result) => {
              if (paySellerErr) {
                next(paySellerErr);
              } else {
                if (!order.transactions) {
                  /*eslint-disable no-param-reassign*/
                  order.transactions = [];
                }
          
                let newTransactions = [];
                newTransactions.push({
                  txHash: result.txHash,
                  address: result.sellerWalletAddress,
                  amountTransferredInETH: result.amountTransferredToSellerInETH
                });
          
                if (result.transferredRemainingToOwner) {
                  newTransactions.push({
                    txHash: result.txHash,
                    address: ETH_ACCOUNT_ADDRESS,
                    amountTransferredInETH: result.amountTransferredToOwnerInETH
                  })
                }
          
                order.transactions.push(newTransactions[0]);
                if (newTransactions.length === 2) {
                  order.transactions.push(newTransactions[1]);
                }
          
                order.save((orderUpdateErr) => {
                  if (orderUpdateErr) {
                    next(orderUpdateErr);
                  } else {
                    res.status(200).send(newTransactions);
                  }
                });
              }
            });
          }
        });
      }
    });
  } catch (e) {
    // if req.params.id is not a valid id, it might throw
    // Argument passed in must be a single String of 12 bytes or a string of 24 hex characters
    next(new HttpError(400, res.__('INVALID_ORDER_ID')));
  }
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