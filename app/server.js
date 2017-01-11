/*
--------------------------------------------Dependencies--------------------------------------------
*/
const express     = require('express');
const mongoose    = require('mongoose');
const bodyParser  = require('body-parser');
const config      = require('./config');
const cors        = require('cors');
const winston     = require('winston');
const winston_ts  = require('winston-daily-rotate-file');
const fs          = require('fs');
const passport    = require('passport')

/*
---------------------------------------------Constants----------------------------------------------
*/
const   env     = process.env.NODE_ENV || 'development';
const   port    = process.env.PORT || config.serverPort;
const   logDir  = config.logPath;

/*
 ---------------------------------------------Logging----------------------------------------------
 */

if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

const tsFormat = function () {
    return new Date().toLocaleTimeString();
};

const logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({
            timestamp: tsFormat,
            colorize: true,
            level: 'info'
        }),
        new (winston_ts)({
            filename: logDir + '/trace.log',
            datePattern: '.yyyy-MM-dd',
            localTime: true,
            timestamp: tsFormat,
            level: env === 'development' ? 'debug' : 'info'
        })
    ]
});

exports.logger = logger;

/*
-----------------------------------------------Setup------------------------------------------------
*/
const app = express();
const server = require('http').Server(app);

app.use(passport.initialize());

app.use(bodyParser.urlencoded({ extended: true, limit: config.transactionLimit }));
app.use(bodyParser.json({limit: config.transactionLimit}));
mongoose.connect(config.database);

/*
 __________________________________Prefixes___________________________________
 */
app.use('/api', require('./routes/api'));
app.use('/api', require('./routes/user'));

/*
-------------------------------------------Start Server--------------------------------------------
*/
server.listen(port, function(){
    logger.info({component: 'Server', status: 'Running ', port: port});
});