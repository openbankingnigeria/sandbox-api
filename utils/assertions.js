const validator = require('mlar')('validators');

module.exports ={
    digitsOnly(entity, error=null, param=null) {
        if (!validator.isDigits(entity)) {
            if (error) throw new Error(error);
            const errorField = param ? param.toString() : entity;
            throw new Error(`${errorField} contains non-digits`);
        }
    },

    bvnFormatOnly(bvn, error=null, param=null){
        param =  'BVN';
        module.exports.digitsOnly(bvn, error, param);
        if (!validator.isOfLength(bvn, 11)) {
            throw new Error('BVN should be 11 digits');
        }
    },

    nubanFormatOnly(entity, error=null, param=null) {
        if (!validator.isNuban(entity)) {
            if (error) throw new Error(error);
            const errorField = param ? param.toString() : entity;
            throw new Error(`${errorField} is not in NUBAN format`);
        }
    },

    dateFormatOnly(entity, error=null, param=null) {
        if (!validator.isDate(entity)) {
            if (error) throw new Error(error);
            const errorField = param ? param.toString() : entity;
            throw new Error(`${errorField} should be in a date format`);
        }
    },
    
    emailFormatOnly(entity, error=null, param=null) {
        if (!validator.isEmail(entity)) {
            if (error) throw new Error(error);
            const errorField = param ? param.toString() : entity;
            throw new Error(`${errorField} is not a valid email`);
        }
    },

    mustBeMutuallyExclusive(entities, error=null, params=null) {
        if (!validator.isMutuallyExclusive(entities)) {
            if (error) throw new Error(error);
            const errorFields = params.length ? params.map(param => param).join(', ') : entities.map(entity => entity).join(', ');
            throw new Error(`${errorFields} cannot be the same value`);
        }
    }
    
}
