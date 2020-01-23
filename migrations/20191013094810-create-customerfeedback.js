'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('customerfeedback', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      feedbackReference: {
        type: Sequelize.STRING(50),
        required: true
      },
      customerID: {
        type: Sequelize.STRING(50)
      },
      accountNumber: {
        type: Sequelize.STRING(10)
      },
      bvn: {
        type: Sequelize.STRING(11)
      },
      phoneNumber: {
        type: Sequelize.STRING(50)
      },
      email: {
        type: Sequelize.STRING(50)
      },
      feedbackCategory: {
        type: Sequelize.STRING(50),
        required: true
      },
      feedbackDescription: {
        type: Sequelize.TEXT,
        required:true
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
    return queryInterface.dropTable('customerfeedback');
  }
};