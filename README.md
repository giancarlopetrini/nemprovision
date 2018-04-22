# nemprovision
A simple API for creating valid NEM addresses and wallets, and storing them in a levelDB instance.

### Getting Started

To initialize the db and run the first time: `npm install && npm run new`  
*This will clean out any artifacts in the `walletdb` folder. **Do not** perform if migrating an existing implementation to a new server/deployment without backing up `walletdb` first!*

On subsequent starts, use:     
`npm run dev` for use with NEM testnet  
`npm run prod` for use wth NEM mainnet


### Usage

In order to create or retrieve a NEM wallet and its public address, make a POST request to the uri: `/v1/wallet/:id`

Posting to the above resource will perform the following:
1. The ID parameter in the request will be treated as the NEM wallet and account 'id'
2. Each wallet will be created with a randomly generated password. This password is currently made available via `console.log` on the server, but may be returned only on the f*irst response to POST requests containing unique id's*, in future iterations.
3. A NEM wallet file string will be created, and encoded in base64. This, and the wallet's primary account (public address), will be stored in a levelDB instance. The key for this new record will remain the original 'id', while the value will be the newly created object.