"use strict";
module.exports = function (sequelize, DataTypes) {
  const MODEL_NAME = 'location';
  const SCHEMA_DEFINITION = {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
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
    },
    entity: {
      type: DataTypes.INTEGER,
      required: true,
    },
    entitytype: {
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
      }
    }
  };
  const model = sequelize.define(MODEL_NAME, SCHEMA_DEFINITION, SCHEMA_CONFIGURATION);
  return model;
};
