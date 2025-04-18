from flask_sqlalchemy import SQLAlchemy

# Создаём объект базы данных
db = SQLAlchemy()

def init_db(app):
    """Функция инициализации базы данных"""
    db.init_app(app)
    with app.app_context():
        db.create_all()  # Создание всех таблиц в базе данных

