const { parse, format } = require('mongodb-uri');
const { connect, connection } = require('mongoose');
const { CONN_STRING } = require('../config');
const { logger } = require('../util/helper');

function encodeMongoURI(urlString) {
  if (urlString) {
    const parsed = parse(urlString);
    return format(parsed);
  }
  return urlString;
}

module.exports = async () => {
  try {
    const url = encodeMongoURI(CONN_STRING ?? '');

    connect(url);

    connection.once('open', () => {
      logger.info('Database connected');
    });

    connection.on('error', (error) => {
      logger.error(`Could not connect to the database. Error: ${error}`);
    });

    connection.on('disconnected', () => {
      logger.info('Disconnected from MongoDB');
    });

    // Gracefully handle process termination
    process.on('SIGINT', () => {
      connection.close(() => {
        logger.info('MongoDB connection closed due to application termination');
        process.exit(0);
      });
    });
    
  } catch (error) {
    logger.error(`Error connecting to the database: ${error}`);
  }
};