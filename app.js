var models = require('./models/sequelize');
var express = require('express');
var appConfig = require('./config/app');
var bodyParser = require('body-parser');
var path = require('path');
var OAuth2Server = require('oauth2-server');
var Request = OAuth2Server.Request;
var Response = OAuth2Server.Response;

var app = express();
const api_meta_routes = require('./routes/api_meta');
const api_branch_routes = require('./routes/api_branch');
const api_atm_routes = require('./routes/api_atm');
const api_agent_routes = require('./routes/api_agent');
const api_customer_routes = require('./routes/api_customer');
const api_pos_routes = require('./routes/api_pos');
const api_account_routes = require('./routes/api_account');
const api_transaction_routes = require('./routes/api_transaction');
const api_fraud_routes = require('./routes/api_fraud');
const api_billpayment_routes = require('./routes/api_billpayment');
const api_developer_routes = require('./routes/api_developer');
const api_dashboard_routes = require('./routes/dashboard');
const api_direct_debit_routes = require('./routes/api_directdebit');
const api_oauth_routes = require('./routes/api_oauth');
const internals_model_routes = require('./routes/internals_model');
const EndpointRouter = require('express').Router();

app.oauth = new OAuth2Server({
  model: require('./services/auth/oauthmod'),
  accessTokenLifetime: 60 * 60,
  allowBearerTokensInQueryString: true
});

/***
 * Actual stubs for doing oauth stuff
 * function obtainToken(req, res) {
    var request = new Request(req);
    var response = new Response(res);
    return app.oauth.token(request, response)
        .then(function(token) {
            res.json(token);
        }).catch(function(err) {
            res.status(err.code || 500).json(err);
        });
}
function authenticateRequest(req, res, next) {
    var request = new Request(req);
    var response = new Response(res);
    return app.oauth.authenticate(request, response)
        .then(function(token) {
            next();
        }).catch(function(err) {
            res.status(err.code || 500).json(err);
        });
}
 */

//var routes = require('./routes');
/*var routes = require('./routes');
var view_routes = require('./view_routes');*/

//************//
//app.set('views', __dirname + '/views');
//app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'pub')));
//************//

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

if (process.env.MONGODB_URI) {
  const mg = require('mongoose');
  mg.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false });
}
const reqIp = require('request-ip');
const logger = require('mlar')('mongolog');
const scrubber = require('mlar')('obscrub');
const SCRUBVALS = require('./utils/scrubvals.json');

if (process.env.DELAY_REQ) {
  app.use((req, res, next) => {
    const delay = isNaN(process.env.DELAY_REQ * 1) ? 3 : process.env.DELAY_REQ * 1;
    setTimeout(() => {
      next();
    }, delay * 1000);
  });
}

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, token, customerId, customerid, customer'
  );
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
  const reqid =
    req.body.requestId ||
    req.query.requestId ||
    req.headers.requestid ||
    'REQ' + Math.ceil(Date.now() + Math.random() * 98984328);
  res._$app_reqid = reqid; //Need this so response can have the value for logging as well
  res._$app_reqip = reqIp.getClientIp(req);
  const scrubs = SCRUBVALS;
  const reqlog = {
    protocol: req.protocol,
    host: req.get('host'),
    endpoint: req.baseUrl + req.path,
    ip: res._$app_reqip,
    method: req.method,
    body: scrubber(req.body, scrubs),
    query: scrubber(req.query, scrubs),
    headers: scrubber(req.headers, scrubs),
    useragent: req.headers['user-agent']
  };
  logger({
    type: 'api_call',
    id: reqid,
    comment: 'Request',
    data: reqlog
  });

  next();
});

const version = '/api/v1';

app.get(version, function(req, res, next) {
  res.json({ version: 1.0 });
});

const oauthversion = '/oauth2/v1';
app.use(version, api_meta_routes(EndpointRouter));
app.use(version, api_branch_routes(EndpointRouter));
app.use(version, api_atm_routes(EndpointRouter));
app.use(version, api_agent_routes(EndpointRouter));
app.use(version, api_customer_routes(EndpointRouter));
app.use(version, api_account_routes(EndpointRouter));
app.use(version, api_pos_routes(EndpointRouter));
app.use(version, api_transaction_routes(EndpointRouter));
app.use(version, api_fraud_routes(EndpointRouter));
app.use(version, api_billpayment_routes(EndpointRouter));
app.use(version, api_developer_routes(EndpointRouter));
app.use(version, api_dashboard_routes(EndpointRouter));
app.use(version, api_direct_debit_routes(EndpointRouter));
app.use(version, internals_model_routes(EndpointRouter));

app.use(
  oauthversion,
  (req, res, next) => {
    req.oauthConfig = { oauth: app.oauth, Request, Response };
    next();
  },
  api_oauth_routes(EndpointRouter)
);

app.get('/api/v1/swagger.json', (req, res) => {
  const swagger = require('./public/swagger.json');
  res.json(swagger);
});

//Handle undefined routes
let mt1l = null;
app.use(version, (req, res) => {
  if (!mt1l) {
    mt1l = require('mlar')('mt1l');
  }
  mt1l.json(res, null, `${req.method} ${req.path} does not exist or has not been implemented yet`, 'error', 404);
});

//app.use(view_routes); //front end
/*
Handle 404
*/
//app.use(mosh.initMoshErrorHandler);

var force_sync = process.env.FORCESYNC ? true : false;

var stage = process.env.NODE_ENV || 'development-local';
if (stage === 'development' || stage === 'test' || stage === 'local' || stage === 'production' || stage === 'development-local') {
  models.sequelize.sync({ force: force_sync }).then(function() {
    app.listen(appConfig.port, function() {
      //runWorker();
      console.log([appConfig.name, 'is running on port', appConfig.port.toString()].join(' '));
    });
  });
}
