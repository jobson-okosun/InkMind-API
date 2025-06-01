const Note = require('../model/note/note');
const AppError = require('../util/appError');
const mongoose = require('mongoose');
const { catchAsync, logger } = require('../util/helper'); 
const { REMINDER_JOB_NAME } = require('../util/constants');
const { agenda } = require('../services/agenda/scheduler');

// Helper function to schedule a reminder
const scheduleReminder = async (note) => {
  if (note.reminderAt && new Date(note.reminderAt) > new Date()) {
    try {
      // Cancel any existing job for this note first to avoid duplicates
      const numRemoved = await agenda.cancel({ 'data.noteId': note._id.toString(), name: REMINDER_JOB_NAME });
      if (numRemoved > 0) {
        logger.info(`[Scheduler] Cancelled ${numRemoved} existing reminder job(s) for Note ID: ${note._id}`);
      }

      const job = await agenda.schedule(new Date(note.reminderAt), REMINDER_JOB_NAME, {
        noteId: note._id.toString(),

      });
      logger.info(`[Scheduler] Reminder job scheduled for Note ID: ${note._id} at ${new Date(note.reminderAt).toLocaleString()}. Job ID: ${job.attrs._id}`);
    } catch (error) {
      logger.error(`[Scheduler] Error scheduling reminder for Note ID ${note._id}:`, error);
    }
  }
};

// Helper function to cancel a reminder
const cancelReminder = async (noteId) => {
  try {
    const numRemoved = await agenda.cancel({ 'data.noteId': noteId.toString(), name: REMINDER_JOB_NAME });
    if (numRemoved > 0) {
      logger.info(`[Scheduler] Reminder job(s) cancelled for Note ID: ${noteId}. Count: ${numRemoved}`);
    }
  } catch (error) {
    logger.error(`[Scheduler] Error cancelling reminder for Note ID ${noteId}:`, error);
  }
};

// @desc    Create a new note
// @route   POST /api/v1/notes
// @access  Private (to be implemented with auth)
exports.createNote = catchAsync(async (req, res, next) => {
  const { title, content, category, reminderAt, dueDate, isPinned } = req.body;

  if (!title || !content) {
    return next(new AppError('Title and content are required fields.', 400));
  }

  const newNoteData = { title, content };
  if (category) newNoteData.category = category;
  if (reminderAt) newNoteData.reminderAt = new Date(reminderAt);
  if (dueDate) newNoteData.dueDate = new Date(dueDate);
  if (isPinned !== undefined) newNoteData.isPinned = isPinned;

  const newNote = await Note.create(newNoteData);

  // Schedule reminder if reminderAt is set and in the future
  if (newNote.reminderAt && new Date(newNote.reminderAt) > new Date()) {
    await scheduleReminder(newNote);
  }

  res.status(201).json({
    status: 'success',
    message: 'Note created successfully.',
    data: {
      note: newNote
    },
  });
});

// @desc    Get all notes
// @route   GET /api/v1/notes
// @access  Private (to be implemented with auth)
exports.getAllNotes = catchAsync(async (req, res, next) => {
  let queryObj = { ...req.query };

  // Add new date-related filter fields to excludedFields if they are not part of the general queryObj structure
  const excludedFields = ['page', 'sort', 'limit', 'fields', 'archived', 'reminderBefore', 'reminderAfter', 'dueBefore', 'dueAfter', 'hasReminder', 'isOverdue'];
  excludedFields.forEach(el => delete queryObj[el]);

  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
  queryObj = JSON.parse(queryStr);

  // --- Archiving Filter ---
  if (req.query.archived === 'true') {
    queryObj.isArchived = true;
  } else if (req.query.archived === 'all') {
    // No filter on isArchived
  } else {
    queryObj.isArchived = false; // Default: show non-archived
  }

  // --- Reminder and Due Date Filters ---
  const now = new Date();

  if (req.query.reminderBefore) {
    queryObj.reminderAt = { ...queryObj.reminderAt, $lte: new Date(req.query.reminderBefore) };
  }
  if (req.query.reminderAfter) {
    // Reminders from now onwards, reminderAfter=today or reminderAfter=now
    queryObj.reminderAt = { ...queryObj.reminderAt, $gte: new Date(req.query.reminderAfter) };
  }
  if (req.query.dueBefore) {
    queryObj.dueDate = { ...queryObj.dueDate, $lte: new Date(req.query.dueBefore) };
  }
  if (req.query.dueAfter) {
    queryObj.dueDate = { ...queryObj.dueDate, $gte: new Date(req.query.dueAfter) };
  }
  if (req.query.hasReminder === 'true') {
    queryObj.reminderAt = { $ne: null, $exists: true };
  } else if (req.query.hasReminder === 'false') {
    queryObj.reminderAt = null;
  }
  if (req.query.isOverdue === 'true') {
    queryObj.dueDate = { $ne: null, $lt: now };
  } else if (req.query.isOverdue === 'false') {
    queryObj.dueDate = { $eq: null, $gte: now }; // Not overdue means no due date or due date is in the future
  }
  // --- End Reminder and Due Date Filters ---

  let query = Note.find(queryObj);

  // Sorting
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-isPinned -createdAt'); // Default sort
  }

  // Field Limiting
  if (req.query.fields) {
    const fields = req.query.fields.split(',').join(' ');
    query = query.select(fields);
  } else {
    query = query.select('-__v');
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  query = query.skip(skip).limit(limit);

  const notes = await query;
  const countQueryObj = { ...queryObj };
  const totalNotes = await Note.countDocuments(countQueryObj);

  res.status(200).json({
    status: 'success',
    results: notes.length,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalNotes / limit),
      totalNotes: totalNotes
    },
    data: {
      notes: notes
    },
  });
});

// @desc    Get a single note by ID
// @route   GET /api/v1/notes/:id
// @access  Private (to be implemented with auth)
exports.getNoteById = catchAsync(async (req, res, next) => {
  const noteId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(noteId)) {
    return next(new AppError('Invalid note ID format.', 400));
  }
  const note = await Note.findById(noteId);

  if (!note) {
    return next(new AppError(`No note found with ID: ${noteId}`, 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      note: note
    },
  });
});

// @desc    Update a note by ID
// @route   PUT /api/v1/notes/:id
exports.updateNote = catchAsync(async (req, res, next) => {
  const noteId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(noteId)) {
    return next(new AppError('Invalid note ID format.', 400));
  }

  const { title, content, category, reminderAt, dueDate, isArchived, isPinned } = req.body;

  // Prevent direct update of isArchived and isPinned via this general update endpoint
  if (isArchived !== undefined || isPinned !== undefined) {
    return next(new AppError('Cannot update isArchived or isPinned status via this endpoint. Use specific archive/pin endpoints.', 400));
  }

  const updateData = {};
  if (title !== undefined) updateData.title = title;
  if (content !== undefined) updateData.content = content;
  if (category !== undefined) updateData.category = category;

  // Allow setting dates to a new value or clearing them by passing null
  if (reminderAt !== undefined) {
    updateData.reminderAt = reminderAt ? new Date(reminderAt) : null;
  }
  if (dueDate !== undefined) {
    updateData.dueDate = dueDate ? new Date(dueDate) : null;
  }

  if (Object.keys(updateData).length === 0) {
    return next(new AppError('No valid data provided for update. To clear dates, pass them as null.', 400));
  }

  const updatedNote = await Note.findByIdAndUpdate(noteId, updateData, { new: true, runValidators: true });
  if (!updatedNote) return next(new AppError(`No note found with ID: ${noteId} to update.`, 404));

  // Handle reminder scheduling changes
  if (updateData.reminderAt !== undefined) { // If reminderAt was part of the update
    await cancelReminder(updatedNote._id);
    if (updatedNote.reminderAt && new Date(updatedNote.reminderAt) > new Date()) {
      await scheduleReminder(updatedNote); // Schedule new one if valid
    }
  }

  if (!updatedNote) {
    return next(new AppError(`No note found with ID: ${noteId} to update.`, 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Note updated successfully.',
    data: {
      note: updatedNote
    },
  });
});

// --- ARCHIVING CONTROLLERS ---
// @desc    Archive a note by ID
// @route   PATCH /api/v1/notes/:id/archive
exports.archiveNote = catchAsync(async (req, res, next) => {
  const noteId = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(noteId)) {
    return next(new AppError('Invalid note ID format.', 400));
  }

  const note = await Note.findByIdAndUpdate(
    noteId,
    { isArchived: true, updatedAt: Date.now() },
    { new: true, runValidators: true }
  );

  if (!note) {
    return next(new AppError(`No note found with ID: ${noteId} to archive.`, 404));
  }

  await cancelReminder(note._id); // Cancel reminder when archiving

  res.status(200).json({
    status: 'success',
    message: 'Note archived successfully.',
    data: { note },
  });
});

// @desc    Restore an archived note by ID
// @route   PATCH /api/v1/notes/:id/restore
exports.restoreNote = catchAsync(async (req, res, next) => {
  const noteId = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(noteId)) {
    return next(new AppError('Invalid note ID format.', 400));
  }

  const note = await Note.findByIdAndUpdate(
    noteId,
    { isArchived: false, updatedAt: Date.now() },
    { new: true, runValidators: true }
  );

  if (!note) {
    return next(new AppError(`No note found with ID: ${noteId} to restore.`, 404));
  }

  // Optional: Re-schedule reminder if reminderAt is still valid and in the future
  if (note.reminderAt && new Date(note.reminderAt) > new Date()) {
    await scheduleReminder(note);
  }

  res.status(200).json({
    status: 'success',
    message: 'Note restored successfully.',
    data: { note },
  });
});

// --- PINNING CONTROLLERS ---
// @desc    Pin a note by ID
// @route   PATCH /api/v1/notes/:id/pin
exports.pinNote = catchAsync(async (req, res, next) => {
  const noteId = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(noteId)) {
    return next(new AppError('Invalid note ID format.', 400));
  }

  const note = await Note.findByIdAndUpdate(
    noteId,
    { isPinned: true, updatedAt: Date.now() },
    { new: true, runValidators: true }
  );

  if (!note) {
    return next(new AppError(`No note found with ID: ${noteId} to pin.`, 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Note pinned successfully.',
    data: { note },
  });
});

// @desc    Unpin a note by ID
// @route   PATCH /api/v1/notes/:id/unpin
exports.unpinNote = catchAsync(async (req, res, next) => {
  const noteId = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(noteId)) {
    return next(new AppError('Invalid note ID format.', 400));
  }

  const note = await Note.findByIdAndUpdate(
    noteId,
    { isPinned: false, updatedAt: Date.now() },
    { new: true, runValidators: true }
  );

  if (!note) {
    return next(new AppError(`No note found with ID: ${noteId} to unpin.`, 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Note unpinned successfully.',
    data: { note },
  });
});


// @desc    Delete a note by ID (Permanent Delete)
// @route   DELETE /api/v1/notes/:id
exports.deleteNote = catchAsync(async (req, res, next) => {
  const noteId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(noteId)) {
    return next(new AppError('Invalid note ID format.', 400));
  }
  const note = await Note.findByIdAndDelete(noteId);

  if (!note) {
    return next(new AppError(`No note found with ID: ${noteId} to delete.`, 404));
  }

  await cancelReminder(noteId); // Cancel any reminder when deleting

  res.status(204).json({
    status: 'success',
    data: null,
  });
});