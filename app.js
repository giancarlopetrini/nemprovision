var express = require('express');
var bodyParser = require('body-parser');
var app = express();
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: false
}))

// parse application/json
app.use(bodyParser.json())

var nem = require("nem-sdk").default;

var levelup = require('levelup');
var leveldown = require('leveldown');
var db = levelup(leveldown('./walletdb'));

app.listen(3000);

app.post("/v1/wallet/:id", (req, res) => {
    var id = req.params.id;
    // check if id already has wallet in db
    db.get(id, (error, value) => {
        if (error == "NotFoundError: Key not found in database [" + id + "]") {
            console.log("Creating wallet for: " +id);
            // run createWallet code here.. then take output
            // and write to db
            var pubKey = generateKeyPair();
            console.log("pub key: ", pubKey);

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
            })
        } else {
            res.send({
                id: id,
                account: value.toString()
            })
        };
    });
});

// nem stuff goes here
var generateKeyPair = () => {
    // make random bytes
    var rBytes = nem.crypto.nacl.randomBytes(32);
    // convert random to hex (make backup?)
    var privateKey = nem.utils.convert.ua2hex(rBytes);
    console.log("private key:", privateKey);
    //generate keypair itself
    var keyPair = nem.crypto.keyPair.create(privateKey);

    return keyPair.publicKey.toString();
}