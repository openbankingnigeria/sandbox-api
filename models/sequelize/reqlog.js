"use strict";
module.exports = function (sequelize, DataTypes) {
  const MODEL_NAME = 'reqlog';
  const SCHEMA_DEFINITION = {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    method: {
      type: DataTypes.STRING(100)
    },
    ip: {
      type: DataTypes.STRING(100)
    },
    path: {
      type: DataTypes.STRING(100)
    },
    status: {
      type: DataTypes.STRING(100)
    },
    requestId: {
      type: DataTypes.STRING(100),
      unique: true,
    },
    // requestId: {
    //   type: DataTypes.STRING(100),
    //   unique: 'idempt',
    // },
    // apiuserId: {
    //   type: DataTypes.INTEGER,
    //   unique: 'idempt'
    // }
  };
  const SCHEMA_CONFIGURATION = {
    timestamps: true,
    paranoid: true,
    underscored: false,
    freezeTableName: true,
    classMethods: {
      associate: function(models) {
        model.belongsTo(models.apiuser, {allowNull: true});
      }
    }
  };
  const model = sequelize.define(MODEL_NAME, SCHEMA_DEFINITION, SCHEMA_CONFIGURATION);
  return model;
};
