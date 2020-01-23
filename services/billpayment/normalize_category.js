const obval = require('mlar')('obval');
const mt1l = require('mlar')('mt1l'); 
module.exports = (billitem) => {
    let fields = 'id,bankId'.split(',');
    const normalized = obval.exclude(fields).from(billitem);
    return normalized;
}