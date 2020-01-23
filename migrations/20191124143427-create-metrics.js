'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('metrics', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      function: {
        type: Sequelize.STRING
      },
      metricStartTime: {
        type: Sequelize.DATE
      },
      metricEndTime: {
        type: Sequelize.DATE
      },
      minimumResponseTime: {
        type: Sequelize.DOUBLE
      },
      averageResponseTime: {
        type: Sequelize.DOUBLE
      },
      maximumResponseTime: {
        type: Sequelize.DOUBLE
      },
      bankId: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('metrics');
  }
};