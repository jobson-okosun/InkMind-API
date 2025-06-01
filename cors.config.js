const { CORS_ORIGIN } = require('./config');
const { logger } = require('./util/helper');

const allowedOrigins = CORS_ORIGIN?.split(',');

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
      logger.info('Request not allowed by CORS: ' + origin);
    }
  },
};

module.exports = corsOptions;
