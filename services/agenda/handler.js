const InkMindNote = require('../../model/note/note')
const { logger } = require('../../util/helper');

// --- New Handler for InkMind Note Reminders ---
module.exports.sendInkMindNoteReminder = async (job) => {
  const { noteId /*, userId */ } = job.attrs.data;
  logger.info(`HANDLER: Processing InkMind reminder for Note ID: ${noteId}`);

  try {
    const note = await InkMindNote.findById(noteId);

    if (!note) {
      logger.warn(`HANDLER: Note ID ${noteId} not found for reminder. Job will be removed.`);
      return; // Exit successfully
    }

    if (note.isArchived) {
      logger.info(`HANDLER: Note ID ${noteId} is archived. Reminder skipped.`);
      return;
    }

    // Check if reminderAt still matches or is still relevant (e.g., not cleared from note)
    // This check can be basic or more complex depending on requirements.
    // For simplicity, we assume if the job runs, the reminder was valid at scheduling time.
    // If the reminder was cleared from the note, this job would still run but could find reminderAt is null.
    if (!note.reminderAt) {
        logger.info(`HANDLER: Reminder for Note ID ${noteId} was cleared. Reminder skipped.`);
        return;
    }
    
    // Add a small tolerance (e.g., a few minutes) if needed, to ensure job doesn't miss due to processing delays
    const now = new Date();
    if (note.reminderAt > now && (note.reminderAt.getTime() - now.getTime()) > 5 * 60 * 1000) { // e.g. if reminder is still >5 mins in future
        logger.warn(`HANDLER: Reminder for Note ID ${noteId} is too far in the future. This job might be running prematurely or the reminder was rescheduled. Skipping.`);
        // This scenario might indicate an issue with job cancellation logic when reminders are updated.
        return;
    }


    // --- !!! Placeholder for Actual Notification Logic !!! ---
    logger.info(`**********************************************************************`);
    logger.info(`* REMINDER ALERT for Note ID: ${noteId} *`);
    logger.info(`* Title: ${note.title} *`);
    logger.info(`* Content: ${note.content.substring(0, 50)}... *`);
    // logger.info(`* User ID (if available): ${userId} *`); // When we have users
    logger.info(`* Original Reminder Time: ${note.reminderAt} *`);
    logger.info(`**********************************************************************`);
    // --- End Placeholder ---

  } catch (error) {
    logger.error(`HANDLER ERROR: Error processing InkMind reminder for Note ID ${noteId}:`, error);
    throw error; 
  }
};