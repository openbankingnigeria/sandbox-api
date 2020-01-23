const obval = require('mlar')('obval'); 
module.exports = (tx, status_check) => {

    let fields = ['accountId', 'apiuserId', 'id', 'bankId', 'customerId', 'status', 'statusCode'];
    let obvalmethod = 'exclude';
    if(status_check) {
        fields = ['status', 'statusCode'];
        obvalmethod = 'select';
    }
    const normalized = obval[obvalmethod](fields).from(tx);
    
    return normalized;
}