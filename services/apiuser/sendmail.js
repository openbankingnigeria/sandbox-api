const ErrorLogger = require('mlar')('errorlogger');  
var morx = require('morx'); 
var q = require('q');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

var spec = morx.spec({})  
                .build('tmpl', 'required:false')
                .build('email', 'required:true')
                .build('subject', 'required:false')
                .build('html', 'required:false')
                .end(); 


function service(data) {

    let d = q.defer();
    let params = {};

    q
    .fcall( () => {

        let result = morx.validate(data, spec, {throw_error:true});
        params = result.params;
        params.data = params.data || {}
        let x = new Date();
        params.data._vnbtime = x.toString();
        params.data._vnbyear = x.getFullYear();  
        params.subject = params.subject || "Open Banking Nigeria Sandbox Login";
        params.data.subject = params.subject;
 
        sgMail.send({
            to: params.email, 
            from: 'Open Banking Nigeria Sandbox Team <noreply@openbanking.ng>',
            subject: params.subject,
            text: 'WELCOME TO OBS',
            html: params.html,
        }).then(x=> {
            //ErrorLogger([x, x[0].request, x[0].request && x[0].request.response, x[0].request && x[0].request.response.toJSON(),  x.body]);
        }).catch(e => {
            ErrorLogger(e, params.requestId);
        });
    
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
