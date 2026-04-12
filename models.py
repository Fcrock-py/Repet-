from sqlalchemy import Column, Integer, String
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