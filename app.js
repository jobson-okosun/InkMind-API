const config = require('./config.js');
const path = require('path');
const express = require('express');
const compression = require('compression');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const requestIp = require('request-ip');
const dbConnection = require('./db/connection');
const corsOptions = require('./cors.config');
const { errorLogger, notFound } = require('./middleware/globalErrorHandler');
const scheduler = require('./services/agenda/scheduler');

const noteRoute = require('./router/note');
const healthRoute = require('./router/health');

const timeZoneMap = {
    development: 'Africa/Lagos'
};

process.env.TZ = timeZoneMap[process.env.NODE_ENV] || 'UTC';

dbConnection();

const app = express();

scheduler.startScheduler();

app.set('trust proxy', true);
app.use(requestIp.mw());

app.options('*', cors());
app.use(cors(corsOptions));

app.use(helmet());
app.use(compression());

app.use(logger('dev'));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

app.use(cookieParser());

// --- Note Routes ---
app.use('/api/v1', noteRoute);

// --- Health Check Route ---
app.use('/health', healthRoute)

app.all('*', notFound)

// --- Global Error Handling Middleware ---
app.use(errorLogger)


module.exports = app;
