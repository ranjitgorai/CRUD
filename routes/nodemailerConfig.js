var nodemailer = require('nodemailer');
var config  =  require('../config')[process.env.NODE_ENV || 'development'];

let transporter = nodemailer.createTransport({
       host: config.email.host,
       port: config.email.port,
       secure: true, // true for 465, false for other ports
       auth: {
        user: config.email.auth.user,
        pass: config.email.auth.pass
      }
 });


module.exports = {

	
  sendmail: function(options){

    return transporter.sendMail(options)
	},


};

