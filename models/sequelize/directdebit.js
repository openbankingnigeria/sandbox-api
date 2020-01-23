'use strict';
module.exports = (sequelize, DataTypes) => {
  const directdebit = sequelize.define('directdebit', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    referenceId: DataTypes.INTEGER,
    mandateStatus: {
      type: DataTypes.STRING, 
      defaultValue: 'pending',
      allowNull: false,
    },
    transactionRef: DataTypes.STRING,
    mandateID: DataTypes.STRING,
    description: DataTypes.STRING,
    sourceAccount: DataTypes.STRING,
    sourceAccountName: DataTypes.STRING,
    sourceNarration: DataTypes.STRING,
    nextPossibleChargeDate: DataTypes.DATE,
    frequency: DataTypes.STRING,
    merchantCurrency: DataTypes.STRING,
    merchantAccount: DataTypes.STRING,
    merchantAccountName: DataTypes.STRING,
    statusWebHook: DataTypes.STRING,
    maximumAmount: DataTypes.DOUBLE,
    maximumTransaction: DataTypes.INTEGER,

    sourceCurrency: DataTypes.STRING,
    startDate: DataTypes.DATE,
    endDate: DataTypes.DATE,
    
  }, {});
  directdebit.associate = function(models) {
    // associations can be defined hered
    directdebit.belongsTo(models.bank);
  };
  return directdebit;
};