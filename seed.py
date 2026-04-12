from database import SessionLocal, engine, Base
from models import Subject

Base.metadata.create_all(bind=engine)

db = SessionLocal()

db.query(Subject).delete()

subjects = [
    Subject(name="Математика", sphere="school"),
    Subject(name="Русский язык", sphere="school"),
    Subject(name="Информатика", sphere="school"),
    Subject(name="Биология", sphere="school"),
    Subject(name="Химия", sphere="school"),
    Subject(name="Физика", sphere="school"),
    Subject(name="Литература", sphere="school"),
    Subject(name="География", sphere="school"),
    Subject(name="Обществознание", sphere="school"),
    Subject(name="История", sphere="school"),

    Subject(name="Гитара", sphere="music"),
    Subject(name="Электрогитара", sphere="music"),
    Subject(name="Скрипка", sphere="music"),
    Subject(name="Фортепиано", sphere="music"),
    Subject(name="Вокал", sphere="music"),
    Subject(name="Сольфеджио", sphere="music"),
    Subject(name="Барабаны", sphere="music"),
    Subject(name="Баян", sphere="music"),
    Subject(name="Саксофон", sphere="music"),
    Subject(name="Флейта", sphere="music"),
    Subject(name="Труба", sphere="music"),
    Subject(name="Кларнет", sphere="music"),
    Subject(name="Виолончель", sphere="music"),

    Subject(name="Испанский", sphere="languages"),
    Subject(name="Китайский", sphere="languages"),
    Subject(name="Арабский", sphere="languages"),
    Subject(name="Английский", sphere="languages"),
    Subject(name="Немецкий", sphere="languages"),
    Subject(name="Финский", sphere="languages"),
    Subject(name="Французкий", sphere="languages"),
    Subject(name="Польский", sphere="languages"),
    Subject(name="Японский", sphere="languages"),
    Subject(name="Португальский", sphere="languages"),
    Subject(name="Итальянский", sphere="languages"),

    Subject(name="Высшая математика", sphere="higher"),
    Subject(name="Теория вероятности", sphere="higher"),
    Subject(name="Сопромат", sphere="higher"),
    Subject(name="Алгебра логики", sphere="higher"),
    Subject(name="Экономика", sphere="higher"),
    Subject(name="Философия", sphere="higher"),
    Subject(name="Программирование", sphere="higher"),
    Subject(name="Журналистика", sphere="higher"),

    Subject(name="Подготовка к школе", sphere="other"),
    Subject(name="Танцы", sphere="other"),
    Subject(name="Компьютерная грамотность", sphere="other"),
    Subject(name="Изобразительное искусство", sphere="other"),
    Subject(name="Начальная школа", sphere="other"),
    Subject(name="Логопед", sphere="other"),
]

db.add_all(subjects)
db.commit()
db.close()

print("База заполнена")