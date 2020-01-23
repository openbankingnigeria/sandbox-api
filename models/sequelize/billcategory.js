
"use strict";
module.exports = function (sequelize, DataTypes) {
  const MODEL_NAME = 'billcategory';
  const SCHEMA_DEFINITION = {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    billingSystemId: {
      type: DataTypes.INTEGER,
      required: true,
    },
    categoryName: {
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
      }
    }
  };
  const model = sequelize.define(MODEL_NAME, SCHEMA_DEFINITION, SCHEMA_CONFIGURATION);
  return model;
};
