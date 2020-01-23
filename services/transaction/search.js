const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger'); 
var morx = require('morx'); 
var q = require('q'); 
const DEFAULT_EXCLUDES = require('mlar')('appvalues').DEFAULT_EXCLUDES;
const assert = require('mlar')('assertions')
var normalize = require('./normalize');
const paginate = require('mlar')('paginate')
const moment = require('moment');

var spec = morx.spec({})  
                .build('bankId', 'required:false')
                .build('accountId', 'map:id, required:false')
                .build('accountNumber', 'required:false')
                .build('from', 'map:startDate, required:false')
                .build('to', 'map:endDate, required:false')
                .build('limit', 'required:false')
                .build('page', 'required:false')
                .build('fetch_one', 'required:false') 
                .build('status_check', 'required:false')
                .build('referenceId', 'required:false')
                .build('transactionRef', 'required:false')
                .end(); 



function service(data) {

    var d = q.defer();
    
    const page = data.page ? Number(data.page) : 1;
    const limit = data.limit ? Number(data.limit) : 20;
    const offset = page ? (page - 1) * limit : false;	
    
    

    q
    .fcall( () => {

        var result = morx.validate(data, spec, {throw_error:true});
        var params = result.params;

        if(params.referenceId) {
            assert.digitsOnly(params.referenceId, null, 'transactionRef');
        }
        if(params.transactionRef) {
            assert.digitsOnly(params.transactionRef, null, 'transactionRef');
        }
        
        if (params.endDate) {
            params.endDate = moment(params.endDate, "DDMMYYYY")
        }

        if (params.startDate) {
            params.startDate = moment(params.startDate, "DDMMYYYY")

        }
        
        let one_of_passed = false; // Flag to indicate one of the required values' passed
        let query_where = {
        };

        if (params.bankId){
            query_where.bankId = params.bankId
        }

        if(params.id) {
            query_where.$or = { id: params.id, accountNumber: params.id }
            one_of_passed = true;
        }
        if(params.referenceId) {
            query_where.referenceId = params.referenceId;
            one_of_passed = true;
        }
        if(params.transactionRef) {
            query_where.referenceId = params.transactionRef;
            one_of_passed = true;
        }
        if(params.accountNumber) {
            query_where.accountNumber = params.accountNumber;
            one_of_passed = true;
        }
        if(!one_of_passed && !params.status_check) {
            throw new Error('accountId or accountNumber required');
        }
        if(params.startDate) {
            query_where.createdAt = {
                $gte: params.startDate
            }
        }

        if(params.endDate) {
            if(!query_where.createdAt) {
                query_where.createdAt = {};
            }
            query_where.createdAt = {
                $lte: moment(moment(params.endDate)).add(1, 'day')
            }
        }
        
        let limit = 10;
        if(params.limit && (params.limit * 1) < 100) {
            limit = params.limit * 1;
        }
        return [params, models.transaction.findAndCountAll({
            raw: true,
            where: query_where,
            limit: limit,
            offset: offset,
            attributes: {
                exclude: [...DEFAULT_EXCLUDES]
            },
            order: [['createdAt', 'DESC']]
        })]
    })
    .spread( (params, transactions) => {
        let response = transactions.rows.map((tx)=> normalize(tx, params.status_check))
        
        if (params.fetch_one) {
            response = response[0];

            if (!response) throw new Error("Transaction not found");
            d.resolve(response);
        }

        let final_response = [];

        response.forEach(r => {
            let new_object = {
                accountNumber: r.accountNumber,
                amount: r.amount,
                currency: r.currency,
                channel: r.channel,
                debitOrCredit: r.debitOrCredit,
                narration: r.narration,
                referenceId: r.referenceId,
                transactionTime: r.transactionTime,
                transactionType: r.transactionType,
                valueDate: r.valueDate,
                balanceAfter: r.amount,
                expansionFields: [
                    {
                        id: r.id,
                        description: r.debitOrCredit + ' transaction for ' + r.accountNumber ,
                        type: r.transactionType, 
                        value: r.amount
                        
                    }
                ]
            }
            final_response.push(new_object)
        })
        d.resolve(paginate(final_response, 'transactions', transactions.count, limit, page));
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
