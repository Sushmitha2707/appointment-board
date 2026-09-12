# from datetime import date

# from fastapi import Depends, FastAPI, HTTPException
# from sqlalchemy.orm import Session

from datetime import date, datetime, timedelta
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import Base, engine, get_db
import models
import schemas


Base.metadata.create_all(bind=engine)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "Appointment Board API is running!"}


@app.post(
    "/appointments",
    response_model=schemas.AppointmentResponse
)
def create_appointment(
    appointment: schemas.AppointmentCreate,
    db: Session = Depends(get_db)
):
    # Check that end time is after start time
    if appointment.end_time <= appointment.start_time:
        raise HTTPException(
            status_code=400,
            detail="End time must be after start time"
        )

    # Get appointments on the same date,
    # excluding cancelled appointments
    existing_appointments = (
        db.query(models.Appointment)
        .filter(
            models.Appointment.date == appointment.date,
            models.Appointment.status != "cancelled"
        )
        .all()
    )

    # Check for overlapping time slots
    for existing in existing_appointments:
        if (
            existing.start_time < appointment.end_time
            and existing.end_time > appointment.start_time
        ):
            raise HTTPException(
                status_code=400,
                detail="This time slot is already booked"
            )

    # Create the new appointment
    new_appointment = models.Appointment(
        title=appointment.title,
        description=appointment.description,
        date=appointment.date,
        start_time=appointment.start_time,
        end_time=appointment.end_time
    )

    # Save the appointment
    db.add(new_appointment)
    db.commit()
    db.refresh(new_appointment)

    return new_appointment


@app.get(
    "/appointments",
    response_model=list[schemas.AppointmentResponse]
)
def get_appointments(
    date: date | None = None,
    status: str | None = None,
    db: Session = Depends(get_db)
):
    # Automatically mark past scheduled appointments as completed
    # now = datetime.now()
    now = datetime.now()

    scheduled_appointments = (
        db.query(models.Appointment)
        .filter(models.Appointment.status == "scheduled")
        .all()
    )

    for appointment in scheduled_appointments:
        appointment_end = datetime.combine(
            appointment.date,
            appointment.end_time,
        )

        if appointment_end < now:
            appointment.status = "completed"

    db.commit()

    # Get appointments after automatic status updates
    query = db.query(models.Appointment)

    # Filter by date if provided
    if date:
        query = query.filter(models.Appointment.date == date)

    # Filter by status if provided
    if status:
        query = query.filter(models.Appointment.status == status)

    return query.all()


@app.put(
    "/appointments/{appointment_id}",
    response_model=schemas.AppointmentResponse
)
def update_appointment(
    appointment_id: int,
    appointment: schemas.AppointmentCreate,
    db: Session = Depends(get_db)
):
    # Find the appointment
    existing_appointment = (
        db.query(models.Appointment)
        .filter(models.Appointment.id == appointment_id)
        .first()
    )

    if not existing_appointment:
        raise HTTPException(
            status_code=404,
            detail="Appointment not found"
        )

    # Check that end time is after start time
    if appointment.end_time <= appointment.start_time:
        raise HTTPException(
            status_code=400,
            detail="End time must be after start time"
        )

    # Get other appointments on the same date
    # Exclude the appointment we are currently editing
    other_appointments = (
        db.query(models.Appointment)
        .filter(
            models.Appointment.date == appointment.date,
            models.Appointment.id != appointment_id,
            models.Appointment.status != "cancelled"
        )
        .all()
    )

    # Check for overlapping time slots
    for other in other_appointments:
        if (
            other.start_time < appointment.end_time
            and other.end_time > appointment.start_time
        ):
            raise HTTPException(
                status_code=400,
                detail="This time slot is already booked"
            )

    # Update the appointment
    existing_appointment.title = appointment.title
    existing_appointment.description = appointment.description
    existing_appointment.date = appointment.date
    existing_appointment.start_time = appointment.start_time
    existing_appointment.end_time = appointment.end_time

    db.commit()
    db.refresh(existing_appointment)

    return existing_appointment


@app.put(
    "/appointments/{appointment_id}/cancel",
    response_model=schemas.AppointmentResponse
)
def cancel_appointment(
    appointment_id: int,
    db: Session = Depends(get_db)
):
    # Find the appointment
    appointment = (
        db.query(models.Appointment)
        .filter(models.Appointment.id == appointment_id)
        .first()
    )

    if not appointment:
        raise HTTPException(
            status_code=404,
            detail="Appointment not found"
        )

    # Check if already cancelled
    if appointment.status == "cancelled":
        raise HTTPException(
            status_code=400,
            detail="Appointment is already cancelled"
        )

    # Change status instead of deleting the appointment
    appointment.status = "cancelled"

    db.commit()
    db.refresh(appointment)

    return appointment


@app.put(
    "/appointments/{appointment_id}/complete",
    response_model=schemas.AppointmentResponse
)
def complete_appointment(
    appointment_id: int,
    db: Session = Depends(get_db)
):
    # Find the appointment
    appointment = (
        db.query(models.Appointment)
        .filter(models.Appointment.id == appointment_id)
        .first()
    )

    if not appointment:
        raise HTTPException(
            status_code=404,
            detail="Appointment not found"
        )

    # Check if the appointment is cancelled
    if appointment.status == "cancelled":
        raise HTTPException(
            status_code=400,
            detail="Cancelled appointment cannot be completed"
        )

    # Check if already completed
    if appointment.status == "completed":
        raise HTTPException(
            status_code=400,
            detail="Appointment is already completed"
        )

    # Change status
    appointment.status = "completed"

    db.commit()
    db.refresh(appointment)

    return appointment