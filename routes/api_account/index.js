const router = require('express').Router();
var handlers = require('./handlers');
var middlewares = require('mlar')('middlewares');
var utils    = require('mlar')('mt1l');
utils.buildRoutes(handlers, middlewares, router);
module.exports = function (EndpointRouter) {
    EndpointRouter.use('/accounts', router);
    return EndpointRouter;
}