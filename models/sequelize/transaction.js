"use strict";
module.exports = function (sequelize, DataTypes) {
  const MODEL_NAME = 'transaction';
  const SCHEMA_DEFINITION = {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    accountNumber: {
      type: DataTypes.STRING(15),
      required: true,
    },
    amount: {
      type: DataTypes.DOUBLE,
      required: true,
    },
    currency: {
      type: DataTypes.STRING(3),
      required: true,
    },
    transactionTime: {
      type: DataTypes.DATE,
      required: true,
    },
    valueDate: {
        type: DataTypes.DATE,
        required: true,
      },
    channel: {
      type: DataTypes.STRING(50),
      required: true,
    },
    status: {
      type: DataTypes.STRING(20),
      required: true,
    },
    statusCode: {
      type: DataTypes.STRING(20),
      required: true,
    },
    debitOrCredit: {
      type: DataTypes.STRING(15),
      allowNull: true,
    },
    narration: {
      type: DataTypes.STRING(150),
      required: true,
    },
    transactionType: {
      type: DataTypes.STRING(50),
      required: true,
    },
    referenceId: {
      type: DataTypes.STRING(50),
      required: true,
    }
  };
  const SCHEMA_CONFIGURATION = {
    timestamps: true,
    indexes: [{unique:true, fields:['referenceId', 'bankId']}],
    paranoid: true,
    underscored: false,
    freezeTableName: true,
    classMethods: {
      associate: function(models) {
        model.belongsTo(models.bank);
        model.belongsTo(models.customer);
        model.belongsTo(models.account);
      }
    }
  };
  const model = sequelize.define(MODEL_NAME, SCHEMA_DEFINITION, SCHEMA_CONFIGURATION);
  return model;
};
