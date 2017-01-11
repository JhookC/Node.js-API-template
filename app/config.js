/*
-------------------------------------------Configuration--------------------------------------------*/

module.exports = {
  'secret'          : 'devEnvironment',
  'database'        : 'mongodb://localhost/nodejs-api',
  'logFormat'       : 'dev',
  'serverPort'      : 5000,
  'logPath'         : '../log',
  'transactionLimit': '2mb'
};
