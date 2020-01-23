"use strict";
module.exports = function (sequelize, DataTypes) {
  const MODEL_NAME = 'version';
  const SCHEMA_DEFINITION = {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    isPrimary: {
      type: DataTypes.BOOLEAN,
      required: true,
    },
    code: {
      type: DataTypes.STRING(5),
      required: true,
    },
    number: {
      type: DataTypes.STRING(3),
      required: true,
    },
    deployDate: {
      type: DataTypes.DATE,
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
