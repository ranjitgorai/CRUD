var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var moment = require('moment');

 var MAX_LOGIN_ATTEMPTS = 5;
 var LOCK_TIME = 2 * 60 * 60 * 1000;

var userSchema = new mongoose.Schema({

  name:{
     type: String
   },
  email: {
      type: String,
      lowercase: true,
      required: true,
      unique: true
  },
  isEmailVerified: {
     type: Boolean,
     default: false
  },
  password: {
    type: String,
    required: true
  },
   mobileNumber:{
     type: Number,
     // unique: true,
     // required: true
   },

  isMobileVerify:{
    type: Boolean,
    default: false
  },
  profileImage: {
    type:Object
  },

 address:[{
   line1:{
     type:String
   },
   line2:{
     String
   },
   city:{
     type:String
   },
   state:{
     type:String
   },
   country:{
     type:String
   },
   pincode:{
     type:String
   },
   _id:false
 }],

 dateOfBirth:{
   type: Date,
   default: null
 },
 gender:{
   type: String,
   enum : ['Male','Female'],
   default: "Male"
 },
  createdAt:{
    type: Date,
    default: Date.now
  },
  updatedAt:{
    type: Date,
    default: Date.now
  },
  lastLogin:{
    type: Date,
    default: Date.now
  },
  loginAttempts: {
     type: Number,
     required: true,
     default: 0
  },
  lockUntil: {
   type: Number
  },
  isActive: {
    type: Boolean,
    default: true
  }


});

userSchema.virtual('isLocked').get(function() {
    // check for a future lockUntil timestamp
    return !!(this.lockUntil && this.lockUntil > Date.now());
});
// Save user's hashed password
userSchema.pre('save', function (next) {
    var user = this;
    if (this.isModified('password') || this.isNew) {
        bcrypt.genSalt(10, function (err, salt) {
            if (err) {
                return next(err);
            }
            bcrypt.hash(user.password, salt, function () {

            }, function (err, hash) {
                if (err) {
                    return next(err);
                }
                // saving actual password as hash
                user.password = hash;
                next();
            });
        });
    } else {
        return next();
    }
});

// compare two passwords

userSchema.methods.comparePassword = function (pw, cb) {
    bcrypt.compare(pw, this.password, function (err, isMatch) {
        if (err) {
            return cb(err);
        }
        cb(null, isMatch);
    });
};

userSchema.methods.incLoginAttempts = function(cb) {
    // if we have a previous lock that has expired, restart at 1
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.update({
            $set: { loginAttempts: 1 },
            $unset: { lockUntil: 1 }
        }, cb);
    }
    // otherwise we're incrementing
    var updates = { $inc: { loginAttempts: 1 } };
    // lock the account if we've reached max attempts and it's not locked already
    if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked) {
        updates.$set = { lockUntil: Date.now() + LOCK_TIME };
    }
    return this.update(updates, cb);
};

// expose enum on the model, and provide an internal convenience reference
var reasons = userSchema.statics.failedLogin = {
    NOT_FOUND: 0,
    PASSWORD_INCORRECT: 1,
    MAX_ATTEMPTS: 2
};

userSchema.statics.getAuthenticated = function(email, password, cb) {
    this.findOne({ email: email }, function(err, user) {
        if (err) return cb(err);

        // make sure the user exists
        if (!user) {
            return cb(null, null, reasons.NOT_FOUND);
        }

        // check if the account is currently locked
        if (user.isLocked) {
            // just increment login attempts if account is already locked
            return user.incLoginAttempts(function(err) {
                if (err) return cb(err);
                return cb(null, null, reasons.MAX_ATTEMPTS);
            });
        }

        // test for a matching password
        user.comparePassword(password, function(err, isMatch) {
            if (err) return cb(err);

            // check if the password was a match
            if (isMatch) {
                // if there's no lock or failed attempts, just return the user
                if (!user.loginAttempts && !user.lockUntil) return cb(null, user);
                // reset attempts and lock info
                var updates = {
                    $set: { loginAttempts: 0 },
                    $unset: { lockUntil: 1 }
                };
                return user.update(updates, function(err) {
                    if (err) return cb(err);
                    return cb(null, user);
                });
            }

            // password is incorrect, so increment login attempts before responding
            user.incLoginAttempts(function(err) {
                if (err) return cb(err);
                return cb(null, null, reasons.PASSWORD_INCORRECT);
            });
        });
    });
};

// userSchema.virtual('name.full').get(function () {
//   var last = (this.name.last === undefined || this.name.last === null) ? '' : this.name.last;
//   return this.name.first + ' ' + last;
// });
//
userSchema.set('toJSON', {virtuals: true});
userSchema.set('toObject', {virtuals: true});


module.exports = mongoose.model('User', userSchema);