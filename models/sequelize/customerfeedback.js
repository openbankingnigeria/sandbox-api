'use strict';
module.exports = (sequelize, DataTypes) => {
  const customerfeedback = sequelize.define('customerfeedback', {
    feedbackReference: DataTypes.STRING,
    customerID: DataTypes.STRING,
    accountNumber: DataTypes.STRING,
    bvn: DataTypes.STRING,
    phoneNumber: DataTypes.STRING,
    email: DataTypes.STRING,
    feedbackCategory: DataTypes.STRING,
    feedbackDescription: DataTypes.STRING
  }, {});
  customerfeedback.associate = function(models) {
    // associations can be defined here
    customerfeedback.belongsTo(models.bank)
  };
  return customerfeedback;
};