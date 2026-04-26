from fastapi import FastAPI, Depends, Query, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import event
from sqlalchemy.engine import Engine
from typing import Optional
import sqlite3
import re

from database import SessionLocal, engine, Base
from models import Subject, Application, Tutor, User, BookingRequest
from schemas import (SubjectOut, ApplicationIn, ApplicationOut, TutorOut, RegisterIn, LoginIn, TokenOut, UserOut, BookingRequestOut)
import datetime
from auth import hash_password, verify_password, create_token, verify_token

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/images", StaticFiles(directory="images"), name="images")

@event.listens_for(Engine, "connect")
def set_sqlite_unicode(dbapi_connection, connection_record):
    if isinstance(dbapi_connection, sqlite3.Connection):
        dbapi_connection.create_function("LOWER_RU", 1, lambda s: s.lower() if s else "")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Не авторизован")
    token = authorization.replace("Bearer ", "")
    user_id = verify_token(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Токен недействителен")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="Пользователь не найден")
    return user

VALID_SUBJECTS = [
    'математика', 'русский язык', 'информатика', 'биология', 'химия',
    'физика', 'литература', 'география', 'обществознание', 'история',
    'гитара', 'электрогитара', 'скрипка', 'фортепиано', 'вокал',
    'сольфеджио', 'барабаны', 'баян', 'саксафон', 'флейта', 'труба',
    'кларнет', 'виолончель', 'испанский', 'китайский', 'арабский',
    'английский', 'немецкий', 'финский', 'французкий', 'польский',
    'японский', 'португальский', 'итальянский', 'высшая математика',
    'теория вероятности', 'сопромат', 'алгебра логики', 'экономика',
    'философия', 'программирование', 'журналистика', 'подготовка к школе',
    'танцы', 'компьютерная грамотность', 'изобразительное искусство',
    'начальная школа', 'логопед', 'английский язык', 'немецкий язык'
]

def validate_application(data: ApplicationIn):
    errors = {}
    if not data.full_name.strip():
        errors['full_name'] = 'Введите ФИО'
    elif re.search(r'\d', data.full_name):
        errors['full_name'] = 'ФИО не должно содержать цифры'
    elif len(data.full_name.strip().split()) < 2:
        errors['full_name'] = 'Введите полное ФИО'
    if data.gender not in ['М', 'Ж']:
        errors['gender'] = 'Укажите пол'
    if data.age < 18 or data.age > 99:
        errors['age'] = 'Возраст должен быть от 18 до 99 лет'
    if not re.match(r'^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$', data.email):
        errors['email'] = 'Некорректная электронная почта'
    if not re.match(r'^\+7\(\d{3}\)\d{3}-\d{2}-\d{2}$', data.phone):
        errors['phone'] = 'Формат телефона: +7(000)000-00-00'
    if not data.subject.strip():
        errors['subject'] = 'Введите предмет'
    elif re.search(r'\d', data.subject):
        errors['subject'] = 'Предмет не должен содержать цифры'
    elif data.subject.strip().lower() not in VALID_SUBJECTS:
        errors['subject'] = 'Укажите настоящий предмет из нашего списка'
    return errors

@app.get("/")
def root():
    return {"message": "Server is running"}

@app.post("/auth/register", response_model=TokenOut)
def register(data: RegisterIn, db: Session = Depends(get_db)):
    errors = {}

    if not data.email and not data.phone:
        raise HTTPException(status_code=422, detail={"general": "Введите почту или телефон"})

    if data.email:
        email_regex = r'^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_regex, data.email):
            errors['email'] = 'Некорректная электронная почта'
        else:
            existing = db.query(User).filter(User.email == data.email).first()
            if existing:
                errors['email'] = 'Эта почта уже зарегистрирована'

    if data.phone:
        phone_regex = r'^\+7\(\d{3}\)\d{3}-\d{2}-\d{2}$'
        if not re.match(phone_regex, data.phone):
            errors['phone'] = 'Формат телефона: +7(000)000-00-00'
        else:
            existing = db.query(User).filter(User.phone == data.phone).first()
            if existing:
                errors['phone'] = 'Этот телефон уже зарегистрирован'

    if len(data.password) < 6:
        errors['password'] = 'Пароль должен быть не менее 6 символов'

    if data.password != data.password_confirm:
        errors['password_confirm'] = 'Пароли не совпадают'

    if errors:
        raise HTTPException(status_code=422, detail=errors)

    user = User(
        email=data.email if data.email else None,
        phone=data.phone if data.phone else None,
        password_hash=hash_password(data.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_token(user.id)

    return TokenOut(
        access_token=token,
        token_type="bearer",
        user=UserOut(id=user.id, email=user.email, phone=user.phone)
    )

@app.post("/auth/login", response_model=TokenOut)
def login(data: LoginIn, db: Session = Depends(get_db)):
    login_val = data.login.strip()

    user = None

    if "@" in login_val:
        user = db.query(User).filter(User.email == login_val).first()
    else:
        user = db.query(User).filter(User.phone == login_val).first()

    if not user:
        raise HTTPException(status_code=401, detail={"general": "Пользователь не найден"})

    if not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail={"general": "Неверный пароль"})

    token = create_token(user.id)

    return TokenOut(
        access_token=token,
        token_type="bearer",
        user=UserOut(id=user.id, email=user.email, phone=user.phone)
    )

@app.get("/auth/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@app.get("/users", response_model=list[UserOut])
def get_all_users(db: Session = Depends(get_db)):
    return db.query(User).order_by(User.id.desc()).all()

@app.post("/booking", response_model=BookingRequestOut)
def create_booking(
    tutor_id: int = Query(...),
    tutor_name: str = Query(...),
    request_type: str = Query(...),
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    user_id = None
    user_email = None
    user_phone = None

    if authorization and authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "")
        uid = verify_token(token)
        if uid:
            user = db.query(User).filter(User.id == uid).first()
            if user:
                user_id = user.id
                user_email = user.email
                user_phone = user.phone

    booking = BookingRequest(
        tutor_id=tutor_id,
        tutor_name=tutor_name,
        user_id=user_id,
        user_email=user_email,
        user_phone=user_phone,
        request_type=request_type,
        created_at=datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking

@app.get("/booking", response_model=list[BookingRequestOut])
def get_bookings(
    user_id: Optional[int] = Query(default=None),
    db: Session = Depends(get_db)
):
    query = db.query(BookingRequest)
    if user_id is not None:
        query = query.filter(BookingRequest.user_id == user_id)
    return query.order_by(BookingRequest.id.desc()).all()

@app.post("/applications", response_model=ApplicationOut)
def create_application(data: ApplicationIn, db: Session = Depends(get_db)):
    errors = validate_application(data)
    if errors:
        raise HTTPException(status_code=422, detail=errors)
    application = Application(
        full_name=data.full_name.strip(),
        gender=data.gender,
        age=data.age,
        email=data.email.strip(),
        phone=data.phone.strip(),
        subject=data.subject.strip()
    )
    db.add(application)
    db.commit()
    db.refresh(application)
    return application

@app.get("/applications", response_model=list[ApplicationOut])
def get_applications(db: Session = Depends(get_db)):
    return db.query(Application).order_by(Application.id.desc()).all()

@app.delete("/applications/{application_id}")
def delete_application(application_id: int, db: Session = Depends(get_db)):
    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Заявка не найдена")
    db.delete(application)
    db.commit()
    return {"message": "Заявка удалена"}

@app.get("/subjects/search", response_model=list[SubjectOut])
def search_subjects(q: str = Query(default=""), sphere: str = Query(...), db: Session = Depends(get_db)):
    query = db.query(Subject).filter(Subject.sphere == sphere)
    if q.strip():
        search_term = q.strip().lower()
        all_subjects = query.all()
        result = [s for s in all_subjects if search_term in s.name.lower()]
        result.sort(key=lambda s: (not s.name.lower().startswith(search_term), s.name.lower()))
        return result
    return query.order_by(Subject.name.asc()).all()

@app.get("/subjects/search-all", response_model=list[SubjectOut])
def search_all_subjects(q: str = Query(default=""), db: Session = Depends(get_db)):
    all_subjects = db.query(Subject).all()
    if q.strip():
        search_term = q.strip().lower()
        result = [s for s in all_subjects if search_term in s.name.lower()]
        result.sort(key=lambda s: (not s.name.lower().startswith(search_term), s.name.lower()))
        return result
    return all_subjects

@app.get("/subjects/by-sphere", response_model=list[SubjectOut])
def get_subjects_by_sphere(sphere: str = Query(...), db: Session = Depends(get_db)):
    return db.query(Subject).filter(Subject.sphere == sphere).order_by(Subject.name.asc()).all()

@app.get("/tutors/search-name")
def search_tutor_name(q: str = Query(default=""), db: Session = Depends(get_db)):
    all_tutors = db.query(Tutor).all()
    if q.strip():
        search_term = q.strip().lower()
        result = [t for t in all_tutors if search_term in t.name.lower()]
        result.sort(key=lambda t: (not t.name.lower().startswith(search_term), t.name.lower()))
        return [{"id": t.id, "name": t.name, "subject": t.subject} for t in result]
    return []

@app.get("/tutors", response_model=list[TutorOut])
def get_tutors(
    name: Optional[str] = Query(default=None),
    subject: Optional[str] = Query(default=None),
    price_from: Optional[int] = Query(default=None),
    price_to: Optional[int] = Query(default=None),
    schedule: Optional[str] = Query(default=None),
    experience: Optional[int] = Query(default=None),
    level: Optional[str] = Query(default=None),
    birth_year_from: Optional[int] = Query(default=None),
    birth_year_to: Optional[int] = Query(default=None),
    goal: Optional[str] = Query(default=None),
    db: Session = Depends(get_db)
):
    all_tutors = db.query(Tutor).all()
    result = all_tutors

    if name and name.strip():
        term = name.strip().lower()
        result = [t for t in result if term in t.name.lower()]

    if subject and subject.strip():
        term = subject.strip().lower()
        result = [t for t in result if term in t.subject.lower()]

    if price_from is not None:
        result = [t for t in result if t.price >= price_from]

    if price_to is not None:
        result = [t for t in result if t.price <= price_to]

    if schedule and schedule.strip() and schedule.strip() != "в любое время":
        term = schedule.strip().lower()
        result = [t for t in result if term in t.schedule.lower()]

    if experience is not None:
        result = [t for t in result if t.experience >= experience]

    if level and level.strip():
        term = level.strip().lower()
        result = [t for t in result if term in t.level.lower()]

    if birth_year_from is not None:
        result = [t for t in result if t.birth_year >= birth_year_from]

    if birth_year_to is not None:
        result = [t for t in result if t.birth_year <= birth_year_to]

    if goal and goal.strip():
        term = goal.strip().lower()
        result = [t for t in result if term in t.goal.lower()]

    return result