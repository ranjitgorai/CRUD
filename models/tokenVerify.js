var mongoose = require('mongoose');
var moment = require('moment');

var tokenSchema = new mongoose.Schema({
  _userId: { 
	  	 type: mongoose.Schema.Types.ObjectId,
	  	 required: true, 
	  	 ref: 'User'
  	  },
    token: { 
		type: String, 
		required: true
    },
    createdAt: { 
    	type: Date, 
    	required: true, 
    	default: Date.now, 
    	expires: 43200 
    }
});

module.exports = mongoose.model('token', tokenSchema);
