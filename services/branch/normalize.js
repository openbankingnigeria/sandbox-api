const obval = require('mlar')('obval'); 
module.exports = (branch) => {

    let fields = 'id,street,city,state,country,latitude,longitude,createdAt,updatedAt,deletedAt,bankId'.split(',');
    const normalized = obval.exclude(fields).from(branch);
    fields = 'street,city,state,country'.split(',');
    const location = obval.select(fields).from(branch);
    location.geoLocation = {
        latitude: branch.latitude,
        longitude: branch.longitude,
    }
    normalized.location = location;
    normalized.branchId = (branch.id + '').padStart(10, 0);
    normalized.contactInfo = JSON.parse(normalized.contactInfo);
    return normalized;
}