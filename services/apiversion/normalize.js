const obval = require('mlar')('obval');
const mt1l = require('mlar')('mt1l'); 
module.exports = (version) => {
    const normalized = obval.exclude(['id','createdAt','updatedAt','deletedAt', 'bankId']).from(version);
    normalized.isPrimary = normalized.isPrimary ? true : false;
    normalized.deployDate = mt1l.yyyymmdd(normalized.deployDate);
    return normalized;
}