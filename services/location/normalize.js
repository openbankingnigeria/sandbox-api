module.exports = (location) => {
    const {street, city, state, country, latitude, longitude} = location;
    return { street, city, state, country, geoLocation: {
        latitude: latitude,
        longitude: longitude
    }};
}