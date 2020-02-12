const logger = require('mlar')('logger');
const mt1l = require('mlar')('mt1l');
const service = require('mlar').mreq('services', 'apiuser/validate_dev');
const q = require('q');
const models = require('mlar')('models');

module.exports = function(routename, routescopelevel, check_admin) {
  return (req, res, next) => {
    // default bank id. Set to different values accross all instances deployed
    req.body.bankId = process.env.BANK_ID || 1;
    req.headers.bankId = req.body.bankId;
    req.query.bankId = req.body.bankId;

    req.body.appBankCode = process.env.BANK_CODE || '988';

    // routename is used to audit a route for permissions
    req.routename = routename;
    // routescopelevel is used to determine whether a dev's api key is required for auth or bank user's secret
    // possible values: dev | user
    req.routescopelevel = routescopelevel;
    logger([routename, routescopelevel]);
    if (routescopelevel === 'none') {
      next();
      return;
    }

    let ad = {};
    let authval = req.headers.Authorization || req.headers.authorization || '';
    q.fcall(() => {
      //Log request id:
      return models.reqlog.create({
        method: req.method,
        path: req.path,
        ip: res._$app_reqip,
        status: 'new',
        requestId: res._$app_reqid
      });
    })
      .then(reqlog => {
        ad.reqlog = reqlog;
        let ret = '1';
        if (routescopelevel !== 'oauth_gtoken') {
          ret = service({
            apiSecret: authval.split(' ')[1],
            bankId: req.body.bankId
          });
        }
        return ret;
      })
      .then(validated_dev => {
        if (check_admin && !validated_dev.is_admin) throw new Error('Only admin API users can access this endpoint');
        ad.validated_dev = validated_dev;
        ad.reqlog.apiuserId = validated_dev;
        req.apiuserId = validated_dev;
        ad.reqlog.save();
        next();
      })
      .catch(error => {
        let code = 401;
        if (ad && ad.reqlog) {
          ad.reqlog.status = 'error';
          ad.reqlog.save();
        }
        if (error.message === 'Validation error') {
          error.message = 'Idempotency error';
          code = 400;
        }
        mt1l.json(res, null, error.message, 'error', code);
      });
    //next();
  };
};
