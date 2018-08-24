var registerAndLogin = require('../model/user.js');
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');
var config = require('../config/storage.js');
module.exports = {
    registerAUser: registerAUser,
    loginInAUser: loginInAUser
};

/*
 this function is responsible for registering a new registerAndLogin
*/
function registerAUser(req, res) {
    req.body.user_id=crypto.createHash('md5').update(req.body.email + Date.now()).digest('hex');
    var userObj = new registerAndLogin(req.body);
    userObj.save(function (err, obj) {
        if (err) res.status(422).json({code: 422, errors: err})
        res.status(200).json({code: 200, message: 'registerAndLogin registered successfully.'})
    })
}

/*
 this function is responsible for login in a registerAndLogin
*/
function loginInAUser(req, res) {
    registerAndLogin.findOneAndUpdate({'email': req.body.email}, {$set: {'last_login': Date.now()}}, function (err, obj) {
        if (err) {
            res.status(500).json({code: 500, errors: err});
        } else {
            if (obj) {
                bcrypt.compare(req.body.password, obj.password, function (err, equal) {
                    if (equal) {
                        var tokenObj = {
                            userId: obj.user_id
                        };

                        var token = jwt.sign(tokenObj, config.secret, {expiresIn: '24h'});

                        res.status(200).json({
                            'success': true,
                            'message': 'executed successfully.',
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
                            'message': 'Your email and password combination is wrong'
                        });
                    }
                });
            } else {
                res.status(401).json({
                    'success': false,
                    'status': 'unauthorized',
                    'message': 'User does not exist'
                });
            }
        }
    })
}