"use strict";
module.exports = function (sequelize, DataTypes) {
  const MODEL_NAME = 'apiuser';
  const SCHEMA_DEFINITION = {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    apiKey: {
      type: DataTypes.STRING(100),
      required: true,
      unique: true
    },
    apiSecret: {
      type: DataTypes.STRING(100),
      required: true,
      unique: true
    },
    passwordhash: {
      type: DataTypes.TEXT,
      required: true,
    },
    is_admin: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      required: false,
    },
    fullName: {
      type: DataTypes.STRING(50),
      required: true,
    },
    company: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    callback_url: {
      type: DataTypes.STRING(250),
      allowNull: true,
    },
    app_name: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    phoneNumber: {
      type: DataTypes.STRING(50),
      required: true,
    },
    email: {
      type: DataTypes.STRING(50),
      required: true,
      unique: true
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
        model.hasMany(models.reqlog);
      }
    }
  };
  const model = sequelize.define(MODEL_NAME, SCHEMA_DEFINITION, SCHEMA_CONFIGURATION);
  return model;
};
