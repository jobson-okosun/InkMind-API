const schema = require("./note.schema");
const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
    schema,
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// --- Indexes ---
// Improves query performance for frequently searched fields.

noteSchema.index({ title: 'text', content: 'text' });
noteSchema.index({ category: 1 });
noteSchema.index({ isArchived: 1 }); 
noteSchema.index({ isPinned: 1 });  
noteSchema.index({ reminderAt: 1 });
noteSchema.index({ dueDate: 1 }); 

const Note = mongoose.model.Note || mongoose.model('Note', noteSchema);
module.exports = Note;

