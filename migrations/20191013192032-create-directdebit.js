'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('directdebits', {
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      mandateID: {
        allowNull: false,
        type: Sequelize.STRING(50),
      },
      bankId: {
        type: Sequelize.INTEGER,
      },
      transactionRef: {
        allowNull: false,
        type: Sequelize.STRING(50),
        unique: true,
      },
      mandateStatus: { 
        type: Sequelize.STRING(20),
      },
      referenceId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        unique: true,

      },
      description: {
        type: Sequelize.TEXT,
      },
      sourceAccount: {
        type: Sequelize.STRING(100)
      },
      sourceAccountName: {
        type: Sequelize.STRING(50)
      },
      maximumAmount: {
        type: Sequelize.DOUBLE,
      },
      maximumTransaction: {
        type: Sequelize.INTEGER,
      },
      sourceCurrency: {
        type: Sequelize.STRING(3)
      },
      sourceNarration: {
        type: Sequelize.TEXT
      },
      nextPossibleChargeDate: {
        type: Sequelize.DATE
      },
      frequency: {
        type: Sequelize.STRING(20)
      },
      merchantCurrency: {
        type: Sequelize.STRING(3)
      },
      merchantAccount: {
        type: Sequelize.STRING(20)
      },
      merchantAccountName: {
        type: Sequelize.STRING(255)
      },
      statusWebHook: {
        type: Sequelize.STRING(255)
      },

      startDate: {
        type: Sequelize.DATE
      },
      endDate: {
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
    return queryInterface.dropTable('directdebits');
  }
};