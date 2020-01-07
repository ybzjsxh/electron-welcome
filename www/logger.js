const path = require('path');
const log4js = require('log4js');

log4js.configure({
  appenders: {
    net: {
      type: 'dateFile',
      pattern: 'yyMMdd',
      filename: path.join(__dirname, './logs/net/', 'net.log'),
      keepFileExt: true,
      daysToKeep: 7,
    },
    err: {
      type: 'dateFile',
      pattern: 'yyMMdd',
      filename: path.join(__dirname, './logs/err/', 'err.log'),
      keepFileExt: true,
      daysToKeep: 7,
    },
  },
  categories: {
    default: { appenders: ['net'], level: 'info' },
    net: { appenders: ['net'], level: 'info' },
    err: { appenders: ['err'], level: 'error' },
  },
});
module.exports = {
  net: log4js.getLogger('net'),
  err: log4js.getLogger('err')
}
