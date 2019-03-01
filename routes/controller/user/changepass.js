var mongoQuery = require('../../mongoQuery');
var User = require('../../../models/user');
var jwt = require('jsonwebtoken');
var config = require('../../../config')[process.env.NODE_ENV || 'development'];


module.exports = {


  /******** forgot password ***/
  postSendChangePassMail: function (req, res) {

   var payload = {
     handle: req.body.email, // the email for whom to change pass
   }
   mongoQuery.findOne(User, {email:req.body.email})
    .then(function(count){
        if (!count) {
         return res.json({ complete: false, status: 0, message: `No user with email '${req.body.email}' exists in our Database!` });
       }
       var token = jwt.sign(payload, config.secret, {expiresIn: '1h'});
       var TinyURL = require('tinyurl');
       // TinyURL.shorten(config.siteUrl+'/changepass/'+token, function (shorturl) {
        TinyURL.shorten(config.siteUrl+'/changepass/'+token, function (shorturl) {
         var locals = {
           to: req.body.email,
           subject: 'Password Change Request for SampleProject',
           handle: req.body.email,
           changePassURL: shorturl
         }
         res.mailer.send('forgotpassword', locals, function (err) {
           if (!err){
           console.log('Password email sent successfully to %s !', locals.handle);
           }else {
             console.log("error: %o", err);
             // res.send({error: true})
           }
         });
       })
       return res.json({ complete: true, status: 1, message: `Change password link send to '${req.body.email}' ` });
     }).catch(function(err){
        console.log(err)
        return res.json({status: 0, message: "Failed to find user ", reason: err});
     })
 },

  getChangePass: function (req, res) {
    var token = req.params.token;
    var decoded = jwt.decode(token);
    res.render('changepass', {
      token: token,
      handle: decoded.handle
    })
  },

  postChangePass: function (req, res) {
    var token = req.body.token;
    var newpass = req.body.newpass;
    jwt.verify(token, config.secret, function (err, decoded) {
      if (err) {
        return res.json({ status: 0, message: "Invalid or Expired Token!", reason: err });
      }
      var handle = decoded.handle;
      // Now change password in DB
      mongoQuery.findOne(User, {email:handle})
      .then(function (user) {
        user.password = newpass;
        return user.save();
      })
      .then(function (savedUser) {
        return res.json({status: 1, message: "successfully changed password for " + handle});
      })
      .catch(function (err) {
        return res.json({status: 0, message: "Failed to change password for " + handle, reason: err });
      })
    })
  }

}
