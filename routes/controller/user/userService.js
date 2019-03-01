var crypto = require('crypto');
var TinyURL = require('tinyurl');
var moment = require('moment');
var jwt = require('jsonwebtoken');

var User = require('../../../models/user');
var Token = require('../../../models/tokenVerify');
var OTPVerify = require('../../../models/otpVerify');

var mongoQuery = require('../../mongoQuery');
var mailer = require('../../nodemailerConfig');
var mailTemp = require('./mailtemp');

var config  =  require('../../../config')[process.env.NODE_ENV || 'development'];

module.exports = {


 signupUser:function(req,res){

 	if(!req.body.email || !req.body.name || !req.body.password){
       return res.json({error: true, message : 'Email,Name and Password can not be empty'});
    }else{

    	 mongoQuery.findOne(User, {email:req.body.email})
          .then(function(result){

          	if(result){
	           return res.json({error:true,message:"The email address you have entered is already associated with another account.Please enter different email."})
	         }
	         //========save user========
		    var user = User(req.body);
		    return mongoQuery.save(user)

          }).then(function(saveUser){
                 //=======save mobile otp========
          		 var otp = OTP(4);
             	 var otpverify = new OTPVerify({_userId: saveUser._id,otp:otp})
             	 mongoQuery.save(otpverify)

             	 return saveUser;
                 //======end here=========
          }).then(function(saveUser){

          	  var token = new Token({ _userId: saveUser._id, token: crypto.randomBytes(16).toString('hex') });

              return mongoQuery.save(token).then(function(tokendata){
               //======send mail verification template=========
               setTimeout(function () {

                 TinyURL.shorten(config.siteUrl+'\/confirmation\/' +token.token, function (shorturl) {

                 	var mailingData = {

	                 "url":shorturl
	                }
		             var mailOptions = {
		               from: config.email.auth.user,
		               to: saveUser.email,
		               subject: 'Account Verification',
		               html: mailTemp.mailtemp(mailingData)

		              };

	                 mailer.sendmail(mailOptions).then(function(maildata){
	                 	console.log('mm',maildata)
		               }).catch(function(err){
		                 console.log(err)
		               })
                 })

                },2000);
                //========end here===========
        	    return res.json({error:false , message:"An email has been sent to "+ saveUser.email + '.'+'It contains an activation link you must click with in 12 hours to activate your account .',result:saveUser});
              })
          }).catch(function(err){
	        console.log('err',err);
	        return res.json({error:true,reason: err});
	      })

    }//else
 },

//========== email verified ====================
confirmationPost:function(req,res){

  mongoQuery.findOne(Token, {token: req.params.token })
   .then(function(token){

      if (!token)
         return res.json({error:true,type: 'not-verified', message: 'We were unable to find a valid token. Your token may have expired.'})
      return token ;
   }).then(function(token){
     //===find user=========
     return mongoQuery.findOne(User, {_id: token._userId })
       .then(function(user){
         if(!user)
            return res.json({error:true,type: 'already-verified',message: 'We were unable to find a user for this token.'})
         if (user.isEmailVerified)
            return res.json({error:true,message:'This email has already been verified.'})
         //====update user table=======
         var updateData = {isEmailVerified:true}
         mongoQuery.update(User,{_id:user._id},updateData)
          .then(function(raw){
             return res.json({error:false,message:'This email has been verified. Please log in.'})
          })
       })
   }).catch(function(err){
    console.log('err',err);
    return res.json({error:true,reason: err});
  })

},

//========fetch user=============

getUser:function(req,res){

   //filter={"_id":"5a8674428443973cca94f325","email":"ranjit.gorain@rplanx.com"}
   var query;
   if(req.query.filter !=null){
       query= userBusiness.searchfilter(JSON.parse(req.query.filter));
   }else{
     query ={}
   }

   //===== selected field=name,email ===========
	var field = req.query.field;
	var selectedField = {};
	var populate;
   if(field == null  || field == "*"){
      selectedField = {password:0,loginAttempts:0};
   }else{
       var splitField = field.split(",");
       for(var val of splitField){
         if(val == 'referailsDetails'){
           populate=[{path:"referailsDetails.referTo",select:{name:1,email:1,referId:1}},{path:"referailsDetails.parentRefer",select:{name:1,email:1,referId:1}},{path:"referailsDetails.grandParentRefer",select:{name:1,email:1,referId:1}}];
         }
        selectedField[val] = 1
       }
   }
//========= sort={"name":1,"createdAt":-1}&field=name,createdAt ============
 var sortparams = req.query.sort;
 var sort ={}
 if(sortparams == null){
    sort = {createdAt:-1}
 }else{
   sort = JSON.parse(sortparams);
   }
 //==pagination=====================
 var start = req.query.start;
 var length = req.query.length;

 //========hit query ==================
    mongoQuery.find(User,query,selectedField,sort,populate,start,length)
    .then(function(result){

      if(result.length == 0){
        return  res.json({error:true,message:"User not found",result:result})
      }
      return  res.json({error:false,message:"User fetched successfully",result:result})

    }).catch(function(err){
      console.log(err)
       return res.json({error:true, reason: err, message: 'Fail to fetch user'})
    })
},

//========== updateUser=============
updateUser:function(req,res){

  mongoQuery.findOne(User, {_id:req.body.id})
  .then(function(user){

  	var result = updateuserData(user,req.body)
    return result.save();

  }).then(function (savedata) {
    return res.json({error:false , message:'User profile updated successfully',result : savedata});

  }).catch(function(err){
   console.log(err)
   return res.json({error:true, reason: err, message: 'Fail to fetch user'})
  })

},

//====== deleteUser ==========
deleteUser:function(req,res){

  mongoQuery.delete(User,req.query.id)
   .then(function(result){
      return res.json({error:false,message:'User deleted successfully'})
   }).catch(function(err){
     console.log(err)
      return res.json({error:true , message:"failed to delete user",reason: err});
   })

},

//======= loginUser ========

loginUser: function(req,res){

  var pass = req.body.password;
  var email = req.body.email;
  var CurrentDate = moment().format();
  if(!email || !pass){
     return res.json({status : 0 , message : 'Email and Password can not be empty'});
  }
  User.getAuthenticated(email, pass, function(err, user, reason) {
     if (err){
        return res.json({status : 0, reason : err})
     }
     if(reason == 0){
       return res.json({status:0, message:"We were unable to find a user for this email! please enter a correct email."});
     }
     if(reason == 1){
       return res.json({status:0, message:"You entered the wrong password! please enter  a valid password."});
     }
     if(reason == 2){
       return res.json({status:0, message:"You have entered the wrong password  5 times or more than 5 times!, Your account suspended for 2 hours."});
     }
     if(user.isActive == false){
      return res.json({status:0, message:"This account is not active,please Login after the account is active"});
     }
     if(user.isEmailVerified == false){
      return res.json({status:0, message:"Entered email is not verified! please verify email before login."});
     }

    var updateData = {lastLogin:CurrentDate}
	  var payload = { id: user._id,email:user.email,name:user.name,lastLogin:user.lastLogin,isActive: user.isActive,loginTime:CurrentDate,expireTime:'1hr'};
	  var token = jwt.sign(payload, config.secret, {expiresIn: '1h'});
	  mongoQuery.findByIdAndUpdate(User,user._id,updateData)
	   .then(function(raw){
	        return res.json({status : 1,message : "Login successfull",token : token});
	    }).catch(function(err){
	       console.log(err);
	       return res.json({status: 0, reason: err, message: 'User lastLogin cannot be updated'})
	    });

  });

},

//======= changePassword ===========

changePassword:function(req,res){

	var pass = req.body.oldpassword;
    var newpass = req.body.newpassword;
    var confirmpass = req.body.confirmpassword;
    if(newpass != confirmpass){
     return res.json({status:0,message:"New password and confirm password does not match!"});
    }
     mongoQuery.findOne(User, {_id:req.body.userid}).then(function(user){

         if (user === null || user == undefined) {
           return res.json({status:0, message:"User does not exist"});
         }
         user.comparePassword(pass, function(err, isMatch){
           if (err) {
             return res.json({status : 0, reason : err});
           }
           if (isMatch && !err){
             if( user.password !== undefined){
                user.password = newpass;
              } else {
                user.password = user.password;
              }
              user.save(function(err,userdata){
                 if(err){
                   return res.json({status: 0 , message:"failed to change  password",reason: err});
                 }
                  return res.json({status: 1 , message:"Password changed successfully",result:userdata});
               });
           }else {
               return res.json({status:0,message:"Wrong Old Password"});
           }
         })

       }).catch(function (err) {
        console.log(err)
        return res.json({status : 0 , reason: err});
       })

},

//======= userActiveinActive ========
userActiveinActive:function(req,res){

     var active = { isActive:req.body.active};
     var id = req.body.userid;
     mongoQuery.findByIdAndUpdate(User,id,active)
     .then(function(raw){
          return res.json({status:1,message:'User active status changed successfully',result:raw})
       }).catch(function(err){
         console.log(err);
         return res.json({status: 0 , message:"failed to change user active status",reason: err});
      });
},




};











function OTP(m){

	var m = m || 9; s = '', r ='0123456789';
     for (var i=0; i < m; i++) { s += r.charAt(Math.floor(Math.random()*r.length)); }
     return s;
}

function updateuserData(result,data){
  console.log('aaa',data.name)

   delete data.password;
   delete data.email;
   delete data.isEmailVerified;
   delete data.isMobileVerify;

   var CurrentDate = moment().format();
   var mobileNumber =data.mobileNumber;
   var profileImage =data.profileImage;
   var address =data.address;
   var dateOfBirth =data.dateOfBirth;
   var gender =data.gender;

   if (dateOfBirth !== undefined) {
	  var dateTimeMoment = moment(dateOfBirth, 'YYYY-MM-DD');
   };

     if( data.name !== undefined){   //true required
       result.name = data.name;
      } else {
       result.name = result.name;
      }
      if( mobileNumber !== undefined){
        result.mobileNumber = mobileNumber;
      }
      if( profileImage !== undefined){
       result.profileImage = profileImage;
      }
      if(address !== undefined){
        result.address = address;
      }
      if(dateOfBirth !== undefined){
        result.dateOfBirth = dateTimeMoment;
      }
      if(gender !== undefined){
        result.gender = gender;
      }
      if( result.updatedAt !== undefined){
        result.updatedAt = CurrentDate;
      }
      return result;
}
