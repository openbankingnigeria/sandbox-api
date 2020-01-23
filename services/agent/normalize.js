const obval = require('mlar')('obval'); 
module.exports = (agent) => {

    let fields = 'id,street,city,state,country,latitude,longitude,createdAt,updatedAt,deletedAt,bankId'.split(',');
    const normalized = obval.exclude(fields).from(agent);
    fields = 'street,city,state,country'.split(',');
    const location = obval.select(fields).from(agent);
    location.geoLocation = {
        latitude: agent.latitude,
        longitude: agent.longitude,
    }
    normalized.location = location; 
    normalized.agentId = (agent.id + '').padStart(8, '0');
    normalized.contactInfo = JSON.parse(normalized.contactInfo);
    return normalized;
}