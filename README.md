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

inkmind-api/
├── config/ # Database configuration
├── controllers/ # Request handling logic
├── models/ # Mongoose schemas
├── routes/ # API route definitions
├── services/
│ └── agenda/ # Agenda.js scheduler setup
│ ├── handler.js
│ └── scheduler.js
├── util/ # Utility functions (e.g. error handler)
├── .env.example # Example environment config
├── .gitignore
├── app.js # Express app setup
├── package.json
├── server.js # Application entry point
└── README.md