const q = require('q');

function debit(amount) {
    const d = q.defer();
    function from(account) {
        q.fcall(() => {
            amount = parseFloat(amount);
            account.availableBalance = parseFloat(account.availableBalance);
            account.minimumBalance = parseFloat(account.minimumBalance);

            if (account.availableBalance < amount) throw new Error("Insufficient funds");
            
            // make sure the debit doesn't lead to a balance that's less than the minimum allowed balance
            if ((account.availableBalance - amount)  < account.minimumBalance) {
                throw new Error(`Balance cannot be less than ${account.minimumBalance}`);
            }
            
            if (account.availableBalance - amount < 0) throw new Error("Debiting this account would lead to a negative balance");
            
            // now we've passed the hurdles, debit!
            account.availableBalance -= amount;
            
            return [amount, account.save()];
        })
        .spread( (amount, txAccount) => {
            if (!txAccount) throw new Error("Could not debit user's account")
            let txDetail = {};
            
            txDetail.account = txAccount.accountNumber;
            txDetail.amountDebited = amount;

            d.resolve(txDetail);
        })
        .catch(error=> {
            d.reject(error)
        })
        return d.promise;
        
    }

    return {
        from: from
    }
}

module.exports = { debit }