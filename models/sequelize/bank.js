"use strict";
module.exports = function (sequelize, DataTypes) {
  const MODEL_NAME = 'bank';
  const SCHEMA_DEFINITION = {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    bankName: {
      type: DataTypes.STRING(100),
      required: true,
    },
    description: {
      type: DataTypes.STRING(140),
      required: true,
    },
    swiftCode: {
      type: DataTypes.STRING(32),
      required: true,
    }, 
    nibssCode: {
      type: DataTypes.STRING(20),
      required: true,
    },
    cbnBankCode: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    incorporationDate: {
      type: DataTypes.DATE,
      required: true,
    },
    rcNumber: {
      type: DataTypes.STRING(50),
      required: true,
    },
    website: {
      type: DataTypes.STRING(50),
      required: true,
    },
    bankCategory: {
      type: DataTypes.STRING(20),
      required: true,
    },
    logo: {
      type: DataTypes.STRING,
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
        
      }
    }
  };
  const model = sequelize.define(MODEL_NAME, SCHEMA_DEFINITION, SCHEMA_CONFIGURATION);
  return model;
};
