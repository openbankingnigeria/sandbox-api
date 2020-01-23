/**
"billingSystemId": "1",
      "categoryId": "1",
      "billerId": "1",
      "billPaymentProductId": "1",
      "billPaymentProductName": "Electricity",
      "fixedOrVariableAmount": "1000"
 */
"use strict";
module.exports = function (sequelize, DataTypes) {
  const MODEL_NAME = 'billitem';
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
    categoryId: {
      type: DataTypes.INTEGER,
      required: true,
    },
    billerId: {
        type: DataTypes.INTEGER,
        required: true,
      },
      billPaymentProductId: {
        type: DataTypes.INTEGER,
        required: true,
    },
    billPaymentProductName: {
      type: DataTypes.STRING(143),
      required: true,
    },
    fixedOrVariableAmount: {
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
        // model.belongsTo(models.customer);
        // model.belongsTo(models.account);
      }
    }
  };
  const model = sequelize.define(MODEL_NAME, SCHEMA_DEFINITION, SCHEMA_CONFIGURATION);
  return model;
};
