const Agenda = require('agenda');
const { CONN_STRING } = require('../../config');
const { logger } = require('../../util/helper'); 
const recurringJobDefinitions = require('./jobs');
const { sendNoteReminder } = require('./handler');

const agenda = new Agenda({
    db: { address: CONN_STRING, collection: 'agendaJobs' },
    processEvery: '30 seconds',
    maxConcurrency: 20,
});

// --- Define Recurring System Jobs ---
const defineRecurringJob = (jobName, updateFunction) => {
  agenda.define(jobName, async (job) => { 
    logger.info(`RECURRING JOB STARTING: ${job.attrs.name}`);
    await updateFunction(job);
  });
};

// --- Define One-Off Job Types ---
agenda.define('sendInkMindNoteReminderJob', {
    // priority: 'high', // Optional: set priority
    // concurrency: 5,   // Optional: limit concurrency for this specific job type
  },
  sendNoteReminder // This is the handler function from handler.js
);


const startAgenda = async () => {
  await agenda.start();
  logger.info('Agenda started successfully.');

  // --- Setup Recurring System Jobs ---
  // Cancel existing recurring jobs to re-register them with current schedules/definitions
  // This helps if schedules in jobs.js are changed.
  const recurringJobNames = recurringJobDefinitions.map(job => job.name);
  if (recurringJobNames.length > 0) {
      await agenda.cancel({ name: { $in: recurringJobNames } });
      logger.info(`Cancelled stale recurring jobs: ${recurringJobNames.join(', ')}`);
  }

  for (const jobConfig of recurringJobDefinitions) {
    if (jobConfig.enabled) {
      defineRecurringJob(jobConfig.name, jobConfig.updateFunction);
      logger.info(`Defined recurring job: ${jobConfig.name}`);
      
      if (jobConfig.runOnStartup) {
        logger.info(`Running job on startup: ${jobConfig.name}`);
        // Run immediately, not through agenda.now() to avoid "complete" event issues for startup
        try {
            await jobConfig.updateFunction(); // Direct call for startup
        } catch (error) {
            logger.error(`Error running job ${jobConfig.name} on startup:`, error);
        }
      }
      await agenda.every(jobConfig.schedule, jobConfig.name);
      logger.info(`Scheduled recurring job "${jobConfig.name}" every "${jobConfig.schedule}"`);
    }
  }
  logger.info('All recurring jobs processed and scheduled.');
};

agenda.on('complete', async (job) => {
  // Only cancel if it's a recurring job defined to avoid conflicts with one-off scheduled jobs
  const isRecurringSystemJob = recurringJobDefinitions.some(def => def.name === job.attrs.name);
  if (isRecurringSystemJob) {

    await agenda.cancel({ _id: job.attrs._id }); // Consider if this is truly needed for 'every'
    logger.info(`RECURRING JOB COMPLETED: ${job.attrs.name}. It will run again based on its 'every' schedule.`);
  } else {
    // For one-off jobs (like reminders), they are typically removed by Agenda upon successful completion.
    logger.info(`ONE-OFF JOB COMPLETED: ${job.attrs.name} (ID: ${job.attrs._id}).`);
  }
});

agenda.on('fail', (err, job) => {
  logger.error(`Job ${job.attrs.name} failed with error: ${err.message}`, { error: err, jobAttrs: job.attrs });
});

agenda.on('ready', () => {
    logger.info('Agenda scheduler is ready and connected to MongoDB.');
});

agenda.on('error', (err) => {
    logger.error('Agenda connection error or general error:', err);
});


const startScheduler = async () => {
  await startAgenda();
};

module.exports = {
  agenda,
  startScheduler,
};