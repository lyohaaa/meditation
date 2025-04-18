from backend.database import db

class MeditationSession(db.Model):
    """Модель хранения данных о медитациях"""
    id = db.Column(db.Integer, primary_key=True)  # Уникальный идентификатор
    user_id = db.Column(db.String(50), nullable=False)  # ID пользователя Telegram
    duration = db.Column(db.Integer, nullable=False)  # Длительность медитации в минутах
    timestamp = db.Column(db.DateTime, default=db.func.current_timestamp())  # Время записи

class MoodEntry(db.Model):
    """Модель хранения данных о состоянии пользователя"""
    __tablename__ = 'mood_entries'
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey('meditation_session.id'), nullable=True)
    mood_text = db.Column(db.String(200), nullable=False)  # Текстовое описание состояния
    mood_score = db.Column(db.Integer, nullable=False)     # Оценка от 1 до 5
    timestamp = db.Column(db.DateTime, default=db.func.current_timestamp())


