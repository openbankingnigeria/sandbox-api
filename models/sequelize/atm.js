"use strict";
module.exports = function (sequelize, DataTypes) {
  const MODEL_NAME = 'atm';
  const SCHEMA_DEFINITION = {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    description: {
      type: DataTypes.STRING(140),
      required: true,
    },
    baseCurrency: {
      type: DataTypes.STRING(3),
      required: true,
    },
    minimumCashAmount: {
      type: DataTypes.DOUBLE,
      required: true,
    },
    ATMServices: { // COMMA SEP LIST TO BE SPLIT ON GET
      type: DataTypes.STRING(150),
      required: true,
    },
    terminalId: {
      type: DataTypes.STRING(15),
      required: true,
    },
    street: {
      type: DataTypes.TEXT,
      required: true,
    },
    city: {
      type: DataTypes.STRING(50),
      required: true,
    },
    state: {
      type: DataTypes.STRING(25),
      required: true,
    }, 
    country: {
      type: DataTypes.STRING(5),
      required: true,
    }, 
    latitude: {
      type: DataTypes.DOUBLE,
      required: true,
    },
    longitude: {
      type: DataTypes.DOUBLE,
      required: true,
    }
  };
  const SCHEMA_CONFIGURATION = {
    timestamps: true,
    paranoid: true,
    underscored: false,
    freezeTableName: true,
    classMethods: {
      associate: function(models) {
        model.belongsTo(models.bank);
        model.belongsTo(models.branch);
      }
    }
  };
  const model = sequelize.define(MODEL_NAME, SCHEMA_DEFINITION, SCHEMA_CONFIGURATION);
  return model;
};
