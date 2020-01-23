'use strict';
module.exports = (sequelize, DataTypes) => {
  const heldfund = sequelize.define('heldfund', {
    referenceId: DataTypes.STRING,
    account: DataTypes.STRING,
    amount: DataTypes.DOUBLE,
    currency: DataTypes.STRING,
    narration: DataTypes.TEXT,
    transactionRef: DataTypes.STRING,
    startHoldDate: DataTypes.DATE,
    endHoldDate: DataTypes.DATE,
    releaseHoldDate: DataTypes.DATE,
    transactionDate: {
      type: DataTypes.DATE,
      defaultValue: new Date()
    },
    bankId: DataTypes.INTEGER,
  }, {
    freezeTableName: true
  });
  heldfund.associate = function(models) {
    // associations can be defined here
    heldfund.belongsTo(models.bank);
  };
  return heldfund;
};