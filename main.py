from fastapi import FastAPI, Depends, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func, event
from sqlalchemy.engine import Engine
import sqlite3
import re

from database import SessionLocal, engine, Base
from models import Subject, Application
from schemas import SubjectOut, ApplicationIn, ApplicationOut

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

@app.get("/applications/{application_id}", response_model=ApplicationOut)
def get_application(application_id: int, db: Session = Depends(get_db)):
    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Заявка не найдена")
    return application

@app.delete("/applications/{application_id}")
def delete_application(application_id: int, db: Session = Depends(get_db)):
    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Заявка не найдена")
    db.delete(application)
    db.commit()
    return {"message": "Заявка удалена"}

@app.get("/subjects/search", response_model=list[SubjectOut])
def search_subjects(
    q: str = Query(default=""),
    sphere: str = Query(...),
    db: Session = Depends(get_db)
):
    query = db.query(Subject).filter(Subject.sphere == sphere)

    if q.strip():
        search_term = q.strip().lower()
        all_subjects = query.all()

        result = [
            s for s in all_subjects
            if search_term in s.name.lower()
        ]

        result.sort(key=lambda s: (
            not s.name.lower().startswith(search_term),
            s.name.lower()
        ))

        return result

    return query.order_by(Subject.name.asc()).all()

@app.get("/subjects/by-sphere", response_model=list[SubjectOut])
def get_subjects_by_sphere(
    sphere: str = Query(...),
    db: Session = Depends(get_db)
):
    return db.query(Subject).filter(Subject.sphere == sphere).order_by(Subject.name.asc()).all()