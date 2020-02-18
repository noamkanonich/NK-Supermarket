let bodyParser = require('body-parser');
let express = require('express');
let http = require('http');
let fs = require('fs');
let session = require('express-session');
let app = express();
let fetch = require("node-fetch");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/public',express.static('public'));
app.use(express.static('www'));

let cookies = {
    generated: false,
    generationDate: undefined,
    currentAge: 0,
    maxAge: 60 * 1000 * 30,
    isAlive: function () {
        return (this.currentAge < this.maxAge)
    }
};

app.use(session({
    secret: 'web-applications-ex2',
    resave: true,
    saveUninitialized: true,
}));

let sessionless_requests = ['/', '/users/login', '/users/register', '/login.html', '/register.html'];
let assigned_id = undefined;

let dbFileName = "db.json";

let login = __dirname + "/www/login.html";
let register = __dirname + "/www/register.html";
let shoppingList = __dirname + "/shoppinglist.html";
let about = __dirname + "/www/about.html";
let vegetables = __dirname + "/www/vegetables.html";
let meat = __dirname + "/www/meat.html";
let fruits = __dirname + "/www/fruits.html";
let drinks = __dirname + "/www/drinks.html";
let other = __dirname + "/www/other.html";
let contactus = __dirname + "/www/contactus.html";

let firstLogin = true;

function sessionAlive(req) {
    if (cookies.generated) {
        cookies.currentAge = Date.now() - cookies.generationDate;
    }
    if (req.session.views && cookies.generated && cookies.isAlive()) {
        req.session.views++;
        return true;
    }
    else {
        destroySession();
        return false;
    }
}

function destroySession() {
    cookies.expired = true;
    assigned_id = undefined;
}

function initSession(req, key) {
    assigned_id = key;
    cookies.generationDate = Date.now();
    cookies.generated = true;
    req.session.views = 1
    req.session.save();
}

app.use(function (req, res, next) {
    if (sessionless_requests.indexOf(req.url) > -2 || sessionAlive(req)) {
        return next();
    }
    else {
        if(req.headers.referer == undefined)
            res.redirect('/');
        else{
            res.end('-1');
        }
    }
});

app.get('/', function (req, res) {
    res.sendFile(login);
});

app.get('/register.html', function (req, res) {
    res.sendFile(register);
});

app.get('/shoppingList.html', function (req, res) {
    res.sendFile(shoppingList);
});

app.get('/about.html', function (req, res) {
    res.sendFile(shoppingList);
});

app.get('/vegetables.html', function (req, res) {
    res.sendFile(shoppingList);
});

app.get('/meat.html', function (req, res) {
    res.sendFile(shoppingList);
});

app.get('/drinks.html', function (req, res) {
    res.sendFile(shoppingList);
});

app.get('/fruits.html', function (req, res) {
    res.sendFile(shoppingList);
});

app.get('/other.html', function (req, res) {
    res.sendFile(shoppingList);
});

app.get('/contactus.html', function(req, res){
    res.sendFile(shoppingList);
});

app.post('/shoppingList.html', function (req, res) {
    res.sendFile(shoppingList);
});


app.post('/users/logout', function (req, res) {
    destroySession();
    res.end('-1');
})

/////////////////////////////////////////////////////////////////////////////////
var users = [
    {
        id: 1,
        full_name: 'Noam Kanonich',
        phone_number: '12345',
        email: 'nok@walla.com',
        message: 'hello',
    }
]

app.post('/users/add', function(req, res){
    var newUser = [{
        full_name: req.body.full_name,
        phone_number: req.body.phone_number,
        email: req.body.email,
        message: req.body.message
    }]
    console.log(newUser);
});

////////////////////////////////////////////////////////////////////////////////


app.post('/users/register', function (req, res) {
    try {
        fs.readFile(dbFileName, function (err, data) {
            if (err) { throw err; }
            let dataBase = JSON.parse(data);
            // check if this username is exists
            Object.keys(dataBase).forEach(function (key) {
                if (dataBase[key]["username"] === req.body.user) {
                    res.end('1');
                }
            });

            //Create a new id
            dataBase["id_" + Object.keys(dataBase).length] =
                {
                    "name": req.body.name,
                    "username": req.body.user,
                    "pass": req.body.pass,
                    "numberOfProducts": 0,
                    "vegetablesProducts": {},
                    "fruitsProducts": {},
                    "meatProducts": {},
                    "drinksProducts": {},
                    "otherProducts": {},
                    "fullname": {},
                    "phonenumber": {},
                    "messages": {},
                    "numberOfMessages": 0,
                    "amounts": {},
                    "purchasedate": {},
                    "numberOfPurchase": 0
                };

            // update the db
            fs.writeFile(dbFileName, JSON.stringify(dataBase), function (err) {
                if (err) {
                    if(sessionAlive(req)) {
                        res.end('1');}
                    else {
                        res.end('-1');
                    }
                }

            });
            res.end('0');
        });
    } catch (err) {
        res.end('2');
    }
});

app.post('/users/login', function (req, res) {
    try {
        fs.readFile('db.json', function (err, data) {
            if (err) {
                throw err;
            }
            let dataBase = JSON.parse(data);

            // validate username & password
            Object.keys(dataBase).forEach(function (key) {
                if ((req.body.pass === dataBase[key]["pass"]) && (req.body.user === dataBase[key]["username"])) {
                    initSession(req, key);
                    res.status(302);
                    res.end('0');
                }
                if ((req.body.pass !== dataBase[key]["pass"]) && (req.body.user === dataBase[key]["username"])){
                    res.end('2');
                }
            });

            // not found
            res.end('1');
        });
    } catch (err) {
        res.end(sessionAlive(req) ? '1' : '-1');
        res.end('2');

    }
});


// Show the full products list
app.get('/products', function (req, res) {
    fs.readFile(dbFileName, function (err, data) {
        if (err) {
            if (sessionAlive(req)) {
                res.json('-1');
            } else { throw err; } }
        else {
            dataBase = JSON.parse(data);
            let res_data = [];
            res_data[0] = dataBase[assigned_id]["vegetablesProducts"];
            res_data[1] = dataBase[assigned_id]["fruitsProducts"];
            res_data[2] = dataBase[assigned_id]["meatProducts"];
            res_data[3] = dataBase[assigned_id]["drinksProducts"];
            res_data[4] = dataBase[assigned_id]["otherProducts"];
            return res.json(res_data); }
    });
})



app.get('/messages', function (req, res) {
    fs.readFile(dbFileName, function (err, data) {
        if (err) {
            if (sessionAlive(req)) {
                res.json('-1');
            } else { throw err; } }
        else {
            dataBase = JSON.parse(data);
            return res.json(dataBase[assigned_id]["messages"]); }
    });
})


app.put('/message', function (req, res) {
    try {
        fs.readFile(dbFileName, function (err, data) {
            if (err) throw err;
            let dataBase = JSON.parse(data);
            let userMessageID =  dataBase[assigned_id].numberOfMessages;
            dataBase[assigned_id].numberOfMessages = dataBase[assigned_id].numberOfMessages + 1;

            dataBase[assigned_id]['messages'][userMessageID] = req.body.message;
            dataBase[assigned_id]['fullname'][userMessageID] = req.body.fullname;
            dataBase[assigned_id]['phonenumber'][userMessageID] = req.body.phonenumber;

            fs.writeFile(dbFileName, JSON.stringify(dataBase), function (err) {
                if (err) {
                    if (sessionAlive(req)) {
                        res.json('-1'); }
                    else { throw err; }
                }
                // TODO: here
                res.json(userMessageID);
            });
        });

    } catch (err) {
        if (sessionAlive(req)) {
            res.json('-1'); }
        else {
            throw err; }
    }

})


app.put('/fullname', function (req, res) {
    try {
        fs.readFile(dbFileName, function (err, data) {
            if (err) throw err;
            let dataBase = JSON.parse(data);
            let userMessageID =  dataBase[assigned_id].numberOfMessages;
            dataBase[assigned_id]['fullname'][userMessageID] = req.body.fullname;

            fs.writeFile(dbFileName, JSON.stringify(dataBase), function (err) {
                if (err) {
                    if (sessionAlive(req)) {
                        res.json('-1'); }
                    else { throw err; }
                }
                // TODO: here
                res.json(userMessageID);
            });
        });

    } catch (err) {
        if (sessionAlive(req)) {
            res.json('-1'); }
        else {
            throw err; }
    }

})


app.put('/phonenumber', function (req, res) {
    try {
        fs.readFile(dbFileName, function (err, data) {
            if (err) throw err;
            let dataBase = JSON.parse(data);
            let userMessageID =  dataBase[assigned_id].numberOfMessages;
            dataBase[assigned_id]['phonenumber'][userMessageID] = req.body.phonenumber;

            fs.writeFile(dbFileName, JSON.stringify(dataBase), function (err) {
                if (err) {
                    if (sessionAlive(req)) {
                        res.json('-1'); }
                    else { throw err; }
                }
                // TODO: here
                res.json(userMessageID);
            });
        });

    } catch (err) {
        if (sessionAlive(req)) {
            res.json('-1'); }
        else {
            throw err; }
    }

})


//show all purchases amounts
app.get('/amounts', function (req, res) {
    fs.readFile(dbFileName, function (err, data) {
        if (err) {
            if (sessionAlive(req)) {
                res.json('-1');
            } else { throw err; } }
        else {
            dataBase = JSON.parse(data);
            return res.json(dataBase[assigned_id]["amounts"]); }
    });
})

//show all purchases dates
app.get('/purchasesdate', function (req, res) {
    fs.readFile(dbFileName, function (err, data) {
        if (err) {
            if (sessionAlive(req)) {
                res.json('-1');
            } else { throw err; } }
        else {
            dataBase = JSON.parse(data);
            return res.json(dataBase[assigned_id]["purchasedate"]); }
    });
})


//create new purchase amount
app.put('/amount', function (req, res) {
    try {
        fs.readFile(dbFileName, function (err, data) {
            if (err) throw err;
            let dataBase = JSON.parse(data);
            let userID =  dataBase[assigned_id].numberOfPurchase;
            dataBase[assigned_id].numberOfPurchase = dataBase[assigned_id].numberOfPurchase + 1;
            // Update the dataBase with new amount
            dataBase[assigned_id]['amounts'][userID] = req.body.amount;
            dataBase[assigned_id]['purchasedate'][userID] = req.body.purchasedate;


            // Add the new message to the dataBase.json file by updating it
            fs.writeFile(dbFileName, JSON.stringify(dataBase), function (err) {
                if (err) {
                    if (sessionAlive(req)) {
                        res.json('-1'); }
                    else { throw err; }
                }
                // TODO: here
                res.json(userID);
            });
        });

    } catch (err) {
        if (sessionAlive(req)) {
            res.json('-1'); }
        else {
            throw err; }
    }

})

//create new purchase date
app.put('/purchasedate', function (req, res) {
    try {
        fs.readFile(dbFileName, function (err, data) {
            if (err) throw err;
            let dataBase = JSON.parse(data);
            let userID =  dataBase[assigned_id].numberOfPurchase;
            dataBase[assigned_id]['purchasedate'][userID] = req.body.purchasedate;

            fs.writeFile(dbFileName, JSON.stringify(dataBase), function (err) {
                if (err) {
                    if (sessionAlive(req)) {
                        res.json('-1'); }
                    else { throw err; }
                }
                // TODO: here
                res.json(userID);
            });
        });

    } catch (err) {
        if (sessionAlive(req)) {
            res.json('-1'); }
        else {
            throw err; }
    }

})

//delete a purchase amount
app.delete('/amount/:userID', function (req, res) {
    try {
        fs.readFile(dbFileName, function (err, data) {
            if(err) {
                throw err; }
            let dataBase = JSON.parse(data);

            Object.keys(dataBase[assigned_id]["amounts"]).forEach(function(userIDkey) {
                if(userIDkey === req.params.userID)
                    delete dataBase[assigned_id]["amounts"][req.params.userID];
            });

            // update the dataBase.json file
            fs.writeFile(dbFileName, JSON.stringify(dataBase), function (err) {
                if (err) {
                    if (sessionAlive(req)) {
                        res.json('-1'); }
                    else { throw err; }
                }
            });
        });

        res.end('0');
    } catch (err) {
        if(sessionAlive(req)) {
            res.end('1');}
        else {
            res.end('-1');
        }
    }})


//show only vegetables products list
app.get('/products/vegetablesProducts', function (req, res) {
    fs.readFile(dbFileName, function (err, data) {
        if (err) {
            if (sessionAlive(req)) {
                res.json('-1');
            } else { throw err; } }
        else {
            dataBase = JSON.parse(data);
            let res_data = [];
            res_data = dataBase[assigned_id]["vegetablesProducts"];
            return res.json(res_data); }
    });
})

//show only drinks products list
app.get('/products/drinksProducts', function (req, res) {
    fs.readFile(dbFileName, function (err, data) {
        if (err) {
            if (sessionAlive(req)) {
                res.json('-1');
            } else { throw err; } }
        else {
            dataBase = JSON.parse(data);
            let res_data=[];
            res_data = dataBase[assigned_id]["drinksProducts"];
            return res.json(res_data); }
    });
})

//show only fruits products list
app.get('/products/fruitsProducts', function (req, res) {
    fs.readFile(dbFileName, function (err, data) {
        if (err) {
            if (sessionAlive(req)) {
                res.json('-1');
            } else { throw err; } }
        else {
            dataBase = JSON.parse(data);
            let res_data = [];
            res_data = dataBase[assigned_id]["fruitsProducts"];
            return res.json(res_data); }
    });
})

//show only meat products list
app.get('/products/meatProducts', function (req, res) {
    fs.readFile(dbFileName, function (err, data) {
        if (err) {
            if (sessionAlive(req)) {
                res.json('-1');
            } else { throw err; } }
        else {
            dataBase = JSON.parse(data);
            let res_data = [];
            res_data = dataBase[assigned_id]["meatProducts"];
            return res.json(res_data); }
    });
})

//show all the other products list
app.get('/products/otherProducts', function (req, res) {
    fs.readFile(dbFileName, function (err, data) {
        if (err) {
            if (sessionAlive(req)) {
                res.json('-1');
            } else { throw err; } }
        else {
            dataBase = JSON.parse(data);
            let res_data = [];
            res_data = dataBase[assigned_id]["otherProducts"];
            return res.json(res_data); }
    });
})

//create new product and add it to the list
app.put('/product', function (req, res) {
    try {
        fs.readFile(dbFileName, function (err, data) {
            if (err) throw err;
            let dataBase = JSON.parse(data);
            let typeOfProduct = req.body.typeOfProduct;
            console.log("server.js - line 182 - numberOfProducts before change = " + dataBase[assigned_id].numberOfProducts);
            let productID =  dataBase[assigned_id].numberOfProducts;
            dataBase[assigned_id].numberOfProducts = dataBase[assigned_id].numberOfProducts + 1;
            console.log("server.js - line 174 - numberOfProducts after change = " + dataBase[assigned_id].numberOfProducts);
            // Update dataBase with a new message
            dataBase[assigned_id][typeOfProduct][productID] = req.body.product;

            // Add the new message to the dataBase.json file by updating it
            fs.writeFile(dbFileName, JSON.stringify(dataBase), function (err) {
                if (err) {
                    if (sessionAlive(req)) {
                        res.json('-1'); }
                    else { throw err; }
                }
                // TODO: here
                res.json(productID);
            });
        });

    } catch (err) {
        if (sessionAlive(req)) {
            res.json('-1'); }
        else {
            throw err; }
    }

})

//delete a product from the list
app.delete('/product/:idProd', function (req, res) {
    try {
        fs.readFile(dbFileName, function (err, data) {
            if(err) {
                throw err; }
            let dataBase = JSON.parse(data);

            Object.keys(dataBase[assigned_id]).forEach(function(typeOfProductKey) {
                Object.keys(dataBase[assigned_id][typeOfProductKey]).forEach(function(idProductKey) {
                    if(idProductKey == req.params.idProd)
                        delete dataBase[assigned_id][typeOfProductKey][req.params.idProd];
                });
            });

            // update the dataBase.json file
            fs.writeFile(dbFileName, JSON.stringify(dataBase), function (err) {
                if (err) {
                    if (sessionAlive(req)) {
                        res.json('-1'); }
                    else { throw err; }
                }
            });
        });

        res.end('0');
    } catch (err) {
        if(sessionAlive(req)) {
            res.end('1');}
        else {
            res.end('-1');
        }
    }})

//edit a product from the list
app.post('/product/:idProd', function (req, res) {
    let flag = false;
    try {
        fs.readFile(dbFileName, function (err, data) {
            if (err) { throw err; }
            let dataBase = JSON.parse(data);

            Object.keys(dataBase[assigned_id]).forEach(function(typeOfProductKey) {
                Object.keys(dataBase[assigned_id][typeOfProductKey]).forEach(function(idProductKey) {
                    if(idProductKey === req.params.idProd) {
                        flag = true;
                        dataBase[assigned_id][typeOfProductKey][req.params.idProd] = req.body.product;
                        console.log(req.body.product);
                    }
                });
            });

            if (flag === false) {
                res.end('0');
            }

            // update the dataBase.json file
            fs.writeFile(dbFileName, JSON.stringify(dataBase), function (err) {
                if (err) {
                    if(sessionAlive(req)) {
                        res.end('1');}
                    else {
                        res.end('-1');
                    }
                }
            });
        });

        res.end('0');
    } catch (err) {
        if(sessionAlive(req)) {
            res.end('1');}
        else {
            res.end('-1');
        }
    }
})


function uploadDatabase(){

    fetch('http://localhost:8081/data/persist', {
        credentials: 'include'})
        .then(function(response) {
            return response.json();
        })
        .then(function(res) {
            if(res == '-1') { window.location.href = '/'; }
            else{
                // update the dataBase.json file
                fs.writeFile(dbFileName, JSON.stringify(res), function (err) {
                    if (err) {
                        if (sessionAlive(req)) {
                            res.json('-1'); }
                        else { throw err; }
                    }
                });
            };
        })
};

setInterval(saveDatabase, 10000)
function saveDatabase() {
    try {
        console.log("Attempting to save database");
        fs.readFile(dbFileName, function (err, data) {
            if (err) { throw err; }
            let dataBase = JSON.parse(data);

            fetch('http://localhost:8081/saveDatabase', {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({database: dataBase})
            })
        });
        console.log("Successfully persisted database");
    } catch (err) {
        console.log(err);
        res.end('-1');
    }
}

//clear all the database
app.get('/clearDatabase', function (req, res) {
    console.log("Attempting to clear database");
    fetch('http://localhost:8081/data/clean', {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        credentials: 'include',
    });
    console.log("Successfully cleared database");
    return res.sendStatus(200);
});


let server = app.listen(3000, function () {
    let host = server.address().address
    let port = server.address().port
    console.log("Main app listening at http://%s:%s", host, port)
    uploadDatabase()
})