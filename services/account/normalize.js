const obval = require('mlar')('obval'); 
module.exports = (account, isbalance, includetransferbalance) => {
    let fields = 'accountNumber,customerId,accountName,currency,accountOpeningDate,lastTransactionDate,accountType,bvn,fullName,phoneNumber,email,status'.split(',');
    if (isbalance) {
        fields = 'accountNumber,currency,decimal,availableBalance,clearedBalance,unclearedBalance,holdBalance,minimumBalance'.split(',');
    }
    if (includetransferbalance) {
        fields.push('availableBalance');
        fields.push('bankId');
        fields.push('customerId');
        fields.push('id');
    }
    const normalized = obval.select(fields).from(account);
    return normalized;
}