/*
--------------------------------------------Dependencies--------------------------------------------
*/
var restful = require('node-restful');
var mongoose = restful.mongoose;
var bcrypt = require('bcrypt-nodejs');
var ObjectId = mongoose.Schema.Types.ObjectId;

/*
-----------------------------------------------Schema-----------------------------------------------
*/

var userSchema = new mongoose.Schema({
    mail: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

/*
-----------------------------------------------Methods----------------------------------------------
*/
//Save the user's hashed password
userSchema.pre('save', function(next){
    var user = this;
    if (this.isModified('password') || this.isNew) {
        bcrypt.genSalt(10, function (err, salt) {
            if(err){
                return next(err);
            }
            bcrypt.hash(user.password, salt, function () {
            }, function (err, hash) {
                if(err){
                    return next(err);
                }
                user.password = hash;
                next();
            });
        });
    } else {
        return next();
    }
});

//Compare passwords
userSchema.methods.comparePassword = function(pw , cb){
    bcrypt.compare(pw, this.password, function (err, isMatch) {
        if(err) {
            return cb(err);
        }
        cb(null, isMatch);
    });
};

/*
--------------------------------------------Return model--------------------------------------------
*/
module.exports = restful.model('user', userSchema);