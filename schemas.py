from pydantic import BaseModel
from typing import Optional

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

class TutorOut(BaseModel):
    id: int
    name: str
    subject: str
    sphere: str
    price: int
    experience: int
    level: str
    schedule: str
    birth_year: int
    goal: str
    rating: float
    students: int
    lessons: int
    reviews: str
    description: str
    languages: str
    badge: str
    image_url: str
    class Config:
        from_attributes = True

class TutorSearchParams(BaseModel):
    name: Optional[str] = None
    subject: Optional[str] = None
    price_from: Optional[int] = None
    price_to: Optional[int] = None
    schedule: Optional[str] = None
    experience: Optional[int] = None
    level: Optional[str] = None
    birth_year_from: Optional[int] = None
    birth_year_to: Optional[int] = None
    goal: Optional[str] = None

class RegisterIn(BaseModel):
    email: Optional[str] = None
    phone: Optional[str] = None
    password: str
    password_confirm: str

class LoginIn(BaseModel):
    login: str
    password: str

class UserOut(BaseModel):
    id: int
    email: Optional[str] = None
    phone: Optional[str] = None
    class Config:
        from_attributes = True

class TokenOut(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

class BookingRequestOut(BaseModel):
    id: int
    tutor_id: int
    tutor_name: str
    user_id: Optional[int]
    user_email: Optional[str]
    user_phone: Optional[str]
    request_type: str
    created_at: str
    class Config:
        from_attributes = True

class UserProfileIn(BaseModel):
    last_name: Optional[str] = None
    first_name: Optional[str] = None
    middle_name: Optional[str] = None
    about: Optional[str] = None
    subjects: Optional[str] = None

class UserProfileOut(BaseModel):
    id: int
    user_id: int
    last_name: Optional[str] = None
    first_name: Optional[str] = None
    middle_name: Optional[str] = None
    about: Optional[str] = None
    subjects: Optional[str] = None
    class Config:
        from_attributes = True

class FavoriteTutorIn(BaseModel):
    tutor_id: int
    tutor_name: str
    tutor_subject: str
    tutor_price: int
    tutor_rating: float
    tutor_students: int
    tutor_lessons: int
    tutor_reviews: str
    tutor_description: str
    tutor_languages: str
    tutor_badge: str
    tutor_image_url: str

class FavoriteTutorOut(BaseModel):
    id: int
    user_id: int
    tutor_id: int
    tutor_name: str
    tutor_subject: str
    tutor_price: int
    tutor_rating: float
    tutor_students: int
    tutor_lessons: int
    tutor_reviews: str
    tutor_description: str
    tutor_languages: str
    tutor_badge: str
    tutor_image_url: str
    class Config:
        from_attributes = True