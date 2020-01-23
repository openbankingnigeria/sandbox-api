const obval = require('mlar')('obval'); 
module.exports = (atm) => {

    let fields = 'id,street,city,state,country,latitude,longitude,createdAt,updatedAt,deletedAt,bankId'.split(',');
    const normalized = obval.exclude(fields).from(atm);
    fields = 'street,city,state,country'.split(',');
    const location = obval.select(fields).from(atm);
    location.geoLocation = {
        latitude: atm.latitude,
        longitude: atm.longitude,
    }
    normalized.location = location;
    //console.log(atm);
    //normalized.terminalId = new Date(atm.createdAt).getTime();
    normalized.atmId = atm.id;
    normalized.ATMServices = atm.ATMServices.split(',');
    return normalized;
}