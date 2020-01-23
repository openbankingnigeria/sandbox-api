"use strict";
module.exports = function (sequelize, DataTypes) {
  const MODEL_NAME = 'meta';
  const SCHEMA_DEFINITION = {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(15),
      required: true,
    },
    description: {
      type: DataTypes.STRING(150),
      required: true,
    },
    value: {
      type: DataTypes.TEXT,
      required: true,
    },
    group: {
      type: DataTypes.STRING(20),
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
        model.belongsTo(models.bank);
      }
    }
  };
  const model = sequelize.define(MODEL_NAME, SCHEMA_DEFINITION, SCHEMA_CONFIGURATION);
  return model;
};
