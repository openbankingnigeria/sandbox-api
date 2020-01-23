function removeWhitespaces(data, dataType) {
    data = dataType.toLowerCase() == 'json' ? JSON.stringify(data) : data.toString();
    return data.replace(/\s/g, "")
}

function removeCarriageReturns(data, dataType) {
    data = dataType.toLowerCase() == 'json' ? JSON.stringify(data) : data.toString();
    return data.replace(/[\n\r]+/g, '');  // shout out to https://stackoverflow.com/a/10805198/12153280
}

function completelySanitize(data) {
    data = data.replace(/\\r/g, '');
    data = data.replace(/\\n/g, '' ) 
    return data
}

function pad(dateString) {
    dateString = '' + dateString;
    if (dateString.length < 2) {
       dateString = '0' + dateString;
    }

    return  dateString;
}

function hyphenatedDate(dateString) {
    let date = new Date(dateString);
    
    return date.getFullYear() + '-' +  pad(date.getMonth() + 1) + '-' + pad(date.getDate());
}
module.exports = { completelySanitize, removeCarriageReturns, removeWhitespaces, hyphenatedDate}