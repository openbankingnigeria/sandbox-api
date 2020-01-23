"use strict";
module.exports = function (sequelize, DataTypes) {
  const MODEL_NAME = 'terminal';
  const SCHEMA_DEFINITION = {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    merchantId: {
      type: DataTypes.STRING(15),
      required: true,
    },
    merchantName: {
      type: DataTypes.STRING(50),
      required: true,
    },
    currency: {
      type: DataTypes.STRING(3),
      required: true,
    },
    dateDeployed: {
      type: DataTypes.DATE,
      required: true,
    },
    terminalType: {
      type: DataTypes.STRING(50),
      required: true,
    },
    ptsa: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    ptsp: {
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
