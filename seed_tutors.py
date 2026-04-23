from database import SessionLocal, engine, Base
from models import Tutor

Base.metadata.create_all(bind=engine)
db = SessionLocal()
db.query(Tutor).delete()

tutors = [
    Tutor(
        name="Анна К.",
        subject="Английский язык",
        sphere="languages",
        price=3400,
        experience=10,
        level="C2",
        schedule="в любое время",
        birth_year=1990,
        goal="Достичь B2",
        rating=4.9,
        students=16,
        lessons=1348,
        reviews="1+ тыс. положительных отзывов",
        description="Привет! Я Анна, и я могу научить тебя английскому с нуля до B1-B2 или помочь достичь С1-С2. Я всегда за хорошую и добрую атмосферу, поэтому всегда выслушаю тебя и помогу построить речь",
        languages="Английский язык (C2), Русский язык (Родной)",
        badge="leading",
        image_url="http://127.0.0.1:5500/images/image%2015.png"
    ),
    Tutor(
        name="Сергей П.",
        subject="Английский язык",
        sphere="languages",
        price=3000,
        experience=7,
        level="C1",
        schedule="три раза в неделю",
        birth_year=1988,
        goal="Подготовка к экзамену",
        rating=4.8,
        students=19,
        lessons=1144,
        reviews="1+ тыс. положительных отзывов",
        description="Я Сергей, и я могу обучить тебя английскому и испанскому с нуля до B1-B2. Я всегда за хорошую и добрую атмосферу, поэтому всегда выслушаю тебя и помогу построить речь",
        languages="Английский язык (C1), Испанский язык (C2), Русский язык (Родной)",
        badge="pro",
        image_url="http://127.0.0.1:8000/images/image%2016.png"
    ),
    Tutor(
        name="Мария В.",
        subject="Математика",
        sphere="school",
        price=2500,
        experience=5,
        level="Высшее образование",
        schedule="два раза в неделю",
        birth_year=1992,
        goal="Подготовка к ЕГЭ",
        rating=4.7,
        students=12,
        lessons=890,
        reviews="500+ положительных отзывов",
        description="Помогу разобраться в математике с нуля. Готовлю к ОГЭ и ЕГЭ, работаю со школьниками и студентами",
        languages="Русский язык (Родной)",
        badge="pro",
        image_url="http://127.0.0.1:8000/images/image%2017.png"
    ),
    Tutor(
        name="Иван Д.",
        subject="Гитара",
        sphere="music",
        price=2000,
        experience=8,
        level="Музыкальное образование",
        schedule="один раз в неделю",
        birth_year=1985,
        goal="Научиться играть с нуля",
        rating=4.6,
        students=8,
        lessons=560,
        reviews="200+ положительных отзывов",
        description="Обучаю игре на гитаре с нуля. Классика, рок, поп — любой стиль. Занятия в удобном для тебя темпе",
        languages="Русский язык (Родной)",
        badge="pro",
        image_url="http://127.0.0.1:8000/images/image%2016.png"
    ),
    Tutor(
        name="Елена С.",
        subject="Русский язык",
        sphere="school",
        price=2200,
        experience=12,
        level="Высшее образование",
        schedule="два раза в неделю",
        birth_year=1980,
        goal="Грамотное письмо",
        rating=4.9,
        students=22,
        lessons=2100,
        reviews="2+ тыс. положительных отзывов",
        description="Помогу улучшить грамотность, подготовиться к ЕГЭ и ОГЭ по русскому языку. Опыт работы более 12 лет",
        languages="Русский язык (Родной)",
        badge="leading",
        image_url="http://127.0.0.1:8000/images/image%2016.png"
    ),
    Tutor(
        name="Дмитрий К.",
        subject="Программирование",
        sphere="higher",
        price=4000,
        experience=6,
        level="Высшее образование",
        schedule="три раза в неделю",
        birth_year=1993,
        goal="Освоить Python",
        rating=4.8,
        students=14,
        lessons=700,
        reviews="300+ положительных отзывов",
        description="Обучаю программированию на Python, JavaScript. Помогу освоить с нуля или углубить знания",
        languages="Русский язык (Родной), Английский язык (B2)",
        badge="pro",
        image_url="http://127.0.0.1:5500/images/image 16.png"
    ),
]

db.add_all(tutors)
db.commit()
db.close()
print("Репетиторы добавлены")