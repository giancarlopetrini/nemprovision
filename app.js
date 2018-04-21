var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var levelup = require('levelup');
var leveldown = require('leveldown');
var nem = require("nem-sdk").default;

var app = express();
app.use(bodyParser.json())
var db = levelup(leveldown('./walletdb'));

app.listen(3000);

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

            var wallet = nem.model.wallet.createPRNG(id, "password", nem.model.network.data.testnet.id);
            // Create a common object
            // var common = nem.model.objects.create("common")("walletPassword/password", "");

            // Get the wallet account to decrypt
            var walletAccount = wallet.accounts[0];
            var walletAddress = wallet.accounts[0].address;
            console.log(walletAddress);

            // Decrypt account private key 
            // nem.crypto.helpers.passwordToPrivatekey(common, walletAccount, "pass:bip32");

            // The common object now has a private key
            // console.log(common)

            /* var [privateKey, pubKey] = generateKeyPair();
            console.log("pub key: ", pubKey);
            console.log("private key:", privateKey);

            generateWallet(id, privateKey);

            var address = nem.model.address.toAddress(pubKey, nem.model.network.data.mainnet.id);
            console.log("account address: ", address);

            if (!nem.model.address.isValid(address)) {
                console.log("Address validation?", isValid);
                res.status(500);
                res.send("NEM address failed validation");

                return
            }



            db.put(id, address, (error) => {
                if (error) {
                    console.log("Unable to add record..", error)
                    res.status(500);
                    res.send("Unable to add record to database.");

                    return
                }
            })
            res.send({
                id: id,
                account: address
            }) */
        } else {
            res.send({
                id: id,
                account: value.toString()
            })
        }
    });
});


var generateKeyPair = () => {
    // make random bytes
    var rBytes = nem.crypto.nacl.randomBytes(32);
    // convert random to hex (make backup?)
    var privateKey = nem.utils.convert.ua2hex(rBytes);
    //generate keypair itself
    var keyPair = nem.crypto.keyPair.create(privateKey);

    return [privateKey, keyPair.publicKey.toString()]
}

var generateWallet = (id, privateKey) => {
    // change password generation?
    var wallet = nem.model.wallet.importPrivateKey(id, "samplePass", privateKey,
        nem.model.network.data.mainnet.id);
    var wordArray = nem.crypto.js.enc.Utf8.parse(JSON.stringify(wallet));
    var base64 = nem.crypto.js.enc.Base64.stringify(wordArray);

    fs.writeFile("tmp/wallet" + id + ".wlt", base64, (error) => {
        if (error) return console.log(error);
    });


    console.log("/tmp/wallet" + id + ".wlt created!");

    // Create a common object
    var common = nem.model.objects.create("common")("walletPassword/samplePass", "");
    // Get the wallet account to decrypt
    var walletAccount = wallet.accounts[0];
    // Decrypt account private key 
    nem.crypto.helpers.passwordToPrivatekey(common, walletAccount, "pass:enc");
    // The common object now has a private key
    console.log(common);
}