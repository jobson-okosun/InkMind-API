InkMind API 🧠📝
A robust and feature-rich backend API for a modern note-taking application. Built with Node.js, Express, MongoDB, and Agenda.js for scheduled reminders. Developed in Lagos, Nigeria as a comprehensive portfolio project.

Table of Contents
Description

Key Features

Tech Stack

Project Structure

API Endpoints

Prerequisites

Installation & Setup

Running the Application

Testing the API

Agenda.js Scheduler for Reminders

Future Enhancements (Ideas)

License

Description
InkMind API serves as the backend engine for a note-taking application that helps users capture, organize, and manage their thoughts, tasks, and ideas.

This project showcases backend development principles like:

RESTful API design

Database interaction

MVC architecture

Asynchronous task scheduling

It is built to be scalable and maintainable using modern JavaScript technologies.

Key Features
✅ Full CRUD Operations – Create, Read, Update, and Delete notes.
📁 Categorization – Organize notes into customizable categories.
🗂 Archiving & Restoration – Soft-delete notes and restore them when needed.
📌 Pinning/Favoriting – Keep important notes at the top for quick access.
⏰ Reminders & Due Dates – Set task reminders and deadlines.
⚡ Active Scheduling – Uses Agenda.js for background job scheduling.
🔍 Advanced Filtering & Sorting – Sort notes by various parameters.
📄 Pagination – Efficiently load and display notes.
⚙️ MVC Architecture – Organized codebase for better maintainability.

Tech Stack
Backend: Node.js, Express.js

Database: MongoDB, Mongoose

Job Scheduling: Agenda.js

Development Tools: dotenv, nodemon

API Testing: Postman, Insomnia (Recommended)

Project Structure
The project follows a Model-View-Controller (MVC) architectural pattern (though "View" is conceptual for an API) to ensure a clear separation of concerns:

inkmind-api/
├── config/                 # Database configuration (db.js)
├── controllers/            # Request handling logic (note.controller.js)
├── models/                 # Mongoose schemas and models (note.model.js)
├── routes/                 # API route definitions (index.js, note.routes.js)
├── services/
│   └── agenda/             # Agenda.js scheduler setup
│       ├── handler.js      # Job processing logic
│       └── scheduler.js    # Agenda configuration and startup
├── util/                   # Utility functions (appError.js, helper.js for catchAsync)
├── .env.example            # Example environment variables file (Recommended to create)
├── .gitignore              # Specifies intentionally untracked files that Git should ignore
├── app.js                  # Express application setup (middleware, main router)
├── package.json            # Project metadata and dependencies
├── server.js               # Main application entry point (starts server, connects DB)
└── README.md               # This file

API Endpoints
The base URL for all API endpoints is /api/v1.

Health Check:

GET /health: Checks the health and status of the API.

Notes Endpoints (/notes):

Method

Endpoint

Description

POST

/notes

Create a new note.

GET

/notes

Get all notes (supports filtering, sorting, pagination).

GET

/notes/:id

Get a single note by its ID.

PUT

/notes/:id

Update an existing note by its ID.

PATCH

/notes/:id

Partially update an existing note by its ID.

DELETE

/notes/:id

Permanently delete a note by its ID.

PATCH

/notes/:id/archive

Archive a note.

PATCH

/notes/:id/restore

Restore an archived note.

PATCH

/notes/:id/pin

Pin a note.

PATCH

/notes/:id/unpin

Unpin a note.

Query Parameters for GET /notes:

archived (true, false, all): Filter by archive status. Default: false.

category: Filter by a specific category name.

isPinned (true, false): Filter by pinned status.

reminderBefore, reminderAfter (ISO Date String): Filter notes by reminder date range.

dueBefore, dueAfter (ISO Date String): Filter notes by due date range.

hasReminder (true, false): Filter notes that have/don't have a reminder set.

isOverdue (true, false): Filter notes that are past their due date.

sort (e.g., -createdAt, title, -isPinned,-createdAt): Sort notes. Default: -isPinned -createdAt.

fields (e.g., title,content): Select specific fields to return.

page (number): Page number for pagination. Default: 1.

limit (number): Number of items per page. Default: 10.

Example Request Body for POST /notes:

{
    "title": "My Awesome Note",
    "content": "Detailed content of the note goes here.",
    "category": "Personal",
    "isPinned": true,
    "reminderAt": "2025-12-31T10:00:00.000Z",
    "dueDate": "2026-01-15"
}

(For more detailed examples, please refer to the code or test with an API client.)

Prerequisites
Before you begin, ensure you have the following installed:

Node.js (v14.x or later recommended)

npm (usually comes with Node.js)

MongoDB (Ensure it's running locally or you have access to a cloud instance like MongoDB Atlas)

Installation & Setup
1. Clone Repository
git clone [https://github.com/YOUR_USERNAME/inkmind-api.git](https://github.com/YOUR_USERNAME/inkmind-api.git)
cd inkmind-api

(Replace YOUR_USERNAME with your actual GitHub username)

2. Install Dependencies
npm install

3. Environment Variables
Create a .env file in the root of the project directory. You can copy the contents of .env.example (if you create one) or create it from scratch.

.env file content:

# Server Configuration
PORT=3000
NODE_ENV=development # or production

# MongoDB Connection
# For local MongoDB:
MONGO_URI="mongodb://localhost:27017/inkmindDB"
# For MongoDB Atlas (replace with your actual connection string):
# MONGO_URI="mongodb+srv://<username>:<password>@<cluster-url>/inkmindDB?retryWrites=true&w=majority"

# Agenda.js (uses the same MONGO_URI by default if not specified separately in agenda config)
# You can also set a specific collection name for Agenda jobs in services/agenda/scheduler.js

# Optional: JWT Secret for authentication (if you implement it later)
# JWT_SECRET="your_very_strong_secret_key_here"

Important:

Replace placeholder values (especially MONGO_URI) with your actual configuration.

Ensure your MongoDB server is running.

Running the Application
Development Mode
This mode uses nodemon for automatic server restarts when files change.

npm run dev

The API will typically be available at http://localhost:3000 (or the port specified in your .env file). You will see log messages in the console indicating the server has started and connected to the database and Agenda.

Production Mode (Simulated)
This command starts the server using node directly.

npm start

Testing the API
Use an API client like Postman or Insomnia to interact with the API endpoints.

Key Test Scenarios:

CRUD Operations: Create, retrieve, update, and delete notes.

Archiving/Restoring: Archive a note, verify it's hidden from default GET /notes, retrieve it via ?archived=true, and then restore it.

Pinning/Unpinning: Pin a note, verify it appears at the top of the default GET /notes list, and then unpin it.

Reminders:

Create a note with a reminderAt set a few minutes in the future (use UTC ISO 8601 format, e.g., YYYY-MM-DDTHH:mm:ss.sssZ).

Observe the server console for logs indicating the job was scheduled by Agenda.

After the reminder time passes (plus Agenda's processEvery interval, e.g., 30 seconds), check the console for the reminder handler logs.

Test updating a reminder time (should cancel the old job and schedule a new one).

Test clearing a reminder by setting reminderAt: null (should cancel the job).

Test deleting/archiving a note with an active reminder (should cancel the job).

Filtering & Sorting: Test the various query parameters for GET /notes.

Agenda.js Scheduler for Reminders
This API uses Agenda.js to manage and process note reminders in the background.

Scheduling: When a note is created or updated with a reminderAt date in the future, a job is scheduled with Agenda. Any existing reminder for that note is cancelled first to avoid duplicates.

Job Definition: A single job type (sendInkMindNoteReminderJob) is defined in services/agenda/scheduler.js.

Processing: The sendInkMindNoteReminder handler function in services/agenda/handler.js is executed when a scheduled reminder time is reached. Currently, this handler logs the reminder details to the console. In a full application, this handler would trigger actual notifications (e.g., email, push notification).

Cancellation: Reminders are automatically cancelled if the note is deleted, archived, or if the reminderAt field is cleared or updated.

Configuration: Agenda connects to MongoDB (using the same MONGO_URI or a specific one) and stores its job queue in a dedicated collection (e.g., inkMindAgendaJobs). It polls the database at intervals defined by processEvery in its configuration.

Future Enhancements (Ideas)
User Authentication & Authorization: Implement JWT-based authentication so notes belong to specific users.

Full-Text Search: Integrate more advanced search capabilities across note titles and content.

Tags/Labels: Allow users to add multiple tags to notes for better organization.

Rich Text/Markdown Support: Allow notes to be formatted.

Actual Notification System: Integrate email (Nodemailer, SendGrid) or push notifications (FCM) for reminders.

API Rate Limiting & Security Hardening: Implement helmet, express-rate-limit, etc.

Comprehensive API Documentation: Generate Swagger/OpenAPI documentation.

Unit & Integration Tests: Add a robust testing suite.

License
This project is licensed under the MIT License. See the LICENSE file for more details (if you added one to your repository).

Thank you for checking out InkMind API! Developed with care in Lagos, Nigeria.