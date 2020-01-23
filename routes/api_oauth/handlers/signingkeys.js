const ainfo = {
  "keys": [
    {
      "kty": "RSA",
      "alg": "RS256",
      "kid": "Mrcyxwvwy-uYa-hu-wRYYmixe9TNa2IJhG-tPywUeBc",
      "use": "sig",
      "e": "AQAB",
      "n": "k4YD17sny25O6Gm46j-qjkYe3NJYYSfeTqqCnXPr0fjq0uh_kAUQNQEEaMmWCY1lxVPQ_SGVGARY-BrSyLdG-IOBB1H0juuGtDdtKQORVHqhU9Imwjbkac0l-g7LFYfWI1eEGG-4ikW7mUyvt9sYzuNGEKkuGQzk0lro2Gg6F-TD7UIQMgt8l9xmEtmoi-bNBXLEVyvwOkU8y11rFwtjHj6aqERaEY0Dl_Q7yGinxuGtGV_04HY6Zqs-uzGF6WD96-9qJYhZLVU2xlZpCZ0OXb-SdvEDBEzTiimw0xQdS_OKNjmPhDI4QrBY5GmZ6xY2dwoGvDX_aqghL_hwyOf9Yw"
    },
    {
      "kty": "RSA",
      "alg": "RS256",
      "kid": "Esh3ywWkvkGl1ofqvSUtiKlSIir04maybGu1N5U4V1o",
      "use": "sig",
      "e": "AQAB",
      "n": "iRH0e79TIcLhX_5BSmM1D0cts8H2Hk-kodcaPik1CyKDgczAHV9vuadE7unzYnobqQxwiv6rAxZO-LHUztkSQ0Y5ymA6fnBYVVv8RWxH8GryxfaFfLHzNuVt9fPxsQ7E_mVyQa6vuGjDAbrOisZ56HUktuMBm3PSt6Z3nR7PpSGp4pqZMnlVI8ZBmUghyEcFIow9Y-rJDdx1-_U00A6B_bltqHXH1-d_uWLLvQPZ5-EpmXtdUcUbkRZlp4gf8gHyjImlsFzXqrXu2GcBpOsCLOxaE4x4iKBlI0mm5n6lQ4Nb0Cqev1Kml9SXMFSRDknj3IYlxudvgJI7EznOqzbI-w"
    }
  ]
};

var utils = require('mlar')('mt1l');
const routemeta = require('mlar')('routemeta');
function vinfo(req, res, next){ 
  res.json(ainfo); 
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/keys"; 
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
