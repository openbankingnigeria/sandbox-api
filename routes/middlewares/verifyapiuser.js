const logger = require('mlar')('logger');
const mt1l = require('mlar')('mt1l');
const service = require('mlar').mreq('services', 'apiuser/jwtauth');
const q = require('q');
const models = require('mlar')('models');

module.exports = function (routename, routescopelevel) {
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

        let ad = {};
        const authval = req.headers.Authorization || req.headers.authorization || '';
        q
        .fcall(() => { 

            return service({
                token: authval.split(' ')[1]
            })
        })
        .then( validated_dev => {
            req.apiuser = validated_dev;
            next();
        })
        .catch( error => {

          console.log(error);
            let code = 401;
            if(error.message === 'Validation error'){
                error.message = 'Idempotency error';
                code = 400;
            }
            mt1l.json(res, null, error.message, 'error', code);

        })
        //next();
    }
}