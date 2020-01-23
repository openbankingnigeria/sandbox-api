"use strict";

let env = {};
try {
  env = require('../config/env.json')
} catch (e) {
  // quiet failure
}

module.exports = {
    "development": {
      "username": process.env.DEVUN || 'root',
      "password": process.env.DEVPW || 'password' , 
      "database": process.env.DEVDB || 'openbanking',
      "host": process.env.DEVHOST || 'localhost',
      "dialect": "mysql"
    },
    "production": {
      "username": process.env.PRODUN,
      "password": process.env.PRODPW,
      "database": process.env.PRODDB,
      "host": process.env.PRODHOST,
      "dialect": "mysql"
    },
    "logging":true

}
