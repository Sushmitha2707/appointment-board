# 📅 Appointment Board

A full-stack appointment management application for creating, managing, filtering, and tracking team appointments.

Built with **React, FastAPI, SQLAlchemy, and SQLite**, with validation and conflict detection to prevent overlapping appointments.

---

## ✨ Features

* ➕ Create appointments with title, description, date, and time
* ✏️ Edit existing appointments
* ✅ Complete appointments manually
* ❌ Cancel appointments without deleting them
* 🤖 Automatically mark past scheduled appointments as completed
* 🚫 Prevent overlapping appointments
* 🔄 Allow cancelled time slots to be reused
* ⏰ Validate that the end time is after the start time
* 🔎 Filter appointments by date and status
* 📅 Display appointments in chronological order
* 💬 Show success and error messages
* 📱 Responsive and user-friendly interface

---

## 🔄 Application Flow

```text
              ┌─────────────────┐
              │      User       │
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │ React Frontend  │
              │     + Vite      │
              └────────┬────────┘
                       │ REST API
                       ▼
              ┌─────────────────┐
              │  FastAPI Backend│
              │   Validation &  │
              │ Business Rules  │
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │   SQLAlchemy    │
              │      ORM        │
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │ SQLite Database │
              └─────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend

* React
* Vite
* JavaScript
* CSS

### Backend

* Python
* FastAPI
* SQLAlchemy
* Pydantic
* Uvicorn

### Database

* SQLite

### Development Tools

* Git
* GitHub
* npm
* Python Virtual Environment

---

## 📂 Project Structure

```text
appointment-board/
│
├── backend/
│   ├── main.py
│   ├── models.py
│   ├── schemas.py
│   ├── database.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

> The local Python virtual environment and SQLite database are excluded from version control using `.gitignore`.

---

## 📋 Appointment Rules

The application enforces the following business rules:

### Time Validation

The appointment's end time must be later than its start time.

```text
Start Time < End Time
```

### Overlap Prevention

Two active appointments cannot overlap on the same date.

For example:

```text
09:00 ───── 10:00
             ❌
09:30 ───── 10:30
```

The second appointment is rejected.

### Adjacent Appointments

Back-to-back appointments are allowed.

```text
09:00 ───── 10:00
10:00 ───── 11:00
```

### Cancelled Appointments

Cancelled appointments remain visible in the appointment list, but their time slots become available for reuse.

### Automatic Completion

Scheduled appointments are automatically marked as **completed** once their end date and time have passed.

---

## 🔎 Filtering

Appointments can be filtered using:

* Date
* Status

Available statuses:

* Scheduled
* Completed
* Cancelled

Filters can also be cleared to return to the complete appointment list.

---

## 🔌 API Endpoints

| Method | Endpoint                      | Description             |
| ------ | ----------------------------- | ----------------------- |
| `GET`  | `/`                           | Check API status        |
| `GET`  | `/appointments`               | Retrieve appointments   |
| `POST` | `/appointments`               | Create an appointment   |
| `PUT`  | `/appointments/{id}`          | Update an appointment   |
| `PUT`  | `/appointments/{id}/complete` | Complete an appointment |
| `PUT`  | `/appointments/{id}/cancel`   | Cancel an appointment   |

---

## ✅ Validation

The backend validates:

* Required appointment title
* Maximum title length
* Valid appointment date
* Valid start and end times
* End time after start time
* Overlapping appointments
* Appointment status transitions
* Appointment existence for update, complete, and cancel operations

Validation is performed on the backend to ensure that business rules are enforced independently of the frontend.

---

## 🗄️ Database

The application uses **SQLite** with **SQLAlchemy ORM**.

The database is created automatically when the backend starts.

The application stores:

* Appointment ID
* Title
* Description
* Date
* Start time
* End time
* Status

---

## 🚀 Getting Started

### Prerequisites

Make sure the following are installed:

* Python 3.10+
* Node.js and npm
* Git

### 1. Clone the Repository

```bash
git clone <repository-url>
cd appointment-board
```

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

### 3. Set Up the Backend

Navigate to the backend directory:

```bash
cd backend
```

Create a Python virtual environment:

```bash
python -m venv venv
```

Activate it on Windows:

```bash
venv\Scripts\activate
```

Install the backend dependencies:

```bash
pip install -r requirements.txt
```

Return to the project root:

```bash
cd ..
```

### 4. Start the Application

From the project root:

```bash
npm run dev
```

The development command starts both:

* React frontend
* FastAPI backend

No separate backend command is required.

---

## 🧪 Example Scenarios

The application supports scenarios such as:

### Create an Appointment

```text
Team Standup
2026-09-15
09:30 - 10:30
```

### Reject an Overlapping Appointment

If an appointment already exists from:

```text
09:30 - 10:30
```

creating another appointment from:

```text
10:00 - 11:00
```

will be rejected.

### Reuse a Cancelled Slot

If an appointment is cancelled, another appointment can be created using its previously reserved time slot.

### Automatic Completion

A scheduled appointment whose end time has passed is automatically changed to:

```text
completed
```

when appointments are retrieved.


## 📌 Future Improvements

Possible future enhancements include:

* User authentication and authorization
* Calendar-based appointment view
* Pagination for large appointment lists
* Email or notification reminders
* Deployment to a cloud platform
* Automated unit and integration tests

---

## 👩‍💻 Author

**Sushmitha H Kumar**

B.E. Artificial Intelligence & Machine Learning

---

## 📄 License

This project was developed as a full-stack application assignment.
