const { config } = require('dotenv');
const { resolve } = require('path');

config({ path: resolve(__dirname, `./environment/${process.env.NODE_ENV || 'development'}.env`) });

const NODE_ENV = process.env.NODE_ENV || 'development';
const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 3000;
const CONN_STRING = process.env.CONN_STRING;

const CORS_ORIGIN = process.env.ALLOWED_ORIGINS;

const configObj = {
  NODE_ENV,
  HOST,
  PORT,
  CONN_STRING,
  CORS_ORIGIN,
}

module.exports = configObj;

