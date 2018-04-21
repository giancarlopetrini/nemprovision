var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var levelup = require('levelup');
var leveldown = require('leveldown');
var encoding = require('encoding-down');
var randomstring = require('randomstring');
var nem = require("nem-sdk").default;

var app = express();
app.use(bodyParser.json())
var db = levelup(leveldown('./walletdb'), {valueEncoding: 'json'});

app.listen(3000);

// make test user to see for duplicates?
db.put("test", "test string account");
db.put("test", "duplicate -- test string account");

app.post("/v1/wallet/:id", (req, res) => {
    var id = req.params.id;
    // check if id already has wallet in db
    db.get(id, (error, value) => {
        if (error == "NotFoundError: Key not found in database [" + id + "]") {
            console.log("Creating wallet for: " + id);
            // run createWallet code here.. then take output
            // and write to db

            /* wallet.algo s:
            PRNG = pass:bip32
            private key wallets = pass:enc
            brain wallets = pass:6k
            Hardware wallets = trezor
            */

            // random string generator for password
            var randPass = randomstring.generate();
            var wallet = nem.model.wallet.createPRNG(id, randPass, nem.model.network.data.testnet.id);
            var walletAccount = wallet.accounts[0];
            var walletAddress = wallet.accounts[0].address;
            console.log("Wallet Address: ", walletAddress);
            console.log("Password: -> ", randPass);

            // create wallet file, add to user obj and store

            var userObj = {
                account: walletAddress,
                walletFile: "wallet filed saved into leveldb?, maybe......"
                // walletObj: wallet
            }

            console.log(userObj);

            if (!nem.model.address.isValid(walletAddress)) {
                console.log("Address validation?", isValid);
                res.status(500);
                res.send("NEM address failed validation");

                return
            }

            db.put(id, {test: 'object'}, (error) => {
                if (error) {
                    console.log("Unable to add record..", error)
                    res.status(500);
                    res.send("Unable to add record to database.");

                    return
                }
            })
            res.send({
                id: id,
                account: walletAddress
            })
        } else {
            res.send({
                id: id,
                account: value
            })
        }
    });
});