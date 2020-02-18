let bodyParser = require('body-parser')
let express = require('express');
var http = require('http');
let fs = require('fs');
let session = require('express-session');
let app = express();
let fetch = require("node-fetch");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/public',express.static('public'));
app.use(express.static('www'));
let persistentDataBaseURL =  'persistDB.json'

// Save DB
app.put('/saveDatabase', function (req, res) {
    try {
        console.log("Saving database");
        fs.writeFile(persistentDataBaseURL, JSON.stringify(req.body.database), function (err) {
            if (err) {
                console.log(err);
                throw err;
            }
            console.log("Save database succeeded.")
            res.sendStatus(200);
        });
    }
    catch (err) {
        console.log(err);
        res.end('-1');
        throw err; }
})

// Clean DB
app.put('/data/clean', function (req, res) {
    try {
        console.log("Cleaning database");
        fs.writeFile(persistentDataBaseURL, JSON.stringify({}), function (err) {
            if (err) {
                console.log(err);
                throw err;
            }
            console.log("Clean database succeeded.")
            res.sendStatus(200);
        });
    }
    catch (err) {
        console.log(err);
        res.end('-1');
        throw err; }
})

app.get('/data/persist', function (req, res) {
    fs.readFile(persistentDataBaseURL, function (err, data) {
        if (err) {
            if (isSessionExist(req)) {
                res.json('-1');
            } else { throw err; } }
        else {
            dataBase = JSON.parse(data);
            return res.json(dataBase); }
    });
})
let server = app.listen(8081, function () {
    let host = server.address().address
    let port = server.address().port

    console.log("Persist app listening at http://%s:%s", host, port)

})