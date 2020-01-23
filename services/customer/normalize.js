const obval = require('mlar')('obval'); 
module.exports = (customer) => {

    let fields = 'idNumber,idType,countryOfIssue,expiryDate,firstName,lastName,otherNames,id,addrLine2,street,addrLine1,city,state,country,postalCode,createdAt,updatedAt,deletedAt,bankId'.split(',');
    const normalized = obval.exclude(fields).from(customer);
    fields = 'firstName,lastName,otherNames'.split(',');
    const customerName = obval.select(fields).from(customer);
    normalized.customerName = customerName;
    fields = 'addrLine2,street,addrLine1,city,state,country,postalCode'.split(',');
    const customerAddress = obval.select(fields).from(customer);
    normalized.customerAddress = customerAddress;
    fields = 'idNumber,idType,countryOfIssue,expiryDate'.split(',');
    const identity = obval.select(fields).from(customer);
    normalized.identity = identity;
    

    normalized.numberOfAccounts = 1; 
    normalized.customerID = (customer.id + '').padStart(8, '0');
    return normalized;
}