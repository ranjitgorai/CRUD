var express = require('express');
var router = express.Router();

var jwt = require('jsonwebtoken');
var checkJwt = require('express-jwt');

var config  =  require('../config')[process.env.NODE_ENV || 'development'];

/*import file*/
//===========user =================================
 var User = require('./controller/user/userService');
 var changepass = require('./controller/user/changepass');

/* Middlewares */
router.use(function(req, res, next) {   //Enabling CORS
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD, OPTIONS, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});

//====email verify routing========
router.get('/confirmation/:token',User.confirmationPost);
/* =======forgot password for user ==========*/
router.post('/userForgotPassword', changepass.postSendChangePassMail);
router.get('/changepass/:token', changepass.getChangePass);
router.post('/changepass', changepass.postChangePass);

/*verify token*/
router.use(checkJwt({ secret: config.secret})
.unless({path: ['/','/signupUser','/loginUser','/userForgotPassword','/changepass','/loginAdmin'] , methods:['GET','POST','OPTIONS']})
);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

//========userRouting===========
router.post('/signupUser',User.signupUser);
router.get('/user',User.getUser);
router.put('/user',User.updateUser);
router.delete('/user',User.deleteUser);
router.post('/loginUser',User.loginUser);
router.post('/changePassword',User.changePassword);
router.put('/userActiveinActive',User.userActiveinActive);




module.exports = router;
