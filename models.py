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