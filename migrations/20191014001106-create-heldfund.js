'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('heldfund', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      referenceId: {
        type: Sequelize.STRING(50),
        unique: true,
      },
      bankId: {
        type: Sequelize.INTEGER,
      },
      account: {
        type: Sequelize.STRING(10)
      },
      amount: {
        type: Sequelize.DOUBLE
      },
      currency: {
        type: Sequelize.STRING(3),
      },
      startHoldDate: {
        type: Sequelize.DATE
      },
      endHoldDate: {
        type: Sequelize.DATE
      },
      transactionRef: {
        type:Sequelize.STRING(50),
        unique: true,
      },
      transactionDate: {
        type: Sequelize.DATE
      },
      releaseHoldDate: {
        type: Sequelize.DATE
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
    return queryInterface.dropTable('heldfund');
  }
};