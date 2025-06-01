const pino = require("pino");

const logger = pino({
  level: "info",
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "dddd, mmmm dS, yyyy, h:MM:ss TT",
    },
  },
});

const log = function (...args){
  logger.error('ERROR LOG:')

  for (let item of args) {
    logger.error(item);
  }
}

// --- Utility function for handling async route handlers ---
// This helps avoid writing try...catch blocks in every async controller function.
const catchAsync = fn => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

module.exports = {
  logger,
  log,
  catchAsync
};
