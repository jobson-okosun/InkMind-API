const schema = {
    title: {
        type: String,
        required: [true, 'A note must have a title.'],
        trim: true,
        maxlength: [100, 'A note title must have less or equal than 100 characters.'],
        minlength: [3, 'A note title must have more or equal than 3 characters.']
    },
    content: {
        type: String,
        required: [true, 'A note must have content.'],
        trim: true,
    },
    category: {
        type: String,
        trim: true,
        default: 'General',
        enum: ['General', 'Work', 'Personal', 'Ideas', 'Urgent']
    },
    isArchived: {
        type: Boolean,
        default: false,
      },
      isPinned: {
        type: Boolean,
        default: false,
      },
      reminderAt: {
        type: Date,
        default: null,
      },
      dueDate: {
        type: Date,
        default: null,
      },
}

module.exports = schema
