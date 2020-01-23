"use strict";
module.exports = function (sequelize, DataTypes) {
  const MODEL_NAME = 'account';
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
    accountName: {
      type: DataTypes.STRING(50),
      required: true,
    },
    currency: {
      type: DataTypes.STRING(3),
      required: true,
    },
    accountOpeningDate: {
      type: DataTypes.DATE,
      required: true,
    },
    decimal: {
      type: DataTypes.DOUBLE,
      required: true,
    },
    availableBalance: {
      type: DataTypes.DOUBLE,
      required: true,
    },
    clearedBalance: {
      type: DataTypes.DOUBLE,
      required: true,
    },
    unclearedBalance: {
      type: DataTypes.DOUBLE,
      required: false,
    },
    holdBalance: {
      type: DataTypes.DOUBLE,
      required: false,
    },
    minimumBalance: {
      type: DataTypes.DOUBLE,
      required: false,
    },
    accountType: {
      type: DataTypes.STRING(50),
      required: true,
    },
    bvn: {
      type: DataTypes.STRING(15),
      allowNull: true,
    },
    fullName: {
      type: DataTypes.STRING(50),
      required: true,
    },
    phoneNumber: {
      type: DataTypes.STRING(50),
      required: true,
    },
    email: {
      type: DataTypes.STRING(50),
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
        model.belongsTo(models.customer);
        model.belongsTo(models.accountype);
      }
    }
  };
  const model = sequelize.define(MODEL_NAME, SCHEMA_DEFINITION, SCHEMA_CONFIGURATION);
  return model;
};
