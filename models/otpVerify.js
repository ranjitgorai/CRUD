
var mongoose = require('mongoose');
var moment = require('moment');

var otpSchema = new mongoose.Schema({
  _userId: { 
	  	 type: mongoose.Schema.Types.ObjectId,
	  	 required: true, 
	  	 ref: 'User'
  	  },
    otp: { 
		type: Number, 
		required: true
    },
    createdAt: { 
    	type: Date, 
    	required: true, 
    	default: Date.now, 
    	expires: 300 
    }
});

module.exports = mongoose.model('otp', otpSchema);
