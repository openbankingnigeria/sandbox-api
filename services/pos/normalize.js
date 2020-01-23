const obval = require('mlar')('obval'); 
module.exports = (pos) => {

    let fields = 'id,street,city,state,country,latitude,longitude,createdAt,updatedAt,deletedAt,bankId'.split(',');
    const normalized = obval.exclude(fields).from(pos);
    fields = 'street,city,state,country'.split(',');
    const location = obval.select(fields).from(pos);
    location.geoLocation = {
        latitude: pos.latitude,
        longitude: pos.longitude,
    }
    normalized.location = location;
    normalized.terminalId = pos.id;
    return normalized;
}