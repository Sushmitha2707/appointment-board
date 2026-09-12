import { useEffect, useState } from "react"
import "./App.css"

function App() {
  const [appointments, setAppointments] = useState([])

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")

  const [filterDate, setFilterDate] = useState("")
  const [filterStatus, setFilterStatus] = useState("")

  const [editingId, setEditingId] = useState(null)

  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState("")

  useEffect(() => {
    let url = "http://127.0.0.1:8000/appointments"

    const params = new URLSearchParams()

    if (filterDate !== "") {
      params.append("date", filterDate)
    }

    if (filterStatus !== "") {
      params.append("status", filterStatus)
    }

    const query = params.toString()

    if (query) {
      url = url + "?" + query
    }

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setAppointments(data)
      })
      .catch((error) => {
        console.error(error)
        setMessage("Could not load appointments.")
        setMessageType("error")
      })
  }, [filterDate, filterStatus])

  const handleAddAppointment = () => {
    setMessage("")

    if (!title || !date || !startTime || !endTime) {
      setMessage("Please fill in all required fields.")
      setMessageType("error")
      return
    }

    if (endTime <= startTime) {
      setMessage("End time must be after start time.")
      setMessageType("error")
      return
    }

    const newAppointment = {
      title: title,
      description: description,
      date: date,
      start_time: startTime,
      end_time: endTime,
    }

    fetch("http://127.0.0.1:8000/appointments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newAppointment),
    })
      .then(async (response) => {
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.detail || "Could not create appointment")
        }

        return data
      })
      .then(() => {
        setTitle("")
        setDescription("")
        setDate("")
        setStartTime("")
        setEndTime("")

        setMessage("Appointment added successfully.")
        setMessageType("success")

        window.location.reload()
      })
      .catch((error) => {
        setMessage(error.message)
        setMessageType("error")
      })
  }

  const handleCompleteAppointment = (appointmentId) => {
    setMessage("")

    fetch(
      `http://127.0.0.1:8000/appointments/${appointmentId}/complete`,
      {
        method: "PUT",
      }
    )
      .then(async (response) => {
        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            data.detail || "Could not complete appointment"
          )
        }

        return data
      })
      .then(() => {
        setMessage("Appointment completed successfully.")
        setMessageType("success")

        window.location.reload()
      })
      .catch((error) => {
        setMessage(error.message)
        setMessageType("error")
      })
  }

  const handleCancelAppointment = (appointmentId) => {
    setMessage("")

    fetch(
      `http://127.0.0.1:8000/appointments/${appointmentId}/cancel`,
      {
        method: "PUT",
      }
    )
      .then(async (response) => {
        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            data.detail || "Could not cancel appointment"
          )
        }

        return data
      })
      .then(() => {
        setMessage("Appointment cancelled successfully.")
        setMessageType("success")

        window.location.reload()
      })
      .catch((error) => {
        setMessage(error.message)
        setMessageType("error")
      })
  }

  const handleEdit = (appointment) => {
    setEditingId(appointment.id)

    setTitle(appointment.title)
    setDescription(appointment.description || "")
    setDate(appointment.date)
    setStartTime(appointment.start_time)
    setEndTime(appointment.end_time)

    setMessage("")
  }

  const handleUpdateAppointment = () => {
    setMessage("")

    if (!title || !date || !startTime || !endTime) {
      setMessage("Please fill in all required fields.")
      setMessageType("error")
      return
    }

    if (endTime <= startTime) {
      setMessage("End time must be after start time.")
      setMessageType("error")
      return
    }

    const updatedAppointment = {
      title: title,
      description: description,
      date: date,
      start_time: startTime,
      end_time: endTime,
    }

    fetch(
      `http://127.0.0.1:8000/appointments/${editingId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedAppointment),
      }
    )
      .then(async (response) => {
        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            data.detail || "Could not update appointment"
          )
        }

        return data
      })
      .then(() => {
        setTitle("")
        setDescription("")
        setDate("")
        setStartTime("")
        setEndTime("")

        setEditingId(null)

        setMessage("Appointment updated successfully.")
        setMessageType("success")

        window.location.reload()
      })
      .catch((error) => {
        setMessage(error.message)
        setMessageType("error")
      })
  }

  const handleCancelEdit = () => {
    setEditingId(null)

    setTitle("")
    setDescription("")
    setDate("")
    setStartTime("")
    setEndTime("")

    setMessage("")
  }

  const statusOrder = {
    scheduled: 0,
    completed: 1,
    cancelled: 2,
  }

  const sortedAppointments = [...appointments].sort((first, second) => {
    const statusDifference =
      (statusOrder[first.status] ?? 3) - (statusOrder[second.status] ?? 3)

    if (statusDifference !== 0) {
      return statusDifference
    }

    const dateDifference = first.date.localeCompare(second.date)

    if (dateDifference !== 0) {
      return dateDifference
    }

    return first.start_time.localeCompare(second.start_time)
  })

  return (
    <div className="app-container">

      <header className="page-header">
        <div>
          <h1>Appointment Board</h1>
          <p>Manage your team's appointments in one place.</p>
        </div>

        <div className="header-badge">
          Appointment Management
        </div>
      </header>

      {message && (
        <div className={`message ${messageType}`}>
          <span>
            {messageType === "success" ? "✓" : "!"}
          </span>

          <p>{message}</p>
        </div>
      )}

      <div className="top-section">

        <section className="panel appointment-form-panel">
          <div className="panel-heading">
            <div>
              <h2>
                {editingId === null
                  ? "Add Appointment"
                  : "Edit Appointment"}
              </h2>

              <p>
                {editingId === null
                  ? "Create a new appointment."
                  : "Update the appointment details."}
              </p>
            </div>
          </div>

          <div className="form-grid">

            <div className="form-group full-width">
              <label>Title *</label>

              <input
                type="text"
                placeholder="e.g. Team Meeting"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
              />
            </div>

            <div className="form-group full-width">
              <label>Description</label>

              <textarea
                placeholder="Add appointment details..."
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>Date *</label>

              <input
                type="date"
                value={date}
                onChange={(event) =>
                  setDate(event.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label>Start Time *</label>

              <input
                type="time"
                value={startTime}
                onChange={(event) =>
                  setStartTime(event.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label>End Time *</label>

              <input
                type="time"
                value={endTime}
                onChange={(event) =>
                  setEndTime(event.target.value)
                }
              />
            </div>

          </div>

          <div className="form-actions">

            {editingId === null ? (
              <button
                className="primary-button"
                onClick={handleAddAppointment}
              >
                + Add Appointment
              </button>
            ) : (
              <>
                <button
                  className="primary-button"
                  onClick={handleUpdateAppointment}
                >
                  Save Changes
                </button>

                <button
                  className="secondary-button"
                  onClick={handleCancelEdit}
                >
                  Cancel Edit
                </button>
              </>
            )}

          </div>
        </section>

        <section className="panel filter-panel">

          <div className="panel-heading">
            <div>
              <h2>Filter Appointments</h2>
              <p>Find appointments quickly.</p>
            </div>
          </div>

          <div className="filter-group">

            <div className="form-group">
              <label>Date</label>

              <input
                type="date"
                value={filterDate}
                onChange={(event) =>
                  setFilterDate(event.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label>Status</label>

              <select
                value={filterStatus}
                onChange={(event) =>
                  setFilterStatus(event.target.value)
                }
              >
                <option value="">All statuses</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

          </div>

          <button
            className="clear-button"
            onClick={() => {
              setFilterDate("")
              setFilterStatus("")
            }}
          >
            Clear Filters
          </button>

        </section>

      </div>

      <section className="appointments-section">

        <div className="section-heading">

          <div>
            <h2>Appointments</h2>

            <p>
              {appointments.length} appointment
              {appointments.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="legend">

            <span>
              <i className="legend-dot scheduled-dot"></i>
              Scheduled
            </span>

            <span>
              <i className="legend-dot completed-dot"></i>
              Completed
            </span>

            <span>
              <i className="legend-dot cancelled-dot"></i>
              Cancelled
            </span>

          </div>

        </div>

        {appointments.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📅</div>

            <h3>No appointments found</h3>

            <p>
              Try changing your filters or create a new appointment.
            </p>
          </div>
        )}

        <div className="appointments-list">

          {sortedAppointments.map((appointment) => (

            <div
              className={`appointment-card ${appointment.status}`}
              key={appointment.id}
            >

              <div className="appointment-card-top">

                <div>
                  <h3>{appointment.title}</h3>

                  {appointment.description && (
                    <p className="appointment-description">
                      {appointment.description}
                    </p>
                  )}
                </div>

                <span
                  className={`status-badge ${appointment.status}`}
                >
                  {appointment.status}
                </span>

              </div>

              <div className="appointment-details">

                <div className="detail-item">
                  <span className="detail-icon">📅</span>

                  <div>
                    <small>Date</small>
                    <strong>{appointment.date}</strong>
                  </div>
                </div>

                <div className="detail-item">
                  <span className="detail-icon">🕐</span>

                  <div>
                    <small>Time</small>
                    <strong>
                      {appointment.start_time} -{" "}
                      {appointment.end_time}
                    </strong>
                  </div>
                </div>

              </div>

              <div className="appointment-actions">

                <button
                  className="edit-button"
                  onClick={() => handleEdit(appointment)}
                >
                  Edit
                </button>

                <button
                  className="complete-button"
                  onClick={() =>
                    handleCompleteAppointment(appointment.id)
                  }
                  disabled={
                    appointment.status === "completed" ||
                    appointment.status === "cancelled"
                  }
                >
                  Complete
                </button>

                <button
                  className="cancel-button"
                  onClick={() =>
                    handleCancelAppointment(appointment.id)
                  }
                  disabled={
                    appointment.status === "cancelled" ||
                    appointment.status === "completed"
                  }
                >
                  Cancel
                </button>

              </div>

            </div>

          ))}

        </div>

      </section>

    </div>
  )
}
export default App