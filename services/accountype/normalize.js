const obval = require('mlar')('obval');
const mt1l = require('mlar')('mt1l'); 
module.exports = (accountype) => {

    let fields = 'id,street,city,state,country,latitude,longitude,createdAt,updatedAt,deletedAt,bankId'.split(',');
    const normalized = obval.exclude(fields).from(accountype);
    normalized.documentationRequired = mt1l.jp(normalized.documentationRequired);
    normalized.digitalServices = mt1l.jp(normalized.digitalServices);
    normalized.cardProducts = mt1l.jp(normalized.cardProducts);
    normalized.accountTypeId = accountype.id;
    return normalized;
}