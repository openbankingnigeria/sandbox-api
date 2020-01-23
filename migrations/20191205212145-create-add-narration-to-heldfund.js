'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('heldfund', 'narration', Sequelize.TEXT);
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('heldfund', 'narration');
  }
};