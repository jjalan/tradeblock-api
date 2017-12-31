module.exports = [
  {
    "constant": true,
    "inputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "name": "isInstantiation",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "",
        "type": "address"
      },
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "instantiations",
    "outputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
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
    "name": "create",
    "outputs": [
      {
        "name": "tradeContract",
        "type": "address"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "creator",
        "type": "address"
      }
    ],
    "name": "getInstantiationCount",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "name": "sender",
        "type": "address"
      },
      {
        "indexed": false,
        "name": "instantiation",
        "type": "address"
      }
    ],
    "name": "ContractInstantiation",
    "type": "event"
  }
];