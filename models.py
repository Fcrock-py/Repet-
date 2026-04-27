from sqlalchemy import Column, Integer, String, Float
from database import Base

class Subject(Base):
    __tablename__ = "subjects"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    sphere = Column(String, nullable=False, index=True)

class Application(Base):
    __tablename__ = "applications"
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    gender = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    subject = Column(String, nullable=False)

class Tutor(Base):
    __tablename__ = "tutors"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    subject = Column(String, nullable=False, index=True)
    sphere = Column(String, nullable=False)
    price = Column(Integer, nullable=False)
    experience = Column(Integer, nullable=False)
    level = Column(String, nullable=False)
    schedule = Column(String, nullable=False)
    birth_year = Column(Integer, nullable=False)
    goal = Column(String, nullable=False)
    rating = Column(Float, nullable=False)
    students = Column(Integer, nullable=False)
    lessons = Column(Integer, nullable=False)
    reviews = Column(String, nullable=False)
    description = Column(String, nullable=False)
    languages = Column(String, nullable=False)
    badge = Column(String, nullable=False)
    image_url = Column(String, nullable=False, default="")
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, nullable=True, unique=True, index=True)
    phone = Column(String, nullable=True, unique=True, index=True)
    password_hash = Column(String, nullable=False)

class BookingRequest(Base):
    __tablename__ = "booking_requests"
    id = Column(Integer, primary_key=True, index=True)
    tutor_id = Column(Integer, nullable=False)
    tutor_name = Column(String, nullable=False)
    user_id = Column(Integer, nullable=True)
    user_email = Column(String, nullable=True)
    user_phone = Column(String, nullable=True)
    request_type = Column(String, nullable=False)
    created_at = Column(String, nullable=False)

class UserProfile(Base):
    __tablename__ = "user_profiles"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, unique=True, nullable=False)
    last_name = Column(String, nullable=True)
    first_name = Column(String, nullable=True)
    middle_name = Column(String, nullable=True)
    about = Column(String, nullable=True)
    subjects = Column(String, nullable=True)

class FavoriteTutor(Base):
    __tablename__ = "favorite_tutors"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    tutor_id = Column(Integer, nullable=False)
    tutor_name = Column(String, nullable=False)
    tutor_subject = Column(String, nullable=False)
    tutor_price = Column(Integer, nullable=False)
    tutor_rating = Column(Float, nullable=False)
    tutor_students = Column(Integer, nullable=False)
    tutor_lessons = Column(Integer, nullable=False)
    tutor_reviews = Column(String, nullable=False)
    tutor_description = Column(String, nullable=False)
    tutor_languages = Column(String, nullable=False)
    tutor_badge = Column(String, nullable=False)
    tutor_image_url = Column(String, nullable=False)