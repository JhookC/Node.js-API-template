/*
--------------------------------------------Dependencies--------------------------------------------
*/
const express     = require('express');
const router      = express.Router();
const config      = require('../config');
const jwt         = require('jsonwebtoken');

/*
-----------------------------------------------Setup------------------------------------------------
*/
const app = express();
app.set('jwtBase', config.secret);

const svr = require('../server');
const io = svr.io;

/*
-----------------------------------------------Models-----------------------------------------------
*/
const User = require('../models/user');

/*
 ---------------------------------------------Logging----------------------------------------------
 */

var buildLog = function (req, res, err, data) {
    var statusCode = res.statusCode;
    var messageCode = 'OK';
    var resData = 'N/A';

    if (err) {
        statusCode = err.status;
        messageCode = err.message;
        resData =  data;
    }

    return {
        req: {
            ip: req.connection.remoteAddress,
            protocol: req.protocol,
            method: req.method,
            endpoint: req.originalUrl
        },
        res: {
            status: statusCode,
            message: messageCode,
            data_in: JSON.stringify(resData)
        },
        message: 'Trace'
    };
};

/*
-----------------------------------------------Routes-----------------------------------------------
*/

//Dev Token
router.get('/devToken', function (req, res) {
    User.findOne({
        mail: "tester@test.com"
    }, function(err, user){
        if (!user) {
            user = new User({
                mail: "tester@test.com",
                password: "1234567890"
            });

            user.save(function(err) {
                if (err){
                    svr.logger.error(buildLog(req, res, err, null));
                }
                svr.logger.info(buildLog(req, res));
            });
        }

        var token = jwt.sign(user, app.get('jwtBase'), {
            expiresIn: '1d'
        });

        return res.json({ devToken: token, expiresIn: '24 h'});
    });
});

/*
__________________________________No token___________________________________
*/

//Welcome route
router.get('/', function(req, res) {
  res.json({ message: 'Welcome to Node.js API!'});
    svr.logger.info(buildLog(req, res));
});

//Sign up
router.post('/register', function(req, res){
    var error = null;
    if (!req.body.mail || !req.body.password) {
        res.json({success: false, message: 'Please enter an email and password to register.'});

        error = {
            message: 'Email and Password required.',
            status: 202
        };

        svr.logger.error(buildLog(req, res, error));
  } else {
    var newUser = new User({
        mail: req.body.mail,
        password: req.body.password
    });

    newUser.save(function(err) {
      if (err){
          error = {
              message: err,
              status: 202
          };

          svr.logger.error(buildLog(req, res, error, req.body));
          return res.json({success: false, message: 'That email address already exists.'});
      }
      res.json({ success: true, message: 'Successfully created new user.'});
        svr.logger.info(buildLog(req, res));
    });
  }
});

//Authenticate
router.post('/authenticate', function(req, res){
    var error = null;
  User.findOne({
      mail: req.body.mail
  }, function(err, user){
    if(err) {
        error = {
            message: err,
            status: 202
        };
        svr.logger.error(buildLog(req, res, error, req.body));

      throw err;
    }
    if(!user) {
        error = {
            message: 'Authentication failed. User not found.',
            status: 202
        };
        svr.logger.error(buildLog(req, res, error, req.body));
      res.send({ success: false, message: 'Authentication failed. User not found.'});
    }else {
        user.comparePassword(req.body.password, function (err, isMatch) {
        if(isMatch && !err) {
          var token = jwt.sign(user, app.get('jwtBase'), {
            expiresIn: '7d'
          });

            svr.logger.info(buildLog(req, res));
            res.json({success: true, _id: user._id, token: token});
        } else {
            error = {
                message: 'Authenticatoin failed. Passwords did not match.',
                status: 202
            };
            svr.logger.error(buildLog(req, res, error, req.body));
          res.send({ success: false, message: 'Authenticatoin failed. Passwords did not match.'});
        }
      });
    }
  });
});

/*
_______________________________Token require_________________________________
 Every route since here, requires token
*/

//Route middleware implemented to verify token
router.use(function(req, res, next) {
  var token = req.body.token || req.query.token || req.headers['x-access-token']; //Check header or url parameters or post parameters for token

  if (token) { //Decode token
    jwt.verify(token, app.get('jwtBase'), function(err, decoded) { //Verifies secret variable
      if (err) {
          svr.logger.error('API access failed. Failed to authenticate token.');
        return res.json({ success: false, message: 'Failed to authenticate token.' });
      } else {
        req.decoded = decoded; //If everything is OK, save to request for use in other routes
        next();
      }
    });

  } else { //If there is no token, return an error
      svr.logger.error('API access failed. No token provided from ' + req.connection.remoteAddress +' to access '+ req.method + ' - ' + req.originalUrl +'.');
    return res.status(403).send({
        success: false,
        message: 'No token provided.'
    });
  }
});

/*
-------------------------------------------Return router--------------------------------------------
*/
module.exports = router;
module.exports.bl = buildLog;