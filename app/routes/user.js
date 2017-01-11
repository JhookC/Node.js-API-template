/*
 --------------------------------------------Dependencies--------------------------------------------
 */
var express = require('express');
var router = express.Router();

var svr = require('../server');
var api = require('./api');

/*
 -----------------------------------------------Model-----------------------------------------------
 */
var User = require('../models/user');

/*
 ----------------------------------------------Routes-----------------------------------------------
 */

//CRUD
User.methods(['get', 'put', 'post', 'delete']);
User.after('get', function (req, res, next) {
    svr.logger.info(api.bl(req, res));
    next();
});
User.after('put', function (req, res, next) {
    if (res.locals.status_code == 404) {
        var err = {
            message: res.locals.bundle.message,
            status: res.locals.status_code
        };
        svr.logger.error(api.bl(req, res, err, req.body));
    }else {
        svr.logger.info(api.bl(req, res));
    }
    next();
});
User.after('post', function (req, res, next) {
    if (res.locals.status_code == 400) {

        var err = {
            message: res.locals.bundle.message,
            status: res.locals.status_code
        };
        svr.logger.error(api.bl(req, res, err, req.body));
    }else {
        svr.logger.info(api.bl(req, res));
    }
    next();
});
User.after('delete', function (req, res, next) {
    if (res.locals.status_code == 404) {

        var err = {
            message: res.locals.bundle.message,
            status: res.locals.status_code
        };
        svr.logger.error(api.bl(req, res, err, req.body));
    }else {
        svr.logger.info(api.bl(req, res));
    }
    next();
});
User.register(router, '/user');

/*
 -------------------------------------------Return router--------------------------------------------
 */
module.exports = router;