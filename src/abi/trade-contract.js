module.exports = [
  {
    "constant": false,
    "inputs": [
      {
        "name": "_seller",
        "type": "address"
      }
    ],
    "name": "paySeller",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "name": "_owner",
        "type": "address"
      },
      {
        "name": "_buyer",
        "type": "address"
      },
      {
        "name": "_sellers",
        "type": "address[]"
      },
      {
        "name": "_sellersDueAmountBeforeCommissionInWei",
        "type": "uint256[]"
      },
      {
        "name": "_sellersDueAmountAfterCommissionInWei",
        "type": "uint256[]"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "payable": true,
    "stateMutability": "payable",
    "type": "fallback"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "name": "seller",
        "type": "address"
      },
      {
        "indexed": false,
        "name": "amountTransferredToSellerInWei",
        "type": "uint256"
      },
      {
        "indexed": false,
        "name": "transferredRemainingToOwner",
        "type": "bool"
      },
      {
        "indexed": false,
        "name": "amountTransferredToOwnerInWei",
        "type": "uint256"
      }
    ],
    "name": "Paid",
    "type": "event"
  }
];