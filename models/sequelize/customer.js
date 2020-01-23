"use strict";
module.exports = function (sequelize, DataTypes) {
  const MODEL_NAME = 'customer';
  const SCHEMA_DEFINITION = {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    firstName: {
      type: DataTypes.STRING(50),
      required: true,
    },
    lastName: {
      type: DataTypes.STRING(50),
      required: true,
    },
    otherNames: {
      type: DataTypes.STRING(50),
      required: true,
    },
    dateOfBirth: {// Modified format accordingly on normalize
      type: DataTypes.DATE,
      required: true,
    },
    bvn: {
      type: DataTypes.STRING(15),
      allowNull: true,
    },
    type: {
      type: DataTypes.STRING(50),
      required: true,
    },
    status: {
      type: DataTypes.STRING(50),
      required: true,
    },
    phone: {
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
    },
    addrLine1: {
      type: DataTypes.STRING(50),
      required: true,
    },
    addrLine2: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING(50),
      required: true,
    },
    state: {
      type: DataTypes.STRING(50),
      required: true,
    },
    country: {
      type: DataTypes.STRING(50),
      required: true,
    },
    postalCode: {
      type: DataTypes.STRING(50),
      required: true,
    },
    idNumber: {
      type: DataTypes.STRING(50),
      required: true,
    },
    idType: {
      type: DataTypes.STRING(50),
      required: true,
    },
    countryOfIssue: {
      type: DataTypes.STRING(50),
      required: true,
    },
    expiryDate: {
      type: DataTypes.STRING(50),
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
