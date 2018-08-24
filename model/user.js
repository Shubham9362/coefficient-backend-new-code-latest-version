/**
 * Created by Anurag on 19-09-2017.
 */
var dbService = require("../config/storage.js");
var mongoose = dbService.getMongooseDB();
var bcrypt = require('bcrypt-nodejs');
var SALT_WORK_FACTOR = 10;
var userSchema = mongoose.Schema({
    name: {
        type: String,
        default: '',
        required: true
    },
    profile_image: {
        type: String,
        default: '',
        required: false
    },
       email: {
        type: String,
        default: '',
        unique: [true, function (v) {
            return v.unique;
        }, 'email is already registered.'],
        index: true,
        lowercase: true,
        required: [true, 'email field is Required']
    },
    password: {
        type: String,
        default: '',
        required: [true, 'password field is Required'],
        validate: [function (v) {
            return v.length >= 8;
        }, 'Password min length is 8 chars']
    },

    user_id: {
        type: String,
        unique: true,
        default: '',
        required: true
    },

    last_login: {
        type: Date,
        default: '',
        required: false
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
    created: {
        type: Date,
        default: Date.now
    },


});
/*
  Encrypt the password before saving it to DB
 */

userSchema.pre('save', function (next) {
    var user = this;
    if (!user.isModified('password'))
        return next();

    bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
        if (err)
            return next(err);
        bcrypt.hash(user.password, salt, null, function (err, hash) {
            if (err)
                return next(err);

            user.password = hash;
            next();
        });
    });
});

var user = mongoose.model('user', userSchema);
module.exports = user;