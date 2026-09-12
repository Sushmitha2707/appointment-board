from datetime import date, time

from pydantic import BaseModel, Field


class AppointmentCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    description: str | None = None
    date: date
    start_time: time
    end_time: time


class AppointmentResponse(BaseModel):
    id: int
    title: str
    description: str | None
    date: date
    start_time: time
    end_time: time
    status: str

    class Config:
        from_attributes = True