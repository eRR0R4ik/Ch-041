var mongoose = require('mongoose'),
    crypto = require('crypto'),
    jwt = require('jsonwebtoken');

var userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true
    },
    hash: String,
    salt: String,
    avatar: {
        type: String,
        default: ""
    },
    feeds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Feed'
    }],
    favourites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Article'
    }]
});

userSchema.methods.setPassword = function (password) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
};

userSchema.methods.validPassword = function (password) {
    var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
    return this.hash === hash;
};

userSchema.methods.generateJwt = function () {
    var expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);

    return jwt.sign({
        _id: this._id,
        email: this.email
    }, "MY_SECRET",  { expiresIn: parseInt(expiry.getTime() / 1000) });
};

mongoose.model('User', userSchema);