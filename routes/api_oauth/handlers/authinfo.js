const ainfo = {
  "issuer": process.env.APIBASEURL + "/oauth2/v1",
  "authorization_endpoint": process.env.APIBASEURL + "/oauth2/v1//authorize",
  "token_endpoint": process.env.APIBASEURL + "/oauth2/v1//token",
  "userinfo_endpoint": process.env.APIBASEURL + "/oauth2/v1//userinfo",
  "registration_endpoint": "https://mytaxi.okta-emea.com/oauth2/v1/clients",
  "jwks_uri": process.env.APIBASEURL + "/oauth2/v1//keys",
  "response_types_supported": [
    "code",
    "id_token",
    "code id_token",
    "code token",
    "id_token token",
    "code id_token token"
  ],
  "response_modes_supported": [
    "query",
    "fragment",
    "form_post"
  ],
  "grant_types_supported": [
    "authorization_code",
    "implicit",
    "refresh_token"
  ],
  "subject_types_supported": [
    "public"
  ],
  "id_token_signing_alg_values_supported": [
    "RS256"
  ],
  "scopes_supported": [
    "openid",
    "profile",
    "email",
    "address",
    "phone",
    "account",
    "transaction",
    "branch",
    "atm",
    "pos",
    "customer",
    "fraud"
  ],
  "token_endpoint_auth_methods_supported": [
    "client_secret_basic",
    "client_secret_post",
    "client_secret_jwt",
    "private_key_jwt",
    "none"
  ],
  "claims_supported": [
    "iss",
    "ver",
    "sub",
    "aud",
    "iat",
    "exp",
    "jti",
    "auth_time",
    "amr",
    "idp",
    "nonce",
    "name",
    "nickname",
    "preferred_username",
    "given_name",
    "middle_name",
    "family_name",
    "email",
    "email_verified",
    "profile",
    "zoneinfo",
    "locale",
    "address",
    "phone_number",
    "picture",
    "website",
    "gender",
    "updated_at",
    "at_hash",
    "c_hash",
    "account_read",
    "account_write",
    "transaction_read",
    "transaction_write",
    "branch_read",
    "atm_read",
    "pos_read",
    "customer_read",
    "customer_write",
    "fraud_write"
  ],
  "code_challenge_methods_supported": [
    "S256"
  ],
  "introspection_endpoint": process.env.APIBASEURL + "/oauth2/v1//introspect",
  "introspection_endpoint_auth_methods_supported": [
    "client_secret_basic",
    "client_secret_post",
    "client_secret_jwt",
    "private_key_jwt",
    "none"
  ],
  "revocation_endpoint": process.env.APIBASEURL + "/oauth2/v1//revoke",
  "revocation_endpoint_auth_methods_supported": [
    "client_secret_basic",
    "client_secret_post",
    "client_secret_jwt",
    "private_key_jwt",
    "none"
  ],
  "end_session_endpoint": process.env.APIBASEURL + "/oauth2/v1//logout",
  "request_parameter_supported": true,
  "request_object_signing_alg_values_supported": [
    "HS256",
    "HS384",
    "HS512",
    "RS256",
    "RS384",
    "RS512",
    "ES256",
    "ES384",
    "ES512"
  ]
};

var utils = require('mlar')('mt1l');
const routemeta = require('mlar')('routemeta');
function vinfo(req, res, next){ 
  res.json(ainfo); 
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/.well-known/openid-configuration"; 
vinfo.routeConfig.method = "get"; 
vinfo.routeConfig.middlewares = [routemeta('oauth_authorize', 'dev')];
module.exports = vinfo;



/*
== MULTI METHOD / CONFIG ==
vinfo.routeConfig = [{}, {}];
vinfo.routeConfig[0].path = "/v12"; 
vinfo.routeConfig[0].method = "post"; 
vinfo.routeConfig[0].middlewares = ['v1'];
vinfo.routeConfig[1].path = "/v12"; 
vinfo.routeConfig[1].method = "get"; 
vinfo.routeConfig[1].middlewares = [];
*/
