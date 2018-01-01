## Getting Started:

```
npm install
```

```
npm start
```

## APIs:

### Create User:
```
curl -H "Content-Type: application/json" -X POST -d '{"firstName":"User 1","email":"user1@yoaccess.com","password":"123456789", "walletAddress":"0xcf7717a448b486748295bfB192085Ec5c64432c0"}' http://api.tradeblock.trysquad.com/auth/register
```
Sample response:
```
{"__v":0,"updatedAt":"2018-01-01T12:51:19.022Z","createdAt":"2018-01-01T12:51:19.022Z","firstName":"User 1","email":"user1@yoaccess.com","password":"$2a$10$vNeoA8ye.oB6SS4/TRi9aey0Cd4rJtGYE1x7wsMqiQ.Z0tocS0FWi","walletAddress":"0xcf7717a448b486748295bfB192085Ec5c64432c0","_id":"5a4a2ec65f6821001f4e85ff","isActive":true,"shippingAddresses":[]}
```
### Login User:
```
curl -H "Content-Type: application/json" -X POST -d '{"email":"user1@yoaccess.com","password":"123456789"}' http://api.tradeblock.trysquad.com/auth/login
```
Sample response:
```
{"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVhNGEyZWM2NWY2ODIxMDAxZjRlODVmZiIsImlhdCI6MTUxNDgxMTM5Mn0.mHMIKVMziji4yCVcHDn23QXInZa_qBF9rs-hMogZeqQ"}
```
### Create Product:
```
curl -H "Content-Type: application/json" -H "Authorization:Token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVhNGEyZWM2NWY2ODIxMDAxZjRlODVmZiIsImlhdCI6MTUxNDgxMTM5Mn0.mHMIKVMziji4yCVcHDn23QXInZa_qBF9rs-hMogZeqQ"  -d '{"name": "Product 1", "priceInETH": 0.02}' -X POST http://api.tradeblock.trysquad.com/products
```
Sample response:
```
{"__v":0,"updatedAt":"2018-01-01T12:58:56.790Z","createdAt":"2018-01-01T12:58:56.790Z","name":"Product 1","priceInETH":0.02,"seller":"5a4a2ec65f6821001f4e85ff","_id":"5a4a30905f6821001f4e8602","isActive":true}
```

### Create Order:
```
curl -H "Content-Type: application/json" -H "Authorization:Token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVhNGEyZmRlNWY2ODIxMDAxZjRlODYwMSIsImlhdCI6MTUxNDgxMTQxOX0._gRAOCk3ereojsWkci56Qdrn2k7E_c5ZVxQRe1_xZCo"  -d '{"products": [{"id": "5a4a30905f6821001f4e8602", "quantity": "2"}, {"id": "5a4a30ce5f6821001f4e8603", "quantity": "5"}], "shippingAddress": {"address1": "2 R 12 R.C.Vyas Colony", "city": "Bhilwara", "state": "Rajasthan", "country": "India", "zipcode": "311001"}}' -X POST http://api.tradeblock.trysquad.com/orders
```
Sample response:
```
{"__v":0,"updatedAt":"2018-01-01T13:02:35.715Z","createdAt":"2018-01-01T13:02:35.715Z","buyer":"5a4a2fde5f6821001f4e8601","shippingAddress":{"updatedAt":"2018-01-01T13:02:35.714Z","createdAt":"2018-01-01T13:02:35.714Z","address1":"2 R 12 R.C.Vyas Colony","city":"Bhilwara","state":"Rajasthan","country":"India","zipcode":"311001","_id":"5a4a316b5f6821001f4e8605","isActive":true},"totalOrderAmountInETH":0.29,"tradeContractAddress":"0xa86385131959abdbb09a6334aae720febb37bda9","txHash":"0x8a45ec93fc1be1dd1e58523d0f778d42a3aac8fc550a086d00109eb1d42eebe8","_id":"5a4a316b5f6821001f4e8604","isActive":true,"transactions":[],"productsWithQuantity":[{"updatedAt":"2018-01-01T13:02:35.710Z","createdAt":"2018-01-01T13:02:35.710Z","product":{"_id":"5a4a30905f6821001f4e8602","updatedAt":"2018-01-01T12:58:56.790Z","createdAt":"2018-01-01T12:58:56.790Z","name":"Product 1","priceInETH":0.02,"seller":"5a4a2ec65f6821001f4e85ff","__v":0,"isActive":true},"quantity":2,"_id":"5a4a316b5f6821001f4e8607"},{"updatedAt":"2018-01-01T13:02:35.714Z","createdAt":"2018-01-01T13:02:35.714Z","product":{"_id":"5a4a30ce5f6821001f4e8603","updatedAt":"2018-01-01T12:59:58.430Z","createdAt":"2018-01-01T12:59:58.430Z","name":"Product 2","priceInETH":0.05,"seller":"5a4a2fb55f6821001f4e8600","__v":0,"isActive":true},"quantity":5,"_id":"5a4a316b5f6821001f4e8606"}]}
```

### Pay Selller:
```
curl -H "Content-Type: application/json" -H "Authorization:Token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVhNGEyZmRlNWY2ODIxMDAxZjRlODYwMSIsImlhdCI6MTUxNDgxMTQxOX0._gRAOCk3ereojsWkci56Qdrn2k7E_c5ZVxQRe1_xZCo" -X POST http://api.tradeblock.trysquad.com/orders/5a4a316b5f6821001f4e8604/seller/5a4a2ec65f6821001f4e85ff/pay
```
Sample response:
```

```