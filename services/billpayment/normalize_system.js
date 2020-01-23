const obval = require('mlar')('obval');
const mt1l = require('mlar')('mt1l'); 
module.exports = (system) => {
    let fields = 'id,bankId'.split(',');
    const normalized = obval.exclude(fields).from(system);
    return {
        "billingSystemId": system.id,
      "billingaSystemName": system.name
    };
}