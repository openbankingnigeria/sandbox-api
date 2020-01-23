function generateRandom(objectType, length=10) {
    let digits = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
    var characters  = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let returnValue = '';
    
    if (objectType == 'digits') {

        for (let i = 0; i < length; i++) {
            returnValue += digits[parseInt(Math.random() * digits.length - 1)];
        }
        return parseInt(returnValue)

    }
    else if (objectType == 'string') {
        for (let i = 0; i < length; i++) {
            returnValue += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return returnValue

    }

    else if (objectType == 'email') {
        for (let i = 0; i < length; i++) {
            returnValue += characters.charAt(Math.floor(Math.random() * characters.length));
        }    
        return returnValue + '@gmail.com';

    }
}

module.exports = {
    generateRandom
}