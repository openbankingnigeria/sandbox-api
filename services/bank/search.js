const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger');
const obval = require('mlar')('obval'); 
var morx = require('morx'); 
var q = require('q'); 
const DEFAULT_EXCLUDES = require('mlar')('appvalues').DEFAULT_EXCLUDES;
const get_location = require('mlar').mreq('services', 'location/search');
const get_all_meta = require('mlar').mreq('services', 'meta/search');
const sanitizers = require('mlar')('sanitizers');

//var normalize = require('./normalize');


var spec = morx.spec({})  
                .build('bankId', 'map:id, required:false')
                .build('bankCode', 'map:cbnBankCode, required:false') 
                .end(); 



function service(data) {

    var d = q.defer();
    let bankCode = null;

    q
    .fcall( () => {

        var result = morx.validate(data, spec, {throw_error:true});
        var params = result.params;
        bankCode = params.cbnBankCode;
        return models.bank.findOne({
            raw: true,
            where: params,
            attributes: {
                exclude: DEFAULT_EXCLUDES
            }
        })
    })
    .then( bank => {
        if (!bank) throw new Error("Bank not found");
        const meta = get_all_meta({
            entity: bank.id,
            bankId: bank.id,
            group: ['bci', 'bsm']
        })
        return [bank, meta]
    })
    .spread( (bank, meta) => {
        let fields = 'id,street,city,state,country,latitude,longitude'.split(',');
        if(bankCode){
            fields = 'street,city,state,country,latitude,longitude'.split(',');
        }
        const response = obval.exclude(fields).from(bank);
        fields = 'street,city,state,country'.split(',');
        const location = obval.select(fields).from(bank);
        location.geoLocation = {
            latitude: bank.latitude,
            longitude: bank.longitude,
        }

        if (response.incorporationDate) {
            response.incorporationDate = sanitizers.hyphenatedDate(response.incorporationDate);
        }
        response.location = location;
        response.contactInfo = meta.filter(m=>{return m.group === 'bci'}).map(m=>{delete m.name; delete m.group; return m;});
        response.socialMedia = meta.filter(m=>{return m.group === 'bsm'}).map(m=>{delete m.name; delete m.group; return m;});
        response["expansionFields"]= [
            {
              "id": "Some random ID",
              "description": "Some random text",
              "type": "Some random type",
              "value": "Some value"
            }
        ]
        d.resolve(response);
    })
    .catch( e => {
        
        ErrorLogger(e);
        d.reject(e);

    })

    return d.promise;

}



service.morxspc = spec;
module.exports = service;

/*require('mlar')('service_tester')(service, {
    business_name:'Green Berg Inc',
    business_type:'e-commerce',
    email:Date.now()+"@kkk.com",
    password:'12345',
    meta:{collegue:124, debo:3940},
    country:'12345',
    public_key:'12345',
    secret_key:'12345',
    test_public_key:'12345',
    test_secret_key:'12345',
    contact_person:Date.now()+" Alaw",
}, false);*/
