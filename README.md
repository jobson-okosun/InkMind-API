# InkMind API 🧠📝

> A robust and feature-rich backend API for a modern note-taking application.  
> Built with Node.js, Express, MongoDB, and Agenda.js for scheduled reminders.  
> Developed with care in Lagos, Nigeria 🇳🇬

---

## 📌 Table of Contents

- [Description](#description)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [Testing the API](#testing-the-api)
- [Agenda.js Scheduler for Reminders](#agendajs-scheduler-for-reminders)
- [Future Enhancements (Ideas)](#future-enhancements-ideas)
- [License](#license)

---

## 🧠 Description

InkMind API serves as the backend engine for a note-taking application that helps users capture, organize, and manage their thoughts, tasks, and ideas.

This project showcases backend development principles like:

- RESTful API design
- Database interaction
- MVC architecture
- Asynchronous task scheduling

It is built to be scalable and maintainable using modern JavaScript technologies.

---

## ✅ Key Features

- **CRUD Operations** – Create, Read, Update, and Delete notes  
- **📁 Categorization** – Organize notes by category  
- **🗂 Archiving & Restoration** – Soft-delete and recover notes  
- **📌 Pinning** – Pin notes for quick access  
- **⏰ Reminders** – Schedule tasks and due dates  
- **⚡ Agenda.js Integration** – Background job scheduling  
- **🔍 Filtering & Sorting** – Flexible query support  
- **📄 Pagination** – Load notes efficiently  
- **⚙️ MVC Architecture** – Organized codebase

---

## 🧰 Tech Stack

- **Backend**: Node.js, Express.js  
- **Database**: MongoDB, Mongoose  
- **Job Scheduling**: Agenda.js  
- **Development Tools**: dotenv, nodemon  
- **API Testing**: Postman, Insomnia (recommended)

---

## 🗂 Project Structure

```bash
app.js
bin
   |-- www
config.js
controller
   |-- healthController.js
   |-- noteController.js
cors.config.js
db
   |-- connection.js
environment
   |-- development.env
middleware
   |-- globalErrorHandler.js
model
   |-- note
   |   |-- note.js
   |   |-- note.schema.js
package-lock.json
package.json
router
   |-- health.js
   |-- note.js
services
   |-- agenda
   |   |-- handler.js
   |   |-- jobs.js
   |   |-- scheduler.js
util
   |-- appError.js
   |-- constants.js
   |-- helper.js
```


---

### API Endpoints

| Method | Endpoint               | Description                          |
|--------|----------------------- |--------------------------------------|
| GET    | `/heath`               | Check for server health and uptime   |
| POST   | `/api/v1`              | Create a new note                    |
| GET    | `/api/v1`              | Get all notes (filter/sort/page)     |
| GET    | `/api/v1/:id`          | Get a specific note by ID            |
| PUT    | `/api/v1/:id`          | Replace a note                       |
| PATCH  | `/api/v1/:id`          | Partially update a note              |
| DELETE | `/api/v1/:id`          | Permanently delete a note            |
| PATCH  | `/api/v1/:id/archive`  | Archive a note                       |
| PATCH  | `/api/v1/:id/restore`  | Restore an archived note             |
| PATCH  | `/api/v1/:id/pin`      | Pin a note                           |
| PATCH  | `/api/v1/:id/unpin`    | Unpin a note                         |

### GET `/api/v1` Query Parameters

- `archived`: `true` | `false` | `all`
- `category`: Filter by category name
- `isPinned`: `true` | `false`
- `reminderBefore`, `reminderAfter`: ISO Date string
- `dueBefore`, `dueAfter`: ISO Date string
- `hasReminder`: `true` | `false`
- `isOverdue`: `true` | `false`
- `sort`: `-isPinned,-createdAt`
- `fields`: e.g. `title,content`
- `page`: Default is `1`
- `limit`: Default is `10`

### Example Request Body (`POST /api/v1`)

```json
{
  "title": "My Awesome Note",
  "content": "Detailed content of the note goes here.",
  "category": "Personal",
  "isPinned": true,
  "reminderAt": "2025-12-31T10:00:00.000Z",
  "dueDate": "2026-01-15"
}

---

## Prerequisites

- Node.js (v14 or newer)  
- npm 
- MongoDB (Local or MongoDB cluster)  

---

###  Installation & Setup
# Clone repository
git clone https://github.com/YOUR_USERNAME/inkmind-api.git
cd inkmind-api

# Install dependencies
npm install

---

## Environment Variables
# Server Config
PORT=3000
NODE_ENV=development

# MongoDB Connection: For cloud
CONN_STRING="mongodb+srv://<user>:<pass>@cluster.mongodb.net/inkmindDB?retryWrites=true&w=majority"

#Cors 
ALLOWED_ORIGINS='http://localhost:4200'

...

## Running the Application
- Dev Environment (With Nodemon): npm run dev
- Prod Environment: npm run start
