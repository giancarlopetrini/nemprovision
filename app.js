var express = require('express');
var bodyParser = require('body-parser');
var levelup = require('levelup');
var leveldown = require('leveldown');
var encoding = require('encoding-down');
var randomstring = require('randomstring');
var nem = require("nem-sdk").default;

var app = express();
app.use(bodyParser.json())
var db = levelup(encoding(leveldown('./walletdb'), {
    valueEncoding: 'json'
}));

const PORT = process.env.PORT || 3000;
const NEMNET = process.env.NEMNET || nem.model.network.data.testnet.id;

app.listen(PORT, () => {
    console.log("App listening on port: ", PORT, "\nUsing NEM network: ", NEMNET)
});

const genWalletFile = (id, wallet) => {
    // stringify wallet then convert to base64
    var wordArray = nem.crypto.js.enc.Utf8.parse(JSON.stringify(wallet));
    var base64 = nem.crypto.js.enc.Base64.stringify(wordArray);

    return base64
}

const genWallet = (id) => {
    /* wallet.algo options:
            PRNG = pass:bip32
            private key wallets = pass:enc
            brain wallets = pass:6k
            Hardware wallets = trezor
    */
    console.log("Creating wallet for id:" + id);

    var randPass = randomstring.generate();
    var wallet = nem.model.wallet.createPRNG(id, randPass, NEMNET);

    console.log("Password: --> ", randPass);

    var walletFile = genWalletFile(id, wallet);

    return {
        account: wallet.accounts[0].address,
        walletFile: walletFile
    }
}

app.post("/v1/wallet/:id", (req, res) => {
    var id = req.params.id;
    db.get(id, (error, value) => {
        // if id/wallet NOT in db:
        if (error == "NotFoundError: Key not found in database [" + id + "]") {
            var userObj = genWallet(id);

            console.log("userObj: --> ", userObj);
            console.log("--------");

            if (!nem.model.address.isValid(userObj.account)) {
                console.log("Address validation failed");
                res.status(500);
                res.send("NEM address failed validation");

                return
            }

            db.put(id, userObj, (error) => {
                if (error) {
                    console.log("Unable to add record..", error)
                    res.status(500);
                    res.send("Unable to add record to database.");

                    return
                }
            })
            res.send({
                id: id,
                account: userObj.account
            })
        } else {
            // if id/wallet DOES exist:
            console.log('value: ', value);
            console.log("--------");
            res.send({
                id: id,
                account: value.account
            })
        }
    });
});