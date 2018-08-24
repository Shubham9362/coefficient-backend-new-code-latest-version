var createError = require('http-errors');
var express = require('express');
var http = require('http2');
var path = require('path');
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var cors = require('cors');
var config = require('./config/storage');
var crypto = require('crypto');
var ObjectID = require('mongodb').ObjectID;
var randomstring = require("randomstring");
var responseTime = require('response-time');
var fs = require('fs');


var app = express();
app.use(cors()); // for allowing the option from another server 

// app.use(auth_config);
app.get('/', function (req, res) {
    res.status(200).json({ ok: 'ok' })
})
// app.use(parseFormdata.json());
app.use(bodyParser.json());    //converting the body data into json type

app.use(bodyParser.urlencoded({ extended: true }));

app.use(responseTime());  // calculate the time....

//Api for register the user.
app.post('/api/register', function (req, res) {
    if (!req.body.email || !req.body.password || !req.body.name) {
        res.status(422).json({ message: 'unprocessible entity' });
        return;
    }
    req.body.user_id = crypto.createHash('md5').update(req.body.email + Date.now()).digest('hex');
    var p = config.getDB().then(function (db) {
        db.collection("users").insertOne(req.body, function (err, obj) {

            if (err) res.status(400).json({ success: false, sucerror: err.errors })
            else {
                res.status(200).json({ success: true, message: 'Registered successfully.' })
            }
        })
    })

})

//Api's for Login users.
app.post('/api/login', function (req, res) {
    console.log('login details', req.body);
    var p = config.getDB().then(function (db) {
        db.collection("users").findOne({ email: req.body.email }, function (err, obj) {
            // console.log(obj)
            if (err) {
                res.status(500).json({ code: 500, errors: err });
            } else {
                if (obj) {
                    if (obj.password === req.body.password) {
                        var tokenObj = {
                            userId: obj.user_id
                        };

                        var token = jwt.sign(tokenObj, config.secret, { expiresIn: '24h' });

                        res.status(200).json({
                            'success': true,
                            'message': 'logged in successfully.',
                            data: {
                                'status': 'authorized',
                                'type': obj.type,
                                'email': obj.email,
                                'session_token': token,
                                'expiry_time': '24h',
                                'last_login': obj.last_login
                            }
                        });


                    } else {
                        res.status(401).json({
                            'success': false,
                            'status': 'unauthorized',
                            'message': 'Incorrect Username or Password'
                        });
                    }

                } else {
                    res.status(401).json({
                        'success': false,
                        'status': 'unauthorized',
                        'message': 'User does not exist'
                    });
                }
            }
        })
    })
})

// catch 404 and forward to error handler

// app middleware that will happen on every request to check JWT
app.use(function (req, res, next) {
    var token = req.header('Authorization') || req.query.state;
    if (token) {
        jwt.verify(token, 'appsecret', function (err, decoded) {
            if (err) {
                return res.status(401).json({ success: false, message: 'Failed to authenticate token.' });
            } else {
                req.userId = decoded.userId;
                next();
            }
        });
    } else {
        return res.status(401).send({
            success: false,
            message: 'No token provided.'
        });
    }
});
//end

//function for date of creation


function datecreate(date) {
    var month = date.getMonth() + 1;
    return date.getDate() + '-' + month + '-' + date.getFullYear();
};


function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}
//Api for insert the data.


app.post('/api/data', function (req, res) {
    // console.log('dat/')
    req.body.userId = req.userId;
    var createdate = new Date();

    CreationDate = datecreate(createdate);
    ModificationDate = datecreate(createdate);

    req.body.metadata.CreationDate = CreationDate;  // data Insertion time.
    req.body.metadata.ModificationDate = ModificationDate;   // data Modified time.
    //console.log('date********###',  req.body.metadata.CreationDate);
    req.body.metadata.userId = req.userId;
    var filename = req.body.metadata.fileName;
    
    var guid = (S4() + S4() + "-" + S4() + "-4" + S4().substr(0, 3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
    req.body.metadata.guid = guid;
    req.body.guid = guid;

    fs.writeFile('file/'+filename,JSON.stringify( req.body.data), "utf8",function(err,data){
        if(err){
            console.log(err);
        }
        else{
        console.log('saved!');
        // console.log('data',data);
        }
    });


    
    // req.body.userId = req.userId;
    // var createdate = new Date();

    // CreationDate = datecreate(createdate);
    // ModificationDate = datecreate(createdate);

    // req.body.metadata.CreationDate = CreationDate;  // data Insertion time.
    // req.body.metadata.ModificationDate = ModificationDate;   // data Modified time.
    // //console.log('date********###',  req.body.metadata.CreationDate);


    // var query = { userId: req.body.userId, fileName: req.body.metadata.fileName };

    // req.body.metadata.userId = req.userId;
    // if (req.body.data && req.body.metadata) {
    //     var p = config.getDB().then(function (db) {
    //         db.collection("Datametadata").findOne(query, function (err, data) {
    //             // console.log('data2***', data);
    //             if (err) {
    //                 res.status(404).json({ success: false, message: 'Data Not Found' })
    //             }
    //             else {
    //                 if (data != null) {
    //                     res.status(200).json({ success: false, message: 'file already exist' })
    //                 }
    //                 else {
    //                     db.collection("datainserts").insertOne(req.body.data, function (err, obj) {
    //                         var dataId = obj.insertedId.toString();

    //                         if (err) res.status(400).json({ success: false, sucerror: err.errors })
    //                         else {
    //                             req.body.metadata.dataId = dataId;
    //                             db.collection("Datametadata").insertOne(req.body.metadata, function (err, obj1) {
    //                                 if (err) res.status(400).json({ success: false, sucerror: err.errors })
    //                                 else {
    //                                     res.status(200).json({ success: true, message: 'inserted successfully.', id: req.body.metadata.dataId })
    //                                 }
    //                             })
    //                         }
    //                     })
    //                 }//nested else
    //             }// else
    //         }) //collection 1st
    //     }) // config
    // }
    // else {
    //     console.log("data is not in proper format");
    //     res.status(401).json({ success: false, message: 'format of the data not proper ' });
    // }
});


// Api for reading all the data. 
app.get('/api/data', function (req, res) {
    console.log('request_id',req.userId);
    fs.readFile('file/newuser1.json', function(err, data) {
        var data1 = JSON.parse(data);
        console.log('zz',req.userId);
        if(data1.email)
        {
        res.status(200).json({ success: true, message: 'retrieved data successfully', data: JSON.parse(data) })
        console.log('value',data1.email);   
    }
        else{
            console.log('erorr......');
        }
    });

    // console.log('read');
    // var p = config.getDB().then(function (db) {
    //     db.collection("Datametadata").find({ userId: req.userId }).toArray(function (err, data) {
    //         if (err) res.status(500).json({ success: false, message: 'something went wrong.' })
    //         else {
    //             // console.log(data)
    //             res.status(200).json({ success: true, message: 'retrieved data successfully', data: data })
    //         }
    //     })
    // })
});


// api for get data using id.
app.get('/api/data/:id', function (req, res) {
    var query = { userId: req.userId, dataId: req.params.id };
    if (!req.params.id) {
        res.status(400).json({ "statusCode": "400", "statusMessage": "FAILED", "result": "invalid user" });
    } else {
        var p = config.getDB().then(function (db) {
            db.collection("Datametadata").findOne(query, function (err, data) {
                if (err) {
                    res.status(500).json({ success: false, message: 'something went wrong.' });
                }
                else if (!data) {
                    res.status(404).json({ success: false, message: ' data Not found' });
                }
                else {
                    console.log('data****', data)
                    db.collection("datainserts").findOne({ _id: ObjectID(data.dataId) }, function (err, data1) {
                        if (err) res.status(500).json({ success: false, message: 'something went wrong.' })
                        else {
                            console.log('data1', data1)
                            res.status(200).json({ success: true, message: 'record get successfully', result: data1 })
                        }
                    })
                }
            });
        })
    }
});


//Api for update data by id.
app.put('/api/data/:id', function (req, res) {
    var createdate = new Date();

    ModificationDate = datecreate(createdate);

    req.body.metadata.ModificationDate = ModificationDate;
    var query = { userId: req.userId, dataId: req.params.id };
    if (!req.params.id) {
        res.status(400).json({ "statusCode": "400", "statusMessage": "FAILED", "result": "invalid user" });
    } else {
        var p = config.getDB().then(function (db) {
            db.collection("Datametadata").updateOne(query, req.body.metadata, function (err, data) {
                if (err) {
                    res.status(500).json({ success: false, message: 'something went wrong.' });
                }
                else {
                    // console.log("data",req.CreationDate);
                    // console.log('data****', data)
                    db.collection("datainserts").updateOne({ _id: ObjectID(req.params.id) }, req.body.data, function (err, data1) {
                        if (err) res.status(500).json({ success: false, message: 'something went wrong.' })
                        else {
                            // console.log('data1', data1)
                            res.status(200).json({ success: true, message: 'record Updated successfully' })
                        }
                    })
                }
            });
        })
    }
});




//Api for delete2 the data using id.

app.delete('/api/data', function (req, res) {
    console.log('query', req.query.ids);
    var a = req.query.ids.split(',');
    console.log('delete', a.length);
    if (!req.query.ids) {
        res.status(400).json({ "statusCode": "400", "statusMessage": "FAILED", "result": "invalid user" });
    }
    else {
        var p = config.getDB().then(function (db) {

            var set = 1;
            for (var i = 0; i < a.length; i++) {
                db.collection("Datametadata").remove({ dataId: a[i] }, function (err, data) {
                    if (err) {
                        set = 0;
                    }
                    else {
                        console.log('datametadata', i);
                        db.collection("datainserts").remove({ _id: ObjectID(a[i]) }, function (err, data1) {
                            if (err) {
                                set = 0;
                            } else {
                                set = 1;
                            }
                        })
                    }
                });
            }

            if (set == 1) {
                res.status(200).json({ success: true, message: 'record deleted successfully' });
            }
            else {
                res.status(500).json({ success: false, message: 'something went wrong.' });
            }

        });
    }
});







//api for metadata of data list 
app.get('/api/datametadata', function (req, res) {
    // console.log('read');
    var p = config.getDB().then(function (db) {
        db.collection("datainserts").find({ userId: req.userId }).toArray(function (err, data) {
            if (err) res.status(500).json({ success: false, message: 'something went wrong.' })
            else {
                // console.log(data)
                res.status(200).json({ success: true, message: 'executed successfully', data: data })
            }
        })
    })
});

/********************************************************************************************************************************
 * ********************************************************************************************************************
 * *********************************************************************************************************************
 * **********************************************************************************************************************
 * *****************************       CHART API'S    ****************************************************************
 * **********************************************************************************************************************
 * *********************************************************************************************************************
 * **********************************************************************************************************************
 */



function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}


// chart insert Api

app.post('/api/chart', function (req, res) {

    //creation and updation time for chart

    // console.log('date',createdate);
 
    var createdate = new Date();
    CreationDate = datecreate(createdate);
    ModificationDate = datecreate(createdate);

    req.body.metadata.CreationDate = CreationDate;  // data Insertion time.
    req.body.metadata.ModificationDate = ModificationDate;   // data Modified time.

    var guid = (S4() + S4() + "-" + S4() + "-4" + S4().substr(0, 3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
    //  alert(guid);
     console.log('req',guid);
    //end
    // console.log('req',req.userId);
    req.body.metadata.userId = req.userId;

     var query = { userId: req.body.metadata.userId, chartName: req.body.metadata.chartName };
    
    // var query = { userId: req.body.metadata.userId};

    // function S4() {
    //     return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    // }

    // // then to call it, plus stitch in '4' in the third group
    // var guid = (S4() + S4() + "-" + S4() + "-4" + S4().substr(0, 3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
    // //  alert(guid);
    //  console.log('req',guid);
    // function randomString(length, chars) {
    //     var result = '';
    //     for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    //     return "COf" + result;
    // }

   // var chartId = randomString(4, '0123456789');
    req.body.metadata.chartId = guid.toString();
    req.body.options.chartoptionId = guid.toString();
    // console.log(a)
    var p = config.getDB().then(function (db) {

        db.collection("chartMetaData").findOne(query, function (err, data) {
            // console.log('data2***', data);

            if (data != null) {
                res.status(200).json({ success: false, message: 'file already exist' })
            }
            else {
                db.collection("chartOptions").insertOne(req.body.options, function (err, obj) {
                    if (err) res.status(400).json({ success: false, sucerror: err.errors })
                    else {
                        db.collection("chartMetaData").insertOne(req.body.metadata, function (err, obj1) {
                            if (err) {
                                res.status(500).json({ success: false, message: 'internal error data unable to store...' })
                            }
                            else {
                                res.status(200).json({ success: true, message: 'chart inserted successfully', id: req.body.metadata.chartId })
                            }
                        })
                    }
                });
            }
        });
    });
}); //end of chart Insert api..


//Api's for get charts list(metadata)...........
app.get('/api/chart', function (req, res) {
    console.log('req', req);
    var p = config.getDB().then(function (db) {
        db.collection("chartMetaData").find({ userId: req.userId }).toArray(function (err, data) {
            if (err) res.status(500).json({ success: false, message: 'something went wrong.' })
            else {
                // console.log(data)
                res.status(200).json({ success: true, message: 'chart list retrieved successfully', data: data })
            }
        })
    })
});
// end of chart meta data Api.............


//Api's get chart by id
app.get('/api/chart/:id', function (req, res) {

    var query = { userId: req.userId, chartId: req.params.id };
    var p = config.getDB().then(function (db) {

        db.collection("chartMetaData").findOne(query, function (err, data) {
            if (err) res.status(500).json({ success: false, message: 'something went wrong.' })
            else if (data == null) {
                res.status(401).json({ success: false, message: 'unauthorized user' })
            }
            else {
                var dataId = data.dataId;
                console.log('datazzz',data);
                // console.log("data", data.dataId);
                db.collection("chartOptions").findOne({ chartoptionId: data.chartId }, function (err, data1) {
                    if (err) {
                        res.status(404).json({ success: false, message: 'data error...' });
                    }
                    else {
                        db.collection('datainserts').findOne({ _id: ObjectID(data.dataId) }, function (err, data2) {
                            if (err) {
                                res.status(404).json({ success: false, message: 'chart not found' });
                            }
                            else {
                                res.status(200).json({ success: true, message: 'chart retrieved successfully', chartdata: data1, data: data2 })
                            }
                        })
                    }
                })
                // console.log(data)
                // res.status(200).json({ success: true, message: 'chart using id retrieved successfully', data: data })
            }
        })
    })
});// end of get chart by Id.........


//Api for update the chart
app.put('/api/chart/:id', function (req, res) {

    var createdate = new Date();

    ModificationDate = datecreate(createdate);

    req.body.metadata.ModificationDate = ModificationDate;
    var query = { userId: req.userId, chartId: req.params.id };
    var p = config.getDB().then(function (db) {
        console.log('update call');
        db.collection("chartMetaData").updateOne(query, req.body.metadata, function (err, data) {
            console.log(err)
            if (err) res.status(500).json({ success: false, message: 'something went wrong.' })
            else {
                console.log(req.param.id);
                db.collection("chartOptions").updateOne({ chartoptionId: req.params.id }, req.body.options, function (err, data1) {
                    res.status(200).json({ success: true, message: 'chart updated successfully' })
                })
            }
        })
    })
});//end of get update chart by Id.........




//Chart delete Api....

app.delete('/api/chart', function (req, res) {
    console.log('query', req.query.ids);

    var a = req.query.ids.split(',');

    console.log('delete', a.length);

    if (!req.query.ids) {
        res.status(400).json({ "statusCode": "400", "statusMessage": "FAILED", "result": "invalid user" });
    }
    else {
        var p = config.getDB().then(function (db) {

            var set = 1;
            for (var i = 0; i < a.length; i++) {
                db.collection("chartMetaData").remove({ chartId: a[i] }, function (err, data) {
                    if (err) {
                        set = 0;
                    }
                    else {
                        console.log('chartOptions', i);
                        db.collection("chartOptions").remove({ chartoptionId: ObjectID(a[i]) }, function (err, data1) {
                            if (err) {
                                set = 0;
                            } else {
                                set = 1;
                            }
                        })
                    }
                });
            }

            if (set == 1) {
                res.status(200).json({ success: true, message: 'chart deleted successfully' });
            }
            else {
                res.status(500).json({ success: false, message: 'something went wrong.' });
            }

        });
    }
});







// api for unwanted request
app.use(function (req, res, next) {
    next(createError(404));
});




// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    //   res.render('error');
});



// assigning the port number.
app.listen(process.env.PORT || 8000, function () {
    // console.log( "Listening on  port " ,process.env.PORT)
});

module.exports = app;
