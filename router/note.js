const express = require('express');
const router = express.Router();
const noteController = require('../controller/noteController');

router
  .route('/')
  .post(noteController.createNote) 
  .get(noteController.getAllNotes); 

router
  .route('/:id')
  .get(noteController.getNoteById)  
  .put(noteController.updateNote)   
  .patch(noteController.updateNote)  
  .delete(noteController.deleteNote); 

router
  .route('/:id/archive')
  .patch(noteController.archiveNote);
router
  .route('/:id/restore')
  .patch(noteController.restoreNote);

router
  .route('/:id/pin')
  .patch(noteController.pinNote); 

router
  .route('/:id/unpin')
  .patch(noteController.unpinNote); 

module.exports = router;
