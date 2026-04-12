from pydantic import BaseModel, EmailStr

class SubjectOut(BaseModel):
    id: int
    name: str
    sphere: str

    class Config:
        from_attributes = True

class ApplicationIn(BaseModel):
    full_name: str
    gender: str
    age: int
    email: str
    phone: str
    subject: str

class ApplicationOut(BaseModel):
    id: int
    full_name: str
    gender: str
    age: int
    email: str
    phone: str
    subject: str

    class Config:
        from_attributes = True