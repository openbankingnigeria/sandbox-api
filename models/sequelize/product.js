"use strict";
module.exports = function (sequelize, DataTypes) {
  const MODEL_NAME = 'product';
  const SCHEMA_DEFINITION = {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    productCategory: {
      type: DataTypes.STRING(50),
      required: true,
    },
    productType: {
      type: DataTypes.STRING(50),
      required: true,
    },
    description: {
      type: DataTypes.TEXT,
      required: true,
    },
    name: {
      type: DataTypes.STRING(50),
      required: true,
    },
    currency: {
      type: DataTypes.STRING(5),
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
