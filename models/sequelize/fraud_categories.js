'use strict';
module.exports = (sequelize, DataTypes) => {
  const fraud_categories = sequelize.define('fraud_categories', {
    code: DataTypes.STRING,
    name: DataTypes.STRING
  }, {});
  fraud_categories.associate = function(models) {
    // associations can be defined here
    //fraud_categories.belongsTo(models.bank);
  };
  return fraud_categories;
};