'use strict';
module.exports = (sequelize, DataTypes) => {
  const metrics = sequelize.define('metrics', {
    function: DataTypes.STRING,
    metricStartTime: DataTypes.DATE,
    metricEndTime: DataTypes.DATE,
    minimumResponseTime: DataTypes.DOUBLE,
    averageResponseTime: DataTypes.DOUBLE,
    maximumResponseTime: DataTypes.DOUBLE,
    bankId: DataTypes.INTEGER
  }, {});
  metrics.associate = function(models) {
    // associations can be defined here
    metrics.belongsTo(models.bank, {foreignKey: 'bankId'})
  };
  return metrics;
};