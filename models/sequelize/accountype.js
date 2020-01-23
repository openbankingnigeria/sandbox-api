"use strict";
module.exports = function (sequelize, DataTypes) {
  const MODEL_NAME = 'accountype';
  const SCHEMA_DEFINITION = {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    accountTypeName: {
      type: DataTypes.STRING(35),
      required: true,
    },
    kycLevel: {
      type: DataTypes.INTEGER,
      required: true,
    },
    decimal: {
        type: DataTypes.DOUBLE,
        required: true,
    },
    currency: {
      type: DataTypes.STRING(3),
      required: true,
    },
    minimumBalance: {
      type: DataTypes.DOUBLE,
      required: true,
    },
    maximumBalance: {
      type: DataTypes.DOUBLE,
      required: true,
    },
    maximumOutflowLimit: {
      type: DataTypes.DOUBLE,
      required: true,
    },
    maximumInFlowLimit: {
      type: DataTypes.DOUBLE,
      required: true,
    },
    documentationRequired: {
      type: DataTypes.TEXT,
      required: true,
    },
    digitalServices: {
        type: DataTypes.TEXT,
        required: true,
    },
    cardProducts: {
    type: DataTypes.TEXT,
    required: true,
    },
    status: {
      type: DataTypes.STRING(20),
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
      }
    }
  };
  const model = sequelize.define(MODEL_NAME, SCHEMA_DEFINITION, SCHEMA_CONFIGURATION);
  return model;
};
