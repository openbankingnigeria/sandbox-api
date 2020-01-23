"use strict";
module.exports = function (sequelize, DataTypes) {
  const MODEL_NAME = 'biller';
  const SCHEMA_DEFINITION = {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    categoryId: {
      type: DataTypes.INTEGER,
      required: true,
    },
    currency: {
        type: DataTypes.STRING(3),
        required: true,
      },
    nameOfBiller: {
        type: DataTypes.STRING(143),
        required: true,
      },
    billerCategory: {
      type: DataTypes.STRING(143),
      required: true,
    },
    categoryDescription: {
        type: DataTypes.STRING(143),
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
        model.belongsTo(models.customer);
      }
    }
  };
  const model = sequelize.define(MODEL_NAME, SCHEMA_DEFINITION, SCHEMA_CONFIGURATION);
  return model;
};
